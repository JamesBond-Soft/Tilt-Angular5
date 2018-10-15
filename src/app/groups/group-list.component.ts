import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';



import { GroupService } from './group.service';
import { IGroup } from './group';
import { GroupItemService } from './group-item.service';

import { IOrganisation } from '../settings/settings-organisations/organisation';



//import { ITreeOptions } from 'angular-tree-component/dist/defs/api';
//import { forEach } from '@angular/router/src/utils/collection';

//import { TreeModule } from 'angular-tree-component';
//import { GroupItemComponent } from './group-item.component';

function modify(obj, newObj) {

  Object.keys(obj).forEach(function(key) {
    delete obj[key];
  });

  Object.keys(newObj).forEach(function(key) {
    obj[key] = newObj[key];
  });
  
}

@Component({
  //selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css'],
  providers: [GroupItemService]
})
export class GroupListComponent implements OnInit, OnDestroy {
  //organisationId: number; //private property that holds the organisation id which limits the groups for a specific organisation
  groups: IGroup[]; //used to hold the list of groups shown
  selectedGroup: IGroup; //variable to hold a group that was clicked/selected
  parentGroup: IGroup; //variable to hold the groups parent
  parentGroupSelectionEnabled: boolean = false;
  showEditCard: boolean = false; // indicates if the group edit card is shown
  groupItemSubscription: Subscription; //observer subscription watching if a group was clicked
  parentGroupItemSubscription: Subscription; //observer subscription watching if a group was clicked
  orgs: IOrganisation[];
  selectedOrganisation: IOrganisation;
  

  // @ViewChild('tree') tree;

  // options: ITreeOptions = {
  //   childrenField: 'subGroups',
  //   displayField: 'name',
  //   idField: 'groupId'
  // };

  constructor(private groupService: GroupService, private groupItemService: GroupItemService, private router: Router, private route: ActivatedRoute) {
    //observe to watch if a user has clicked on an a group in the tree - it follows the service mission control pattern
    
    

    

    this.groupItemSubscription = groupItemService.selectedGroupAnnounced$.subscribe( group => {
      //check if group is not null (null group means a group was de-selected)
      if(group != null){
        //check we are not already editing. If we already are, don't do anything
        if(!this.showEditCard){
          this.selectedGroup = group;//Object.assign({}, group);
          this.cmdEditGroup();
         // this.groupItemService.allowClick = false;
        }
      } else {
        // if(this.showEditCard && this.groupForm.pristine){
        //   //cancel out of edit here
        //   this.onFinishEdit(false);
        // } //NOTE THIS IF NEEDS TO BE RESOLVED AFTER REFACTOR
      }
    });

    this.parentGroupItemSubscription = groupItemService.selectedSecondaryGroupAnnounced$.subscribe( group => {
      //check if group is not null (null group means a group was de-selected)
      if(group != null){
        //check we are not already editing. If we already are, don't do anything
        if(group.groupId == this.selectedGroup.groupId){
          //invalid selection
          alert('Invalid Selection!');
          this.groupItemService.announceSecondarySelectedGroup(this.parentGroup);
          //this.groupForm.markAsDirty(); //REFACTOR
          return;
        }
          this.parentGroup = group;//Object.assign({}, group);
          if(this.showEditCard){
            //mark the form as dirty
            //this.groupForm.markAsDirty(); //REFACTOR
          }
      }
    });
   }

  ngOnInit() {
    
    this.route.data.subscribe(data => {
      this.orgs = data['orgs'];

     // if (this.userForm) {
     //   this.userForm.reset();
    this.selectedOrganisation = null;
    let organisationId: number = +this.route.snapshot.params['organisationId'];
    
    if(organisationId && organisationId > 0){
          var matchingOrg: IOrganisation = this.orgs.find(o => o.organisationId === organisationId);
          if(matchingOrg){
            this.selectedOrganisation = matchingOrg;
          }
    }
    
    if(!this.selectedOrganisation && this.orgs && this.orgs.length > 0){
      //couldnt find a match - default to the first organisation
      this.selectedOrganisation = this.orgs[0];  
    }
    
    //load the groups when the component loads
    this.loadGroups();
    });

    
  }

  

