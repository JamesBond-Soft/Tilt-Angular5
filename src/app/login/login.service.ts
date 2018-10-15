import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http/src/response';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { environment } from '../../environments/environment';
import { IUser } from '../settings/settings-users/user';
import { IUserLoginResponse } from './user-login-response';

export enum RoleType {
  None = 0,
  Staff = 1,
  Admin = 2,
  Sysadmin = 3
}

@Injectable()
export class LoginService {
  currentUser: IUserLoginResponse;
  redirectUrl: string;

  constructor(private _http: HttpClient) { }

    isLoggedIn(): boolean {
      return !!this.currentUser;
    }

    getCurrentUser(): IUserLoginResponse {
      return this.currentUser;
    }

    getCurrentUserId(): number {
      return this.currentUser.userId;
    }
    authenticate(username, password): Observable<IUser> {
      return this._http.post<any>(`${environment.apiURL}/api/users/login`, { username: username, password:password })
              .map(user => {
                  if(user && user.authToken) {
                    localStorage.setItem("tsa_token", user.authToken);
                    this.currentUser = user;
                    return this.currentUser;
                  } else{
                    //return Observable.of(null);
                    return Observable.throw(user);
                  }
                })
             // .do(data => console.log('All: ' + JSON.stringify(data)))        
              .catch(this.handleError);
    }

    logOut(): Observable<any> {
      return this._http.post<void>(`${environment.apiURL}/api/users/logout`,null)
              .do(() => this.clearUserSession());
              //.catch(this.handleError); //dont worry about catching logout errors
      
    }

    getToken(): string {
      return localStorage.getItem('tsa_token');
    }

    getUserRoleType(): RoleType {
      //find the role the user is assigned to
      let result: number = RoleType.None;
      if (this.currentUser && this.currentUser.roles) {
         this.currentUser.roles.forEach(roleItem => {
          if (roleItem.toLowerCase().indexOf('sysadmin') === 0) {
            result = RoleType.Sysadmin;
            return;
          } else if (roleItem.toLowerCase().indexOf('admin') === 0) {
            result = RoleType.Admin;
            return;
          } else if (roleItem.toLowerCase().indexOf('staff') === 0) {
            result = RoleType.Staff;
            return;
          }
        });
      }
      return result;
    }

    private clearUserSession(): void {
      localStorage.removeItem('tsa_token');
      this.currentUser = null;
    }

    private handleError(err: HttpErrorResponse) {
      console.log(err.message);
      return Observable.throw(err);
    }
}
