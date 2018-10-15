import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { ICourseCategory } from '../../../courses/course-categories/course-category';
import { IOrganisation } from '../../settings-organisations/organisation';
import { GenericValidator } from '../../../shared/generic-validator';
import { BsModalService } from 'ngx-bootstrap';
import { CourseCategoryService } from '../../../courses/course-categories/course-category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IMoodleImportSummary } from '../moodle-import-summary';
import { CourseCategorySelectComponent } from '../../../courses/course-categories/course-category-select.component';
import { MoodleImportService } from '../moodle-import.service';

@Component({
  selector: 'import-course-config',
  templateUrl: './import-course-config.component.html',
  styles: []
})
export class ImportCourseConfigComponent implements OnInit, OnChanges {
  courseForm: FormGroup;
  selectedCourseCategory: ICourseCategory;
  subscriptions: Subscription[] = [];
  orgs: IOrganisation[];
  
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  @Input() moodleImportSummary: IMoodleImportSummary;
  
  
  constructor(private route: ActivatedRoute, 
              private router: Router,
              private fb: FormBuilder,
              private modalService: BsModalService, 
              private changeDetection: ChangeDetectorRef,
              private courseCategoryService: CourseCategoryService,
              private moodleImportService: MoodleImportService ) {
               
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

  ngOnChanges(changes: SimpleChanges) {
    if(changes['moodleImportSummary'] && this.moodleImportSummary){
      //the moodleImportSummary value changed
     
      this.populateCourseForm();
      
    }
  }

  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.orgs = data['orgs'];
      
     

    });
  }

  populateCourseForm(): void {
    this.courseForm.reset();

    if(this.moodleImportSummary){
      this.courseForm.patchValue({
        name: this.moodleImportSummary.originalCourseFullName,
        description: this.moodleImportSummary.originalCourseSummary,
        extRefCourseNum: this.moodleImportSummary.originalCourseRefId,
        status: 0 //status hard coded to pending always
      });

      if (this.orgs && this.orgs.length > 0) {
        //couldnt find a match - default to the first organisation
        this.courseForm.patchValue({
          organisationId: this.orgs[0].organisationId
        });
      }
    }

    //initialise the moodleMappedCourseModules property as an empty array if it's undefined/null
    if(!this.moodleImportSummary.moodleMappedCourseModules){
      this.moodleImportSummary.moodleMappedCourseModules = [];

      //build a courseModuleList based on the section names
    this.moodleImportSummary.originalCourseSectionNames.map((sectionName, index) => {
      //prepare new MoodleMappedCourseModule object
      let mmcmObj = this.moodleImportService.initMoodleMappedCourseModule();

      mmcmObj.moodleSectionId = 0;
      mmcmObj.moodleSectionName = sectionName,
      mmcmObj.courseModule.name = sectionName,
      mmcmObj.courseModule.order = index
      
      //add the object to the array thats in the moodleImportSummary object
      this.moodleImportSummary.moodleMappedCourseModules.push(mmcmObj);
    });
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

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  cmdChangeOrg(): void {
    
  }
}
