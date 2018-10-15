import { Component, OnInit, AfterViewInit, ViewChildren, ViewChild, ElementRef, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/zip';

import { GenericValidator } from '../../shared/generic-validator';


import { ICourse } from '../manage-courses/course';

import { IGroup } from '../../groups/group';
import { GroupService } from '../../groups/group.service';

import { ICourseGroupAssignment } from './course-group-assignment';
import { CourseGroupAssignmentService } from './course-group-assignment.service';

import {BasketSelectorComponent} from '../../shared/basket-selector/basket-selector.component';
import { moment } from 'ngx-bootstrap/chronos/test/chain';



@Component({
  selector: 'app-group-assignment',
  templateUrl: './group-assignment.component.html',
  styleUrls: ['./group-assignment.component.scss'],
  providers: [GroupService]
})
export class GroupAssignmentComponent implements OnInit, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  
  @ViewChild('groupBasketSelector') groupBasketSelector: BasketSelectorComponent;

  pageTitle: string;
  course: ICourse;
  courseGroupForm: FormGroup;
  courseGroupAssignmentId: number;
  courseGroupAssignment: ICourseGroupAssignment;

  availableGroups: IGroup[];

  courseGroupAssignmentList: ICourseGroupAssignment[];

  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private groupService: GroupService,
    private courseGroupAssignmentService: CourseGroupAssignmentService
  ) {
    this.validationMessages = {
      repeatInterval: {
        required: 'Repeat Number is required.',
      },
      repeatUnit: {
        required: 'Repeat Unit is required.'
      },
      startDate: {
        required: 'Start Date is required'
      },
      dueDate: {
        required: 'Due Date is required'
      },
      subGroupsCanInherit: {
        required: 'Sub-Groups Can Inherit courses require an answer'
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
   }

  ngOnInit() {
    this.courseGroupForm = this.fb.group({
      repeatInterval: ['', [Validators.required]],
      repeatUnit: ['never', Validators.required],
      startDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      endDate: [''],
      subGroupsCanInherit: ['true']
    });

    this.loadCourseDetails();
    

  }

  loadCourseDetails(): void {
    this.courseGroupAssignmentId = +this.route.snapshot.params['courseGroupAssignmentId'];

    //get the course object from the route (which is populated by the resolver)
    this.route.data.subscribe(data => {
      this.course = data['course'];

      if(this.courseGroupAssignmentId === -2){
        //this is a multi-item edit...
        ///load the items seperately
        
        this.courseGroupAssignment = null;

        //courseGroupAssignmentList
        let idListString = this.route.snapshot.paramMap.get('idList');
        let idList: number[];
        if (idListString.length === 0) {
          idList = [];
        } else {
          idList = idListString.replace(/, +/g, ",").split(",").map(Number);
        }
        
        if(idList.length > 1){
          this.pageTitle = "Edit Group Assignments";
        } else {
          this.pageTitle = "Edit Group Assignment";
        }
        this.loadMultipleCourseGroups(idList);

      } else {
        this.courseGroupAssignment = data['courseGroupAssignment'];

        if(this.courseGroupAssignmentId === 0){
          this.pageTitle = "Add Group Assignment";
          //set the start date as today
          this.courseGroupAssignment.startDate = new Date();

          this.courseGroupForm.reset();
          this.courseGroupForm.patchValue({
            repeatInterval: this.courseGroupAssignment.repeatInterval,
            repeatUnit: this.courseGroupAssignment.repeatUnit,
            subGroupsCanInherit: this.courseGroupAssignment.subGroupsCanInherit,
            startDate: new Date(this.courseGroupAssignment.startDate),
            dueDate: this.courseGroupAssignment.dueDate ? new Date(this.courseGroupAssignment.dueDate) : null,
            endDate: this.courseGroupAssignment.endDate ? new Date(this.courseGroupAssignment.endDate) : null
          });
          this.courseGroupForm.get('repeatInterval').enable();
          this.courseGroupForm.get('repeatUnit').enable();
          this.courseGroupForm.get('startDate').enable();

          this.loadAvailableGroups();
        } else {
          this.pageTitle = "Edit Group Assignment";
          this.loadMultipleCourseGroups([this.courseGroupAssignment.courseGroupAssignmentId]);
          // //get the specific group and put it in the basket
          // this.groupService.getGroupCollection([this.courseGroupAssignment.groupId]).subscribe(groups => {
          //   //this will be an array of 1
          //   this.groupBasketSelector.shelfItems = [];
          //   this.groupBasketSelector.basketItems = groups;
          // })
        }
      
        

      
      }
    });
  }

  loadAvailableGroups(): void {
    this.groupService.getGroups(this.course.organisationId).subscribe(groups => {
      this.availableGroups = groups;

      this.groupBasketSelector.shelfItems = this.availableGroups;
      this.groupBasketSelector.basketItems = [];
    });
  }

  loadMultipleCourseGroups(courseGroupAssignmentIdList: number[]): void {
    var tasks$ = []; //array that will hold observers for each 'getCourseGroupAssignmentById' request - as the data is loaded one by one
    courseGroupAssignmentIdList.forEach((courseGroupAssignmentId: number, index: number) => {
      //iterate through each courseGroupAssignmentId and call the web service to load the data. Store the observer in an array (which is observed)
      tasks$.push(this.courseGroupAssignmentService.getCourseGroupAssignmentById(courseGroupAssignmentId))
    });

      //wait for the courseGroupAssignment observers to complete in parallel
      Observable.zip(...tasks$).subscribe(courseGroupAssignmentList => {
      //all courseGroupAssignment objects now loaded from web service, store objects in array
      this.courseGroupAssignmentList = <ICourseGroupAssignment[]>courseGroupAssignmentList;
      
      //build an number array of groupIds  from the above courseGroupAssignmentlist
      let groupIdList = this.courseGroupAssignmentList.map(cga => cga.groupId);
      
      //now call the web servie to load the groups in ONE request (special web service method)
      this.groupService.getGroupCollection(groupIdList).subscribe(groups => {
        //groups loaded - so set the groupBasketSelector data items

        //set the shelf items to nothing - because this is an edit
        this.groupBasketSelector.shelfItems = [];

        //set the basket items to the loaded groups - because this is an edit of existing groups allocated to courseGroupAssignment objects
        this.groupBasketSelector.basketItems = groups;

        this.populateFormWithDetailsFromMultiEdit();
      });
     });

     this.courseGroupForm.get('repeatInterval').disable();
     this.courseGroupForm.get('repeatUnit').disable();
     this.courseGroupForm.get('startDate').disable();
  }

  populateFormWithDetailsFromMultiEdit(): void {
    //special method that tries to pre-populate the form with selective data when performing a multi-edit.
    //As the multi-edit is editing various records of DIFFERENT values, it gets messy, so this method will try to load the fields with some logic

    //pick the details from the latest item in the multi-edit collection (ie item with the biggest PK)
    let mostRecentCourseGroupAssignmentObjectAvailable: ICourseGroupAssignment = this.courseGroupAssignmentList.sort((a,b) => b.courseGroupAssignmentId - a.courseGroupAssignmentId)[0];
    
    this.courseGroupForm.reset();
        this.courseGroupForm.patchValue({
          repeatInterval: mostRecentCourseGroupAssignmentObjectAvailable.repeatInterval,
          repeatUnit: mostRecentCourseGroupAssignmentObjectAvailable.repeatUnit,
          subGroupsCanInherit: mostRecentCourseGroupAssignmentObjectAvailable.subGroupsCanInherit,
          //startDate: new Date(mostRecentCourseGroupAssignmentObjectAvailable.startDate),
          startDate: mostRecentCourseGroupAssignmentObjectAvailable.startDate ? moment.utc(mostRecentCourseGroupAssignmentObjectAvailable.startDate).toDate() : new Date(),
          //dueDate: mostRecentCourseGroupAssignmentObjectAvailable.dueDate ? new Date(mostRecentCourseGroupAssignmentObjectAvailable.dueDate) : null,
          dueDate: mostRecentCourseGroupAssignmentObjectAvailable.dueDate ? moment.utc(mostRecentCourseGroupAssignmentObjectAvailable.dueDate).toDate() : null,
          //endDate: mostRecentCourseGroupAssignmentObjectAvailable.endDate ? new Date(mostRecentCourseGroupAssignmentObjectAvailable.endDate) : null
          endDate: mostRecentCourseGroupAssignmentObjectAvailable.endDate ? moment.utc(mostRecentCourseGroupAssignmentObjectAvailable.endDate).toDate() : null
        });
  }


  cmdSaveCourseGroupAssignments(): void {
    

    var tasks$ = [];

    if(this.courseGroupForm.pristine && this.courseGroupAssignmentId !== 0){
      //this was an edit but nothing was changed so skip saving
      this.onFinishSave();
    } else {
      //determine if this is an add / update single / update multi behaviour
      if(this.courseGroupAssignment && this.courseGroupAssignmentId === 0){
        //ADD MODE
        this.groupBasketSelector.basketItems.forEach((group: IGroup, index) => {
          let modifiedCourseGroupAssignmentObject:ICourseGroupAssignment = this.mergeFormValuesWithCourseGroupAssignmentObject(this.courseGroupAssignment);
          modifiedCourseGroupAssignmentObject.groupId = group.groupId; //set the groupId for this iteration
          tasks$.push(this.courseGroupAssignmentService.saveCourseGroupAssignment(modifiedCourseGroupAssignmentObject));
        });
        
      } else {
        //EDIT
        //ask for validation to continue if it's a multi edit
        if(this.courseGroupAssignmentList.length > 1){
          //only ask for validation if the multi-edit is actually multi-edit!!
          if(!confirm('Attention: You are about to made changes which alters Multiple Course Group Assignments.\r\nAre you sure you want to continue?')){
            return;
          }
        }

        //ok so we got to here. Now the fun part


        //now lets go through the basket items and find the corresponding existing courseGroupAssignment objects and update their values
        this.groupBasketSelector.basketItems.forEach((group: IGroup, index) => {
          //find the existing courseGroupAssignment object
          let existingCGAObj = this.courseGroupAssignmentList.find(cga => cga.groupId === group.groupId);
          //if we could NOT find an existing item, it means it's a new courseGroupAssignment, so add it.
          if(existingCGAObj){
            let modifiedCourseGroupAssignmentObject:ICourseGroupAssignment = this.mergeFormValuesWithCourseGroupAssignmentObject(existingCGAObj);
            tasks$.push(this.courseGroupAssignmentService.saveCourseGroupAssignment(modifiedCourseGroupAssignmentObject)); //UPDATE OP
          } else {
            //couldn't find existing item, it means its a new courseGroupAssignment, so assign values and add it
            let newCourseGroupAssignmentObject:ICourseGroupAssignment = this.courseGroupAssignmentService.initialiseCourseGroupAssignment();
            newCourseGroupAssignmentObject.courseId = this.course.courseId;
            newCourseGroupAssignmentObject.groupId = group.groupId;
            newCourseGroupAssignmentObject = this.mergeFormValuesWithCourseGroupAssignmentObject(newCourseGroupAssignmentObject);
            tasks$.push(this.courseGroupAssignmentService.saveCourseGroupAssignment(newCourseGroupAssignmentObject)); //INSERT OP
          }
        });

        //now look for any courseGroupAssignment objects that happen to have the group now on the shelf
        this.groupBasketSelector.shelfItems.forEach((group: IGroup, index) => {
           //find the existing courseGroupAssignment object
           let existingCGAObj = this.courseGroupAssignmentList.find(cga => cga.groupId === group.groupId);
           if(existingCGAObj){
             //bugger - found existing one that now needs to be deleted.
             tasks$.push(this.courseGroupAssignmentService.deleteCourseGroupAssignment(existingCGAObj.courseGroupAssignmentId)); //DELETE OP
           }
        });
        //done!
        
      }

      //observe for the tasks to complete - as there may be multiple calls to the db      
      Observable.forkJoin(tasks$).subscribe(results => {
        //console.log(results);
        this.onFinishSave();
      },
      error => alert(`There has been an unexpected error. Please try again (ref cmdSaveCourseGroupAssignments). Error: ${error}`));
      
    }
  }

  mergeFormValuesWithCourseGroupAssignmentObject(cgaObj: ICourseGroupAssignment): ICourseGroupAssignment {
    //helper function that merges courseGroupAssignment object with the form values. Returns modified object (doesnt alter original object)
    let mergedCGAObj: ICourseGroupAssignment = Object.assign({}, cgaObj, this.courseGroupForm.value);
    return mergedCGAObj;
  }

  cmdDeleteCourseGroupAssignments(): void {
    //ask for confirmation
    if(!confirm('Attention: Are you sure you want to delete these Group Assignment(s)?')){
      return; //user cancelled from delete
    }

    //delete going ahead
    var tasks$ = []; //array to hold observables if there are multiple items being deleted

    this.courseGroupAssignmentList.forEach((existingCGAObj, index) => {
      tasks$.push(this.courseGroupAssignmentService.deleteCourseGroupAssignment(existingCGAObj.courseGroupAssignmentId)); //DELETE OP
    });

    //observe for the tasks to complete - as there may be multiple calls to the db      
    Observable.forkJoin(tasks$).subscribe(results => {
      //console.log(results);
      this.onFinishSave();
    },
    error => alert(`There has been an unexpected error. Please log out and log back in and try again. (ref cmdDeleteCourseGroupAssignments). Error: ${error}`));

    //done!
  }

  onFinishSave(): void {
    this.router.navigate(['/courses/view', this.course.courseId, this.course.name]);
  }

  cmdBack(): void {
   this.onFinishSave();
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
        .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.courseGroupForm.valueChanges, ...controlBlurs).debounceTime(250).subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(this.courseGroupForm);
    });
  }

  cmdExpandAll(): void {

  }

  cmdHideAll(): void {
    
  }

  basketSelectorIsDirtyEventHandler(isDirty: boolean): void {
    //event handler that is triggered if a user makes a changed to the group basket selection. This marks the courseGroupForm as dirty
    if(isDirty){
      this.courseGroupForm.markAsDirty();
    }
  }
}
