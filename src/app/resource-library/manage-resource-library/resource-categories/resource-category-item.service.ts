import { Injectable } from '@angular/core';

import { Subject }    from 'rxjs/Subject';
import { IResourceCategory } from './resource-category';

@Injectable()
export class ResourceCategoryItemService {

  private selectedResourceCategory = new Subject<IResourceCategory>();
  private selectedSecondaryResourceCategory = new Subject<IResourceCategory>();
  private visibilitySubject = new Subject<number>();

  allowClick: boolean = true;
  showSecondarySelection: boolean = false;
  selectedResourceCategoryAnnounced$ = this.selectedResourceCategory.asObservable();
  selectedSecondaryResourceCategoryAnnounced$ = this.selectedSecondaryResourceCategory.asObservable();
  
  visibilityAnnoucement$ = this.visibilitySubject.asObservable();

  expandedChildrenResourceCategoryIdList: number[] = [];

  constructor() { }

  //broadcast the new selected category
  announceSelectedResourceCategory(category: IResourceCategory): void {
    this.selectedResourceCategory.next(category);
  }

  //broadcast the new secondary selected category
  announceSecondarySelectedResourceCategory(category: IResourceCategory): void {
    this.selectedSecondaryResourceCategory.next(category);
  }

  announceVisibility(instruction: number): void {
    //public method to issue instruction to all category component to do something
    //instruction of 0 is hide all
    //instruction of 1 is show all
    //instruction of 3 is to check expanded state with service and adjust accordingly
    this.visibilitySubject.next(instruction);
  }

  setExpandedState(resourceCategoryId: number, state: boolean): void {
    //this method stored a resourceCategoryId in a list if it is supposed to be expanded - this is to maintain the current tree view hierarchy
    let matchIndex = this.expandedChildrenResourceCategoryIdList.findIndex(gId => gId === resourceCategoryId);
    if(matchIndex > -1){
      //found the match, check state
      if(!state){
        //need to remove it
        this.expandedChildrenResourceCategoryIdList.splice(matchIndex, 1);
      }
    } else {
      //doesnt exist yet
      if(state){
        //it's expanded so we need to add it
        this.expandedChildrenResourceCategoryIdList.push(resourceCategoryId);
      }
    }
  }

  checkIfResourceCategoryShouldBeExpanded(resourceCategoryId: number): boolean {
    //this is used by the category component to check if they should be displayed as expanded - based on visbilityInstruction check # 3
    let matchIndex = this.expandedChildrenResourceCategoryIdList.findIndex(gId => gId === resourceCategoryId);
    return matchIndex > -1;
  }

  clearExpandedStates(): void {
    //quick helper to clear all the expanded states
    // NOTE THIS IS KIND OF REDUNDANT
    this.expandedChildrenResourceCategoryIdList.splice(0, this.expandedChildrenResourceCategoryIdList.length);
  }
  
  
}
