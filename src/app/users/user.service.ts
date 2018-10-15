import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../environments/environment';
import { IUserProfile } from './user-profile';

@Injectable()
export class UserService {
  private baseUrl: string = `${environment.apiURL}/api/userprofile`;

  constructor(private http: HttpClient) { }

  getUserProfile(userId: number): Observable<IUserProfile>{
    //returns a single userProfile for the matching UserId
    return this.http.get(`${this.baseUrl}/${userId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveUserProfile(userProfile: IUserProfile): Observable<IUserProfile> {
    //update an existing user profile only
    return this.http.put(this.baseUrl +'/' +userProfile.userId, userProfile)
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
