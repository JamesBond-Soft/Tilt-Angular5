import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../environments/environment';
import { IGroup } from './group';

@Injectable()
export class GroupService {
  private baseUrl: string = `${environment.apiURL}/api/groups`;
  //private baseUrl: string = './api/groups/groups.json'; // json file with test data

  constructor(private http: HttpClient) { }

  getGroups(organisationId: number): Observable<IGroup[]> {
    return this.http.get(`${this.baseUrl}/byorganisation/${organisationId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getGroupCollection(groupIdList: number[]): Observable<IGroup[]> {
    return this.http.get(`${this.baseUrl}/collection`, {params: {groupIdList: groupIdList.map(g => g.toString())}})
    .map(this.extractData)
    .catch(this.handleError);
  }

  saveGroup(group: IGroup): Observable<IGroup> {
    if(group.groupId === 0){
      //create a new group
      return this.createGroup(group);
    } else {
      //update existing group
      return this.updateGroup(group);
    }
  }

  deleteGroup(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  initGroup(): IGroup {
    return {
      groupId: 0,
      name: '',
      description: '',
      extGroupRefNum: '',
      organisationId: 0,
      parentGroupId: null,
      subGroups: [],
      assigned : false
    }
  }

  private createGroup(group: IGroup): Observable<IGroup> {
    return this.http.post(this.baseUrl, group)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateGroup(group: IGroup): Observable<IGroup> {
    return this.http.put(this.baseUrl +'/' + group.groupId, group)
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
