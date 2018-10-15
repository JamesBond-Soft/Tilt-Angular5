import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../../environments/environment';

import { ICoursePage } from './course-page';
import { ICoursePageContent } from './course-page-content';

@Injectable()
export class CoursePageService {
  private baseUrl: string = `${environment.apiURL}/api/coursepages`;

  constructor(private http: HttpClient) { }

  getCoursePages(courseModuleId: number): Observable<ICoursePage[]> {
    return this.http.get(`${this.baseUrl}/bycoursemodule/${courseModuleId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCoursePage(coursePageId: number): Observable<ICoursePage> {

    //check if it's a new org, if so, return new empty org object
    if(coursePageId === 0){
      return Observable.of(this.initialiseCoursePage());
    } else {
      return this.http.get(`${this.baseUrl}/${coursePageId}`)
      .map(this.extractData)
      .catch(this.handleError);
    }

    
  }

  getCoursePageWithData(coursePageId: number): Observable<ICoursePage> {

    return this.http.get(`${this.baseUrl}/${coursePageId}/withdata/`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveCoursePage(coursePage: ICoursePage): Observable<ICoursePage> {
    if (coursePage.coursePageId === 0) {
      //create new coursePage
      return this.createCoursePage(coursePage);
    } else {
      //update existing coursePage
      return this.updateCoursePage(coursePage);
    }
  }

  updateCoursePageOrder(coursePageList: ICoursePage[]): Observable<any> {
    return this.http.put(this.baseUrl +'/updateorder',  coursePageList)
    .catch(this.handleError);
  }

  deleteCoursePage(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  initialiseCoursePage(): ICoursePage {
    return {
      coursePageId: 0,
      courseModuleId: 0,
      name: '',
      order: 0,
      coursePageContentId: null,
      coursePageContent: <ICoursePageContent>{templateType: 0}
    }
  }

  private createCoursePage(courseModule: ICoursePage): Observable<ICoursePage> {
    return this.http.post(this.baseUrl, courseModule)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateCoursePage(courseModule: ICoursePage): Observable<ICoursePage> {
    return this.http.put(`${this.baseUrl}/${courseModule.coursePageId}`, courseModule)
      .map(this.extractData)
      .catch(this.handleError);
  }

  sortCoursePageList(coursePageList: ICoursePage[]): ICoursePage[] {
    return coursePageList.sort((a: ICoursePage, b: ICoursePage) => {
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
