import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../environments/environment';
import { ISelfAssessmentReport } from './self-assessment-report';
import { ISelfAssessmentReportDetails } from './self-assessment-report-details';

@Injectable()
export class SelfAssessmentService {
  private baseUrl: string = `${environment.apiURL}/api/selfassessmentreport`;

  constructor(private http: HttpClient) { }

  getSelfAssessmentReportForValidation(managerId: number): Observable<ISelfAssessmentReport[]> {
    return this.http.get(`${this.baseUrl}/${managerId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSelfAssesmentReportById(selfAssessmentReportID: number): Observable<ISelfAssessmentReport> {
    return this.http.get(`${this.baseUrl}/byid/${selfAssessmentReportID}`)
    .map(this.extractData)
    .catch(this.handleError);
  }

  createSelfAssessmentReport(sarObj: ISelfAssessmentReport): Observable<ISelfAssessmentReport> {
    return this.http.post(this.baseUrl, sarObj)
    .map(this.extractData)
    .catch(this.handleError);
  }

  finalizeAssessmentReport(sarObj: ISelfAssessmentReport): Observable<any>{
    return this.http.put(this.baseUrl +'/' + sarObj.selfAssessmentReportID, sarObj)
    .map(this.extractData)
    .catch(this.handleError);
  }

  deleteSelfAssessmentReport(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  IsSelfAssessmentReportRequired(): Observable<boolean> {
    return this.http.get(`${this.baseUrl}/isselfassessmentrequired`)
      .map(response => <boolean>response)
      .catch(this.handleError);
  }

  initSelfAssessmentReport(): ISelfAssessmentReport {
    return <ISelfAssessmentReport>{
      selfAssessmentReportID: 0,
      userId: 0,
      groupID: 0,
      status: 0,
      createdDate: new Date(),
      details: [],
      groupIdOverride: 0,
      overrideByManagerId: 0
    }
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
