import { Component, OnInit, ViewChild, TemplateRef, OnChanges, AfterViewInit, SimpleChanges, ElementRef, ViewChildren } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/combineLatest';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { GenericValidator } from '../../shared/generic-validator';
import { ICoursePageContentQuestion } from '../../courses/manage-courses/course-page-content-questions/course-page-content-question';
import { ICoursePageContentQuestionPack } from '../../courses/manage-courses/course-page-content-questions/course-page-content-question-pack';
import { CoursePageContentQuestionService } from '../../courses/manage-courses/course-page-content-questions/course-page-content-question.service';
import { CoursePageContentQuestionPackService } from '../../courses/manage-courses/course-page-content-questions/course-page-content-question-pack.service';
import { ICoursePageContentQuestionResponse } from '../../courses/manage-courses/course-page-content-questions/course-page-content-question-response';
import { forEach } from '@angular/router/src/utils/collection';


@Component({
  selector: 'app-question-picker-dialog',
  templateUrl: './question-picker-dialog.component.html',
  styleUrls: ['./question-picker-dialog.component.scss']
})
export class QuestionPickerDialogComponent implements OnInit, OnChanges, AfterViewInit {
  pageTitle: string = 'Drag and Drop Response';
  questionForm: FormGroup;
  questionGroups: FormArray;
  questionPack: ICoursePageContentQuestionPack;

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator; 

  constructor(private bsModalRef: BsModalRef, 
    private modalService: BsModalService,
    private fb: FormBuilder,
    private coursePageContentQuestionService: CoursePageContentQuestionService,
    private coursePageContentQuestionPackService: CoursePageContentQuestionPackService) {

      this.validationMessages = {
        question: {
          required: 'Question is required.',
        },
        correctAnswer: {
          required: 'Response is required'
        },
        maximumAllowedWrong: {
          required: 'Maximum Allowed Wrong is required.',
          min: 'Minimum value of 0 is required'
        }
      };
  
      this.genericValidator = new GenericValidator(this.validationMessages);
     }

