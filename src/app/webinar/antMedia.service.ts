import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../environments/environment';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, retry } from 'rxjs/operators';

import { LiveBroadcast, EndPoint} from './LiveBroadcast';
@Injectable()
export class AntMediaService {
    // REST_SERVICE_ROOT = 'http://antcommunity.760dev.com:5080'; // Local Mode
    REST_SERVICE_ROOT = 'https://antcommunity.760dev.com:5443'; // Production Mode
    constructor(private http: HttpClient) {}

    public createLiveStream(appName: string, liveBroadcast: LiveBroadcast): Observable<LiveBroadcast> {
        return this.http.post(this.REST_SERVICE_ROOT + '/' + appName + '/rest/broadcast/create', liveBroadcast)
            .map(this.extractData)
            .catch(this.handleError);
    }
    public addEndpoint(appName: string, newEndpoint: EndPoint): Observable<Object> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type':  'application/x-www-form-urlencoded'
            })
          };

        return this.http.post(this.REST_SERVICE_ROOT + '/' + appName + '/rest/broadcast/addEndpoint', newEndpoint, httpOptions)
        .map(this.extractData)
        .catch(this.handleError);
    }

    public deleteStream(appName: String, streamId: number) {
        return this.http.post(this.REST_SERVICE_ROOT + '/' + appName + '/rest/broadcast/delete/' + streamId, null)
        .map(this.extractData)
        .catch(this.handleError);
    }

    private extractData(response: Response) {
        const body = response;
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
    }

}
