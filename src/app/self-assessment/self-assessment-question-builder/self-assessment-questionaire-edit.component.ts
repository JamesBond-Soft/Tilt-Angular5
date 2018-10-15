import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { IOrganisation } from '../../settings/settings-organisations/organisation';
import { ISelfAssessmentQuestion } from './self-assessment-question';
import {SelfAssessmentQuestionService } from './self-assessment-question.service';
import { ISelfAssessmentQuestionResponse } from './self-assessment-question-response';
import {IGroup } from '../../groups/group';

import { SelfAssessmentGroupSelectionComponent } from '../self-assessment-group-selection.component';
import { GenericValidator } from '../../shared/generic-validator';

@Component({
  selector: 'self-assessment-questionaire-edit',
  templateUrl: './self-assessment-questionaire-edit.component.html',
  styleUrls: ['./self-assessment-questionaire-edit.component.scss']
})
export class SelfAssessmentQuestionaireEditComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  
  questionForm: FormGroup;
  selectedResponseItem: ISelfAssessmentQuestionResponse;
  showEditResponseSection: boolean = false;
  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

 @Input() selectedQuestion: ISelfAssessmentQuestion;

 private _showEditCard = false; //variable that shows / hides the whole component
  @Input() 
    set showEditCard(showEditCard: boolean){

      if(showEditCard){
        //value was set to true - meaning we are now showing the edit card. Lets trigger the onEdit method to populate the fields
        this.onStartEdit(this.selectedQuestion);
      }

      this._showEditCard = showEditCard;
    }

    get showEditCard(): boolean { return this._showEditCard; }

    @Output() onFinishEditEvent = new EventEmitter<boolean>(); //event to tell parent that editing is finished

  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private selfAssessmentQuestionService: SelfAssessmentQuestionService, private modalService: BsModalService, private changeDetection: ChangeDetectorRef) {
    this.validationMessages = {
      question: {
        required: 'Question name is required.'
      },
      response: {
        required: 'Response is required'
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
   }

  
  ngOnInit() {
    

      this.questionForm = this.fb.group({
        question: ['', Validators.required],
        responseGroup: this.fb.group({
          response: ['', Validators.required]
        })
      });
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.questionForm.valueChanges, controlBlurs).debounceTime(250).subscribe(value => {
      //console.log(JSON.stringify(this.userForm.get('passwordGroup.password').errors));

      this.displayMessage = this.genericValidator.processMessages(this.questionForm);
    });
  }

  private onStartEdit(question: ISelfAssessmentQuestion) {
    //this method patches the group values and resets the form and makes it visible

    this.questionForm.reset(); //reset validation

    //apply values to form
    this.questionForm.patchValue({
      question: this.selectedQuestion.question
    });
  }

  private onFinishEdit(shouldReload: boolean = false): void {
    //finished editing, send message to parent that it's done and whether it should trigger a reload of the groups
    this.onFinishEditEvent.emit(shouldReload);
  }

  cmdAddResponse(): void {


    this.selectedResponseItem = this.selfAssessmentQuestionService.initSelfAssessmentQuestionResponse();
    this.selectedResponseItem.selfAssessmentQuestionId = this.selectedQuestion.selfAssessmentQuestionId;
    
    this.selectedResponseItem.relatedGroup = null;//<IGroup>{groupId: 0, name:'test'};
    

    this.questionForm.get('responseGroup').reset();
    this.questionForm.get('responseGroup').patchValue({
      response: this.selectedResponseItem.response
    });
    this.showEditResponseSection = true;
  }
  cmdRemoveResponse(responseItem: ISelfAssessmentQuestionResponse): void {
    if(confirm('Are your sure you want to remove this response?')){
      this.selectedQuestion.responses.forEach((ri, index) => {
        if(ri === responseItem) this.selectedQuestion.responses.splice(index, 1);
      });

      this.questionForm.markAsDirty();
    }
  }

  cmdSelectResponse(responseItem: ISelfAssessmentQuestionResponse): void {
    this.selectedResponseItem = responseItem;

    this.questionForm.get('responseGroup').reset();
    this.questionForm.get('responseGroup').patchValue({
      response: this.selectedResponseItem.response
    });

    this.showEditResponseSection = true;
  }

  cmdCancelEditResponse(): void {
    this.selectedResponseItem = null;
    this.showEditResponseSection = false;
  }

  cmdSaveResponse(): void {
    this.selectedResponseItem.response = this.questionForm.get('responseGroup.response').value;

    var matchingResponseItem: ISelfAssessmentQuestionResponse = this.selectedQuestion.responses.find(r => r === this.selectedResponseItem);
    if (matchingResponseItem) {
      //this is an edit
    } else {
      //this is an add
      this.selectedQuestion.responses.push(this.selectedResponseItem);
      
    }

    this.selectedResponseItem = null;
    this.showEditResponseSection = false;
    //if(this.selectedResponseItem)
  }

  cmdSelectGroup(): void {
    this.openModalWithComponent();

    // let returnPath: string;
    // //returnPath = this.router.url;
    // returnPath = 'selfassessments/questionaire/builder';

    // this.router.navigate(['selfassessments/questionaire/builder', 'group'], {queryParams: { returnPath: returnPath }});
  }

  cmdSave(): void {
    if(!this.questionForm.dirty && this.selectedQuestion.selfAssessmentQuestionId > 0){
      //question wasnt changed, skip saving - finish cleanly
      this.onFinishEdit(false);
      return;
    } else {
      //save changes
      let updatedQuestionObj: ISelfAssessmentQuestion = Object.assign({}, this.selectedQuestion);
      this.mergeQuestionWithFormValues(updatedQuestionObj);
      
      this.selfAssessmentQuestionService.saveSelfAssesmentQuestion(updatedQuestionObj).subscribe(() => {
        this.onFinishEdit(true);
      },
      error => alert(error));

      
    }
  }

  cmdCancelEdit(): void {
    if(this.questionForm.dirty){
      this.onFinishEditEvent.emit(true);
    } else {
      this.onFinishEditEvent.emit(false);
    }
    
  }

  cmdDelete(): void {
    if (confirm('Are you sure you want to delete the question?')) {
      this.selfAssessmentQuestionService.deleteSelfAssessmentQuestion(this.selectedQuestion.selfAssessmentQuestionId).subscribe(() => {
        this.onFinishEdit(true);
      });
    }
  }

  openModalWithComponent() {
    
    const initialState = {
      openedAsModal: true,
      organisationId: this.selectedQuestion.organisationId
    };
    this.bsModalRef = this.modalService.show(SelfAssessmentGroupSelectionComponent, {initialState});
    this.bsModalRef.content.closeBtnName = 'Close';
    let sagsComp: SelfAssessmentGroupSelectionComponent = <SelfAssessmentGroupSelectionComponent> this.bsModalRef.content;
    //sagsComp.pageTitle = "hiya";
    
    const _combine = Observable.combineLatest(
      //this.modalService.onShow,
      //this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        const _reason = reason ? `, dismissed by ${reason}` : '';
        //this.messages.push(`onHide event has been fired${_reason}`);
        console.log('onhide: ' + _reason);

        if(_reason.length === 0){
          //normal close
        //  console.log(sagsComp.selectedGroup);
          if(sagsComp.selectedGroup){
            //set the response group to the selected group
            this.selectedResponseItem.relatedGroup = sagsComp.selectedGroup;
            this.selectedResponseItem.relatedGroupId = sagsComp.selectedGroup.groupId;
          }
        }
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        const _reason = reason ? `, dismissed by ${reason}` : '';
        //this.messages.push(`onHidden event has been fired${_reason}`);
      //  console.log('onhidden: ' + _reason);
        this.unsubscribe();
      })
    );
    
    this.subscriptions.push(_combine);


    // const initialState = {
    //   list: [
    //     'Open a modal with component',
    //     'Pass your data',
    //     'Do something else',
    //     '...'
    //   ],
    //   title: 'Modal with component'
    // };
    
    
  }
  
  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  private mergeQuestionWithFormValues(questionObj: ISelfAssessmentQuestion): void {
    //merge the form values into a group object
    questionObj.question = this.questionForm.get('question').value;
    
    //do the responses too

  }

  
}
