import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../environments/environment';
import { ICoursePrerequisites } from './course-prerequisites'


@Injectable()
export class CoursePrerequisitesService {
  private baseUrl: string = `${environment.apiURL}/api/courseprerequisites`;

  constructor(private http: HttpClient) { }

  getCoursePrerequisites(courseId:number): Observable<ICoursePrerequisites[]> {
    return this.http.get(`${this.baseUrl}/bycourseid/${courseId}`)
    .map(this.extractData)
    .catch(this.handleError);
  }

  saveCourePrerequisites(preqs:ICoursePrerequisites[], courseId:number): Observable<any>  {
    preqs.forEach(p=>{
      p.courseId = courseId
      p.coursePrerequisiteID = 0;
    })

    return this.http.post(this.baseUrl,preqs)
                        .map(this.extractData)
                        .catch(this.handleError);
  }

  deletePrerequisiteOfCourses(courseId:number):Observable<any>
  {
    return this.http.delete(`${this.baseUrl}/${courseId}`)
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
