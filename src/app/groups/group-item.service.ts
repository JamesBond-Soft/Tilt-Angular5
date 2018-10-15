import { Injectable } from '@angular/core';

import { Subject }    from 'rxjs/Subject';
import { IGroup } from './group';

@Injectable()
export class GroupItemService {

  private selectedGroup = new Subject<IGroup>();
  private selectedSecondaryGroup = new Subject<IGroup>();
  private visibilitySubject = new Subject<number>();

  allowClick: boolean = true;
  showSecondarySelection: boolean = false;
  selectedGroupAnnounced$ = this.selectedGroup.asObservable();
  selectedSecondaryGroupAnnounced$ = this.selectedSecondaryGroup.asObservable();
  
  visibilityAnnoucement$ = this.visibilitySubject.asObservable();

  expandedChildrenGroupIdList: number[] = [];

  constructor() { }

  //broadcast the new selected group
  announceSelectedGroup(group: IGroup): void {
    this.selectedGroup.next(group);
  }

  //broadcast the new secondary selected group
  announceSecondarySelectedGroup(group: IGroup): void {
    this.selectedSecondaryGroup.next(group);
  }

  announceVisibility(instruction: number): void {
    //public method to issue instruction to all group component to do something
    //instruction of 0 is hide all
    //instruction of 1 is show all
    //instruction of 3 is to check expanded state with service and adjust accordingly
    this.visibilitySubject.next(instruction);
  }

  setExpandedState(groupId: number, state: boolean): void {
    //this method stored a groupId in a list if it is supposed to be expanded - this is to maintain the current tree view hierarchy
    let matchIndex = this.expandedChildrenGroupIdList.findIndex(gId => gId === groupId);
    if(matchIndex > -1){
      //found the match, check state
      if(!state){
        //need to remove it
        this.expandedChildrenGroupIdList.splice(matchIndex, 1);
      }
    } else {
      //doesnt exist yet
      if(state){
        //it's expanded so we need to add it
        this.expandedChildrenGroupIdList.push(groupId);
      }
    }
  }

  checkIfGroupShouldBeExpanded(groupId: number): boolean {
    //this is used by the group component to check if they should be displayed as expanded - based on visbilityInstruction check # 3
    let matchIndex = this.expandedChildrenGroupIdList.findIndex(gId => gId === groupId);
    return matchIndex > -1;
  }

  clearExpandedStates(): void {
    //quick helper to clear all the expanded states
    // NOTE THIS IS KIND OF REDUNDANT
    this.expandedChildrenGroupIdList.splice(0, this.expandedChildrenGroupIdList.length);
  }
  
  
}
