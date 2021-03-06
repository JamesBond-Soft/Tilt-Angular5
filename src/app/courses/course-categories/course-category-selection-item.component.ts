import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription }   from 'rxjs/Subscription';

import { CourseCategoryService } from './course-category.service';
import { ICourseCategory } from './course-category';
import { CourseCategoryItemService } from './course-category-item.service';



@Component({
  selector: 'course-category-selection-item',
  // template: `
  // <li><i class="fa fa-caret-right"></i><i class="fa fa-circle" aria-hidden="true" *ngIf="this.selected"></i><i class="fa fa-circle-o" aria-hidden="true" *ngIf="secondarySelected && this.groupItemService.showSecondarySelection"></i>
  //   <span class="groupItem noselect" [ngClass]="{'bg-primary text-white':selected && !this.groupItemService.showSecondarySelection, 'groupLocked': !this.groupItemService.allowClick || (this.groupItemService.showSecondarySelection && this.selected), 'bg-secondary text-white':secondarySelected && this.groupItemService.showSecondarySelection}" (click)="cmdSelect(group)">{{group.name}}</span>
  //   <ul *ngIf="group.subGroups.length">
  //     <group-item *ngFor="let subGroupItem of group.subGroups" [group]="subGroupItem"></group-item>
  //   </ul>
  // </li>`,
  templateUrl: './course-category-selection-item.component.html',
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
export class CourseCategorySelectionItemComponent implements OnDestroy {
  //GroupItemComponent is a simple component used for recursive rendering of groups.

  selected: boolean = false;
  secondarySelected: boolean = false;
  expanded: boolean = false;
  
  subscription: Subscription; //subscription to groupItemService broadcast
  secondarySubscription: Subscription; //subscription to groupItemService broadcast
  private visibilitySubscription: Subscription; //subscription to expand/hide all
  @Input() category: ICourseCategory;

  constructor(public courseCategoryItemService: CourseCategoryItemService) {
    //subscribe to groupItem service to listen for announcments if any group-items have been selected.
    this.subscription = courseCategoryItemService.selectedCourseCategoryAnnounced$.subscribe( category => {
      //announcement was observed, check if this group is the one which should be selected, if so mark it as selected; or not
      if(category === this.category){
        this.selected = true;
      } else {
        this.selected = false;
      }
    });

    this.secondarySubscription = courseCategoryItemService.selectedSecondaryCourseCategoryAnnounced$.subscribe( category => {
      //announcement was observed, check if this group is the one which should be selected, if so mark it as selected; or not
      if(category === this.category){
        this.secondarySelected = true;
      } else {
        this.secondarySelected = false;
      }
    });

    this.visibilitySubscription = courseCategoryItemService.visibilityAnnoucement$.subscribe(instruction => {
      if(instruction == 1){
        //expand all
        this.expanded = true;
        this.courseCategoryItemService.setExpandedState(this.category.courseCategoryId, this.expanded);
      } else if (instruction == 0) {
        //hide all
        this.expanded = false;
        this.courseCategoryItemService.setExpandedState(this.category.courseCategoryId, this.expanded);
      } else if(instruction == 3) {
        //ask to check if expanded or not
        this.expanded = this.courseCategoryItemService.checkIfCourseCategoryShouldBeExpanded(this.category.courseCategoryId);
      }
    });
   }

   ngOnInit() {
    this.expanded = this.courseCategoryItemService.checkIfCourseCategoryShouldBeExpanded(this.category.courseCategoryId);
   }

  cmdSelect(category: ICourseCategory): void {
    //announce to groupItemService that this group was selected - this will trigger a broadbast message
    if(!this.courseCategoryItemService.allowClick){
      //ignore the click event
      return;
    }

    if(!this.expanded && this.category.subCourseCategories.length > 0){
      this.cmdExpand();
      return;
    }
  }

  cmdSelectCategory(event: Event, category: ICourseCategory): void {
    event.stopPropagation();

    this.courseCategoryItemService.announceSelectedCourseCategory(category);
  }

  cmdExpand(): void {
    this.expanded = !this.expanded;
    this.courseCategoryItemService.setExpandedState(this.category.courseCategoryId, this.expanded);
  }

  ngOnDestroy() {
    //tidy up - unsubscribe to the groupItemService when packing up
    this.subscription.unsubscribe();
    this.secondarySubscription.unsubscribe();
    this.visibilitySubscription.unsubscribe();
  }
}
