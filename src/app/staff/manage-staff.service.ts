import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../environments/environment';
import { ICourse } from '../courses/manage-courses/course';

import { catchError } from 'rxjs/operators/catchError';
import { retry } from 'rxjs/operators/retry';

@Injectable()
export class ManageStaffService {
    private baseUrl: string = `${environment.apiURL}/api/courses`;

  /*   getUnAssignedCourses(): Observable<ICourse[]>{
        return this.http.get<ICourse[]>(`${this.baseUrl}`)
          .pipe(
            retry(3), // retry a failed request up to 3 times
            catchError(this.handleError)
          );
    }
 */
    constructor(private http: HttpClient) { }
}