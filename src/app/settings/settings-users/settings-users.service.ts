import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import "rxjs/add/operator/debounceTime";
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';


import { environment } from '../../../environments/environment';
import { IUser } from './user';
import { IRole } from './role';
import { IUserProfile } from '../../users/user-profile';
import { IUserGroup } from './user-group';
@Injectable()
export class SettingsUsersService {
  private baseUrl: string = `${environment.apiURL}/api/users`;
  
  constructor(private http: HttpClient) { }

  getUsers(): Observable<IUser[]> {
    // let headers = new Headers();
    // headers.append('Authorization', `Bearer ${localStorage.getItem('tsa_token')}`);
    // let options = new RequestOptions(
    //   {
    //     headers: headers//,
    //    // withCredentials: true
    //   }
    // );
    return this.http.get(this.baseUrl)
      .map(this.extractData)
      //.do(data => console.log('getUsers: ' + JSON.stringify(data)))
      .catch(this.handleError);

  }

  getUsersByOrganisation(organisationId: number): Observable<IUser[]> {
    return this.http.get(`${this.baseUrl}/byorganisation/${organisationId}`)
      .map(this.extractData)
      .catch(this.handleError);

  }

  getEligibleSupportUsers(organisationId: number): Observable<IUser[]> {
    return this.http.get(`${this.baseUrl}/eligiblesupportusers/${organisationId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  searchForUsersByOrganisationAndString(organisationId: number, searchString: Observable<string>) {
    return searchString.debounceTime(400)
      .distinctUntilChanged()
      .switchMap(searchStringItem => this.getUsersBySearchWithOrganisation(organisationId, searchStringItem));
  }

  getUsersBySearchWithOrganisation(organisationId: number, searchString: string): Observable<IUser[]> {
    return this.http.get(`${this.baseUrl}/search/${organisationId}`, {params: {searchString: searchString}})
      .map(this.extractData)
      .catch(this.handleError);

  }

  getUserCollection(userIdList: number[]): Observable<IUser[]> {
    return this.http.get(`${this.baseUrl}/collection`, {params: {userIdList: userIdList.map(g => g.toString())}})
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUser(id: number): Observable<IUser> {
    if(id === 0){
      //return Observable.of(null); //change to initialised empty user
      return Observable.of(this.initialiseUser());
    }

    return this.http.get(this.baseUrl + '/' + id)
      .map(this.extractData)
      //.do(data => console.log('getUser: ' + JSON.stringify(data)))
      .catch(this.handleError);

  }

  getUserGroup(id: number): Observable<IUserGroup> {
    if(!id){
      return null;
    }
    
    return this.http.get(`${this.baseUrl}/usergroup/${id}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveUser(user: IUser): Observable<IUser> {
    if(user.userId === 0){
      return this.createUser(user);
    } else {
      return this.updateUser(user);
    }
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + id)
                  .catch(this.handleError);
  }

  getRoles(): Observable<IRole> {
    //this service gets a list of roles (ie role types)
    return this.http.get(`${this.baseUrl}/roles`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getRoleList(): Observable<IRole[]> {
    //this service gets a list of roles (ie role types)
    return this.http.get(`${this.baseUrl}/roles`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private createUser(user: IUser) {
    user.userId = undefined;

    return this.http.post(this.baseUrl, user)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateUser(user: IUser){
    const url = `${this.baseUrl}/${user.userId}`;
    return this.http.put(url, user)
      .map(this.extractData)
      .catch(this.handleError);
  }

  sortUsersByName(userList: IUser[]): IUser[] {
    return userList.sort((a: IUser, b: IUser) => {
      const compareFirstName = a.firstName ? a.firstName.localeCompare(b.firstName) : -1;
      const compareLastName = a.lastName ? a.lastName.localeCompare(b.lastName) : -1;
      const compareEmail = a.email ? a.email.localeCompare(b.email) : -1;
      return compareFirstName || compareLastName || compareEmail;
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

  private initialiseUser(): IUser {
    return {
      userId: 0,
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      pin: '',
      roleId: 0,
      organisationId: 0,
      userProfile: <IUserProfile>{}
    }
  }
}
