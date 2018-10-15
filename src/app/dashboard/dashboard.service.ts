import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../environments/environment';

import {IUserStats} from './user-stats';
import {ISelfAssessmentReportStats} from './self-assessment-report-stats';
import { ICourseStats } from './course-stats';
import { IMyCourseStatsInfo } from './my-courses-staff-widget/my-course-stats-info';
import { ICompletedCourseInfo } from './completed-course-info';
import { INoncomplianceCourseInfo } from './noncompliance-course-info';
@Injectable()
export class DashboardService {
  private baseUrl: string = `${environment.apiURL}/api/dashboard`;
  constructor(private http: HttpClient) { }

  getUserStats(): Observable<IUserStats> {
    return this.http.get(`${this.baseUrl}/userstats/`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSelfAssessmentReportStats(): Observable<ISelfAssessmentReportStats> {
    return this.http.get(`${this.baseUrl}/selfassessmentreportstats/`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCoursesStats(): Observable<ICourseStats> {
    return this.http.get(`${this.baseUrl}/coursestats/`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getMyCoursesStats(): Observable<IMyCourseStatsInfo> {
    return this.http.get(`${this.baseUrl}/mycoursestats/`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCompletedCourseCount(): Observable<ICompletedCourseInfo> {
    return this.http.get(`${this.baseUrl}/completedcount`)
    .map(this.extractData)
    .catch(this.handleError);
  }

  getNoncomplianceCourseCount(): Observable<INoncomplianceCourseInfo> {
    return this.http.get(`${this.baseUrl}/noncompliancecount`)
    .map(this.extractData)
    .catch(this.handleError);
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
