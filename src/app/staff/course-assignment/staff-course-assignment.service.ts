import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../environments/environment';

import { ICourseAdhocAssignment } from './course-adhoc-assignment';
/* import { ICourseAdhocAssignmentSummaryInfo } from './course-adhoc-assignment-summary-info'; */

@Injectable()
export class StaffCourseAssignmentService {
  private baseUrl = `${environment.apiURL}/api/courseadhocassignments`;

  constructor(private http: HttpClient) { }


  public saveCourseAdhocAssignment(courseAdhocAssignment: ICourseAdhocAssignment): Observable<ICourseAdhocAssignment> {
    return this.http.post(this.baseUrl, courseAdhocAssignment)
      .map(this.extractData)
      .catch(this.handleError);
  }

  initialiseCourseAdhocAssignment(): ICourseAdhocAssignment {
    return {
      courseAdhocAssignmentId: 0,
      courseId: 0,
      userId: 0,
      repeatInterval: 0,
      repeatUnit: '',
      dueDate: null,
      endDate: null,
      startDate: null
    };
  }

  private extractData(response: Response) {
    const body = response;
    return body || {};
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    // return Observable.throw(error.json() || 'Server error');
    return Observable.throw(JSON.stringify(error.error) || 'Server error');
  }
}
