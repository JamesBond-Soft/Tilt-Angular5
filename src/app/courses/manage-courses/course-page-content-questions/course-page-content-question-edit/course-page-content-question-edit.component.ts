import { Component, OnInit, Input, EventEmitter, Output, ViewChildren, ElementRef, OnChanges, AfterViewInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/combineLatest';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { GenericValidator } from '../../../../shared/generic-validator';

import { ICoursePageContentQuestion, ICoursePageContentQuestionType } from '../course-page-content-question';
import { ICoursePageContentQuestionResponse } from '../course-page-content-question-response';
import { CoursePageContentQuestionService } from '../course-page-content-question.service';

@Component({
  selector: 'course-page-content-question-edit',
  templateUrl: './course-page-content-question-edit.component.html',
  styleUrls: ['./course-page-content-question-edit.component.scss']
})
export class CoursePageContentQuestionEditComponent implements OnInit, OnChanges, AfterViewInit {
  pageTitle: string;
  contentQuestionForm: FormGroup;
  ICoursePageContentQuestionType = ICoursePageContentQuestionType;
  showEditResponseSection: boolean = false;
  selectedResponseItem: ICoursePageContentQuestionResponse;

  @Input() coursePageContentQuestion: ICoursePageContentQuestion;
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @Output() onFinishEditEvent = new EventEmitter<boolean>(); //event to tell parent that editing is finished
  
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator; 

  constructor(private coursePageContentQuestionService: CoursePageContentQuestionService,
              private fb: FormBuilder) {

    this.validationMessages = {
      question: {
        required: 'Question is required.',
      },
      questionType: {
        required: 'Question Type is required.',
      },
      response: {
        required: 'Response is required'
      },
      correctValue: {
        required: 'Correct Value is required',
        min: 'Correct Value % minimum is 0',
        max: 'Correct Value % maxium is 100'
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    //create the reactive form
    this.initReactiveForm();
    this.populateForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['coursePageContentBlock'] && this.coursePageContentQuestion){
      //the coursePageContentBlock value changed
      if(this.coursePageContentQuestion){
       this.populateForm();
      } else {
        this.contentQuestionForm.reset();
      }
    }
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.contentQuestionForm.valueChanges, controlBlurs).debounceTime(250).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.contentQuestionForm);
    });
  }

  initReactiveForm(): void {
    this.contentQuestionForm = this.fb.group({
      question: ['', Validators.required],
      questionType: ['', Validators.required],
      responseGroup: this.fb.group({
        response: ['', Validators.required],
        correctValue: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
      })
    });
  }

  populateForm(): void {
    if(!this.contentQuestionForm){
      this.initReactiveForm();
    }

    if(this.coursePageContentQuestion.coursePageContentQuestionId){
      //this is an edit
      this.pageTitle = 'Edit Content Question';
    } else {
      this.pageTitle = 'Add Content Question';
    }

    if(this.contentQuestionForm){
      this.contentQuestionForm.reset();
    }

    this.contentQuestionForm.patchValue({
      question: this.coursePageContentQuestion.question,
      questionType: this.coursePageContentQuestion.coursePageContentQuestionType
    });
    
  }

  cmdAddResponse(): void {
    this.selectedResponseItem = this.coursePageContentQuestionService.initialiseCoursePageContentQuestionResponse();
    this.selectedResponseItem.coursePageContentQuestionId = this.coursePageContentQuestion.coursePageContentQuestionId;
    this.selectedResponseItem.correctValue = 100;    

    this.contentQuestionForm.get('responseGroup').reset();
    this.contentQuestionForm.get('responseGroup').patchValue({
      response: this.selectedResponseItem.response,
      correctValue: this.selectedResponseItem.correctValue
    });
    this.showEditResponseSection = true;
  }
  cmdRemoveResponse(responseItem: ICoursePageContentQuestionResponse, event: Event): void {
    event.stopPropagation();
    if(confirm('Are your sure you want to remove this response?')){
      this.coursePageContentQuestion.coursePageContentQuestionResponses.forEach((ri, index) => {
        if(ri === responseItem) this.coursePageContentQuestion.coursePageContentQuestionResponses.splice(index, 1);
      });

      this.contentQuestionForm.markAsDirty();
    }
  }

  cmdSelectResponse(responseItem: ICoursePageContentQuestionResponse): void {
    this.selectedResponseItem = responseItem;

    this.contentQuestionForm.get('responseGroup').reset();
    
    this.contentQuestionForm.get('responseGroup').patchValue({
      response: this.selectedResponseItem.response,
      correctValue: +this.selectedResponseItem.correctValue * 100
    });

    this.showEditResponseSection = true;
  }

  cmdCancelEditResponse(): void {
     this.selectedResponseItem = null;
     this.showEditResponseSection = false;
     this.contentQuestionForm.get('responseGroup').reset();
  }

  cmdSaveResponse(): void {
    this.selectedResponseItem.response = this.contentQuestionForm.get('responseGroup.response').value;
    this.selectedResponseItem.correctValue = +this.contentQuestionForm.get('responseGroup.correctValue').value / 100;

    var matchingResponseItem: ICoursePageContentQuestionResponse = this.coursePageContentQuestion.coursePageContentQuestionResponses.find(r => r === this.selectedResponseItem);
    if (matchingResponseItem) {
      //this is an edit
    } else {
      //this is an add
      this.coursePageContentQuestion.coursePageContentQuestionResponses.push(this.selectedResponseItem);
      
    }

    this.selectedResponseItem = null;
    this.showEditResponseSection = false;
  }

  cmdCancelEditPageContentQuestion(): void {
    //user pressed the cancel button
    this.onFinishEditEvent.emit(false);
  }

  cmdSavePageContentQuestion(): void {
    //save changes to web service

    //validation
    if(this.contentQuestionForm.invalid){
      //prevent the user from saving as the form is invalid. This is a failsafe
      console.warn('cmdSavePageContentQuestion was called but the reactive form is invalid. Aborting save. (ref cmdSavePageContentQuestion)');
      return; 
    }
    
    //skip to go
    if(this.coursePageContentQuestion.coursePageContentQuestionId && this.contentQuestionForm.pristine){
      //skip the saving as nothing was changed during this edit
      this.onFinishEditEvent.emit(false);
      return;
    }

    //make a copy of the edited object
    let modifiedCoursePageContentQuestion = Object.assign({}, this.coursePageContentQuestion);

    //merge the reactive form values to the contentBlock item
    modifiedCoursePageContentQuestion.question = this.contentQuestionForm.get('question').value; //name
    modifiedCoursePageContentQuestion.coursePageContentQuestionType = this.contentQuestionForm.get('questionType').value;

    //save the changes
     this.coursePageContentQuestionService.saveCoursePageContentQuestion(modifiedCoursePageContentQuestion).subscribe(() => {
       this.onFinishEditEvent.emit(true);
     }, error => alert(`Error: ${error} (ref cmdSavePageContentQuestion)`));
  }
  

  cmdDeletePageContentQuestion(): void {
    //deletes the selected content block

    //ask for confirmation
    if(confirm('Are you sure you want to Delete this Content Question?')){
      //call webservice
      this.coursePageContentQuestionService.deleteCoursePageContentQuestion(this.coursePageContentQuestion.coursePageContentQuestionId).subscribe(() => {
        //call finishEdit and ensure shouldResult is true
        this.onFinishEditEvent.emit(true);
      }, error => alert(`Unexpected error: ${error}.\r\nPlease refresh the page and try again. (ref cmdDeletePageContentQuestion)`));
    }
  }

}