  private loadGroups(): void {
    //private function that retrieves all groups for the organisation via a web service, and stores the collection into the variable. 
    //Note groups is a multi-level tree heirarchy

    if(!this.selectedOrganisation) return;
    
    this.groupService.getGroups(this.selectedOrganisation.organisationId).subscribe(groups => {
      this.groups = groups;
      this.groupItemService.announceVisibility(3);
      },error => {
        alert("There was an unexpected error. Please refresh your browser. (ref: loadGroups)");
        console.log(`Error: ${<any>error}`);
        return;
      }
    );
  }

  cmdAddGroup(): void {
    this.selectedGroup = this.groupService.initGroup(); //get a new  initialised "empty" group
    this.selectedGroup.organisationId = this.selectedOrganisation.organisationId;
    this.onStartEdit(this.selectedGroup);
  }

  

  cmdEditGroup(): void {
    this.onStartEdit(this.selectedGroup);
  }

  private onStartEdit(group: IGroup){
    if (group.parentGroupId > 0) {
      this.parentGroup = this.findGroupWithId(group.parentGroupId);
    } else {
      this.parentGroup = null;
    }
    this.groupItemService.allowClick = false;
    this.showEditCard = true;
  }

  cmdExpandAll(): void {
    this.groupItemService.announceVisibility(1); //show all
  }

  cmdHideAll(): void {
    this.groupItemService.announceVisibility(0); //hide all
    this.groupItemService.clearExpandedStates();
  }

  cmdChangeOrg(): void {
    this.loadGroups();
  }

  ngOnDestroy(): void {
      //clean-up - unsubscribe from the group selection observer
      this.groupItemSubscription.unsubscribe();
      this.parentGroupItemSubscription .unsubscribe();
  }

  onFinishEditEvent(shouldReload: boolean): void {
    //make sure parentGroup is set to expanded - which includes if it was changed
    if(this.parentGroup){
      this.groupItemService.setExpandedState(this.parentGroup.groupId, true);
    }

    this.showEditCard = false;
    this.groupItemService.allowClick = true;
    this.groupItemService.showSecondarySelection = false;
    this.groupItemService.announceSelectedGroup(null);
    this.groupItemService.announceSecondarySelectedGroup(null);
    this.parentGroupSelectionEnabled = false;

     if(shouldReload){
        this.loadGroups();
     }
  }

  onSelectParent(parentGroupSelectionEnabled): void {
    //this responds to event from groupEditComponent. if parentGroupSelectionEnabled is true, it means the user is trying to select a new parent from the tree. False means they have finished selection.
    this.parentGroupSelectionEnabled = parentGroupSelectionEnabled;

    if (this.parentGroupSelectionEnabled) {
      //annouce who the secondaryGroup is to toggle showing the secondary parent group
        this.groupItemService.announceSecondarySelectedGroup(this.parentGroup);
        this.groupItemService.allowClick = true;
    } else {
      this.groupItemService.allowClick = false;
    }
     this.groupItemService.showSecondarySelection = this.parentGroupSelectionEnabled;
  }

  private findGroupWithId(groupId: number): IGroup {
    //recursive helper method to find a group in the deep multi-level collection

    var searchForGroup = function (groupList: IGroup[], groupId: number): IGroup {
      //the generic recursive function variable that keeps searching for a group in subgroups
      for (let groupItem of groupList) {
        if (groupItem.groupId === groupId) {
          return groupItem;
        } else {
          //look for subGroups
          var match = searchForGroup(groupItem.subGroups, groupId);
          if (match) return match;
        }
      }
      return null;
    }

    //kick off the recursive reach
    var match = searchForGroup(this.groups, groupId);
    return match; //this could be something - or null
  }
}
