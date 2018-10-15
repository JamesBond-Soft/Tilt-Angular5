import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { retry } from 'rxjs/operators/retry';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { Subject, Subscriber } from 'rxjs';
import { catchError } from 'rxjs/operators/catchError';

import { environment } from '../../../environments/environment';
import { IExportReport, IExportReportOrganisation, IExportReportStatusType } from './export-report';
import { IExportReportColumn } from './export-report-column';
import { CourseStatusNamePipe } from '../../shared/pipes/course-status-name.pipe';
import { IColumnMapping } from './column-mapping';

@Injectable()
export class ExportReportService {
  private baseUrl: string = `${environment.apiURL}/api/exportreports`;

  constructor(private http: HttpClient) { }

  public getExportReports(): Observable<IExportReport[]> {
      return this.http.get<IExportReport>(`${this.baseUrl}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  public getExportReport(exportReportId: number): Observable<IExportReport> {
    return this.http.get<IExportReport>(`${this.baseUrl}/${exportReportId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  public getColumnMappings(): Observable<IColumnMapping[]> {
    return this.http.get<IColumnMapping[]>(`${this.baseUrl}/columnmappings`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  public generatePreviewReport(exportReport: IExportReport): Observable<string> {
    return this.http.post(`${this.baseUrl}/preview`, exportReport, {responseType: 'text'})
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  public saveExportReport(exportReport: IExportReport): Observable<IExportReport> {
    if (exportReport.exportReportId === 0) {
      //create new item
      return this.createExportReport(exportReport);
    } else {
      //update existing item
      return this.updateExportReport(exportReport);
    }
  }

  public deleteExportReport(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  private createExportReport(exportReport: IExportReport): Observable<IExportReport> {
    return this.http.post(this.baseUrl, exportReport)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateExportReport(exportReport: IExportReport): Observable<IExportReport> {
    return this.http.put(`${this.baseUrl}/${exportReport.exportReportId}`, exportReport)
      .map(this.extractData)
      .catch(this.handleError);
  }

  public initExportReport(): IExportReport {
    return {
      exportReportId: 0,
      description: '',
      name: '',
      extRefReportNum: '',
      status: IExportReportStatusType.Pending,
      exportReportColumns: [],
      exportReportOrganisations: []
    };
  }

  public initExportReportColumn(): IExportReportColumn {
    return {
      exportReportColumnId: 0,
      exportReportId: 0,
      name: '',
      dataColumn: '',
      dataTable: '',
      order: 0
    }
  }

  sortExportReportColumns(ercList: IExportReportColumn[]): IExportReportColumn[] {
    return ercList.sort((a: IExportReportColumn, b: IExportReportColumn) => {
      return a.order.valueOf() - b.order.valueOf();
    });
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
