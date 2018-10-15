import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ElementRef, ViewChildren } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import {Observable}  from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

import { IUser } from '../../settings/settings-users/user';

@Component({
  selector: 'staff-basket-selector',
  templateUrl: './staff-basket-selector.component.html',
  styleUrls: ['./staff-basket-selector.component.scss']
})
export class StaffBasketSelectorComponent implements OnInit, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  @Input() shelfTitle: string;
  @Input () basketTitle: string;

  @Input() shelfItems: IUser[];
  @Input() basketItems: IUser[];

  @Output() isDirty = new EventEmitter<boolean>(); //event to tell parent component that the selection stat is dirty (changes were made by the user)
  @Output() searchStringChanged = new EventEmitter<string>(); //event to tell parent that the search string has changed

  shelfForm: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.shelfForm = this.fb.group({
      txtSearchString: ['']
    });
  }

  ngAfterViewInit(): void {
   
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
        .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.shelfForm.valueChanges, ...controlBlurs).debounceTime(250).subscribe(value => {
        this.searchStringChanged.emit(this.shelfForm.get('txtSearchString').value);
    });
  }
  cmdSelectSingleShelfItem(user: IUser): void {
    this.genericSingleSelect(user, this.shelfItems, this.basketItems);
    this.isDirty.emit(true);
  }

  cmdSelectSingleBasketItem(user: IUser): void {
    this.genericSingleSelect(user, this.basketItems, this.shelfItems);
    this.isDirty.emit(true);
  }

  private genericSingleSelect(item: (any), sourceDataCollection: (any)[], destinationDataCollection: (any)[]): void {
    if(item){
      //copy these into the basket series
      destinationDataCollection.push(Object.assign({}, item)); 
      
      //remove the items from the shelfItems collection (recursively)
      this.findAndDeleteItemInCollection(item, sourceDataCollection);
    } else {
      //show benign warning
      alert('Please select an item first!');
    }
  }

  findAndDeleteItemInCollection(itemToDelete: (any), itemCollection:(any)[]): boolean {
    let foundItemIndex: number = -1;
    foundItemIndex = itemCollection.findIndex(x => x === itemToDelete);
    if(foundItemIndex > -1){
      //found it! so remove it
      itemCollection.splice(foundItemIndex, 1);
      return true;
    }

    return false; //bugger - didn't find it
    
  }

}
