import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { ICourse } from '../course';

import { GenericValidator } from '../../../shared/generic-validator';
import { ManageCoursesService } from '../manage-courses.service';
import { LoginService } from '../../../login/login.service';
import { CourseCategorySelectComponent } from '../../course-categories/course-category-select.component';
import { ICourseCategory } from '../../course-categories/course-category';
import { CourseCategoryService } from '../../course-categories/course-category.service';
import { IOrganisation } from '../../../settings/settings-organisations/organisation';
import { ICoursePrerequisites } from '../../course-prerequisites/course-prerequisites';
import { CoursePrerequisitesService } from '../../course-prerequisites/course-prerequisites.service';
import { CoursePrerequisitesComponent } from '../../course-prerequisites/course-prerequisites.component';

@Component({
  templateUrl: './course-edit.component.html',
  styleUrls: ['./course-edit.component.scss']
}) 
export class CourseEditComponent implements OnInit, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  pageTitle: string;
  courseForm: FormGroup;
  course: ICourse;
  selectedCourseCategory: ICourseCategory;
  subscriptions: Subscription[] = [];
  orgs: IOrganisation[];  
  coursePrerequisistes: ICoursePrerequisites[] = new Array();

  //selectedOrganisation: IOrganisation;
  
  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private route: ActivatedRoute, 
    private router: Router, 
    private fb: FormBuilder, 
    private manageCoursesService: ManageCoursesService, 
    private loginService: LoginService, 
    private modalService: BsModalService, 
    private changeDetection: ChangeDetectorRef,
    private courseCategoryService: CourseCategoryService,
    private coursePrerequisisteService: CoursePrerequisitesService) {

    this.validationMessages = {
      name: {
        required: 'Course Name is required.',
      },
      organisationId: {
        required: 'Organisation is required'
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
   }

  ngOnInit() {
    this.courseForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      extRefCourseNum: [''],
      organisationId: ['', Validators.required],
      status: ['', Validators.required]
    });

    this.loadOrganisations();
  }

  loadForm(): void {
    this.route.data.subscribe(data => {
      this.course = data['course'];

      if(this.course.courseId == 0){
        this.pageTitle = 'Add New Course';
        //stub to set the organisationId first
        // if(!this.course.organisationId && this.loginService.currentUser && this.loginService.currentUser.organisationId){
        //   this.course.organisationId = this.loginService.currentUser.organisationId; //default to current organisation of user - which may or may not exist
        // }
        if(!this.course.organisationId){
          //set it to the first course available in the list
          if(this.orgs && this.orgs.length){
            this.course.organisationId = this.orgs[0].organisationId;
          }
        }
      } else {
        this.pageTitle = 'Edit Existing Course';

        this.coursePrerequisisteService.getCoursePrerequisites(this.course.courseId).subscribe(data=>{
          this.coursePrerequisistes = data;        
        });
      }
      
      if(this.courseForm){
        this.courseForm.reset();
      }

      this.courseForm.patchValue({
        name: this.course.name, //keep names same
        description: this.course.description,
        extRefCourseNum: this.course.extRefCourseNum,
        organisationId: this.course.organisationId,
        status: this.course.status
      });

      

      if(this.course.courseCategoryId){
        //load the courseCategory object
        this.courseCategoryService.getCourseCategory(+this.course.courseCategoryId).subscribe(courseCategory => {
          this.selectedCourseCategory = courseCategory;
        });
      } else {
        this.selectedCourseCategory = null;
      }
    });
  }

  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.orgs = data['orgs'];

      // this.selectedOrganisation = null;
      // let organisationId: number = +this.route.snapshot.params['organisationId'];

      // if (organisationId && organisationId > 0) {
      //   var matchingOrg: IOrganisation = this.orgs.find(o => o.organisationId === organisationId);
      //   if (matchingOrg) {
      //     this.selectedOrganisation = matchingOrg;
      //   }
      // }

      // if (!this.selectedOrganisation && this.orgs && this.orgs.length > 0) {
      //   //couldnt find a match - default to the first organisation
      //   this.selectedOrganisation = this.orgs[0];
      // }

      //load the courses now
      this.loadForm();
    });
  }

  cmdChangeOrg(): void {
    //organisation dropdown value was changed, load the courses
   // this.loadCourses();
   if(this.selectedCourseCategory.organisationId != +this.courseForm.get('organisationId').value){
     //the course catagory is from a different organisation, so clear it's value
    this.selectedCourseCategory = null;
   }
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
        .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.courseForm.valueChanges, ...controlBlurs).debounceTime(250).subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(this.courseForm);
    });
  }

  cmdSave(): void {
    if(this.selectedCourseCategory && this.course.courseCategoryId != this.selectedCourseCategory.courseCategoryId){
      //course category has changed
      this.course.courseCategoryId = this.selectedCourseCategory.courseCategoryId;
      this.courseForm.markAsDirty();
    } else if(!this.selectedCourseCategory && this.course.courseCategoryId){
      //course category was changed to null
      this.course.courseCategoryId = null;
      this.courseForm.markAsDirty();
    }

    if(this.courseForm.dirty && this.courseForm.valid){
      //attempt to save course
      
      //get a copy and merge the orgForm values with the organisation object
      let courseObj = Object.assign({}, this.course, this.courseForm.value);


      //call the service to save the org
      this.manageCoursesService.saveCourse(courseObj).subscribe(
        (data) => {
          this.coursePrerequisisteService.deletePrerequisiteOfCourses(data.courseId).subscribe(()=>{
            this.coursePrerequisisteService.saveCourePrerequisites(this.coursePrerequisistes,data.courseId).subscribe(()=>{
                //successful save, lets move away
                this.onSaveComplete();
            })
          })         
        },
        (error: any) => alert(`'Unexpected error: ${error}`) //bugger
      );
    } else if(!this.courseForm.dirty) {
      this.onSaveComplete();
    }
  }

  cmdDelete(): void {
    if(confirm('Are you sure you want to delete this course?')){
      //call service to delete org
      this.manageCoursesService.deleteCourse(this.course.courseId)
            .subscribe(() => this.onSaveComplete(true),
            (error: any) => alert(`'Attention: ${error}`));
    }
  }

  cmdCancel(): void {
    //do nothing - go back to the manage courses screen
    this.onSaveComplete();
  }

  private onSaveComplete(takeBacktoCourseList: boolean = false): void {
    this.courseForm.reset(); //clear any validation

    if(this.course.courseId){
      //this was an edit - so take user back to course-view
      this.router.navigate(['/courses/view', this.course.courseId, this.course.name]);
    } else {
      //take the user back to the courses-list
      this.router.navigate(['/courses/manage']);
    }
    
  }

  cmdSelectCourseCategory(): void {
    const initialState = {
      openedAsModal: true,
      organisationId: +this.courseForm.get('organisationId').value, //this.course.organisationId,
      selectedCategory: this.selectedCourseCategory
    };
    let courseCategorySelectCompModalRef = this.modalService.show(CourseCategorySelectComponent, {initialState: initialState, class: 'modal-lg'});

    const _combine = Observable.combineLatest(
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        const _reason = reason ? `, dismissed by ${reason}` : '';
        if (_reason.length === 0) {
          //the modal was closed normally (ie by use pressing a close button / hide js, not escape or clicked in the background)
          
          //get any data from the component if needed
          let courseCategorySelectComp: CourseCategorySelectComponent = courseCategorySelectCompModalRef.content;
          if(courseCategorySelectComp){
            //set the selectedCategory as what to was selected in the component which could be a category OR NULL!!
            this.selectedCourseCategory = courseCategorySelectComp.selectedCategory;  
          }
        }
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    this.subscriptions.push(_combine);
  }

  cmdSelectCoursePrerequisite():void{
    const initialState = {
      openedAsModal: true,
      organisationId: +this.courseForm.get('organisationId').value, //this.course.organisationId,
      selectedCourse : this.course,
      coursePrerequisites: this.coursePrerequisistes
    };

    let coursePrerequisiteCompModalRef = this.modalService.show(CoursePrerequisitesComponent, {initialState: initialState, class: 'modal-lg modal-max-width' });

    const _combine = Observable.combineLatest(
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        const _reason = reason ? `, dismissed by ${reason}` : '';
        if (_reason.length === 0) {
          //the modal was closed normally (ie by use pressing a close button / hide js, not escape or clicked in the background)
          
          //get any data from the component if needed
          let coursePrerequisiteSelectComp: CoursePrerequisitesComponent = coursePrerequisiteCompModalRef.content;
          if(coursePrerequisiteSelectComp){
            
            

            let updatedData = coursePrerequisiteSelectComp.coursePrerequisites;

            if(this.coursePrerequisistes.length != updatedData.length)
            {
              this.courseForm.markAsDirty();
            }else{
              this.coursePrerequisistes.forEach(d=>{
                updatedData.forEach(u => {
                  if(d.prerequisiteCourseId!= u.prerequisiteCourseId)
                  {
                    this.courseForm.markAsDirty();
                  }
                });
              });
            }           

            this.coursePrerequisistes = updatedData;  
          }
        }
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    this.subscriptions.push(_combine);
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }
}
