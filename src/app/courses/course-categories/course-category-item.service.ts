import { Injectable } from '@angular/core';

import { Subject }    from 'rxjs/Subject';
import { ICourseCategory } from './course-category';

@Injectable()
export class CourseCategoryItemService {

  private selectedCourseCategory = new Subject<ICourseCategory>();
  private selectedSecondaryCourseCategory = new Subject<ICourseCategory>();
  private visibilitySubject = new Subject<number>();

  allowClick: boolean = true;
  showSecondarySelection: boolean = false;
  selectedCourseCategoryAnnounced$ = this.selectedCourseCategory.asObservable();
  selectedSecondaryCourseCategoryAnnounced$ = this.selectedSecondaryCourseCategory.asObservable();
  
  visibilityAnnoucement$ = this.visibilitySubject.asObservable();

  expandedChildrenCourseCategoryIdList: number[] = [];

  constructor() { }

  //broadcast the new selected category
  announceSelectedCourseCategory(category: ICourseCategory): void {
    this.selectedCourseCategory.next(category);
  }

  //broadcast the new secondary selected category
  announceSecondarySelectedCourseCategory(category: ICourseCategory): void {
    this.selectedSecondaryCourseCategory.next(category);
  }

  announceVisibility(instruction: number): void {
    //public method to issue instruction to all category component to do something
    //instruction of 0 is hide all
    //instruction of 1 is show all
    //instruction of 3 is to check expanded state with service and adjust accordingly
    this.visibilitySubject.next(instruction);
  }

  setExpandedState(courseCategoryId: number, state: boolean): void {
    //this method stored a courseCategoryId in a list if it is supposed to be expanded - this is to maintain the current tree view hierarchy
    let matchIndex = this.expandedChildrenCourseCategoryIdList.findIndex(gId => gId === courseCategoryId);
    if(matchIndex > -1){
      //found the match, check state
      if(!state){
        //need to remove it
        this.expandedChildrenCourseCategoryIdList.splice(matchIndex, 1);
      }
    } else {
      //doesnt exist yet
      if(state){
        //it's expanded so we need to add it
        this.expandedChildrenCourseCategoryIdList.push(courseCategoryId);
      }
    }
  }

  checkIfCourseCategoryShouldBeExpanded(courseCategoryId: number): boolean {
    //this is used by the category component to check if they should be displayed as expanded - based on visbilityInstruction check # 3
    let matchIndex = this.expandedChildrenCourseCategoryIdList.findIndex(gId => gId === courseCategoryId);
    return matchIndex > -1;
  }

  clearExpandedStates(): void {
    //quick helper to clear all the expanded states
    // NOTE THIS IS KIND OF REDUNDANT
    this.expandedChildrenCourseCategoryIdList.splice(0, this.expandedChildrenCourseCategoryIdList.length);
  }
  
  
}
