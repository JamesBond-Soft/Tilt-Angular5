import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SelfAssessmentQuestionaireEditComponent } from './self-assessment-questionaire-edit.component';
import { IOrganisation } from '../../settings/settings-organisations/organisation';

import { ISelfAssessmentQuestion } from './self-assessment-question';
import { ISelfAssessmentQuestionResponse } from './self-assessment-question-response';
import {SelfAssessmentQuestionService} from './self-assessment-question.service';

@Component({
  selector: 'app-self-assessment-questionaire-builder',
  templateUrl: './self-assessment-questionaire-builder.component.html',
  styleUrls: ['./self-assessment-questionaire-builder.component.scss']
})
export class SelfAssessmentQuestionaireBuilderComponent implements OnInit {
  showEditCard: boolean;
  orgs: IOrganisation[];
  selectedOrganisation: IOrganisation;
  questions: ISelfAssessmentQuestion[];
  selectedQuestion: ISelfAssessmentQuestion;
  editQuestionOrder: boolean;

  constructor(private router: Router, private route: ActivatedRoute, private selfAssessmentQuestionService: SelfAssessmentQuestionService) { }

  ngOnInit() {
    let preselectQuestionId: number;

    this.route.data.subscribe(data => {
      this.orgs = data['orgs'];

      this.selectedOrganisation = null;
      let organisationId: number;

      //check if we came back from the group selector - if so, set the override groupid
    this.route.queryParamMap.subscribe(params => {
      if (params.has("groupId")) {
        //url has the groupId parameter meaning it just came back from the group selection screen
        if (+params.get('groupId') > 0) {
          let selectedGroupId = +params.get('groupId');
          let selectedGroupName = params.get('groupName');
        }
        
        
        let questionState = this.loadSessionState();
        if(questionState){
          //load the selected organisation
      //    organisationId = questionState.organisationId;
      //    preselectQuestionId = questionState.questionId;
          //load the questions

          //select the question

          //select the response
        }

        
      } else {
        organisationId = +this.route.snapshot.params['organisationId'];
      } 
    });

      // if (this.userForm) {
      //   this.userForm.reset();
     
      
     

      if (organisationId && organisationId > 0) {
        var matchingOrg: IOrganisation = this.orgs.find(o => o.organisationId === organisationId);
        if (matchingOrg) {
          this.selectedOrganisation = matchingOrg;
        }
      }

      if (!this.selectedOrganisation && this.orgs && this.orgs.length > 0) {
        //couldnt find a match - default to the first organisation
        this.selectedOrganisation = this.orgs[0];
      }
      //load the questions now
      this.loadQuestions();

      if(preselectQuestionId != undefined){
        if(preselectQuestionId == 0){
          this.cmdAddNewQuestion();
        }
      }


    });

    // this.route.params.subscribe(params => {
    //   alert(params['id']);
    // }) 
  }
  
  loadQuestions(): void {
    this.selfAssessmentQuestionService.getSelfAssessmentQuestionsByOrgansationId(this.selectedOrganisation.organisationId).subscribe(questions => {
        this.questions = this.selfAssessmentQuestionService.sortSelfAssessmentQuestionList(questions);

        // if(this.questions.length > 0){
        //   this.selectedQuestion = this.questions[0];
        // }
      }, 
      (error: any) => alert(`'Unexpected error: ${error}`));
  }

  cmdAddGroup(): void {

  }

  cmdSelectQuestion(questionItem: ISelfAssessmentQuestion): void {
    
    if(this.editQuestionOrder){
      //ignore the click becuase editQuestionOrder is enabled
      return;
    }

    if(this.selectedQuestion === questionItem){
      //deselect
      this.selectedQuestion = null;
    } else {
      //select the question
      this.selectedQuestion = questionItem;
      this.saveSessionState();
      this.showEditCard = true;
      //this.router.navigate(['/selfassessments/questionaire/builder', this.selectedQuestion.selfAssessmentQuestionId, 'edit'] );
    }
  }

  cmdChangeOrg(): void {
    this.loadQuestions();
  }

  onFinishEditEvent(shouldReload: boolean): void {
    //make sure parentGroup is set to expanded - which includes if it was changed
    // if(this.parentGroup){
    //   this.groupItemService.setExpandedState(this.parentGroup.groupId, true);
    // }

    this.showEditCard = false;
    // this.groupItemService.allowClick = true;
    // this.groupItemService.showSecondarySelection = false;
    // this.groupItemService.announceSelectedGroup(null);
    // this.groupItemService.announceSecondarySelectedGroup(null);
    // this.parentGroupSelectionEnabled = false;

     if(shouldReload){
        this.loadQuestions();
     }
  }

  cmdAddNewQuestion(): void {
    
    this.selectedQuestion = this.selfAssessmentQuestionService.initSelfAssessmentQuestion();
    this.selectedQuestion.organisationId = this.selectedOrganisation.organisationId;
    this.showEditCard = true;

    this.saveSessionState();
  }

  private saveSessionState(): void {
    let questionState = {
      questionId: this.selectedQuestion.selfAssessmentQuestionId,
      organisationId: this.selectedOrganisation.organisationId,
      responseId: 0
    }

    sessionStorage.setItem('selfassessments/questionaire/builder', JSON.stringify(questionState));
  }

  cmdEditQuestionOrder(): void {
    this.editQuestionOrder = true;
  }

  cmdDoneEditQuestionOrder(): void {
    this.selfAssessmentQuestionService.updateSelfAssessmentQuestionOrder(this.questions).subscribe(() => {
      this.editQuestionOrder = false;
    },
    error => alert("There has been an unexpected error. Please try again. (ref cmdDoneEditQuestionOrder)"));
    
    
  }

  cmdMoveOrderUp(question: ISelfAssessmentQuestion, event: Event): void {
    event.stopPropagation();
    this.adjustQuestionOrder(question, -1);
  }

  cmdMoveOrderDown(question: ISelfAssessmentQuestion, event: Event): void {
    event.stopPropagation();
    this.adjustQuestionOrder(question, 1);
  }

  private adjustQuestionOrder(question: ISelfAssessmentQuestion, increment: number) {
    //find this objects current index
    let currentQuestionIndex = this.questions.findIndex(q => q == question);

    if(currentQuestionIndex == 0 && increment < 0){
      return; //don't move backward because the item is already at the top
    }

    //move question in array
    this.array_move(this.questions, currentQuestionIndex, (currentQuestionIndex + increment));

    //modify all question orders according to array index
    this.questions.forEach((questionItem, index) => {
      questionItem.order = index;
    });

    //we are done!
  }

  private array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  };

  private loadSessionState(): (any) {
    let questionStateString: string = sessionStorage.getItem('selfassessments/questionaire/builder');
    if(questionStateString && questionStateString.length){
      return JSON.parse(questionStateString);
    }
  }
}
