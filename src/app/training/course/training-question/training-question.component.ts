import { Component, OnInit, Input } from '@angular/core';
import { ICoursePageContentQuestion, ICoursePageContentQuestionType } from '../../../courses/manage-courses/course-page-content-questions/course-page-content-question';
import { ICourseSession, ICourseSessionStatusType } from '../../course-session';
import { ICoursePage } from '../../../courses/manage-courses/course-pages/course-page';
import { ICoursePageContent } from '../../../courses/manage-courses/course-pages/course-page-content';
import { ICoursePageContentQuestionResponse } from '../../../courses/manage-courses/course-page-content-questions/course-page-content-question-response';
import { ICourseSessionUserDataQuestionResponse } from '../../course-session-user-data-question-response';
import { ICourseSessionUserData } from '../../course-session-user-data';
import { TrainingEngineService } from '../../training-engine.service';
import { IQuestionUserDataQuestionMap, IQuestionUserDataResponseMap } from './question-user-data';
import { ICourseModule } from '../../../courses/manage-courses/course-modules/course-module';
import { ICourse } from '../../../courses/manage-courses/course';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { OnTrainingPageChange } from '../training-component-hooks';

@Component({
  selector: 'training-question',
  templateUrl: './training-question.component.html',
  styleUrls: ['./training-question.component.scss']
})
export class TrainingQuestionComponent implements OnInit, OnTrainingPageChange {
  ICoursePageContentQuestionType = ICoursePageContentQuestionType;
  ICourseSessionStatusType = ICourseSessionStatusType;
  questionMapItems: IQuestionUserDataQuestionMap[];
  courseSessionUserData: ICourseSessionUserData;
  courseSessionReadOnly: boolean;

  private _page: ICoursePage;
  @Input()
  set page(page: ICoursePage) {
    //console.log('pageChanged');
    //console.log(this.trainingEngineService.courseSession);
    this.courseSessionReadOnly = this.trainingEngineService.courseSessionReadOnly;
    this._page = page;
    this.loadQuestionMapItems();
  }
  get page(): ICoursePage { return this._page };

  @Input() module: ICourseModule;
  @Input() course: ICourse;

  constructor(private trainingEngineService: TrainingEngineService) { }

  ngOnInit() {



  }

  private loadQuestionMapItems(): void {
    if (!this.questionMapItems) {
      this.questionMapItems = [];
    }

    this.questionMapItems = this.page.coursePageContent.coursePageContentQuestions.map(q => <IQuestionUserDataQuestionMap>{ questionItem: q, responseItems: q.coursePageContentQuestionResponses.map(r => <IQuestionUserDataResponseMap>{ responseItem: r, selected: false }) });
    this.loadCourseSessionUserData();
  }

  private loadCourseSessionUserData(): void {
    if (!this.trainingEngineService.courseSession) {
      return; //missing courseSession!
    }

    this.trainingEngineService.getCourseSessionUserData(this.trainingEngineService.courseSession.courseSessionId, this.page.coursePageId).subscribe(csud => {
      if (csud) {
        //found existing courseSessionUserData object for the page / session
        this.courseSessionUserData = csud;
      } else {
        //there is no existing courseSessionUserData object, so create one (in memory)
        this.courseSessionUserData = this.trainingEngineService.initCourseSessionUserData();
        this.courseSessionUserData.courseSessionId = this.trainingEngineService.courseSession.courseSessionId;
        this.courseSessionUserData.courseId = this.course.courseId;
        this.courseSessionUserData.courseModuleId = this.module.courseModuleId;
        this.courseSessionUserData.coursePageId = this.page.coursePageId;
      }

      //set the selected values for the responses (if there are any present)
      if (this.courseSessionUserData.courseSessionUserDataQuestionResponses && this.courseSessionUserData.courseSessionUserDataQuestionResponses.length) {
        //iterate through each response and find the corresponding question/response in the questionMap

        this.courseSessionUserData.courseSessionUserDataQuestionResponses.forEach(rItem => {
          let questionMapItem = this.questionMapItems.find(q => q.questionItem.coursePageContentQuestionId === rItem.coursePageContentQuestionId);

          //check if we found a match, if so, now search for the selected response
          if (questionMapItem) {
            let responseMapItem = questionMapItem.responseItems.find(r => r.responseItem.coursePageContentQuestionResponseId === rItem.coursePageContentQuestionResponseId);
            if (responseMapItem) {
              responseMapItem.selected = true;
              responseMapItem.courseSessionUserDataQuestionResponse = rItem;

              if(questionMapItem.questionItem.coursePageContentQuestionType === ICoursePageContentQuestionType.WrittenAnswer && rItem.responseValue && rItem.responseValue.length){
                //this is a written answer, populate the text value
                responseMapItem.textValue = rItem.responseValue;
              }
            }
          }
        });
      }
    });

  }

  cmdTest(): void {
    let i: number = 0;
    this.cmdSaveQuestionUserData().subscribe(() => {
      //console.log('done saving!');
    }, error => console.log(`Unexpected error when trying to save user data. ${error}`));
    
  }

