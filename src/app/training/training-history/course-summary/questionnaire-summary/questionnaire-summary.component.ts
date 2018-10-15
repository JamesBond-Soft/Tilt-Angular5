import { Component, OnInit, Input } from '@angular/core';
import { ICourseSessionQuestionnaireResult } from '../../../course-session-questionnaire-result';
import { ICourseSessionResultQuestionMapInfo } from '../../../course-session-result-question-map-info';
import { TrainingEngineService } from '../../../training-engine.service';
import { ICourseSessionResultDisplayMapInfo } from '../../../course-session-result-display-map-info';

@Component({
  selector: 'questionnaire-summary',
  templateUrl: './questionnaire-summary.component.html',
  styleUrls: ['./questionnaire-summary.component.scss']
})
export class QuestionnaireSummaryComponent implements OnInit {
  private _courseSessionQuestionnaireResult: ICourseSessionQuestionnaireResult;
  @Input() 
  set courseSessionQuestionnaireResult(courseSessionQuestionnaireResult: ICourseSessionQuestionnaireResult){
    this._courseSessionQuestionnaireResult = courseSessionQuestionnaireResult;
    this.loadCourseSessionResultQuestionMapInfoList();
    this.loadCourseSessionResultDisplayMapInfo();
  }
  get courseSessionQuestionnaireResult(): ICourseSessionQuestionnaireResult {return this._courseSessionQuestionnaireResult;}
  
  courseSessionResultQuestionMapInfoList: ICourseSessionResultQuestionMapInfo[];
  displayMap: ICourseSessionResultDisplayMapInfo;

  constructor(private trainingEngineService: TrainingEngineService) { }

  ngOnInit() {
  }

  private loadCourseSessionResultQuestionMapInfoList(): void {
    //validate we have the questionnaireResult object & id
    if(!this.courseSessionQuestionnaireResult || !this.courseSessionQuestionnaireResult.courseSessionQuestionnaireResultId){
      return; //failsafe
    }

    this.trainingEngineService.getCourseSessionResultQuestionMapInfoList(this.courseSessionQuestionnaireResult.courseSessionQuestionnaireResultId).subscribe(courseSessionResultQuestionMapInfoList => {
      this.courseSessionResultQuestionMapInfoList = courseSessionResultQuestionMapInfoList;
    }, error => console.log(`Unexpected error: ${error} (ref loadCourseSessionResultQuestionMapInfoList)`));
  }

  private loadCourseSessionResultDisplayMapInfo(): void {
    //validate we have the questionnaireResult object & id
    if(!this.courseSessionQuestionnaireResult || !this.courseSessionQuestionnaireResult.courseSessionQuestionnaireResultId){
      return; //failsafe
    }

    //call service to get basic coursePage and module details
    this.trainingEngineService.getCourseSessionResultDisplayMapInfo(this.courseSessionQuestionnaireResult.courseSessionQuestionnaireResultId).subscribe(displayMap => {
      this.displayMap = displayMap;
    }, error => console.log('Unexpected error: ${error} (ref loadCoursePageAndModule)'));
  }

}
