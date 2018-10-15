import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { IGroup } from '../groups/group';
import { GroupItemService } from '../groups/group-item.service';
import { GroupService } from '../groups/group.service';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  templateUrl: './self-assessment-group-selection.component.html',
  styleUrls: ['./self-assessment-group-selection.component.scss']
})
export class SelfAssessmentGroupSelectionComponent implements OnInit, OnDestroy {
  pageTitle: string = "Group Selection"
  searchString: string;
  groups: IGroup[];
  selectedGroup: IGroup; //variable to hold a group that was clicked/selected
  parentGroup: IGroup; //variable to hold the groups parent
  parentGroupSelectionEnabled: boolean = false;
  groupItemSubscription: Subscription; //observer subscription watching if a group was clicked
  parentGroupItemSubscription: Subscription; //observer subscription watching if a group was clicked
  returnPath: string;
  openedAsModal: boolean = false;
  organisationId: number;

  constructor(private route: ActivatedRoute, private router: Router, private groupService: GroupService, private groupItemService: GroupItemService, public bsModalRef: BsModalRef) {
    //observe to watch if a user has clicked on an a group in the tree - it follows the service mission control pattern
    
    

    

    this.groupItemSubscription = groupItemService.selectedGroupAnnounced$.subscribe( group => {
      //check if group is not null (null group means a group was de-selected)
      if(group != null){
          this.selectedGroup = group;
          this.cmdSelectGroup(this.selectedGroup);
      } 
    });
    
   }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      if (params.has("returnPath")) {
        //url has the groupId parameter meaning it just came back from the group selection screen
        this.returnPath = params.get('returnPath');
      }
    });

    if(this.route.snapshot.paramMap.has('organisationId')){
      this.organisationId = +this.route.snapshot.paramMap.get('organisationId');
    }

    this.loadGroups();

    // if(this.route.snapshot.paramMap.has('groupId')){
    //   let selectedGroupId: number = +this.route.snapshot.paramMap.get('groupId');
      
    // }
  }

  private loadGroups(): void {
    //private function that retrieves all groups for the organisation via a web service, and stores the collection into the variable. 
    //Note groups is a multi-level tree heirarchy

    //if(!this.selectedOrganisation) return;
    if(!this.organisationId){
      console.log("Error - missing organisationId (ref: loadGroups)");
      return;
    }
    
    this.groupService.getGroups(this.organisationId).subscribe(groups => {
      this.groups = groups;
      this.groupItemService.announceVisibility(3);
      },error => {
        alert("There was an unexpected error. Please refresh your browser. (ref: loadGroups)");
        console.log(`Error: ${<any>error}`);
        return;
      }
    );
  }

  cmdExpandAll(): void {
    this.groupItemService.announceVisibility(1); //show all
  }

  cmdHideAll(): void {
    this.groupItemService.announceVisibility(0); //hide all
    this.groupItemService.clearExpandedStates();
  }
  
  cmdSelectGroup(group: IGroup): void {
    if(confirm(`Are you sure you want to assign ${group.name}?`)){

      if(this.openedAsModal){
        //set selected group &  hide the modal
        this.bsModalRef.hide();
      } else {
        //opened as per normal
        if(this.returnPath){
          //new nifty reusable redirect
          this.router.navigate([this.returnPath],{queryParams: {groupId: group.groupId, groupName: group.name}});
        } else {
          this.router.navigate(['selfassessments/validation/',this.route.snapshot.params.id],{queryParams: {groupId: group.groupId, groupName: group.name}});
        }
      }
      
    } else {
      this.selectedGroup = null;
      this.groupItemService.announceSelectedGroup(null);
      
    }
  }

  cmdBack(): void {
    if(this.returnPath){
      this.router.navigate([this.returnPath]); 
    } else {
      this.router.navigate(['selfassessments/validation/', this.route.snapshot.params.id]); 
    }
    
  }

  ngOnDestroy(): void {
    //clean-up - unsubscribe from the group selection observer
    this.groupItemSubscription.unsubscribe();
    //this.parentGroupItemSubscription .unsubscribe();
  }
}
