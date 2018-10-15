import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription }   from 'rxjs/Subscription';

import { ResourceCategoryService } from './resource-category.service';
import { IResourceCategory } from './resource-category';
import { ResourceCategoryItemService } from './resource-category-item.service';



@Component({
  selector: 'resource-category-selection-item',
  // template: `
  // <li><i class="fa fa-caret-right"></i><i class="fa fa-circle" aria-hidden="true" *ngIf="this.selected"></i><i class="fa fa-circle-o" aria-hidden="true" *ngIf="secondarySelected && this.groupItemService.showSecondarySelection"></i>
  //   <span class="groupItem noselect" [ngClass]="{'bg-primary text-white':selected && !this.groupItemService.showSecondarySelection, 'groupLocked': !this.groupItemService.allowClick || (this.groupItemService.showSecondarySelection && this.selected), 'bg-secondary text-white':secondarySelected && this.groupItemService.showSecondarySelection}" (click)="cmdSelect(group)">{{group.name}}</span>
  //   <ul *ngIf="group.subGroups.length">
  //     <group-item *ngFor="let subGroupItem of group.subGroups" [group]="subGroupItem"></group-item>
  //   </ul>
  // </li>`,
  templateUrl: './resource-category-selection-item.component.html',
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
export class ResourceCategorySelectionItemComponent implements OnDestroy {
  //GroupItemComponent is a simple component used for recursive rendering of groups.

  selected: boolean = false;
  secondarySelected: boolean = false;
  expanded: boolean = false;
  
  subscription: Subscription; //subscription to groupItemService broadcast
  secondarySubscription: Subscription; //subscription to groupItemService broadcast
  private visibilitySubscription: Subscription; //subscription to expand/hide all
  @Input() category: IResourceCategory;

  constructor(public resourceCategoryItemService: ResourceCategoryItemService) {
    //subscribe to groupItem service to listen for announcments if any group-items have been selected.
    this.subscription = resourceCategoryItemService.selectedResourceCategoryAnnounced$.subscribe( category => {
      //announcement was observed, check if this group is the one which should be selected, if so mark it as selected; or not
      if(category === this.category){
        this.selected = true;
      } else {
        this.selected = false;
      }
    });

    this.secondarySubscription = resourceCategoryItemService.selectedSecondaryResourceCategoryAnnounced$.subscribe( category => {
      //announcement was observed, check if this group is the one which should be selected, if so mark it as selected; or not
      if(category === this.category){
        this.secondarySelected = true;
      } else {
        this.secondarySelected = false;
      }
    });

    this.visibilitySubscription = resourceCategoryItemService.visibilityAnnoucement$.subscribe(instruction => {
      if(instruction == 1){
        //expand all
        this.expanded = true;
        this.resourceCategoryItemService.setExpandedState(this.category.resourceCategoryId, this.expanded);
      } else if (instruction == 0) {
        //hide all
        this.expanded = false;
        this.resourceCategoryItemService.setExpandedState(this.category.resourceCategoryId, this.expanded);
      } else if(instruction == 3) {
        //ask to check if expanded or not
        this.expanded = this.resourceCategoryItemService.checkIfResourceCategoryShouldBeExpanded(this.category.resourceCategoryId);
      }
    });
   }

   ngOnInit() {
    this.expanded = this.resourceCategoryItemService.checkIfResourceCategoryShouldBeExpanded(this.category.resourceCategoryId);
   }

  cmdSelect(category: IResourceCategory): void {
    //announce to groupItemService that this group was selected - this will trigger a broadbast message
    if(!this.resourceCategoryItemService.allowClick){
      //ignore the click event
      return;
    }

    if(!this.expanded && this.category.subResourceCategories.length > 0){
      this.cmdExpand();
      return;
    }
  }

  cmdSelectCategory(event: Event, category: IResourceCategory): void {
    event.stopPropagation();

    this.resourceCategoryItemService.announceSelectedResourceCategory(category);
  }

  cmdExpand(): void {
    this.expanded = !this.expanded;
    this.resourceCategoryItemService.setExpandedState(this.category.resourceCategoryId, this.expanded);
  }

  ngOnDestroy() {
    //tidy up - unsubscribe to the groupItemService when packing up
    this.subscription.unsubscribe();
    this.secondarySubscription.unsubscribe();
    this.visibilitySubscription.unsubscribe();
  }
}
