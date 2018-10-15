import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { IGroup } from './group';
import { GroupService } from './group.service';

import { GenericValidator } from '../shared/generic-validator';

@Component({
  selector: 'group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.css']
})
export class GroupEditComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  parentGroupSelectionEnabled: boolean = false;

  @Input() selectedGroup: IGroup; //variable to hold a group that was clicked/selected
  
  private _parentGroup: IGroup; //variable to hold the groups parent - this is usually set by the parent component, or cleared within this component.
  @Input() 
  set parentGroup(parentGroup: IGroup){ 
    this._parentGroup = parentGroup;

    //behaviour functionality to toggle 'off' the parent selection because a parentGroup was selected
    if(this.parentGroupSelectionEnabled){
      //finish parentGroup selection mode because a parent was selected (which should have come from the parent component)  
      this.parentGroupSelectionEnabled = false; 
    }
  } 

  get parentGroup(): IGroup {return this._parentGroup; }
  
  private _showEditCard = false; //variable that shows / hides the whole component
  @Input() 
    set showEditCard(showEditCard: boolean){

      if(showEditCard){
        //value was set to true - meaning we are now showing the edit card. Lets trigger the onEdit method to populate the fields
        this.onStartEdit(this.selectedGroup);
      }

      this._showEditCard = showEditCard;
    }

    get showEditCard(): boolean { return this._showEditCard; }

  @Output() onFinishEditEvent = new EventEmitter<boolean>(); //event to tell parent that editing is finished

  @Output() onSelectParent = new EventEmitter<boolean>(); //event to tell parent controller that parentGroup selection is on or off

  groupForm: FormGroup;

  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;


  constructor(private groupService: GroupService, private fb: FormBuilder) {
    this.genericValidator = new GenericValidator(this.validationMessages);

    this.validationMessages = {
      groupName: {
        required: 'Group Name is required.',
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }


  ngOnInit() {
    this.groupForm = this.fb.group({
      groupName: ['', Validators.required],
      groupDescription: [''],
      parentGroupId: [''],
      externalGroupReferenceID: ['']
    });

    //this is redundant in the component now
    // this.groupForm.statusChanges.subscribe(() => {
    //   if (this.groupForm.dirty && this.showEditCard) {
    //     console.log('statusChanged');
    //     // this.groupItemService.allowClick = false; //REFACTOR
    //   }
    // });

  }

  ngAfterViewInit() {
    //  this.tree.treeModel.expandAll();

    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.groupForm.valueChanges, ...controlBlurs).debounceTime(250).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.groupForm);
    });
  }

  cmdAddSubGroup(): void {
    this.parentGroup = this.selectedGroup;
    let parentGroupId: number = this.selectedGroup.groupId;
    this.selectedGroup = this.groupService.initGroup();
    this.selectedGroup.parentGroupId = parentGroupId;
    this.selectedGroup.organisationId = this.parentGroup.organisationId;
    this.onStartEdit(this.selectedGroup);
  }

  cmdSaveGroup(): void {
    //save button clicked
    //merge the values from the form into a copy of the corresponding selectedGroup object

    //quick check - if no changes, dont save anything
    if (this.groupForm.pristine) {
      //this logic just checks if the groups parent was NOT changed
      if((this.selectedGroup.parentGroupId > 0 && this.parentGroup && this.parentGroup.groupId === this.selectedGroup.parentGroupId) || (this.selectedGroup.parentGroupId == 0 && !this.parentGroup)) {
        //no changes, just close
        this.onFinishEdit(false);
        return;
      }
    }

    let origGroup: IGroup;
    let updatedGroupObj: IGroup;
    let parentChanged: boolean = false;

    //check if we are adding a new group or editing an existing group - simply by checking if there is an id
    if (this.selectedGroup.groupId > 0) {
      //existing group
      origGroup = this.selectedGroup;//this.findGroupWithId(this.selectedGroup.groupId);
      if (origGroup) {
        //ok we found the match
        updatedGroupObj = Object.assign({}, origGroup, this.selectedGroup);
        this.mergeGroupWithFormValues(updatedGroupObj);
        if (origGroup.parentGroupId != updatedGroupObj.parentGroupId) {
          parentChanged = true;
        }

      } else {
        //oh no, something went wrong
        alert("Error - could not find the original group. Please refesh the screen");
        return;
      }
    } else {
      //add new group - just set the updatedGroupObj (which is sent to the web service) to the new selectedGroupObj
      updatedGroupObj = this.selectedGroup;
      this.mergeGroupWithFormValues(updatedGroupObj);

      parentChanged = true;
    }

    //ok we have got to here so all is well, just do a quick sanity check to make sure we have the updatedGroupObj
    if (updatedGroupObj) {
      //call the web service to add/edit the group
      this.groupService.saveGroup(updatedGroupObj).subscribe(group => {

        //save is done - now next behaviour is different between add or edit.

        if (updatedGroupObj.groupId === 0) {
          //this was an add operation, so now add the returned groupObj to the list
          //this.groups.push(group);
        } else {
          //this was an edit operation, so replace insitu to avoid a big refresh
          //modify(origGroup, updatedGroupObj); //helper method that is inefficient but ok on small occurances
        }
        //we are done. Hide the edit panel and clear the selectedGroup obj
        this.onFinishEdit(updatedGroupObj.groupId === 0 || parentChanged);
      });
    } else {
      //this is bad and completely unexpected. This should never happen but present just in case
      alert('There was an unexpected error. Please log out and log back in. (ref: cmdSaveGroup)');
      return;
    }
  }

  cmdDeleteGroup(): void {
    if (confirm('Are you sure you want to delete the group?')) {
      // this.groups.forEach( (groupItem, index) => {
      //   if(groupItem === this.selectedGroup) this.groups.splice(index, 1);
      // });

      //this.groups = this.groups.filter(g => g !== this.selectedGroup);

      this.groupService.deleteGroup(this.selectedGroup.groupId).subscribe(() => {
        this.onFinishEdit(true);
      });

    }
  }

  cmdCancelEdit(): void {
    //user clicked the cancel button
    this.onFinishEdit();
  }

  cmdSelectParentGroup(): void {
    //this enables / disables the parentGroupSelection mode
    this.parentGroupSelectionEnabled = !this.parentGroupSelectionEnabled;
    this.onSelectParent.emit(this.parentGroupSelectionEnabled);

    
  }

  cmdNoParentGroup(): void {
    //user clicked the None button indicated there is no parent group - ie the edited group will become a top level group
    this.parentGroup = null;
    this.parentGroupSelectionEnabled = false;
    this.onSelectParent.emit(this.parentGroupSelectionEnabled);
  }

  
  private mergeGroupWithFormValues(group: IGroup): void {
    //merge the form values into a group object
    group.name = this.groupForm.get('groupName').value;
    group.description = this.groupForm.get('groupDescription').value;
    group.extGroupRefNum = this.groupForm.get('externalGroupReferenceID').value;
    if (this.parentGroup) {
      group.parentGroupId = this.parentGroup.groupId;
    } else {
      group.parentGroupId = null;
    }

  }

  private onStartEdit(group: IGroup) {
    //this method patches the group values and resets the form and makes it visible

    this.groupForm.reset(); //reset validation

    //apply values to form
    this.groupForm.patchValue({
      groupName: this.selectedGroup.name,
      groupDescription: this.selectedGroup.description,
      parentGroupId: this.selectedGroup.parentGroupId,
      externalGroupReferenceID: this.selectedGroup.extGroupRefNum
    });
  }

  private onFinishEdit(shouldReload: boolean = false): void {
    //finished editing, send message to parent that it's done and whether it should trigger a reload of the groups
    this.onFinishEditEvent.emit(shouldReload);
  }
}
