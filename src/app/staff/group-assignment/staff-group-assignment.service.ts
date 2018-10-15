import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../environments/environment';
import { ICourse } from '../../courses/manage-courses/course';

import { catchError } from 'rxjs/operators/catchError';
import { retry } from 'rxjs/operators/retry';
import { IUserProfile } from '../../users/user-profile';
import { IUserGroup } from '../../settings/settings-users/user-group';

@Injectable()
export class StaffGroupAssignmentService {
    private baseUrl: string = `${environment.apiURL}/api/users`;
    constructor(private http: HttpClient) { }
    // Get Groups from Staff
    getUserGroup(id: number): Observable<IUserGroup> {
        if (!id) {
          return null;
        }
        return this.http.get(`${this.baseUrl}/usergroup/${id}`)
          .map(this.extractData)
          .catch(this.handleError);
    }

    // Assign Group to Staff
    public CreateUserGroup(userID: number, GroupID: number): Observable<any> {
        if (!userID || !GroupID) {
            return null;
        }
        return this.http.get(`${this.baseUrl}/usergroup/${userID}/${GroupID}`)
            .map(this.extractData)
            .catch(this.handleError);
    }

    // Remove Group from Staff
    public deleteUserGroup(UserGroupID: number): Observable<any> {
        return this.http.delete(this.baseUrl + '/usergroup/' + UserGroupID)
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
        // return Observable.throw(error.json() || 'Server error');
        return Observable.throw(JSON.stringify(error.error) || 'Server error');
    }
}