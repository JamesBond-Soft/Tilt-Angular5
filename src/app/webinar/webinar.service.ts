import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../environments/environment';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry } from 'rxjs/operators';
import { IWebinar, IWebinarGroupAssignment, IWebinarNotificationType, IWebinarStatus } from './webinar';
import { IUpdateStatusRestModel, IUpdateHLSUrlRestModel, IUpdateResourceIdRestModel } from './rest-model';
import { IUserProfile } from '../users/user-profile';
@Injectable()
export class ManageWebinarService {
    private baseUrl = `${environment.apiURL}/api/webinar`;

    constructor(private http: HttpClient) {}

    getWebinars(): Observable<IWebinar[]> {
        return this.http.get(`${this.baseUrl}`)
        .map(this.extractData)
        .catch(this.handleError);
    }

    getLiveWebinars(): Observable<IWebinar[]> {
        return this.http.get(`${this.baseUrl}/live`)
        .map(this.extractData)
        .catch(this.handleError);
    }

    getWebinarDeatil(webinarId): Observable<IWebinar> {
        return this.http.get(`${this.baseUrl}/${webinarId}`)
        .map(this.extractData)
        .catch(this.handleError);
    }


    saveWebinar(webinar: IWebinar): Observable<IWebinar> {
        if (webinar.webinarId === 0) {
          // create new item
          return this.createWebinar(webinar);
        } else {
          // update existing item
          return this.updateWebinar(webinar);
        }
    }

    updateStatus(newStatus: IUpdateStatusRestModel): Observable<Boolean> {
        return this.http.post(`${this.baseUrl}/updateStatus`, newStatus)
        .map(this.extractData)
        .catch(this.handleError);
    }

    setHLSUrl(newUrl: IUpdateHLSUrlRestModel): Observable<Boolean> {
        return this.http.post(`${this.baseUrl}/updateHLSUrl`, newUrl)
        .map(this.extractData)
        .catch(this.handleError);
    }

    updateRecordedFileAssetId(model: IUpdateResourceIdRestModel): Observable<Boolean> {
        return this.http.post(`${this.baseUrl}/setRecordedAssetId`, model)
        .map(this.extractData)
        .catch(this.handleError);
    }

    /*  public deleteNotificationBatch(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/batch/${id}`)
          .catch(this.handleError);
    } */

    private createWebinar(webinar: IWebinar): Observable<IWebinar> {
        return this.http.post(`${this.baseUrl}`, webinar)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private updateWebinar(webinar: IWebinar): Observable<IWebinar> {
        return this.http.put(`${this.baseUrl}/${webinar.webinarId}`, webinar)
            .map(this.extractData)
            .catch(this.handleError);
    }

    deleteWebinar(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`)
          .catch(this.handleError);
    }

    // add this staff to attended User of broadcasting webinar
    setAttended(webinarId): Observable<any> {
        return this.http.get(`${this.baseUrl}/addAttended/${webinarId}`)
        .map(this.extractData)
        .catch(this.handleError);
    }

    // remove this staff from current attended users of broadcasting webinar
    removeAttended(webinarId) :Observable<any> {
        return this.http.get(`${this.baseUrl}/removeAttenedUser/${webinarId}`)
        .map(this.extractData)
        .catch(this.handleError)
    }

    // get current attended users of broadcasting
    getCurrentAttendedUsers(webinarId):Observable<IUserProfile[]> {
        return this.http.get(`${this.baseUrl}/getAttendedUsers/${webinarId}`)
        .map(this.extractData)
        .catch(this.handleError);
    }
    
    private extractData(response: Response) {
        const body = response;
        return body || {};
    }

    initWebinar(): IWebinar {
        return {
            webinarId: 0,
            name : '',
            description : '',
            scheduledDate : new Date(),
            duration : 0,
            recordAsResource: false,
            notificationType : IWebinarNotificationType.NO,
            status : IWebinarStatus.SCHEDULED,
            hlsUrl : null,
            agenda : null,
            webinarGroupAssignments : [],
            createdByUserId : 0,
            notificationBatchId: 0,
            resourceLibraryAssetId: 0
        };
    }

    initWebinarGroupAssignment(): IWebinarGroupAssignment {
        return {
            webinarGroupAssignmentId: 0,
            webinarId: 0,
            groupId: null
        };
    }
    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          console.error(
            `Backend returned code ${error.status}, ` +
            `body was: ${error.error}`);
        }
        // return an ErrorObservable with a user-facing error message
        return new ErrorObservable(
          'Something bad happened; please try again later.');
    }
}



