import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../../environments/environment';

import { IResourceCategory } from './resource-category';

@Injectable()
export class ResourceCategoryService {
  private baseUrl: string = `${environment.apiURL}/api/resourcecategories`;

  constructor(private http: HttpClient) { }

  getResourceCategories(organisationId: number): Observable<IResourceCategory[]> {
    return this.http.get(`${this.baseUrl}/byorganisation/${organisationId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getResourceCategory(resourceCategoryId: number): Observable<IResourceCategory> {
    return this.http.get(`${this.baseUrl}/${resourceCategoryId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveResourceCategory(category: IResourceCategory): Observable<IResourceCategory> {
    if(category.resourceCategoryId === 0){
      //create a new category
      return this.createResourceCategory(category);
    } else {
      //update existing category
      return this.updateResourceCategory(category);
    }
  }

  deleteResourceCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  initResourceCategory(): IResourceCategory {
    return {
      resourceCategoryId: 0,
      name: '',
      description: '',
      extCategoryRefNum: '',
      organisationId: 0,
      parentResourceCategoryId: null,
      subResourceCategories: []
    }
  }

  private createResourceCategory(category: IResourceCategory): Observable<IResourceCategory> {
    return this.http.post(this.baseUrl, category)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateResourceCategory(category: IResourceCategory): Observable<IResourceCategory> {
    return this.http.put(this.baseUrl +'/' + category.resourceCategoryId, category)
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
