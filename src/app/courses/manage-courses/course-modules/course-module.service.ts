import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../../environments/environment';

import { ICourseModule } from './course-module';
import { ICourseModuleSummaryInfo } from './course-module-summary-info';

@Injectable()
export class CourseModuleService {
  private baseUrl: string = `${environment.apiURL}/api/coursemodules`;

  constructor(private http: HttpClient) { }


  getCourseModules(courseId: number): Observable<ICourseModule[]> {
    return this.http.get(`${this.baseUrl}/bycourse/${courseId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCourseModule(courseModuleId: number): Observable<ICourseModule> {

    //check if it's a new org, if so, return new empty org object
    if(courseModuleId === 0){
      return Observable.of(this.initialiseCourseModule());
    } else {
      return this.http.get(`${this.baseUrl}/${courseModuleId}`)
      .map(this.extractData)
      .catch(this.handleError);
    }

    
  }

  getCourseModuleSummaryInfoList(courseId: number): Observable<ICourseModuleSummaryInfo[]> {
    return this.http.get(`${this.baseUrl}/summary/bycourse/${courseId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveCourseModule(courseModule: ICourseModule): Observable<ICourseModule> {
    if (courseModule.courseModuleId === 0) {
      //create new org
      return this.createCourseModule(courseModule);
    } else {
      //update existing org
      return this.updateCourseModule(courseModule);
    }
  }

  updateCourseModuleOrder(courseModuleList: ICourseModuleSummaryInfo[]): Observable<any> {
    return this.http.put(this.baseUrl +'/updateorder',  courseModuleList)
    .catch(this.handleError);
  }

  deleteCourseModule(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  initialiseCourseModule(): ICourseModule {
    return {
      courseModuleId: 0,
      courseId: 0,
      name: '',
      description: '',
      extCourseModuleRefNum: '',
      order: 0
    };
  }

  private createCourseModule(courseModule: ICourseModule): Observable<ICourseModule> {
    return this.http.post(this.baseUrl, courseModule)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateCourseModule(courseModule: ICourseModule): Observable<ICourseModule> {
    return this.http.put(`${this.baseUrl}/${courseModule.courseModuleId}`, courseModule)
      .map(this.extractData)
      .catch(this.handleError);
  }

  sortCourseModuleList(courseModuleList: ICourseModule[]): ICourseModule[] {
    return courseModuleList.sort((a: ICourseModule, b: ICourseModule) => {
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
