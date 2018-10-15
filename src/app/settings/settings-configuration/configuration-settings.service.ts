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

import { environment } from '../../../environments/environment';
import { IConfigurationSettings } from './configuration-settings';
import { IConfigurationOrganisationSettings } from './configuration-organisation-settings';

@Injectable()
export class ConfigurationSettingsService {
  private baseUrl: string = `${environment.apiURL}/api/configurationsettings`;

  constructor(private http: HttpClient) { }

  public getConfigurationSettings(): Observable<IConfigurationSettings> {
    return this.http.get<IConfigurationSettings>(`${this.baseUrl}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  public saveConfigurationSettings(configurationSettings: IConfigurationSettings): Observable<IConfigurationSettings> {
    return this.http.put(`${this.baseUrl}`, configurationSettings)
    .map(this.extractData)
    .catch(this.handleError);
  }

  initConfigurationOrganisationSettings(): IConfigurationOrganisationSettings {
    return {
      configurationOrganisationSettingsId: 0,
      configurationSettingsId: 0,
      organisationId: 0,
      supportAdminUserId: 0,
      supportAdminUserDisplayName: '',
      weeklyAdminReportStartDate: null
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
