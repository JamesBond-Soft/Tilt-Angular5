import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../../environments/environment';

import { ICoursePageContentQuestion, ICoursePageContentQuestionType } from './course-page-content-question';
import { ICoursePageContentQuestionResponse } from './course-page-content-question-response';

@Injectable()
export class CoursePageContentQuestionService {
  private baseUrl: string = `${environment.apiURL}/api/coursepagecontentquestions`;

  constructor(private http: HttpClient) { }
  
  getCoursePageContentQuestionsByPageId(coursePageId: number): Observable<ICoursePageContentQuestion[]> {
    return this.http.get(`${this.baseUrl}/bypage/${coursePageId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCoursePageContentQuestionsByCoursePageContentId(coursePageContentId: number): Observable<ICoursePageContentQuestion[]> {
    return this.http.get(`${this.baseUrl}/bycoursepagecontent/${coursePageContentId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveCoursePageContentQuestion(coursePageContentQuestion: ICoursePageContentQuestion): Observable<ICoursePageContentQuestion> {
    if (coursePageContentQuestion.coursePageContentQuestionId === 0) {
      //create new coursePageContentQuestion
      return this.createCoursePageContentQuestion(coursePageContentQuestion);
    } else {
      //update existing coursePageContentQuestion
      return this.updateCoursePageContentQuestion(coursePageContentQuestion);
    }
  }

  deleteCoursePageContentQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  initialiseCoursePageContentQuestion(): ICoursePageContentQuestion {
    return {
      coursePageContentQuestionId: 0,
      coursePageId: 0,
      coursePageContentId: 0,
      question: '',
      extRefNum: '',
      coursePageContentQuestionType: ICoursePageContentQuestionType.SingleChoice,
      order: 0,
      coursePageContentQuestionResponses: <any>[]
    }
  }

  initialiseCoursePageContentQuestionResponse(): ICoursePageContentQuestionResponse {
    return {
      coursePageContentQuestionResponseId: 0,
      coursePageContentQuestionId: 0,
      response: '',
      correctValue: 0,
      extRefNum: '',
      order: 0
    }
  }

  private createCoursePageContentQuestion(coursePageContentQuestion: ICoursePageContentQuestion): Observable<ICoursePageContentQuestion> {
    return this.http.post(this.baseUrl, coursePageContentQuestion)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateCoursePageContentQuestion(coursePageContentQuestion: ICoursePageContentQuestion): Observable<ICoursePageContentQuestion> {
    return this.http.put(`${this.baseUrl}/${coursePageContentQuestion.coursePageContentQuestionId}`, coursePageContentQuestion)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateCoursePageContentQuestionOrder(contentQuestionList: ICoursePageContentQuestion[]): Observable<any> {
    return this.http.put(this.baseUrl +'/updateorder',  contentQuestionList)
    .catch(this.handleError);
  }

  sortCoursePageContentQuestionList(coursePageContentQuestionList: ICoursePageContentQuestion[]): ICoursePageContentQuestion[] {
    return coursePageContentQuestionList.sort((a: ICoursePageContentQuestion, b: ICoursePageContentQuestion) => {
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
