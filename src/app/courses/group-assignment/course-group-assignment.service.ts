import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../environments/environment';

import { ICourseGroupAssignment } from './course-group-assignment';
import {ICourseGroupAssignmentSummaryInfo } from './course-group-assignment-summary-info';

@Injectable()
export class CourseGroupAssignmentService {
  private baseUrl: string = `${environment.apiURL}/api/coursegroupassignments`;

  constructor(private http: HttpClient) { }

  getCourseGroupAssignmentById(courseGroupAssignmentId: number): Observable<ICourseGroupAssignment> {
    if(courseGroupAssignmentId === 0){
      return Observable.of(this.initialiseCourseGroupAssignment());
    } else {
      return this.http.get(`${this.baseUrl}/${courseGroupAssignmentId}`)
      .map(this.extractData)
      .catch(this.handleError);
    }
    
  }

  getCourseGroupAssignmentsByCourseId(courseId: number): Observable<ICourseGroupAssignment[]> {
    return this.http.get(`${this.baseUrl}/bycourse/${courseId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCourseGroupAssignmentsByGroupId(groupId: number): Observable<ICourseGroupAssignment[]> {
    return this.http.get(`${this.baseUrl}/bygroup/${groupId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCourseGroupAssignmentSummaryInfoListByCourseId(courseId: number): Observable<ICourseGroupAssignmentSummaryInfo[]> {
    return this.http.get(`${this.baseUrl}/summary/bycourse/${courseId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveCourseGroupAssignment(courseGroupAssignment: ICourseGroupAssignment): Observable<ICourseGroupAssignment> {
    if (courseGroupAssignment.courseGroupAssignmentId === 0) {
      //create new courseGroupAssignment
      return this.createCourseGroupAssignment(courseGroupAssignment);
    } else {
      //update existing courseGroupAssignment
      return this.updateCourseGroupAssignment(courseGroupAssignment);
    }
  }

  deleteCourseGroupAssignment(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }



  initialiseCourseGroupAssignment(): ICourseGroupAssignment {
    return {
      courseGroupAssignmentId: 0,
      courseId: 0,
      groupId: 0,
      subGroupsCanInherit: true,
      repeatInterval: 0,
      repeatUnit: '',
      startDate: null,
      endDate: null,
      dueDate: null
    }
  }

  private createCourseGroupAssignment(courseGroupAssignment: ICourseGroupAssignment): Observable<ICourseGroupAssignment> {
    return this.http.post(this.baseUrl, courseGroupAssignment)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateCourseGroupAssignment(courseGroupAssignment: ICourseGroupAssignment): Observable<ICourseGroupAssignment> {
    return this.http.put(`${this.baseUrl}/${courseGroupAssignment.courseGroupAssignmentId}`, courseGroupAssignment)
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
