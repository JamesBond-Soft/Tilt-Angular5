import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../environments/environment';

import { ISelfAssessmentQuestion } from './self-assessment-question';
import { ISelfAssessmentQuestionResponse } from './self-assessment-question-response';

@Injectable()
export class SelfAssessmentQuestionService {
  private baseUrl: string = `${environment.apiURL}/api/selfassessmentquestions`;

  constructor(private http: HttpClient) { }

  getSelfAssessmentQuestionsByOrgansationId(organisationId: number): Observable<ISelfAssessmentQuestion[]> {
    return this.http.get(`${this.baseUrl}/byorganisationid/${organisationId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSelfAssesmentQuestionById(selfAssessmentQuestionId: number): Observable<ISelfAssessmentQuestion> {
    return this.http.get(`${this.baseUrl}/${selfAssessmentQuestionId}`)
    .map(this.extractData)
    .catch(this.handleError);
  }

  saveSelfAssesmentQuestion(saqObj: ISelfAssessmentQuestion): Observable<ISelfAssessmentQuestion> {
    if(saqObj.selfAssessmentQuestionId === 0){
      //create a new group
      return this.createSelfAssessmentQuestion(saqObj);
    } else {
      //update existing group
      return this.updateSelfAssessmentQuestion(saqObj);
    }
  }
  private createSelfAssessmentQuestion(saqObj: ISelfAssessmentQuestion): Observable<ISelfAssessmentQuestion> {
    return this.http.post(this.baseUrl, saqObj)
    .map(this.extractData)
    .catch(this.handleError);
  }

  private updateSelfAssessmentQuestion(saqObj: ISelfAssessmentQuestion): Observable<ISelfAssessmentQuestion> {
    return this.http.put(this.baseUrl +'/' + saqObj.selfAssessmentQuestionId, saqObj)
    .map(this.extractData)
    .catch(this.handleError);
  }

  deleteSelfAssessmentQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  updateSelfAssessmentQuestionOrder(questionList: ISelfAssessmentQuestion[]): Observable<any> {
    return this.http.put(this.baseUrl +'/updateorder',  questionList)
    .catch(this.handleError);
  }

  initSelfAssessmentQuestion(): ISelfAssessmentQuestion {
    return <ISelfAssessmentQuestion>{
      selfAssessmentQuestionId: 0,
      organisationId: 0,
      question: '',
      responses: [],
      order: 0
    }
  }

  initSelfAssessmentQuestionResponse(): ISelfAssessmentQuestionResponse {
    return <ISelfAssessmentQuestionResponse>{
      selfAssessmentQuestionResponseId: 0,
      selfAssessmentQuestionId: 0,
      response: ''
    }
  }

  sortSelfAssessmentQuestionList(saqList: ISelfAssessmentQuestion[]): ISelfAssessmentQuestion[] {
    return saqList.sort((a: ISelfAssessmentQuestion, b: ISelfAssessmentQuestion) => {
      return a.order.valueOf() - b.order.valueOf();
    });
  }
  
  private extractData(response: Response) {
    let body = response;
    return body || {};
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    //return Observable.throw(error.json() || 'Server error');
    return Observable.throw(JSON.stringify(error.error) || 'Server error');
  }
}
