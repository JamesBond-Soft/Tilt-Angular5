import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../../environments/environment';
import { ICoursePageContentQuestionPack } from './course-page-content-question-pack';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';


@Injectable()
export class CoursePageContentQuestionPackService {
  private baseUrl: string = `${environment.apiURL}/api/coursepagecontentquestionpacks`;
  
  constructor(private http: HttpClient) { }

  getCoursePageContentQuestionPackById(coursePageContentQuestionPackId: number): Observable<ICoursePageContentQuestionPack>{
    return this.http.get(`${this.baseUrl}/${coursePageContentQuestionPackId}`)
    .map(this.extractData)
    .catch(this.handleError);
  }

  getCoursePageContentQuestionPacksByPageId(coursePageId: number): Observable<ICoursePageContentQuestionPack[]> {
    return this.http.get(`${this.baseUrl}/bypage/${coursePageId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCoursePageContentQuestionPacksByCoursePageContentId(coursePageContentId: number): Observable<ICoursePageContentQuestionPack[]> {
    return this.http.get(`${this.baseUrl}/bycoursepagecontent/${coursePageContentId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveCoursePageContentQuestionPack(coursePageContentQuestionPack: ICoursePageContentQuestionPack): Observable<ICoursePageContentQuestionPack> {
    if (coursePageContentQuestionPack.coursePageContentQuestionPackId === 0) {
      //create new coursePageContentQuestion
      return this.createCoursePageContentQuestionPack(coursePageContentQuestionPack);
    } else {
      //update existing coursePageContentQuestion
      return this.updateCoursePageContentQuestionPack(coursePageContentQuestionPack);
    }
  }

  private createCoursePageContentQuestionPack(coursePageContentQuestionPack: ICoursePageContentQuestionPack): Observable<ICoursePageContentQuestionPack> {
    return this.http.post(this.baseUrl, coursePageContentQuestionPack)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateCoursePageContentQuestionPack(coursePageContentQuestionPack: ICoursePageContentQuestionPack): Observable<ICoursePageContentQuestionPack> {
    return this.http.put(`${this.baseUrl}/${coursePageContentQuestionPack.coursePageContentQuestionPackId}`, coursePageContentQuestionPack)
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteCoursePageContentQuestionPack(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  initialiseCoursePageContentQuestionPack(): ICoursePageContentQuestionPack{
    return {
      coursePageContentQuestionPackId: 0,
      coursePageContentId: 0,
      coursePageId: 0,
      coursePageContentQuestions: [],
      maximumAllowedWrong: 0
    };
  }

  private extractData(response: Response) {
    let body = response;
    return body || {};
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an ErrorObservable with a user-facing error message
    return new ErrorObservable(
      'Something bad happened; please try again later.');
  };
}
