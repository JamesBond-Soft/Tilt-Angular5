import { Injectable } from '@angular/core';

@Injectable()
export class ReorderCollectionService {
  ///Helper Service which assists in reordering items in a collection (ie user moving item order up or down).
  //
  ///---------------------------------------------------------------------------------
  //  WARNING - the service methods actually modify the collection being passed to it.
  //----------------------------------------------------------------------------------
  constructor() { }

  moveOrderUp(item: any, collection: any[]): void {
    //move passed item backwards in collection
    this.adjustCollectionOrder(item, -1, collection);
  }

  moveOrderDown(item: any, collection: any[]): void {
    //move item forwards in collection
    this.adjustCollectionOrder(item, 1, collection);
  }

  private adjustCollectionOrder(item: any, increment: number, collection: any[]) {
    //find this objects current index
    let currentItemIndex = collection.findIndex(q => q == item);

    if(currentItemIndex == 0 && increment < 0){
      return; //don't move backward because the item is already at the top
    }

    //move item in array
    this.array_move(collection, currentItemIndex, (currentItemIndex + increment));

    //modify all items according to array index
    collection.forEach((incrementItem, index) => {
      incrementItem.order = index;
    });

    //we are done!
  }

  private array_move(arr, old_index, new_index) {
    //private method which slices and dices the array
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  };
}
