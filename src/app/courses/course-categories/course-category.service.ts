import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../environments/environment';
import { ICourseCategory } from './course-category';

@Injectable()
export class CourseCategoryService {
  private baseUrl: string = `${environment.apiURL}/api/coursecategories`;

  constructor(private http: HttpClient) { }

  getCourseCategories(organisationId: number): Observable<ICourseCategory[]> {
    return this.http.get(`${this.baseUrl}/byorganisation/${organisationId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCourseCategory(courseCategoryId: number): Observable<ICourseCategory> {
    return this.http.get(`${this.baseUrl}/${courseCategoryId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveCourseCategory(category: ICourseCategory): Observable<ICourseCategory> {
    if(category.courseCategoryId === 0){
      //create a new category
      return this.createCourseCategory(category);
    } else {
      //update existing category
      return this.updateCourseCategory(category);
    }
  }

  deleteCourseCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  initCourseCategory(): ICourseCategory {
    return {
      courseCategoryId: 0,
      name: '',
      description: '',
      extCategoryRefNum: '',
      organisationId: 0,
      parentCourseCategoryId: null,
      subCourseCategories: []
    }
  }

  private createCourseCategory(category: ICourseCategory): Observable<ICourseCategory> {
    return this.http.post(this.baseUrl, category)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateCourseCategory(category: ICourseCategory): Observable<ICourseCategory> {
    return this.http.put(this.baseUrl +'/' + category.courseCategoryId, category)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(response: Response) {
    let body = response;
    return body || {};
  }

  // private handleError(error: Response): Observable<any> {
  //   // in a real world app, we may send the server to some remote logging infrastructure
  //   // instead of just logging it to the console
  //   console.error(error);
  //   return Observable.throw(error.json() || 'Server error');
  // }

  private handleError(error: HttpErrorResponse): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    //return Observable.throw(error.json() || 'Server error');
    return Observable.throw(JSON.stringify(error.error) || 'Server error');
  }
}
