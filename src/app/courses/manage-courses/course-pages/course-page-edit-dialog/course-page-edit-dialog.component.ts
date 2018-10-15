
import { Component, OnInit, AfterViewInit, ViewChildren, ViewChild, ElementRef, Input, ChangeDetectorRef, EventEmitter, Output, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { GenericValidator } from '../../../../shared/generic-validator';
import { ICoursePage } from '../course-page';
import { CoursePageService } from '../course-page.service';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap';
@Component({
  selector: 'course-page-edit-dialog',
  templateUrl: './course-page-edit-dialog.component.html',
  styleUrls: ['./course-page-edit-dialog.component.scss']
})
export class CoursePageEditDialogComponent implements OnInit {
  
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('editPageTemplate') editPageTemplate: ElementRef;

  modalTitle: string;
  pageForm: FormGroup;
  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  private _page: ICoursePage;
  @Input()
  set page(page: ICoursePage) {
    this._page = page;
    this.onStartEdit();
  }
  get page(): ICoursePage { return this._page };

  parentShouldReload: boolean;

  constructor(private fb: FormBuilder,
    private manageCoursePageService: CoursePageService,
    public bsModalRef: BsModalRef) {
    this.validationMessages = {
      name: {
        required: 'Page Name is required.',
      },
      pageType: {
        required: 'Page Type is required.',
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);

    this.pageForm = this.fb.group({
      name: ['', Validators.required],
      pageType: ['', Validators.required]
    });
  }

  ngOnInit() {
   
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.pageForm.valueChanges, ...controlBlurs).debounceTime(250).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.pageForm);
    });
  }

  private onStartEdit() {
    //this method patches the group values and resets the form and makes it visible

    if (!this.page) {
      //don't do anything if the page is missing/invalid
      return;
    }

    this.pageForm.reset(); //reset validation

    //apply values to form
    this.pageForm.patchValue({
      name: this.page.name,
      pageType: this.page.coursePageContent.templateType
    });

    //set the title
    if (this.page.coursePageId) {
      //this is an edit
      this.modalTitle = "Edit Page";
      this.pageForm.get('pageType').disable();
    } else {
      //this is an add
      this.modalTitle = "Add Page";
      this.pageForm.get('pageType').enable();
    }
  }

  private onFinishEdit(shouldReload: boolean = false): void {
    //finished editing, set message that is read by parent to indicate whether it should trigger a reload of its data when the modal has hidden
    this.parentShouldReload = shouldReload;
    this.bsModalRef.hide();
  }

  cmdSave(): void {
    if (!this.pageForm.dirty && this.page.coursePageId > 0) {
      //question wasnt changed, skip saving - finish cleanly
      this.onFinishEdit(false);
      return;
    } else {
      //save changes
      let updatedPageObj: ICoursePage = Object.assign({}, this.page);
      this.mergePageWithFormValues(updatedPageObj);

      this.manageCoursePageService.saveCoursePage(updatedPageObj).subscribe(() => {
        this.onFinishEdit(true);
      },
        error => alert(error));


    }
  }

  cmdCancel(): void {
    if (this.pageForm.dirty) {
      //this.onFinishEditEvent.emit(true);
      this.onFinishEdit(true);
    } else {
      //this.onFinishEditEvent.emit(false);
      this.onFinishEdit(false);
    }
  }
  cmdDelete(): void {
    if (confirm('Are you sure you want to delete the page?')) {
      this.manageCoursePageService.deleteCoursePage(this.page.coursePageId).subscribe(() => {
        this.onFinishEdit(true);
      });
    }
  }

  private mergePageWithFormValues(pageObj: ICoursePage): void {
    //merge the form values into a group object
    pageObj.name = this.pageForm.get('name').value;
    pageObj.coursePageContent.templateType = +this.pageForm.get('pageType').value;
  }
}
