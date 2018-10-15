import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../environments/environment';

import { ICourse } from './course';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry } from 'rxjs/operators';
//import { retry } from 'rxjs/operator/retry';

@Injectable()
export class ManageCoursesService {
  private baseUrl: string = `${environment.apiURL}/api/courses`;

  constructor(private http: HttpClient) { }

  getCourses(organisationId: number): Observable<ICourse[]> {
    return this.http.get(`${this.baseUrl}/byorganisation/${organisationId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }


  getCourse(courseId: number): Observable<ICourse> {

    //check if it's a new org, if so, return new empty org object
    if(courseId === 0){
      return Observable.of(this.initialiseCourse());
    } else {
      return this.http.get<ICourse>(`${this.baseUrl}/${courseId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
      // .map(this.extractData)
      // //.catch(this.handleError);
      // .catch((error: any) => {
      //   if (error.status === 302 || error.status === "302" ) {
      //       // do some thing
      //   }
      //   else {
      //     return Observable.throw(new Error(error.status));
      //   }
      // });
    }

  }

  saveCourse(course: ICourse): Observable<ICourse> {
    if (course.courseId === 0) {
      //create new org
      return this.createCourse(course);
    } else {
      //update existing org
      return this.updateCourse(course);
    }
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  private createCourse(course: ICourse): Observable<ICourse> {
    return this.http.post(this.baseUrl, course)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateCourse(course: ICourse): Observable<ICourse> {
    return this.http.put(`${this.baseUrl}/${course.courseId}`, course)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(response: Response) {
    let body = response;
    return body || {};
  }

  initialiseCourse(): ICourse {
    return {
      courseId: 0,
      name: '',
      description: '',
      extRefCourseNum: '',
      courseCategoryId: null,
      organisationId: null,
      status: 0 
    };
  }

  // private handleError(error: any): Observable<any> {
  //   // in a real world app, we may send the server to some remote logging infrastructure
  //   // instead of just logging it to the console
  //  // console.error(error);
  //   //return Observable.throw(error.json() || 'Server error');
  //  // return Observable.throw(JSON.stringify(error) || 'Server error');
  //  return Observable.throw(new Error(error.status));
  // }
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
