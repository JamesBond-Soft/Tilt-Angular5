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
import { ICourse } from '../../courses/manage-courses/course';
import { ICourseAdhocAssignment } from '../../courses/staff-assignment/course-adhoc-assignment';
import { IGroup } from '../../groups/group';
import { SettingsUsersService } from '../../settings/settings-users/settings-users.service';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IUser } from '../../settings/settings-users/user';
import { StaffCourseAssignmentService } from './staff-course-assignment.service';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { IOrganisation } from '../../settings/settings-organisations/organisation';
import { ManageCoursesService } from '../../courses/manage-courses/manage-courses.service';
import { CourseAssignmentInfoService } from '../../training/course-assignment-info.service';
import { CourseAdhocAssignmentService } from '../../courses/staff-assignment/course-adhoc-assignment.service';

@Component({
  selector: 'app-staff-course-assignment',
  templateUrl: './staff-course-assignment.component.html',
  styleUrls: ['./staff-course-assignment.component.scss'],
  providers: [SettingsUsersService]
})

export class StaffCourseAssignmentComponent implements OnInit, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  // added by vlad
  user: IUser;
  selectedCourseId: number;
  courseAhdocAssignmentItem: ICourseAdhocAssignment;

  // for course selection variables
  orgs: IOrganisation[];
  selectedOrganisation: IOrganisation;
  courses: ICourse[];
  searchString: string;

  //
  pageTitle: string;
  course: ICourse;
  adhocForm: FormGroup;
  courseAdhocAssignmentId: number;

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
              private staffCourseAssignmentService: StaffCourseAssignmentService,
              private settingsCoursesService: ManageCoursesService,
              private courseAssignmentInfoService: CourseAssignmentInfoService,
              private courseAdhocAssignmentService: CourseAdhocAssignmentService
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
      }
    };

    this.route.data.subscribe(data => {
      this.user = data['user'];
    });

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
    this.loadOrganisations();
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    const controlBlurs: Observable<any>[] = this.formInputElements
        .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.adhocForm.valueChanges, ...controlBlurs).debounceTime(250).subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(this.adhocForm);
    });
  }

  // Save courseId when select course to assign
  selectCourse(course: ICourse) {
      this.selectedCourseId = course.courseId;
  }
  loadCourseDetails(): void {
    // get the courseAdhocAssignmentId from the url
    // this is an ADD
    this.courseAdhocAssignmentId = +this.route.snapshot.paramMap.get('courseAdhocAssignmentId');
    if (this.courseAdhocAssignmentId === 0) {
      // this is an ADD
      this.pageTitle = 'Add Course Assignment';

      this.adhocForm.reset();
      this.adhocForm.patchValue({
        repeatInterval: null,
        repeatUnit: '',
        startDate: new Date(),
        dueDate: null,
        endDate: null
      });
    } else {
      // edit or delete course
      this.pageTitle = 'Edit Course Assignment';
      this.loadAdhocAssignment(this.courseAdhocAssignmentId);
    }

  }
  loadAdhocAssignment(courseAdhocAssignmentId: number) {
    this.courseAdhocAssignmentService.getCourseAdhocAssignmentById(courseAdhocAssignmentId).subscribe(courseAdhocAssignment => {
      this.courseAhdocAssignmentItem = courseAdhocAssignment;
      this.populateFormWithDetailsEdit();
    });
  }

  populateFormWithDetailsEdit(): void  {
    this.adhocForm.reset();
    this.adhocForm.patchValue({
      repeatInterval: this.courseAhdocAssignmentItem.repeatInterval,
      repeatUnit: this.courseAhdocAssignmentItem.repeatUnit,
      // startDate: new Date(mostRecentCourseGroupAssignmentObjectAvailable.startDate),
      startDate: this.courseAhdocAssignmentItem.startDate ? moment.utc(this.courseAhdocAssignmentItem.startDate).toDate() : new Date(),
      // dueDate: mostRecentCourseGroupAssignmentObjectAvailable.dueDate ?
      // new Date(mostRecentCourseGroupAssignmentObjectAvailable.dueDate) : null,
      dueDate: this.courseAhdocAssignmentItem.dueDate ? moment.utc(this.courseAhdocAssignmentItem.dueDate).toDate() : null,
      // endDate: mostRecentCourseGroupAssignmentObjectAvailable.endDate ?
      // new Date(mostRecentCourseGroupAssignmentObjectAvailable.endDate) : null
      endDate: this.courseAhdocAssignmentItem.endDate ? moment.utc(this.courseAhdocAssignmentItem.endDate).toDate() : null
    });
  }

  cmdBack(): void {
    this.onFinishSave();
  }

  searchStringChangedEventHandler(searchString: string): void {
    this.searchStringSubject$.next(searchString);
  }

  cmdSaveCourseAdhocAssignments(): void {
    const tasks$ = [];

    if (this.adhocForm.pristine && this.courseAdhocAssignmentId !== 0) {
      // this was an edit and nothing was changed, so skip the db update
      this.onFinishSave(); // Advance to Go (Collect $200)
      return;
    } else {
        if (this.courseAdhocAssignmentId === 0) {
          // this is an ADD

          // initialise a new courseAdhocAssignmentObject
          const caaObj = this.courseAdhocAssignmentService.initialiseCourseAdhocAssignment();
          caaObj.userId = this.user.userId;
          caaObj.courseId = this.selectedCourseId;
          const modifiedCourseAdhocAssignmentObject: ICourseAdhocAssignment = this.mergeFormValuesWithCourseAdhocAssignmentObject(caaObj);
          this.courseAdhocAssignmentService.saveCourseAdhocAssignment(modifiedCourseAdhocAssignmentObject).subscribe(results => {
            // console.log(results);
            this.onFinishSave();
            return;
          },
          error => alert(`There has been an unexpected error. Please try again (ref cmdSaveCourseGroupAssignments). Error: ${error}`));
      } else {
        // Update edited course
        const existingCAAObj = this.courseAhdocAssignmentItem;
        const modifiedCourseAdhocAssignmentObject: ICourseAdhocAssignment =
        this.mergeFormValuesWithCourseAdhocAssignmentObject(existingCAAObj);
        this.courseAdhocAssignmentService.saveCourseAdhocAssignment(modifiedCourseAdhocAssignmentObject).subscribe(results => {
          // console.log(results);
          this.onFinishSave();
          return;
        },
        error => alert(`There has been an unexpected error. Please try again (ref cmdSaveCourseGroupAssignments). Error: ${error}`));
      }
    }
  }

  mergeFormValuesWithCourseAdhocAssignmentObject(caaObj: ICourseAdhocAssignment): ICourseAdhocAssignment {
    // helper function that merges courseGroupAssignment object with the form values. Returns modified object (doesnt alter original object)
    const mergedCAAObj: ICourseAdhocAssignment = Object.assign({}, caaObj, this.adhocForm.value);
    return mergedCAAObj;
  }

  cmdDeleteCourseAdhocAssignments(): void {
    // ask for confirmation
    if(!confirm('Attention: Are you sure you want to delete these Adhoc Assignment(s)?')){
      return; // user cancelled from delete
    }

    // delete going ahead
    this.courseAdhocAssignmentService.deleteCourseAdhocAssignment(this.courseAhdocAssignmentItem.courseAdhocAssignmentId)
    .subscribe(results => {
    // console.log(results);
    this.onFinishSave();
    },
    error => alert(`There has been an unexpected error. Please log out and log back in and try again. (ref cmdDeleteCourseAdhocAssignments). Error: ${error}`));
  }

  // Back navigation
  onFinishSave(): void {
    console.log(' ----------------- ', this.user.userId);
    this.router.navigate(['/staff', this.user.userId, this.user.username]);
  }

  /**
   * Load courses and select one
   */
  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.orgs = data['orgs'];

      this.selectedOrganisation = null;
      const organisationId: number = +this.route.snapshot.params['organisationId'];

      if (organisationId && organisationId > 0) {
        // tslint:disable-next-line:prefer-const
        let matchingOrg: IOrganisation = this.orgs.find(o => o.organisationId === organisationId);
        if (matchingOrg) {
          this.selectedOrganisation = matchingOrg;
        }
      }

      if (!this.selectedOrganisation && this.orgs && this.orgs.length > 0) {
        // couldnt find a match - default to the first organisation
        this.selectedOrganisation = this.orgs[0];
      }

      // load the courses now
      this.loadCourses();
    });
  }

  loadCourses(): void {
    // load the courses for the selected organisation
    if (!this.selectedOrganisation) {
      return;
    }
    this.settingsCoursesService.getCourses(this.selectedOrganisation.organisationId).subscribe(courses => {
      this.courses = courses;
    },
    error => console.log(`Unexpected error: ${error}`) 
    );
  }

  cmdChangeOrg(): void {
    // organisation dropdown value was changed, load the courses
    this.loadCourses();
  }

}
