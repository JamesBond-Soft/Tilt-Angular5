import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../environments/environment';
import { IOrganisation } from './organisation';

@Injectable()
export class SettingsOrganisationsService {
  private baseUrl: string = `${environment.apiURL}/api/organisations`;

  constructor(private http: HttpClient) { }

  getOrganisations(): Observable<IOrganisation[]> {
    return this.http.get(this.baseUrl)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getOrg(orgId: number): Observable<IOrganisation> {
    //get a single organisation

    //check if it's a new org, if so, return new empty org object
    if(orgId === 0){
      return Observable.of(this.initialiseOrg());
    }

    //call web service
    return this.http.get(this.baseUrl + '/' + orgId)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveOrg(org: IOrganisation): Observable<IOrganisation> {
    if(org.organisationId === 0){
      //create new org
      return this.createOrg(org);
    } else {
      //update existing org
      return this.updateOrg(org);
    }
  }

  deleteOrg(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }
  
  private createOrg(org: IOrganisation): Observable<IOrganisation> {
      return this.http.post(this.baseUrl, org)
        .map(this.extractData)
        .catch(this.handleError);
  }

  private updateOrg(org: IOrganisation): Observable<IOrganisation> {
    return this.http.put(`${this.baseUrl}/${org.organisationId}`, org)
      .map(this.extractData)
      .catch(this.handleError);
}

  private extractData(response: Response) {
    let body = response;
    return body || {};
  }

  private handleError(error: Response): Observable<any> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.error(error);
    return Observable.throw(error.json() || 'Server error');
  }

  private initialiseOrg(): IOrganisation {
    return {
      organisationId: 0,
      organisationName: '',
      description: ''
    };
  }
}
