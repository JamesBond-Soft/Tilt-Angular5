import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { map } from 'rxjs/operators/map';
import { retry } from 'rxjs/operators/retry';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Subject, Subscriber } from 'rxjs';
import { catchError } from 'rxjs/operators/catchError';

import { environment } from '../../environments/environment';
import { INotificationBatch, INotificationBatchGroupAssignment, INotificationBatchUserAssignment } from './notification-batch';
import { INotificationType, INotification } from './notification';

@Injectable()
export class NotificationService {
  private baseUrl: string = `${environment.apiURL}/api/notifications`;

  constructor(private http: HttpClient) { }

  public getNotificationBatchesWithOrganisationId(organisationId: number): Observable<INotificationBatch[]> {
    return this.http.get<INotificationBatch[]>(`${this.baseUrl}/batcheswithorganisation/${organisationId}`)
    .pipe(
      map(notificationBatchList => {
        return this.sortNotificationBatches(notificationBatchList).reverse(); //order by createdDate descending (most recent first)
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError)
    );
  }

  public getNotificationBatch(notificationBatchId: number): Observable<INotificationBatch> {
    return this.http.get<INotificationBatch>(`${this.baseUrl}/batch/${notificationBatchId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  public getMyNotifications(): Observable<INotification[]> {
    return this.http.get<INotification[]>(`${this.baseUrl}/mynotifications`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  public getMyNotificationItem(notificationId: number): Observable<INotification> {
    return this.http.get<INotification>(`${this.baseUrl}/${notificationId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  public markNotificationAsRead(notificationId: number): Observable<INotification> {
    return this.http.post(`${this.baseUrl}/markasread/${notificationId}`, '')
    .map(this.extractData)
    .catch(this.handleError);
  }

  saveNotificationBatch(notificationBatch: INotificationBatch): Observable<INotificationBatch> {
    if (notificationBatch.notificationBatchId === 0) {
      //create new item
      return this.createNotificationBatch(notificationBatch);
    } else {
      //update existing item
      return this.updateNotificationBatch(notificationBatch);
    }
  }
  
  public deleteNotificationBatch(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/batch/${id}`)
      .catch(this.handleError);
  }
  
  private createNotificationBatch(notificationBatch: INotificationBatch): Observable<INotificationBatch> {
    return this.http.post(`${this.baseUrl}/batch`, notificationBatch)
      .map(this.extractData)
      .catch(this.handleError);
  }
  
  private updateNotificationBatch(notificationBatch: INotificationBatch): Observable<INotificationBatch> {
    return this.http.put(`${this.baseUrl}/batch/${notificationBatch.notificationBatchId}`, notificationBatch)
      .map(this.extractData)
      .catch(this.handleError);
  }

  sortNotificationBatches(notificationBatchList: INotificationBatch[]): INotificationBatch[] {
    return notificationBatchList.sort((a: INotificationBatch, b: INotificationBatch) => {
      return a.createdDate.valueOf() - b.notificationBatchId.valueOf();
    });
  }

  initNotificationBatch(): INotificationBatch {
    return {
      notificationBatchId: 0,
      subject: '',
      body: '',
      createdByUserId: null,
      createdDate: null,
      notificationType: INotificationType.Email,
      organisationId: null,
      priority: 3,
      scheduledDate: new Date(),
      expiryDate: null,
      notificationBatchGroupAssignments: [],
      notificationBatchUserAssignments: [],
      notificationsCreated: false,
      passedTime : ''
    }
  } 

  initNotificationBatchGroupAssignment(): INotificationBatchGroupAssignment {
    return {
      notificationBatchGroupAssignmentId: 0,
      notificationBatchId: 0,
      groupId: null
    }
  }

  initNotificationBatchUserAssignment(): INotificationBatchUserAssignment {
    return {
      notificationBatchUserAssignmentId: 0,
      notificationBatchId: 0,
      userId: null
    }
  }

  private extractData(response: Response) {
    let body = response;
    return body || {};
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
  };
}
