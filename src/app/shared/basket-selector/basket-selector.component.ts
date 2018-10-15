import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TreeBranchItemService, ISeriesProperties, ITreeBranchItemEvent, InstructionType } from '../tree-branch-item/tree-branch-item.service';
import { TreeBranchItemComponent } from '../tree-branch-item/tree-branch-item.component';
import { ITreeBranchItem } from '../tree-branch-item/tree-branch-item';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'basket-selector',
  templateUrl: './basket-selector.component.html',
  styleUrls: ['./basket-selector.component.scss'],
  providers: [TreeBranchItemService]
})
export class BasketSelectorComponent implements OnInit {
  @Input() shelfTitle: string;
  @Input () basketTitle: string;
  @Input () displayField: string;
  @Input () dataBranchField: string;

  @Input() shelfItems: (any)[];
  @Input() basketItems: (any)[];

  selectedShelfItems: (any)[] = [];

  @Output() isDirty = new EventEmitter<boolean>(); //event to tell parent component that the selection stat is dirty (changes were made by the user)

  constructor(private treeBranchItemService: TreeBranchItemService) {
    this.treeBranchItemService.createInstructionSeries('shelf', {allowClick: true, multiSelect: true});
    this.treeBranchItemService.createInstructionSeries('basket', {allowClick: true, multiSelect: true});
  }

  ngOnInit() {
    // this.shelfItems = [{name: 'hello', kids:[{name:'hi!'}]},{name: 'hello'},{name: 'hello'},{name: 'hello'},{name: 'hello'},{name: 'hello'}];
    // this.basketItems = [{name: 'hello', kids:[{name:'hi!'}]},{name: 'hello'},{name: 'hello'},{name: 'hello'},{name: 'hello'},{name: 'hello'}];//[];//[1,2,4,5,6,7];
    // this.displayField = 'name';
    // this.dataBranchField = 'kids';

    //this.treeBranchItemService.subscribeToInstruction('shelf').subscribe(treeBranchEventItem => this.shelfTreeBranchEventHandler(treeBranchEventItem));
    
  }

  cmdSelectSingleShelfItem(): void {
    this.genericSingleSelect('shelf', this.shelfItems, this.basketItems);
    this.isDirty.emit(true);
    // let selectedItems = this.treeBranchItemService.getSeriesSelectedItems('shelf');
    // if(selectedItems.length){
    //   //copy these into the basket series
    //   selectedItems.forEach((item, index) => {
    //     this.basketItems.push(Object.assign({}, item.data)); 

    //     //remove the items from the shelfItems collection (recursively)
    //     this.findAndDeleteItemInCollectionRecursively(item.data, this.shelfItems);
    //   });

    //   this.treeBranchItemService.clearSeriesSelectedItems('shelf');

    //   //clear the selectedItems now
    //   //selectedItems.splice(0, selectedItems.length);
    // }
  }

  findAndDeleteItemInCollectionRecursively(itemToDelete: (any), itemCollection:(any)[]): boolean {
    let foundItemIndex: number = -1;
    foundItemIndex = itemCollection.findIndex(x => x === itemToDelete);
    if(foundItemIndex > -1){
      //found it! so remove it
      itemCollection.splice(foundItemIndex, 1);
      return true;
    } else if(this.dataBranchField && this.dataBranchField.length){
      //the dataBranchField is populated so do a recurive search down for each item
      itemCollection.forEach((lookupItem, index) => {
        //check if there are any children for this iterated item
        if(lookupItem[this.dataBranchField] && lookupItem[this.dataBranchField].length){
          //there are children - perform the recursive search on all the children
          let result: boolean = this.findAndDeleteItemInCollectionRecursively(itemToDelete, lookupItem[this.dataBranchField]);
          if(result){
            return true;
          }
        }
      });
      
    }

    return false; //bugger - didn't find it
    
  }

  cmdSelectAllShelfItems(): void {
    this.genericMultiSelect('shelf', this.shelfItems, this.basketItems);
    this.isDirty.emit(true);
    // //copy all shelf items into the selected groups
    // this.shelfItems.forEach((item, index) => {
    //   this.basketItems.push(Object.assign({}, item));
    // })

    // //clear the selectedItems for the shelf
    // this.treeBranchItemService.clearSeriesSelectedItems('shelf');

    // //clear the shelfItems
    // this.shelfItems.splice(0, this.shelfItems.length);
  }

  cmdSelectSingleBasketItem(): void {
    this.genericSingleSelect('basket', this.basketItems, this.shelfItems);
    this.isDirty.emit(true);
    // let selectedItems = this.treeBranchItemService.getSeriesSelectedItems('basket');
    // if(selectedItems.length){
    //   //copy these into the basket series
    //   selectedItems.forEach((item, index) => {
    //     this.shelfItems.push(Object.assign({}, item.data)); 

    //     //remove the items from the shelfItems collection (recursively)
    //     this.findAndDeleteItemInCollectionRecursively(item.data, this.basketItems);
    //   });

    //   this.treeBranchItemService.clearSeriesSelectedItems('basket');

    //   //clear the selectedItems now
    //   //selectedItems.splice(0, selectedItems.length);
    // }
  }

  cmdSelectAllBasketItems(): void {
    this.genericMultiSelect('basket', this.basketItems, this.shelfItems);
    this.isDirty.emit(true);
  }

  private genericSingleSelect(sourceSeriesName: string, sourceDataCollection: (any)[], destinationDataCollection: (any)[]): void {
    let selectedItems = this.treeBranchItemService.getSeriesSelectedItems(sourceSeriesName);
    if(selectedItems.length){
      //copy these into the basket series
      selectedItems.forEach((item, index) => {
        destinationDataCollection.push(Object.assign({}, item.data)); 

        //remove the items from the shelfItems collection (recursively)
        this.findAndDeleteItemInCollectionRecursively(item.data, sourceDataCollection);
      });

      this.treeBranchItemService.clearSeriesSelectedItems(sourceSeriesName);
    } else {
      //show benign warning
      alert('Please select an item first!');
    }
  }

  private genericMultiSelect(sourceSeriesName: string, sourceDataCollection: (any)[], destinationDataCollection: (any)[]): void {
     //copy all shelf items into the selected groups
     sourceDataCollection.forEach((item, index) => {
      destinationDataCollection.push(Object.assign({}, item));
    })

    //clear the selectedItems for the shelf
    this.treeBranchItemService.clearSeriesSelectedItems(sourceSeriesName);

    //clear the shelfItems
    sourceDataCollection.splice(0, this.shelfItems.length);
  }

}
