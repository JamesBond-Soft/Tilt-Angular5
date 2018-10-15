import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription }   from 'rxjs/Subscription';

import { ResourceCategoryItemService } from './resource-category-item.service';
import { IResourceCategory } from './resource-category';



@Component({
  selector: 'resource-category-item',
  templateUrl: './resource-category-item.component.html',
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
export class ResourceCategoryItemComponent implements OnDestroy {
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
  if(this.resourceCategoryItemService.showSecondarySelection){
    //secondary selection mode
    //do a validility check - if the selectedGroup is also the selectedSecondary - do not process the click
    if(this.selected){
      //ignore the click
      console.log('uh uh, no.');
      return;
    }
    //if(this.secondarySelected){
      //select the group
      this.resourceCategoryItemService.announceSecondarySelectedResourceCategory(category);
    //}
  }  else {
    //normal selection mode
    if(this.selected){
      //de-select group
      this.resourceCategoryItemService.announceSelectedResourceCategory(null);
    } else {
      //select the group
      this.resourceCategoryItemService.announceSelectedResourceCategory(category);
    }
  }   
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