  ngOnInit() {
    this.initForm();
    this.populateForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    // if(changes['coursePageContentBlock'] && this.coursePageContentQuestion){
    //   //the coursePageContentBlock value changed
    //   if(this.coursePageContentQuestion){
    //    this.populateForm();
    //   } else {
    //     this.questionForm.reset();
    //   }
    // }
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.questionForm.valueChanges, controlBlurs).debounceTime(250).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.questionForm);
    });
  }

  private initForm(): void {
    this.questionForm = this.fb.group({
      questions: this.fb.array([]),
      incorrectAnswers: [''],
      maximumAllowedWrong: ['', [Validators.required, Validators.min(0)]]
    });
  }

  private createQuestionGroup(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
      correctAnswer: ['', Validators.required],
      id: ['']
    });
  }

  private populateForm(): void {
    //initialise a new questionPack if none was provided to this component
    if(!this.questionPack){
      this.questionPack = this.coursePageContentQuestionPackService.initialiseCoursePageContentQuestionPack();
      console.log("Initialised new CoursePageContentQuestionPack");
    }

    if(!this.questionPack.coursePageContentQuestions || (this.questionPack.coursePageContentQuestions && this.questionPack.coursePageContentQuestions.length === 0)){
      this.questionPack.coursePageContentQuestions = []; //create new array
      this.cmdAddQuestion(); //create a new blank question
    }

    this.questionForm.patchValue({
      //incorrectAnswers: //'One\r\nPer\r\nLine\r\n',
      maximumAllowedWrong: this.questionPack.maximumAllowedWrong
    })
    
    //declare tmp array to hold incorrectResponses
    let incorrectAnswerArray: string[] = [];

    //populate the questions
    this.questionGroups = this.questionForm.get('questions') as FormArray;
    this.questionPack.coursePageContentQuestions.forEach(q => {
      let validResponseItem = q.coursePageContentQuestionResponses.find(r => r.correctValue === 1); //get the valid response item (if it exists!)

      let qgItem = this.createQuestionGroup(); //create a new question+response formGroup
      qgItem.patchValue({
        id: q.coursePageContentQuestionId,
        question: q.question,
        correctAnswer: validResponseItem ? validResponseItem.response : ''
      });
      this.questionGroups.push(qgItem); //add the question formGroup to the questionGroups FormArray

      //populate the incorrectAnswers - add unique items to the incorrectAnswer array
      q.coursePageContentQuestionResponses.forEach(r => {
        //we are iterating through ALL responses, so check if the current response is an incorrectAnswer
        if(r.correctValue === 0){
          //ok this response is an incorrectAnswer, so check if it's not already in the incorrectAnswerArray
          if(!incorrectAnswerArray.some(ia => ia === r.response)){
            //not already in the incorrectAnswers array, so add it
            incorrectAnswerArray.push(r.response); 
          }
        }
      });
    });

    //post processing, need to remove the 'correct answer' duplicates from the incorrectAnswerArray to make the UI work with the DB
    //iterate through each correct response for all questions, and remove exactly ONE match from the incorrect answers list
    this.questionPack.coursePageContentQuestions.forEach(q => {
      //get the correct answer for the question
      let correctResponseObj = q.coursePageContentQuestionResponses.find(r => r.correctValue === 1);
      if(correctResponseObj){
        //now find ONE of the exact same responses from the incorrectAnswerArray
        let incorrectAnswerDuplicateIndex: number = incorrectAnswerArray.findIndex(response => response === correctResponseObj.response);
        if(incorrectAnswerDuplicateIndex != -1){
          //found a match, remove it
          incorrectAnswerArray.splice(incorrectAnswerDuplicateIndex, 1);
        }
      }
    });

    this.questionForm.patchValue({
      incorrectAnswers: incorrectAnswerArray.join('\n')
    });
    


  }

  cmdAddQuestion(){
    this.questionGroups = this.questionForm.get('questions') as FormArray;
    this.questionGroups.push(this.createQuestionGroup());

    this.questionForm.markAsDirty();
  }

  cmdRemoveQuestion(questionItem: FormGroup){
    this.questionGroups = this.questionForm.get('questions') as FormArray;
    let questionItemGroupIndex: number = this.questionGroups.controls.findIndex(qg => qg === questionItem);
    this.questionGroups.removeAt(questionItemGroupIndex);

    this.questionForm.markAsDirty();
  }

  cmdSave() {

    if(this.questionForm.dirty && !this.questionForm.pristine){
      //merge changes into new revisedQuestionObject (don't touch original). Changes are NOT saved via service or DB, that is handled by parent component calling this dialog component.
      let revisedQuestionPackObj = this.mergeQuestionPack(this.questionPack);
      this.questionPack = revisedQuestionPackObj;
      this.onSaveComplete(true);
    } else {
      //questionForm not modified, so skip doing anything
      this.onSaveComplete(false);
    }

    
  }

  private onSaveComplete(shouldRefresh: boolean): void {
    this.bsModalRef.hide();
  }

  private mergeQuestionPack(questionPackObj: ICoursePageContentQuestionPack): ICoursePageContentQuestionPack {
    //this method merges the values in the form to create a revised questionPack object (doesnt modify the original)

    let revisedQuestionPackObj = Object.assign({}, this.questionPack); //don't merge with form in this instance
    revisedQuestionPackObj.coursePageContentQuestions = []; //clear the array of questions as we are manually copying or adding questions to the revisedObj
    
    //merge the fields manually
    revisedQuestionPackObj.maximumAllowedWrong = this.questionForm.get('maximumAllowedWrong').value;

    //process the incorrect answers into an array
    let incorrectAnswersStr: string = this.questionForm.get('incorrectAnswers').value;
    let incorrectAnswerArray = incorrectAnswersStr.split('\n');
    incorrectAnswerArray = incorrectAnswerArray.filter(item => item.trim().length > 0); //remove any blank items in the incorrectAnswer array

    //process the questions
    this.questionGroups = this.questionForm.get('questions') as FormArray;

    if(this.questionGroups.controls.length){

      //iterate through each question
      for(let i=0; i<this.questionGroups.controls.length; i++){
        let questionItemFormGroup = this.questionGroups.controls[i];

        let questionObject: ICoursePageContentQuestion;
        if(questionItemFormGroup.get('id') && questionItemFormGroup.get('id').value && questionItemFormGroup.get('id').value !== 0){
          //this is an existing question - find the question in the revised questionPackObj
          questionObject = this.questionPack.coursePageContentQuestions.find(cpcq => cpcq.coursePageContentQuestionId === questionItemFormGroup.get('id').value);
          if(!questionObject){
            console.log(`Error - could not find the existing question with id: ${questionItemFormGroup.get('id').value} (ref mergeQuestionPack)`);
            continue;
          }
        } else {
          //this is a new question
          questionObject = this.coursePageContentQuestionService.initialiseCoursePageContentQuestion();
          questionObject.coursePageId = this.questionPack.coursePageId;
          questionObject.coursePageContentId = this.questionPack.coursePageContentId;
        }

         //add the (new or existing) question into the revisedObj
         revisedQuestionPackObj.coursePageContentQuestions.push(questionObject);

        //ok now that we have the questionObject, time to update the fields
        questionObject.question = questionItemFormGroup.get('question').value;

        //look if the questionObject already has a correct response
        let correctResponseObj: ICoursePageContentQuestionResponse;
        if(questionObject.coursePageContentQuestionResponses){
          let responses = questionObject.coursePageContentQuestionResponses.find(r => r.correctValue === 1);
          if(responses){
            //grab the first successful response only
            correctResponseObj = responses[0];
          }
        }

        //check if there isn't an existing correctResponse, if so, initialise a new one
        if(!correctResponseObj){
          //init a new correct response
          correctResponseObj = this.coursePageContentQuestionService.initialiseCoursePageContentQuestionResponse();
          correctResponseObj.correctValue = 1; //this value indicates that it's correct
          questionObject.coursePageContentQuestionResponses.push(correctResponseObj); //add the response to the questionObj
        }

        //update the correctResponse text
        correctResponseObj.response = questionItemFormGroup.get('correctAnswer').value;

        //now remove all other 'correctResponses' for this question if they exist (shouldn't occur in real-life but here for completeness)
        questionObject.coursePageContentQuestionResponses = questionObject.coursePageContentQuestionResponses.filter(r => r === correctResponseObj || r.correctValue !== 1 );

        //now process the incorrect responses
        //clear any existing invalid responses that are not in the new incorrectAnswerArray
        questionObject.coursePageContentQuestionResponses = questionObject.coursePageContentQuestionResponses.filter(r => r.correctValue === 1 || (incorrectAnswerArray.some(ir => ir === r.response)));

        //now add any new responses that are not present for this question
        incorrectAnswerArray.forEach(incorrectAnswer => {
          if(!questionObject.coursePageContentQuestionResponses.some(r => r.response === incorrectAnswer)){
            let incorrectResponseObj: ICoursePageContentQuestionResponse;
            incorrectResponseObj = this.coursePageContentQuestionService.initialiseCoursePageContentQuestionResponse();
            incorrectResponseObj.response = incorrectAnswer;
            incorrectResponseObj.correctValue = 0; //this value indicates that it's correct
            questionObject.coursePageContentQuestionResponses.push(incorrectResponseObj); //add the response to the questionObj
          }
        });
      }

      //now we also need to add duplicate 'incorrect' answers that are copies of 'correct' answers for all other questions. Ie one question's correct answer, is another question's incorrect answer.
      revisedQuestionPackObj.coursePageContentQuestions.forEach(revisedQuestionObj => {
        //get the correct question from all the other questions and add it as a new 'incorrect' question
        let otherQuestionCorrectResponses = revisedQuestionPackObj.coursePageContentQuestions.filter(q => q != revisedQuestionObj).map(altQ => {
          return altQ.coursePageContentQuestionResponses.find(r => r.correctValue === 1);
        });

        if(otherQuestionCorrectResponses && otherQuestionCorrectResponses.length){
          otherQuestionCorrectResponses.forEach(altResponse => {
            let incorrectResponseObj: ICoursePageContentQuestionResponse;
            incorrectResponseObj = this.coursePageContentQuestionService.initialiseCoursePageContentQuestionResponse();
            incorrectResponseObj.response = altResponse.response; //copy the response text to the new incorrectResponse object
            incorrectResponseObj.correctValue = 0; //this value indicates that it's correct
            revisedQuestionObj.coursePageContentQuestionResponses.push(incorrectResponseObj); //add the response to the questionObj
          });
        }
      });
    } 

    

    
    return revisedQuestionPackObj;
  }

}
