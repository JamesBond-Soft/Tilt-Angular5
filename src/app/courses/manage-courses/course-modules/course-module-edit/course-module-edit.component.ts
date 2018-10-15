import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { GenericValidator } from '../../../../shared/generic-validator';

import { BsModalRef } from 'ngx-bootstrap';
import { ICourseModule } from '../course-module';
import { CourseModuleService } from '../course-module.service';

@Component({
  selector: 'course-module-edit',
  templateUrl: './course-module-edit.component.html',
  styleUrls: ['./course-module-edit.component.scss']
})
export class CourseModuleEditComponent implements OnInit, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  pageTitle: string;
  courseModuleForm: FormGroup;
  shouldParentRefresh: boolean;

  courseModule: ICourseModule;
 
  
  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder, public bsModalRef: BsModalRef, private manageCourseModuleService: CourseModuleService) {
    this.validationMessages = { 
      name: {
        required: 'Course Module Name is required.',
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
   }

  ngOnInit() {

    this.courseModuleForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      extCourseModuleRefNum: ['']
    });

    this.loadFormData();
  }

  loadFormData(): void {
    this.route.data.subscribe(data => {
      this.courseModule = data['courseModule'];

      if(this.courseModule){
        this.courseModuleForm.reset();
        this.courseModuleForm.patchValue({
          name: this.courseModule.name,
          description: this.courseModule.description,
          extCourseModuleRefNum: this.courseModule.extCourseModuleRefNum
  
        })
  
        if(this.courseModule.courseModuleId){
          //edit course module
          this.pageTitle = 'Edit Course Module';
        } else {
          //Add course module
          this.pageTitle = 'Add Course Module';
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
        .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.courseModuleForm.valueChanges, ...controlBlurs).debounceTime(250).subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(this.courseModuleForm);
    });
  }

  cmdSave(): void {
    if(this.courseModuleForm.dirty && this.courseModuleForm.valid){
      //attempt to save courseModule
      
      //get a copy and merge the orgForm values with the organisation object
      let courseModuleObj = Object.assign({}, this.courseModule, this.courseModuleForm.value);


      //call the service to save the org
      this.manageCourseModuleService.saveCourseModule(courseModuleObj).subscribe(
        () => {
                //successful save, lets move away
                this.onSaveComplete(true);
              },
              (error: any) => alert(`'Unexpected error: ${error}`) //bugger
      );

    } else if(!this.courseModuleForm.dirty) {
      this.onSaveComplete(false);
    }
  }

  cmdCancel(): void {
    this.onSaveComplete(false);
  }

  cmdDelete(): void {
    if(confirm('Are you sure you want to delete this course module?')){
      
      //call service to delete course module
      this.manageCourseModuleService.deleteCourseModule(this.courseModule.courseModuleId)
            .subscribe(() => this.onSaveComplete(true),
            (error: any) => alert(`'Attention: ${error}`));
    }
    

    
  }

  private onSaveComplete(shouldParentRefresh): void {
    //this.shouldParentRefresh = shouldParentRefresh;

    this.courseModuleForm.reset(); //clear any validation
    //TODO: trigger method on parent
    //this.bsModalRef.hide();
    this.router.navigate(['/courses/view', this.courseModule.courseId, this.courseModule.name]);
  }

}