  cmdClickResponse(event: Event, questionObj: IQuestionUserDataQuestionMap, responseObj: IQuestionUserDataResponseMap): void {
    if(this.trainingEngineService.courseSessionReadOnly){
      event.stopPropagation();
      return;
    }

    if (questionObj.questionItem.coursePageContentQuestionType === ICoursePageContentQuestionType.SingleChoice) {
      //single choice selection
      responseObj.selected = !responseObj.selected;

      //mark all other responses as unselected for this question
      questionObj.responseItems.forEach(r => {
        if (r != responseObj && r.selected) {
          r.selected = false;
        }
      });

      //otherwise select it and unselect all other responses for this question
    } else if (questionObj.questionItem.coursePageContentQuestionType === ICoursePageContentQuestionType.MultiChoice) {
      //multi choice selection
      responseObj.selected = !responseObj.selected;
    }
  }

  cmdUpdateResponseTextValue(questionObj: IQuestionUserDataQuestionMap, responseObj: IQuestionUserDataResponseMap, textValue: string): void {
    if (questionObj.questionItem.coursePageContentQuestionType === ICoursePageContentQuestionType.WrittenAnswer) {
      responseObj.selected = true;
      responseObj.textValue = textValue;
    }
  }

  cmdSaveQuestionUserData(): Observable<ICourseSessionUserData> {
    //this method saves the courseSessionUserDataobject for this page, including all the courseSessionUserDataQuestionResponses

    if(this.trainingEngineService.courseSessionReadOnly){
      //don't save anything because the courseSession is readonly
      return;
    }
    //try to get the existing CourseSesionUserData object if it exists for the courseSession
    if (!this.courseSessionUserData) {
      //initialise a new courseSessionUserDataObject
      this.courseSessionUserData = this.trainingEngineService.initCourseSessionUserData();
      this.courseSessionUserData.courseSessionId = this.trainingEngineService.courseSession.courseSessionId;
      this.courseSessionUserData.courseId = this.course.courseId;
      this.courseSessionUserData.courseModuleId = this.module.courseModuleId;
      this.courseSessionUserData.coursePageId = this.page.coursePageId;
    }

    let revisedCourseSessionUserDataQuestionResponsesList: ICourseSessionUserDataQuestionResponse[] = [];

    //build the courseSessionUserDataQuestionResponse collection
    this.questionMapItems.forEach((q, i) => {
      //only get selected items to include in the courseSessionUserData courseSessionUserDataQuestionResponses collection. (Existing items that are NOT selected will be automatically deleted on the server)
      let selectedResponseList = q.responseItems.filter(r => r.selected || q.questionItem.coursePageContentQuestionType === ICoursePageContentQuestionType.WrittenAnswer);

      //check if we have some selected answers!
      if (selectedResponseList && selectedResponseList.length) {

        //iterate through each response
        selectedResponseList.forEach(rObj => {
          if (!rObj.courseSessionUserDataQuestionResponse) {
            rObj.courseSessionUserDataQuestionResponse = this.trainingEngineService.initCourseSessionUserDataQuestionResponse();
            rObj.courseSessionUserDataQuestionResponse.courseSessionId = this.trainingEngineService.courseSession.courseSessionId;
            rObj.courseSessionUserDataQuestionResponse.courseSessionUserDataId = this.courseSessionUserData.courseSessionUserDataId;
          }

          rObj.courseSessionUserDataQuestionResponse.coursePageContentQuestionId = q.questionItem.coursePageContentQuestionId;
          rObj.courseSessionUserDataQuestionResponse.coursePageContentQuestionResponseId = rObj.responseItem.coursePageContentQuestionResponseId;
          if(q.questionItem.coursePageContentQuestionType === ICoursePageContentQuestionType.WrittenAnswer){
            rObj.courseSessionUserDataQuestionResponse.responseValue = rObj.textValue;
            //this is a written question/response try to match the text from the response to determine score
            if(rObj.textValue && rObj.textValue.toLowerCase().trim() === rObj.responseItem.response.toLowerCase().trim()){
              //value matches response, so assign score
              rObj.courseSessionUserDataQuestionResponse.responseScore = rObj.responseItem.correctValue;  
            } else {
              //value does NOT match the response, so give it score of 0
              rObj.courseSessionUserDataQuestionResponse.responseScore = 0;
            }
          } else {
            //normal single/multi-choice question/response
            rObj.courseSessionUserDataQuestionResponse.responseValue = rObj.responseItem.response;            
            rObj.courseSessionUserDataQuestionResponse.responseScore = rObj.responseItem.correctValue;
          }
          

          revisedCourseSessionUserDataQuestionResponsesList.push(rObj.courseSessionUserDataQuestionResponse);
        });
      }
    });

    this.courseSessionUserData.courseSessionUserDataQuestionResponses = revisedCourseSessionUserDataQuestionResponsesList;

    return this.trainingEngineService.saveCourseSessionUserData(this.courseSessionUserData).do(csud => {
      if (csud && !this.courseSessionUserData.courseSessionUserDataId) {
        //     //update the courseSessionUserDataId because it was an add (the id was originally 0)
        this.courseSessionUserData.courseSessionUserDataId = csud.courseSessionUserDataId;
      }
      //console.log("i'm not telling anyone I'm done in the do method")
    });
  }

  saveComponentUserData(): Observable<void> {
    let observer = Observable.create((obs) => {
      //check if there are questions
      if (this.questionMapItems) {
        //we have questions, save the answers
        this.cmdSaveQuestionUserData().subscribe(() => {
          obs.next(); //all done with saving. Trigger the observer
        }, error => console.log(`Unexpected error: ${error} (ref saveComponentUserData : training-question.component)`));
      } else {
        //no questions! - trigger observer as nothing to do
        obs.next();
      }
    });

    return observer;
  }

  canMoveForward(): boolean {
    return true;
  }
}
