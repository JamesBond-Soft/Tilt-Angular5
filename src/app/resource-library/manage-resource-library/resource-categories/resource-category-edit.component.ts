import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { IResourceCategory } from './resource-category';
import { ResourceCategoryService } from './resource-category.service';

import { GenericValidator } from '../../../shared/generic-validator';

@Component({
  selector: 'resource-category-edit',
  templateUrl: './resource-category-edit.component.html'
})
export class ResourceCategoryEditComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  parentCategorySelectionEnabled: boolean = false;

  @Input() selectedCategory: IResourceCategory; //variable to hold a category that was clicked/selected
  
  private _parentCategory: IResourceCategory; //variable to hold the categories parent - this is usually set by the parent component, or cleared within this component.
  @Input() 
  set parentCategory(parentCategory: IResourceCategory){ 
    this._parentCategory = parentCategory;

    //behaviour functionality to toggle 'off' the parent selection because a parentGroup was selected
    if(this.parentCategorySelectionEnabled){
      //finish parentGroup selection mode because a parent was selected (which should have come from the parent component)  
      this.parentCategorySelectionEnabled = false; 
    }
  } 

  get parentCategory(): IResourceCategory {return this._parentCategory; }
  
  private _showEditCard = false; //variable that shows / hides the whole component
  @Input() 
    set showEditCard(showEditCard: boolean){

      if(showEditCard){
        //value was set to true - meaning we are now showing the edit card. Lets trigger the onEdit method to populate the fields
        this.onStartEdit(this.selectedCategory);
      }

      this._showEditCard = showEditCard;
    }

    get showEditCard(): boolean { return this._showEditCard; }

  @Output() onFinishEditEvent = new EventEmitter<boolean>(); //event to tell parent that editing is finished

  @Output() onSelectParent = new EventEmitter<boolean>(); //event to tell parent controller that parentGroup selection is on or off

  categoryForm: FormGroup;

  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;


  constructor(private resourceCategoryService: ResourceCategoryService, private fb: FormBuilder) {
    this.genericValidator = new GenericValidator(this.validationMessages);

    this.validationMessages = {
      name: {
        required: 'Category Name is required.',
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }


  ngOnInit() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      parentResourceCategoryId: [''],
      extCategoryRefNum: ['']
    });
  }

  ngAfterViewInit() {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.categoryForm.valueChanges, ...controlBlurs).debounceTime(250).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.categoryForm);
    });
  }

  cmdAddSubCategory(): void {
    this.parentCategory = this.selectedCategory;
    let parentResourceCategoryId: number = this.selectedCategory.resourceCategoryId;
    this.selectedCategory = this.resourceCategoryService.initResourceCategory();
    this.selectedCategory.parentResourceCategoryId = parentResourceCategoryId;
    this.selectedCategory.organisationId = this.parentCategory.organisationId;
    this.onStartEdit(this.selectedCategory);
  }

  cmdSaveCategory(): void {
    //save button clicked
    //merge the values from the form into a copy of the corresponding selectedGroup object

    //quick check - if no changes, dont save anything
    if (this.categoryForm.pristine) {
      //this logic just checks if the categories parent was NOT changed
      if((this.selectedCategory.parentResourceCategoryId > 0 && this.parentCategory && this.parentCategory.resourceCategoryId === this.selectedCategory.parentResourceCategoryId) || (this.selectedCategory.parentResourceCategoryId == 0 && !this.parentCategory)) {
        //no changes, just close
        this.onFinishEdit(false);
        return;
      }
    }

    let origCategory: IResourceCategory;
    let updatedCategoryObj: IResourceCategory;
    let parentChanged: boolean = false;

    //check if we are adding a new category or editing an existing category - simply by checking if there is an id
    if (this.selectedCategory.resourceCategoryId > 0) {
      //existing category
      origCategory = this.selectedCategory;
      if (origCategory) {
        //ok we found the match
        updatedCategoryObj = Object.assign({}, origCategory, this.selectedCategory);
        this.mergeCategoryWithFormValues(updatedCategoryObj);
        if (origCategory.parentResourceCategoryId != updatedCategoryObj.parentResourceCategoryId) {
          parentChanged = true;
        }

      } else {
        //oh no, something went wrong
        alert("Error - could not find the original category. Please refesh the screen");
        return;
      }
    } else {
      //add new category - just set the updatedGroupObj (which is sent to the web service) to the new selectedGroupObj
      updatedCategoryObj = this.selectedCategory;
      this.mergeCategoryWithFormValues(updatedCategoryObj);

      parentChanged = true;
    }

    //ok we have got to here so all is well, just do a quick sanity check to make sure we have the updatedGroupObj
    if (updatedCategoryObj) {
      //call the web service to add/edit the category
      this.resourceCategoryService.saveResourceCategory(updatedCategoryObj).subscribe(category => {

        //save is done - now next behaviour is different between add or edit.

        if (updatedCategoryObj.resourceCategoryId === 0) {
          //this was an add operation, so now add the returned categoryObj to the list
          //this.categories.push(category);
        } else {
          //this was an edit operation, so replace insitu to avoid a big refresh
          //modify(origGroup, updatedGroupObj); //helper method that is inefficient but ok on small occurances
        }
        //we are done. Hide the edit panel and clear the selectedGroup obj
        this.onFinishEdit(updatedCategoryObj.resourceCategoryId === 0 || parentChanged);
      });
    } else {
      //this is bad and completely unexpected. This should never happen but present just in case
      alert('There was an unexpected error. Please log out and log back in. (ref: cmdSaveGroup)');
      return;
    }
  }

  cmdDeleteCategory(): void {
    if (confirm('Are you sure you want to delete the category?')) {
      this.resourceCategoryService.deleteResourceCategory(this.selectedCategory.resourceCategoryId).subscribe(() => {
        this.onFinishEdit(true);
      });

    }
  }

  cmdCancelEdit(): void {
    //user clicked the cancel button
    this.onFinishEdit();
  }

  cmdSelectParentCategory(): void {
    //this enables / disables the parentGroupSelection mode
    this.parentCategorySelectionEnabled = !this.parentCategorySelectionEnabled;
    this.onSelectParent.emit(this.parentCategorySelectionEnabled);

    
  }

  cmdNoParentCategory(): void {
    //user clicked the None button indicated there is no parent category - ie the edited category will become a top level category
    this.parentCategory = null;
    this.parentCategorySelectionEnabled = false;
    this.onSelectParent.emit(this.parentCategorySelectionEnabled);
  }

  
  private mergeCategoryWithFormValues(category: IResourceCategory): void {
    //merge the form values into a category object
    category.name = this.categoryForm.get('name').value;
    category.description = this.categoryForm.get('description').value;
    category.extCategoryRefNum = this.categoryForm.get('extCategoryRefNum').value;
    if (this.parentCategory) {
      category.parentResourceCategoryId = this.parentCategory.resourceCategoryId;
    } else {
      category.parentResourceCategoryId = null;
    }

  }

  private onStartEdit(category: IResourceCategory) {
    //this method patches the category values and resets the form and makes it visible

    this.categoryForm.reset(); //reset validation

    //apply values to form
    this.categoryForm.patchValue({
      name: this.selectedCategory.name,
      description: this.selectedCategory.description,
      parentResourceCategoryId: this.selectedCategory.parentResourceCategoryId,
      extCategoryRefNum: this.selectedCategory.extCategoryRefNum
    });
  }

  private onFinishEdit(shouldReload: boolean = false): void {
    //finished editing, send message to parent that it's done and whether it should trigger a reload of the categories
    this.onFinishEditEvent.emit(shouldReload);
  }
}
