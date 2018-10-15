import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { environment } from '../../../environments/environment';
import { IMoodleMappedCourseModule, IMoodleImportSummary } from './moodle-import-summary';

@Injectable()
export class MoodleImportService {
  private baseUrl: string = `${environment.apiURL}/api/moodleimporter`;

  constructor(private http: HttpClient) { }

  public importMoodleCourse(moodleImportSummary: IMoodleImportSummary): Observable<any> {
    return this.http.post(`${this.baseUrl}/import`, moodleImportSummary)
      .map(this.extractData)
      .catch(this.handleError);
  }

  public initMoodleMappedCourseModule(): IMoodleMappedCourseModule {
    return {
      moodleSectionId: 0,
      moodleSectionName: "",
      moodleActivityCount: 0,
      moodleQuizCount: 0,
      moodleResourceCount: 0,
      courseModule: {
        courseModuleId: 0,
        courseId: 0,
        name: "",
        description: "",
        extCourseModuleRefNum: "",
        order: 0
      }
    }
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
