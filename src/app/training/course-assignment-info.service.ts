import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of'
import { catchError } from 'rxjs/operators/catchError';
import { retry } from 'rxjs/operators/retry';

import { environment } from '../../environments/environment';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { ICourseAssignmentInfo } from './course-assignment-info';
import { ICourseTrainingHistoryInfo } from './training-history/course-training-history-info';
import { ICourse } from '../courses/manage-courses/course';

import { StaffAssignedCourseSummaryInfo } from '../staff/staff-course-assigned-summary-info';

@Injectable()
export class CourseAssignmentInfoService {
  private baseUrl: string = `${environment.apiURL}/api/courseassignmentinfo`;

  constructor(private http: HttpClient) { }

  getCourseAssignmentInfos(): Observable<ICourseAssignmentInfo[]>{
    return this.http.get<ICourseAssignmentInfo[]>(`${this.baseUrl}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }


  getCourseAssignmentInfosByUser(userId: number): Observable<StaffAssignedCourseSummaryInfo[]>{
    return this.http.get<StaffAssignedCourseSummaryInfo[]>(`${this.baseUrl}/${userId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  getUnAssignedCourseAssignmentInfosByUser(userId: number): Observable<ICourse[]>{
    return this.http.get<ICourse[]>(`${this.baseUrl}/unassigned/${userId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  async GetCoursesAssignedToGroup(GroupID: number) {
    return  await this.http.get<StaffAssignedCourseSummaryInfo[]>(`${this.baseUrl}/GroupAssigned/${GroupID}`).toPromise();
  }

  getCourseTrainingHistory(): Observable<ICourseTrainingHistoryInfo[]>{
    return this.http.get<ICourseTrainingHistoryInfo[]>(`${this.baseUrl}/traininghistory`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  getCourseTrainingHistoryItem(courseSessionId: number): Observable<ICourseTrainingHistoryInfo>{
    return this.http.get<ICourseTrainingHistoryInfo[]>(`${this.baseUrl}/traininghistory/${courseSessionId}`)
    .pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError)
    );
  }
  // Get Course Results for Staff management page
  getCourseResult(UserId: number): Observable<ICourseTrainingHistoryInfo[]> {
    return this.http.get<ICourseTrainingHistoryInfo[]>(`${this.baseUrl}/courseResult/${UserId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
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
