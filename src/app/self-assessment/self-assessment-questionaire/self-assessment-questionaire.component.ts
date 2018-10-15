import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from '../../login/login.service';

import { ISelfAssessmentQuestion } from '../self-assessment-question-builder/self-assessment-question';
import {SelfAssessmentQuestionService } from '../self-assessment-question-builder/self-assessment-question.service';
import { ISelfAssessmentQuestionResponse } from '../self-assessment-question-builder/self-assessment-question-response';
import { SafeStyle, DomSanitizer } from '@angular/platform-browser';
import { ISelfAssessmentReportDetails } from '../self-assessment-report-details';
import { SelfAssessmentService } from '../self-assessment.service';
import { ISelfAssessmentReport } from '../self-assessment-report';

@Component({
  selector: 'app-self-assessment-questionaire',
  templateUrl: './self-assessment-questionaire.component.html',
  styleUrls: ['./self-assessment-questionaire.component.scss']
})
export class SelfAssessmentQuestionaireComponent implements OnInit {
  userDisplayName: string;
  questionIndex: number = 0;
  questions: ISelfAssessmentQuestion[];
  currentQuestion: ISelfAssessmentQuestion;
  questionProgress: number = 0;
  selfAssessmentDetailsList: ISelfAssessmentReportDetails[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private loginService: LoginService, private selfAssessmentQuestionService: SelfAssessmentQuestionService, private _sanitizer: DomSanitizer, private selfAssessmentService: SelfAssessmentService) { }

  ngOnInit() {
   // alert(this.loginService.currentUser); 
    if(this.loginService.currentUser && this.loginService.currentUser.displayName){
      this.userDisplayName = this.loginService.currentUser.displayName;
    }
  
    //do a check if the user needs to complete a self-assessment, if NOT, take them to the dashboard
    this.selfAssessmentService.IsSelfAssessmentReportRequired().subscribe(result => {
      if(!result){
        this.router.navigate(['/dashboard']);
      }
    })

    //check if we have a questionIndex in the heading
    this.route.paramMap.subscribe(params => {
      if(params.has('index')){
        //there is a question index present
        this.questionIndex = +params.get('index');
        this.loadQuestions();
      } else {
        this.loadQuestions();
      }
    })

    
  }

  loadQuestions(): void {
    this.selfAssessmentQuestionService.getSelfAssessmentQuestionsByOrgansationId(1).subscribe(questions => {
        this.questions = questions;

        if(this.questionIndex > 0 && this.questionIndex <= this.questions.length){
          this.currentQuestion = this.questions[this.questionIndex -1];
          this.questionProgress = this.questionIndex / (this.questions.length + 1) * 100;
        } else {
          this.currentQuestion = null;
          if(this.questionIndex === -1){
            this.questionProgress = 100; //finished - last page
          } else {
            this.questionProgress = 0;
          }
        }
        // if(this.questions.length > 0){
        //   this.selectedQuestion = this.questions[0];
        // }
      }, 
      (error: any) => alert(`'Unexpected error: ${error}`));
  }

  cmdNextQuestion(questionItem:ISelfAssessmentQuestion, responseItem: ISelfAssessmentQuestionResponse): void {
    
    //save the answer locally - if this method was passed the question and response objects
    if(questionItem && responseItem){
      this.saveAnswer(questionItem, responseItem);  
    }

    //increment the question index
    this.questionIndex += 1;
    if(this.questionIndex > 0 && this.questionIndex <= this.questions.length){
      //we can move to the next question - which updates the questionIndex in the url. This wont trigger a full page reload, nor an NgOnit because the page is already loaded.
      this.router.navigate(['/selfassessments/questionaire', this.questionIndex])
    } else {
      if(this.questionIndex > 0 && this.questionIndex > this.questions.length){
        //we have reached the end of the questionare! Show end summary
        this.router.navigate(['/selfassessments/questionaire', -1])
      } else {
        //what happened?? Not sure, show error?
        alert('Error: Unexpected index! (ref. cmdNextQuestion)');
        return;
      }
    }
  }

  saveAnswer(questionItem:ISelfAssessmentQuestion, responseItem: ISelfAssessmentQuestionResponse):  void {
    //this saves the question + answer response locally. If the question was already answered before, it updates the response (ie use went backwards)

    //try to find this this question already was answered in the current local list
    let existingSelfAssessmentDetailsItem = this.selfAssessmentDetailsList.find(sad => sad.selfAssessmentQuestionId === questionItem.selfAssessmentQuestionId);
    if(existingSelfAssessmentDetailsItem){
      //found existing question item, modify the response
      existingSelfAssessmentDetailsItem.selfAssessmentQuestionResponseId = responseItem.selfAssessmentQuestionResponseId;
      existingSelfAssessmentDetailsItem.answer = responseItem.response;
    } else {
      //did NOT find the question item, so create a new selfAssessmentDetails object and add it to the list
      let sadItem: ISelfAssessmentReportDetails = <ISelfAssessmentReportDetails>{};
      sadItem.selfAssessmentQuestionId = questionItem.selfAssessmentQuestionId;
      sadItem.question = questionItem.question;
      sadItem.selfAssessmentQuestionResponseId = responseItem.selfAssessmentQuestionResponseId;
      sadItem.answer = responseItem.response;
      this.selfAssessmentDetailsList.push(sadItem);
    }

  }

  cmdFinishQuestionaire(): void {
    //create a new selfAssessmentReport
    let selfAssessmentReport: ISelfAssessmentReport = this.selfAssessmentService.initSelfAssessmentReport();
    selfAssessmentReport.userId = this.loginService.currentUser.userId;
    selfAssessmentReport.userProfileId = this.loginService.currentUser.userProfileId;
    selfAssessmentReport.details = this.selfAssessmentDetailsList;
    selfAssessmentReport.groupID = -1; //pass this value to indicate to the server that it should determine the group
    selfAssessmentReport.groupIdOverride = null;
    selfAssessmentReport.overrideByManagerId = null;
    this.selfAssessmentService.createSelfAssessmentReport(selfAssessmentReport).subscribe(() => {
      this.router.navigate(['/dashboard']);
    }, error => alert("Attention - there was an unexpected error. Please try again. (ref cmdFinishQuestionaire)"));

  }

  

}
