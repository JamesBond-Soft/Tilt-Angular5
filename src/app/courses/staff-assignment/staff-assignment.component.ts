import { Component, OnInit, AfterViewInit, ViewChildren, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import { StaffBasketSelectorComponent } from '../../shared/staff-basket-selector/staff-basket-selector.component';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/switchMap';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { GenericValidator } from '../../shared/generic-validator';


import { ICourse } from '../manage-courses/course';
import { ICourseAdhocAssignment } from './course-adhoc-assignment';
import { IGroup } from '../../groups/group';
import { SettingsUsersService } from '../../settings/settings-users/settings-users.service';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IUser } from '../../settings/settings-users/user';
import { CourseAdhocAssignmentService } from './course-adhoc-assignment.service';
import { moment } from 'ngx-bootstrap/chronos/test/chain';


@Component({
  selector: 'app-staff-assignment',
  templateUrl: './staff-assignment.component.html',
  styleUrls: ['./staff-assignment.component.scss'],
  providers: [SettingsUsersService]
})
export class StaffAssignmentComponent implements OnInit, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  @ViewChild('staffBasketSelector') staffBasketSelector: StaffBasketSelectorComponent;

  pageTitle: string;
  course: ICourse;
  searchString: string;
  adhocForm: FormGroup;
  courseAdhocAssignmentId: number;
  courseAdhocAssignmentList: ICourseAdhocAssignment[];
  subscriptions: Subscription[] = [];

  searchStringSubject$ = new Subject<string>();

  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private fb: FormBuilder,
              private modalService: BsModalService, 
              private changeDetection: ChangeDetectorRef,
              private settingsUserService: SettingsUsersService,
              private courseAdhocAssignmentService: CourseAdhocAssignmentService) {
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
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.adhocForm = this.fb.group({
      repeatInterval: ['', [Validators.required]],
      repeatUnit: ['never', Validators.required],
      startDate: ['', Validators.required],
      dueDate: ['', Validators.required],
      endDate: ['']
    });

    this.loadCourseDetails();
    this.staffBasketSelector.basketItems = [];


    //create observer on searchForUsersByOrganisationAndString service which is triggered every time the searchStringSubject fires a new event (ie search field changed)
    this.settingsUserService.searchForUsersByOrganisationAndString(this.course.organisationId, this.searchStringSubject$).subscribe(users => {
      //filter out any users already in basket
      this.staffBasketSelector.basketItems.forEach((user, index) => {
        let matchingIndex = users.findIndex(u => u.userId === user.userId)
        if(matchingIndex > -1){
          //found a match in the new users collection, so drop it before being passed to the basketSelectorShelfItem property
          users.splice(matchingIndex, 1);
        }
      });
      this.staffBasketSelector.shelfItems = this.settingsUserService.sortUsersByName(users);
    })
    this.searchStringSubject$.next(''); //set the text to a blank field to load all users for the organisation
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
        .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.adhocForm.valueChanges, ...controlBlurs).debounceTime(250).subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(this.adhocForm);
    });
  }

  loadCourseDetails(): void {
    //get the courseAdhocAssignmentId from the url
    this.courseAdhocAssignmentId = +this.route.snapshot.paramMap.get('courseAdhocAssignmentId')
    
    
    if(this.courseAdhocAssignmentId === 0){
      //this is an ADD
      this.pageTitle = 'Add Adhoc Staff Assignment';

      this.adhocForm.reset();
      this.adhocForm.patchValue({
        repeatInterval: null,
        repeatUnit: '',
        startDate: new Date(),
        dueDate: null,
        endDate: null
      });
      this.adhocForm.get('repeatInterval').enable();
      this.adhocForm.get('repeatUnit').enable();
      this.adhocForm.get('startDate').enable();
    } else if(this.courseAdhocAssignmentId === -2){
      //this is an multi-edit (which may have one or more items)
      let idListString = this.route.snapshot.paramMap.get('idList');
        let idList: number[];
        if (idListString.length === 0) {
          idList = [];
        } else {
          idList = idListString.replace(/, +/g, ",").split(",").map(Number);
        }
        
        //bit of logic to show plural or single
        if(idList.length > 1){
          this.pageTitle = "Edit Adhoc Staff Assignments";
        } else {
          this.pageTitle = "Edit Adhoc Staff Assignment";
        }

        this.loadMultipleCourseAdhocAssignments(idList);
    } else {
      //this is a single edit
      this.pageTitle = 'Edit Adhoc Staff Assignment';
      this.loadMultipleCourseAdhocAssignments([this.courseAdhocAssignmentId]);
    }
    //get the course object from the route (which is populated by the resolver)
    this.route.data.subscribe(data => {
      this.course = data['course'];
    });

  }

  loadMultipleCourseAdhocAssignments(courseAdhocAssignmentIdList: number[]): void {
    var tasks$ = []; //array that will hold observers for each 'getCourseGroupAssignmentById' request - as the data is loaded one by one
    courseAdhocAssignmentIdList.forEach((courseAdhocAssignmentId: number, index: number) => {
      // iterate through each courseGroupAssignmentId and 
      // call the web service to load the data. Store the observer in an array (which is observed)
      tasks$.push(this.courseAdhocAssignmentService.getCourseAdhocAssignmentById(courseAdhocAssignmentId))
    });

      // wait for the courseGroupAssignment observers to complete in parallel
      Observable.zip(...tasks$).subscribe(courseAdhocAssignmentList => {
      // all courseGroupAssignment objects now loaded from web service, store objects in array
      this.courseAdhocAssignmentList = <ICourseAdhocAssignment[]>courseAdhocAssignmentList;
      // build an number array of groupIds  from the above courseGroupAssignmentlist
      let userIdList = this.courseAdhocAssignmentList.map(caa => caa.userId);
      // now call the web servie to load the groups in ONE request (special web service method)
      this.settingsUserService.getUserCollection(userIdList).subscribe(users => {
      // groups loaded - so set the groupBasketSelector data items

      // set the shelf items to nothing - because this is an edit
      this.staffBasketSelector.shelfItems = [];

        // set the basket items to the loaded groups - because this is an edit of existing groups allocated to courseGroupAssignment objects
        this.staffBasketSelector.basketItems = users;

        this.populateFormWithDetailsFromMultiEdit();
      });
     });
  }

  populateFormWithDetailsFromMultiEdit(): void {
    //special method that tries to pre-populate the form with selective data when performing a multi-edit.
    //As the multi-edit is editing various records of DIFFERENT values, it gets messy, so this method will try to load the fields with some logic

    //pick the details from the latest item in the multi-edit collection (ie item with the biggest PK)
    let mostRecentCourseAdhocAssignmentObjectAvailable: ICourseAdhocAssignment = this.courseAdhocAssignmentList.sort((a,b) => b.courseAdhocAssignmentId - a.courseAdhocAssignmentId)[0];
    
    this.adhocForm.reset();
    this.adhocForm.patchValue({
      repeatInterval: mostRecentCourseAdhocAssignmentObjectAvailable.repeatInterval,
      repeatUnit: mostRecentCourseAdhocAssignmentObjectAvailable.repeatUnit,
      //startDate: new Date(mostRecentCourseGroupAssignmentObjectAvailable.startDate),
      startDate: mostRecentCourseAdhocAssignmentObjectAvailable.startDate ? moment.utc(mostRecentCourseAdhocAssignmentObjectAvailable.startDate).toDate() : new Date(),
      //dueDate: mostRecentCourseGroupAssignmentObjectAvailable.dueDate ? new Date(mostRecentCourseGroupAssignmentObjectAvailable.dueDate) : null,
      dueDate: mostRecentCourseAdhocAssignmentObjectAvailable.dueDate ? moment.utc(mostRecentCourseAdhocAssignmentObjectAvailable.dueDate).toDate() : null,
      //endDate: mostRecentCourseGroupAssignmentObjectAvailable.endDate ? new Date(mostRecentCourseGroupAssignmentObjectAvailable.endDate) : null
      endDate: mostRecentCourseAdhocAssignmentObjectAvailable.endDate ? moment.utc(mostRecentCourseAdhocAssignmentObjectAvailable.endDate).toDate() : null
    });

    this.adhocForm.get('repeatInterval').disable();
    this.adhocForm.get('repeatUnit').disable();
    this.adhocForm.get('startDate').disable();    
  }

  cmdBack(): void {
    this.onFinishSave();
  }

  staffbasketSelectorIsDirtyEventHandler(isDirty: boolean): void {
    //event handler that is triggered if a user makes a changed to the group basket selection. This marks the courseGroupForm as dirty
    if(isDirty){
      this.staffBasketSelector.basketItems = this.settingsUserService.sortUsersByName(this.staffBasketSelector.basketItems);
      this.staffBasketSelector.shelfItems = this.settingsUserService.sortUsersByName(this.staffBasketSelector.shelfItems);
      this.adhocForm.markAsDirty();
    }
  }

  searchStringChangedEventHandler(searchString: string): void {
    this.searchStringSubject$.next(searchString);
  }

  cmdSaveCourseAdhocAssignments(): void {
    var tasks$ = [];

    if(this.adhocForm.pristine && this.courseAdhocAssignmentId !== 0){
      //this was an edit and nothing was changed, so skip the db update
      this.onFinishSave(); //Advance to Go (Collect $200)
      return;
    } else {
      if(this.courseAdhocAssignmentId === 0){
        //this is an ADD

        //initialise a new courseAdhocAssignmentObject
        let caaObj = this.courseAdhocAssignmentService.initialiseCourseAdhocAssignment();
        caaObj.courseId = this.course.courseId; //set the courseId

        this.staffBasketSelector.basketItems.forEach((user: IUser, index) => {
          let modifiedCourseAdhocAssignmentObject:ICourseAdhocAssignment = this.mergeFormValuesWithCourseAdhocAssignmentObject(caaObj);
          modifiedCourseAdhocAssignmentObject.userId = user.userId; //set the groupId for this iteration
          tasks$.push(this.courseAdhocAssignmentService.saveCourseAdhocAssignment(modifiedCourseAdhocAssignmentObject));
        });

      } else {
        //EDIT
        //check if multi-edit
        if(this.courseAdhocAssignmentList.length > 1){
          //ask for confirmation as is affects multiple entries
          if(!confirm('Attention: You are about to made changes which alters Multiple Course Group Assignments.\r\nAre you sure you want to continue?')){
            return;
          }
        }

        //perform the saving stuff here for edit
         //now lets go through the basket items and find the corresponding existing courseGroupAssignment objects and update their values
         this.staffBasketSelector.basketItems.forEach((user: IUser, index) => {
          //find the existing courseGroupAssignment object
          let existingCAAObj = this.courseAdhocAssignmentList.find(caa => caa.userId === user.userId);
          //if we could NOT find an existing item, it means it's a new courseGroupAssignment, so add it.
          if(existingCAAObj){
            let modifiedCourseAdhocAssignmentObject:ICourseAdhocAssignment = this.mergeFormValuesWithCourseAdhocAssignmentObject(existingCAAObj);
            tasks$.push(this.courseAdhocAssignmentService.saveCourseAdhocAssignment(modifiedCourseAdhocAssignmentObject)); //UPDATE OP
          } else {
            //couldn't find existing item, it means its a new courseAdhocAssignment, so assign values and add it
            let newCourseAdhocAssignmentObject:ICourseAdhocAssignment = this.courseAdhocAssignmentService.initialiseCourseAdhocAssignment();
            newCourseAdhocAssignmentObject.courseId = this.course.courseId;
            newCourseAdhocAssignmentObject.userId = user.userId;
            newCourseAdhocAssignmentObject = this.mergeFormValuesWithCourseAdhocAssignmentObject(newCourseAdhocAssignmentObject);
            tasks$.push(this.courseAdhocAssignmentService.saveCourseAdhocAssignment(newCourseAdhocAssignmentObject)); //INSERT OP
          }
        });

        //now look for any courseGroupAssignment objects that happen to have the group now on the shelf
        this.staffBasketSelector.shelfItems.forEach((user: IUser, index) => {
           //find the existing courseGroupAssignment object
           let existingCAAObj = this.courseAdhocAssignmentList.find(caa => caa.userId === user.userId);
           if(existingCAAObj){
             //bugger - found existing one that now needs to be deleted.
             tasks$.push(this.courseAdhocAssignmentService.deleteCourseAdhocAssignment(existingCAAObj.courseAdhocAssignmentId)); //DELETE OP
           }
        });
        //done!
      }

       //observe for the tasks to complete - as there may be multiple calls to the db      
       Observable.forkJoin(tasks$).subscribe(results => {
        //console.log(results);
        this.onFinishSave();
        return;
      },
      error => alert(`There has been an unexpected error. Please try again (ref cmdSaveCourseGroupAssignments). Error: ${error}`));
    }
  }

  mergeFormValuesWithCourseAdhocAssignmentObject(caaObj: ICourseAdhocAssignment): ICourseAdhocAssignment {
    //helper function that merges courseGroupAssignment object with the form values. Returns modified object (doesnt alter original object)
    let mergedCAAObj: ICourseAdhocAssignment = Object.assign({}, caaObj, this.adhocForm.value);
    return mergedCAAObj;
  }

  cmdDeleteCourseAdhocAssignments(): void {
    //ask for confirmation
    if(!confirm('Attention: Are you sure you want to delete these Adhoc Assignment(s)?')){
      return; //user cancelled from delete
    }

    //delete going ahead
    var tasks$ = []; //array to hold observables if there are multiple items being deleted

     this.courseAdhocAssignmentList.forEach((existingCAAObj, index) => {
       tasks$.push(this.courseAdhocAssignmentService.deleteCourseAdhocAssignment(existingCAAObj.courseAdhocAssignmentId)); //DELETE OP
     });

    //observe for the tasks to complete - as there may be multiple calls to the db      
    Observable.forkJoin(tasks$).subscribe(results => {
      //console.log(results);
      this.onFinishSave();
    },
    error => alert(`There has been an unexpected error. Please log out and log back in and try again. (ref cmdDeleteCourseAdhocAssignments). Error: ${error}`));

    //done!
  }

  onFinishSave(): void {
    this.router.navigate(['/courses/view', this.course.courseId, this.course.name]);
  }

}
