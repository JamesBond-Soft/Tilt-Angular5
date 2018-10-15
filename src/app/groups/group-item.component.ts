import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription }   from 'rxjs/Subscription';

import { GroupItemService } from './group-item.service';
import { IGroup } from './group';



@Component({
  selector: 'group-item',
  // template: `
  // <li><i class="fa fa-caret-right"></i><i class="fa fa-circle" aria-hidden="true" *ngIf="this.selected"></i><i class="fa fa-circle-o" aria-hidden="true" *ngIf="secondarySelected && this.groupItemService.showSecondarySelection"></i>
  //   <span class="groupItem noselect" [ngClass]="{'bg-primary text-white':selected && !this.groupItemService.showSecondarySelection, 'groupLocked': !this.groupItemService.allowClick || (this.groupItemService.showSecondarySelection && this.selected), 'bg-secondary text-white':secondarySelected && this.groupItemService.showSecondarySelection}" (click)="cmdSelect(group)">{{group.name}}</span>
  //   <ul *ngIf="group.subGroups.length">
  //     <group-item *ngFor="let subGroupItem of group.subGroups" [group]="subGroupItem"></group-item>
  //   </ul>
  // </li>`,
  templateUrl: './group-item.component.html',
    styles:[`.groupItem {   cursor: pointer; 
                            -moz-user-select: none;
                            -webkit-user-select: none;
                            -ms-user-select: none;
                            -o-user-select: none;
                            user-select: none;  }`,
            `li { list-style: none; }`,
            `.groupLocked {
              cursor: not-allowed; 
            }`        
           ],
  providers: []
})
export class GroupItemComponent implements OnDestroy {
  //GroupItemComponent is a simple component used for recursive rendering of groups.

  selected: boolean = false;
  secondarySelected: boolean = false;
  expanded: boolean = false;
  
  subscription: Subscription; //subscription to groupItemService broadcast
  secondarySubscription: Subscription; //subscription to groupItemService broadcast
  private visibilitySubscription: Subscription; //subscription to expand/hide all
  @Input() group: IGroup;

  constructor(public groupItemService: GroupItemService) {
    //subscribe to groupItem service to listen for announcments if any group-items have been selected.
    this.subscription = groupItemService.selectedGroupAnnounced$.subscribe( group => {
      //announcement was observed, check if this group is the one which should be selected, if so mark it as selected; or not
      if(group === this.group){
        this.selected = true;
      } else {
        this.selected = false;
      }
    });

    this.secondarySubscription = groupItemService.selectedSecondaryGroupAnnounced$.subscribe( group => {
      //announcement was observed, check if this group is the one which should be selected, if so mark it as selected; or not
      if(group === this.group){
        this.secondarySelected = true;
      } else {
        this.secondarySelected = false;
      }
    });

    this.visibilitySubscription = groupItemService.visibilityAnnoucement$.subscribe(instruction => {
      if(instruction == 1){
        //expand all
        this.expanded = true;
        this.groupItemService.setExpandedState(this.group.groupId, this.expanded);
      } else if (instruction == 0) {
        //hide all
        this.expanded = false;
        this.groupItemService.setExpandedState(this.group.groupId, this.expanded);
      } else if(instruction == 3) {
        //ask to check if expanded or not
        this.expanded = this.groupItemService.checkIfGroupShouldBeExpanded(this.group.groupId);
      }
    });
   }

   ngOnInit() {
    this.expanded = this.groupItemService.checkIfGroupShouldBeExpanded(this.group.groupId);
   }

  cmdSelect(group: IGroup): void {
    //announce to groupItemService that this group was selected - this will trigger a broadbast message
    if(!this.groupItemService.allowClick){
      //ignore the click event
      return;
    }

    if(!this.expanded && this.group.subGroups.length > 0){
      this.cmdExpand();
      return;
    }
  if(this.groupItemService.showSecondarySelection){
    //secondary selection mode
    //do a validility check - if the selectedGroup is also the selectedSecondary - do not process the click
    if(this.selected){
      //ignore the click
      console.log('uh uh, no.');
      return;
    }
    //if(this.secondarySelected){
      //select the group
      this.groupItemService.announceSecondarySelectedGroup(group);
    //}
  }  else {
    //normal selection mode
    if(this.selected){
      //de-select group
      this.groupItemService.announceSelectedGroup(null);
    } else {
      //select the group
      this.groupItemService.announceSelectedGroup(group);
    }
  }   
  }

  cmdExpand(): void {
    this.expanded = !this.expanded;
    this.groupItemService.setExpandedState(this.group.groupId, this.expanded);
  }

  ngOnDestroy() {
    //tidy up - unsubscribe to the groupItemService when packing up
    this.subscription.unsubscribe();
    this.secondarySubscription.unsubscribe();
    this.visibilitySubscription.unsubscribe();
  }
}
