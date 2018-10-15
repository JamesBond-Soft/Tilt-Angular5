import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

import { ITreeBranchItem } from './tree-branch-item';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class TreeBranchItemService {
  treeBranchItemInstructionCollection: ITreeBranchItemInstructionSubject[] = []; //collection of subjects that can be observed

  constructor() {  }

  createInstructionSeries(name: string, properties?: ISeriesProperties): ITreeBranchItemInstructionSubject {
    //this created a subject with name that can be observed

    //validation - check there isn;t an existing series with the same name
    
    if(this.findSeriesWithName(name)){
      throw new RangeError("Error - name already taken (ref: createInstructionSeries)");
    }

    let instructionSeries: ITreeBranchItemInstructionSubject = <ITreeBranchItemInstructionSubject>{};
    instructionSeries.name = name;
    instructionSeries.instructionSubject = new Subject<ITreeBranchItemEvent>();
    instructionSeries.instructionSubjectAnnouncement$ = instructionSeries.instructionSubject.asObservable();
    instructionSeries.selectedItems = [];

    if(properties){
      //use provided properties
      instructionSeries.properties = properties;
    } else {
      //use default properties for the series
      instructionSeries.properties = <ISeriesProperties>{
                                                          multiSelect: false, 
                                                          allowClick: true
                                                        }
    }
    
    this.treeBranchItemInstructionCollection.push(instructionSeries);

    return instructionSeries;
  }

  sendInstruction(instructionSeriesName: string, instruction: InstructionType, payload: (any)): void {
    //broadcast an instruction to all observers of a particular subject (by name)
    
    //find the series with the name for validation.
    let series = this.findSeriesWithName(instructionSeriesName);
    if(!series){
      throw new RangeError('Error - could not find instruction series with name: ' + instructionSeriesName + ' (ref: sendInstruction)');
    }

    if(instruction === InstructionType.ItemSelected){
      this.monitorSelection(series, <ITreeBranchItem> payload);
    }

    //broadcast the new instruction to all observers
    series.instructionSubject.next({instruction: instruction, payload: payload});
  }

  subscribeToInstruction(instructionSeriesName: string): Observable<ITreeBranchItemEvent> {
    //find a subject to observe by name and subscribe/observe to the returned series

     //find the series with the name for validation
     let series = this.findSeriesWithName(instructionSeriesName);
     if(!series){
       throw new RangeError('Error - could not find instruction series with name: ' + instructionSeriesName + ' (ref: sendInstruction)');
     }

     //return the matching series so it can be subscribed to
     return series.instructionSubjectAnnouncement$;
  }

  getSeriesProperties(instructionSeriesName: string): ISeriesProperties {
    //get the properties for a particular series

    //find the series with the name for validation
    let series = this.findSeriesWithName(instructionSeriesName);
    if (!series) {
      throw new RangeError('Error - could not find instruction series with name: ' + instructionSeriesName + ' (ref: sendInstruction)');
    }

    //return the matching series so it can be subscribed to
    return series.properties;
  }

  private findSeriesWithName(name: string): ITreeBranchItemInstructionSubject {
    //helper function to find a series by name
    let match = this.treeBranchItemInstructionCollection.find(item => {
      return item.name === name;
    });

    return match;
  }

  private monitorSelection(series: ITreeBranchItemInstructionSubject, item: ITreeBranchItem): void {

    //an item in the shelf was clicked. Check if it was selected or not
    if (item.selected) {
      //selected item - add it to the selected array
      
      //check if the series is an exclusive selection, if so, clear all other items before adding it
      
      if(!series.properties.multiSelect){
        this.clearSeriesSelectedItems(series.name);
        // if(series.selectedItems.length){
        //   series.selectedItems.splice(0, series.selectedItems.length);
        // }
      }

      //make sure the item is not already in the selectedItems collection (just in case...)
      if (!series.selectedItems.find(x => x === item)) {
        series.selectedItems.push(item);
      }

      
    } else {
      //not selected - remove it from the selected array
      let index = series.selectedItems.findIndex(x => x === item);
      if (index != -1) {
        series.selectedItems.splice(index, 1);
      }
    }
  }

  getSeriesSelectedItems(instructionSeriesName: string): ITreeBranchItem[] {
    //find the series with the name for validation
    let series = this.findSeriesWithName(instructionSeriesName);
    if (!series) {
      throw new RangeError('Error - could not find instruction series with name: ' + instructionSeriesName + ' (ref: sendInstruction)');
    }

    return series.selectedItems;
  }

  clearSeriesSelectedItems(instructionSeriesName: string): void {
    //find the series with the name for validation
    let series = this.findSeriesWithName(instructionSeriesName);
    if (!series) {
      throw new RangeError('Error - could not find instruction series with name: ' + instructionSeriesName + ' (ref: sendInstruction)');
    }

    if(series.selectedItems && series.selectedItems.length){
      //mark each selected item as NOT selected
      series.selectedItems.forEach((item, index) => {
        item.selected = false;
      });

      //clear the selectedItems array
      series.selectedItems.splice(0, series.selectedItems.length);
    }
  }
}


export interface ITreeBranchItemInstructionSubject {
  //interface which defines a subject series using name as the identifier
  name: string, //identifier of series - MUST BE UNIQUE!!!
  instructionSubject: Subject<ITreeBranchItemEvent>, //define subject type which is the interface defined below (ie instructionType and payload)
  instructionSubjectAnnouncement$: Observable<ITreeBranchItemEvent> //observable of the subject
  properties: ISeriesProperties, //properties of the series such as multi-select, allowClick and etc
  selectedItems: ITreeBranchItem[]
}

export interface ITreeBranchItemEvent {
  instruction: InstructionType, //instruction type - which is an enum
  payload: (any) //data can be send along with the instruction
  
}

export enum InstructionType {
  //enum which includes a type for each instruction
 VisibilityCollapseAll = 0, //collapse/hide all tree-branch child items
 VisibilityExpandAll = 1, //expand all tree-branch child items
 CheckExpandedState = 2, //all tree-branch-items in series need to check what their expanded state is supposed to be (mainly for restoring state of what is expanded for UI purposes)
 ItemSelected = 3
}

export interface ISeriesProperties {
  multiSelect: boolean
  allowClick: boolean
}