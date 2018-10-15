import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription }   from 'rxjs/Subscription';

import { ITreeBranchItem } from './tree-branch-item';
import { TreeBranchItemService, InstructionType, ITreeBranchItemEvent, ITreeBranchItemInstructionSubject, ISeriesProperties } from './tree-branch-item.service';

@Component({
  selector: 'tree-branch-item',
  templateUrl: './tree-branch-item.component.html',
  styleUrls: ['./tree-branch-item.component.scss']
})
export class TreeBranchItemComponent implements OnInit, OnDestroy {
  instructionSubscription: Subscription;
  seriesProperties: ISeriesProperties;

  @Input() set data(data: (any)){
    this.item.data = data;
  };
  get data(){ return this.item.data}

  @Input() set displayField(displayField: string){
    this.item.displayField = displayField;
  }
  get displayField(){ return this.item.displayField }

  @Input() set dataBranchField(dataBranchField: string){
    this.item.dataBranchField = dataBranchField;
  }
  get dataBranchField(){ return this.item.dataBranchField }

  @Input() set seriesName(seriesName: string) {
    this.item.seriesName = seriesName;

    this.instructionSubscription = this.treeBranchItemService.subscribeToInstruction(this.item.seriesName).subscribe(treeBranchItemEvent => this.instructionEventHandler(treeBranchItemEvent));

    this.seriesProperties = this.treeBranchItemService.getSeriesProperties(this.item.seriesName);
  }
  get seriesName(){ return this.item.seriesName }


  @Input() item: ITreeBranchItem; //fixed object type for treebranchitem. Contains data and item specific properties
  
  constructor(private treeBranchItemService: TreeBranchItemService) {
    this.item = <ITreeBranchItem>{};

    
   }

  ngOnInit() {
    //this.item = <ITreeBranchItem>{displayField: 'name', selected: false}; //for testing
    //this.item.data = {name: 'hello', description: 'nothing to say'};
   // this.item.dataBranchField = 'kids';
   

  }

  cmdClick(item: ITreeBranchItem): void {
    //tree-branch-item was clicked, inverse the item's current selection
    if(!this.seriesProperties.allowClick || this.item.data.assigned){
      //ignore the click because it is not allowed
      return; 
    }

    
    item.selected = !item.selected;
    this.treeBranchItemService.sendInstruction(this.item.seriesName, InstructionType.ItemSelected, item);
    
  }

  getTreeItemCSS(item: ITreeBranchItem) {
    //set the CSS for the main span tag of the tree item based on logic (eg if selected, locked or etc)
    let cssClasses = {
      'assigned': item.data.assigned,
      'active text-white': item.selected,
      'locked': !this.seriesProperties.allowClick
    }
    return cssClasses;
  }

  instructionEventHandler(treeBranchItemEvent: ITreeBranchItemEvent): void {
    if(treeBranchItemEvent.instruction === InstructionType.ItemSelected && !this.seriesProperties.multiSelect){
      if(treeBranchItemEvent.payload !== this.item){
        this.item.selected = false;
      }
    }
  }

  ngOnDestroy() {
    //cleanup - unsubscribe the instruction subscription when being destroyed - to avoid memory leaks
    if(this.instructionSubscription){
      this.instructionSubscription.unsubscribe();
    }
  }
}
