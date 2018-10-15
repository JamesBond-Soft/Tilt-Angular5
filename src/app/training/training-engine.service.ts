import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of'
import { catchError } from 'rxjs/operators/catchError';
import { retry } from 'rxjs/operators/retry';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { environment } from '../../environments/environment';

import { ICourseMapInfo, ICourseModuleInfo } from './course-map-info';
import { Subject, Subscriber } from 'rxjs';
import { ICourseSession, ICourseSessionStatusType, IUpdateCourseAssignmentScheduleParam } from './course-session';
import { LoginService } from '../login/login.service';
import { ICourseSessionUserData } from './course-session-user-data';
import { ICourseSessionUserDataQuestionResponse } from './course-session-user-data-question-response';
import { ICourseModuleProgressInfo } from './course/training-progress-indicator/course-module-progress-info';
import { ICourseSessionResult } from './course-session-result';
import { ICourseSessionResultQuestionMapInfo } from './course-session-result-question-map-info';
import { ICourseSessionResultDisplayMapInfo } from './course-session-result-display-map-info';


@Injectable()
export class TrainingEngineService {
  private baseUrl: string = `${environment.apiURL}/api/coursetrainingengine`;
  courseMapInfo: ICourseMapInfo;
  
  public courseSession: ICourseSession;
  public courseSessionReadOnly: boolean;
  
  constructor(private http: HttpClient, private loginService: LoginService) { }

  getCourseMapInfo(courseId: number): Observable<ICourseMapInfo> {
    return this.http.get<ICourseMapInfo>(`${this.baseUrl}/getcoursemapinfo/${courseId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  getCourseModuleProgressInfoList(courseId: number): Observable<ICourseModuleProgressInfo[]> {
    return this.http.get<ICourseModuleProgressInfo[]>(`${this.baseUrl}/getcoursemoduleprogressinfolist/${courseId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  getNextModule(courseId: number, currentModuleId: number): Observable<number> {
    return Observable.create(observer => {
      if (!this.courseMapInfo || (this.courseMapInfo && this.courseMapInfo.courseId != courseId)) {
        //empty or dirty courseMapInfo - load it from webservice
        this.getCourseMapInfo(courseId).subscribe(courseMapInfo => {
          this.courseMapInfo = courseMapInfo;
          observer.next(this.calculateNextModule(currentModuleId));
        });
      } else {
        //use existing courseMapInfo
        observer.next(this.calculateNextModule(currentModuleId));
      }
    });
  }

  getNextPage(courseId: number, moduleId: number, currentPageId: number): Observable<number> {
    return Observable.create(observer => {
      if (!this.courseMapInfo || (this.courseMapInfo && this.courseMapInfo.courseId != courseId)) {
        //empty or dirty courseMapInfo - load it from webservice
        let courseMapInfo$ = this.getCourseMapInfo(courseId).subscribe(courseMapInfo => {
          this.courseMapInfo = courseMapInfo;
          observer.next(this.calculateNextPage(moduleId, currentPageId));
        });
      } else {
        //we use the existing courseMapInfo
        observer.next(this.calculateNextPage(moduleId, currentPageId));
      }
    });
  }

  getCurrentCourseProgress(courseId: number, currentModuleId: number, currentPageId: number): Observable<number> {
    return Observable.create(observer => {
      if (!this.courseMapInfo || (this.courseMapInfo && this.courseMapInfo.courseId != courseId)) {
        //empty or dirty courseMapInfo - load it from webservice
        let courseMapInfo$ = this.getCourseMapInfo(courseId).subscribe(courseMapInfo => {
          this.courseMapInfo = courseMapInfo;
          observer.next(this.calculateCurrentCourseProgress(currentModuleId, currentPageId));
        });
      } else {
        //we use the existing courseMapInfo
        observer.next(this.calculateCurrentCourseProgress(currentModuleId, currentPageId));
      }
    });
  }

  getCurrentModuleProgress(courseId: number, currentModuleId: number, currentPageId: number): Observable<number> {
    return Observable.create(observer => {
      if (!this.courseMapInfo || (this.courseMapInfo && this.courseMapInfo.courseId != courseId)) {
        //empty or dirty courseMapInfo - load it from webservice
        let courseMapInfo$ = this.getCourseMapInfo(courseId).subscribe(courseMapInfo => {
          this.courseMapInfo = courseMapInfo;
          observer.next(this.calculateCurrentModuleProgress(currentModuleId, currentPageId));
        });
      } else {
        //we use the existing courseMapInfo
        observer.next(this.calculateCurrentModuleProgress(currentModuleId, currentPageId));
      }
    });
  }

  private calculateCurrentCourseProgress(currentModuleId: number, currentPageId: number): number {
    let currentModuleIndex = this.courseMapInfo.courseModuleList.findIndex(cm => cm.courseModuleId === currentModuleId);
    
    if(currentModuleIndex > -1){
      let currentPageIndex = this.courseMapInfo.courseModuleList[currentModuleIndex].coursePageIdList.findIndex(cp => cp === currentPageId);
      if(currentPageIndex > -1){
        //calculate total number of pages in course
        let pageTotal: number = 0;
        let currentPageTotal: number = 0;
        this.courseMapInfo.courseModuleList.forEach((cm, index) => {
          if(index < currentModuleIndex){
            //increment total for currentPageTotal
            currentPageTotal += cm.coursePageIdList.length;
          } else if(index === currentModuleIndex){
            //we are on the current module, so only increment the currentPageTotal up until the current page
            currentPageTotal += currentPageIndex + 1;
          }
          pageTotal += cm.coursePageIdList.length;
        });

        return currentPageTotal / pageTotal;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  private calculateCurrentModuleProgress(currentModuleId: number, currentPageId: number): number {
    let currentModuleIndex = this.courseMapInfo.courseModuleList.findIndex(cm => cm.courseModuleId === currentModuleId);
    
    if(currentModuleIndex > -1){
      let currentPageIndex = this.courseMapInfo.courseModuleList[currentModuleIndex].coursePageIdList.findIndex(cp => cp === currentPageId);
      if(currentPageIndex > -1){
        //calculate total number of pages in module

        let pageTotal: number = this.courseMapInfo.courseModuleList[currentModuleIndex].coursePageIdList.length;
        let currentPageTotal: number = 0;
        currentPageTotal += currentPageIndex + 1;

        return currentPageTotal / pageTotal;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  private calculateNextModule(currentModuleId: number): number {
    //gets the next module id for a course using the cached courseMapInfo property
    
    if(currentModuleId === 0){
      //get the first module for the course
      if(this.courseMapInfo.courseModuleList.length){
        //there are modules for this course, return the first id
        return this.courseMapInfo.courseModuleList[0].courseModuleId;
      } else {
        //there are no existing modules for this course - return -2 which means no more modules
        console.log('no more modules for this course');
        return -2;
      }
    } else if(currentModuleId !== -2) {
      //get current module index
      let currentModuleIndex = this.courseMapInfo.courseModuleList.findIndex(cm => cm.courseModuleId === currentModuleId);
      if(currentModuleIndex !== -1){
        //we found the existing module

        //check that it's not the last
        if(currentModuleIndex < this.courseMapInfo.courseModuleList.length -1){
          //ok, return the next module in the list
          return this.courseMapInfo.courseModuleList[currentModuleIndex+1].courseModuleId;
        } else {
          //too bad, it was the last module in the course, return -2
          return -2;
        }
      } else {
        //we could not find it - fatal
        alert('disaster - could not find current course module');
        return null;
      }  
    } else {
      //this is bad, -2 should not be passed here!
      return null;
    }
  }

  private calculateNextPage(moduleId: number, currentPageId: number): number {
    //get the module (map) from the cached courseMapInfo property
    let courseModule = this.courseMapInfo.courseModuleList.find(cm => cm.courseModuleId === moduleId);
    if (!courseModule) {
      //MASSIVE FAILURE - MISSING COURSE MODULE
      alert('disaster - could not find course module');
      return null;
    }

    if (currentPageId === 0) {
      //get the first page of the module
      if (courseModule.coursePageIdList.length) {
        return courseModule.coursePageIdList[0];
      }
    } else {
      //find the current index of the page in the module
      let currentPageIndex = courseModule.coursePageIdList.findIndex(cp => cp === currentPageId);
      if (currentPageIndex !== -1) {
        //we found the index

        //check if the item is not the last page in the module
        if (currentPageIndex < courseModule.coursePageIdList.length - 1) {
          //get the next pageId in the list
          return courseModule.coursePageIdList[currentPageIndex + 1];
        } else {
          // return -2 which means no more pages
          return -2;
        }
      }

    }

    return null; //failsafe if we couldnt find the page
  }

  getCourseSessionById(courseSessionId: number): Observable<ICourseSession> {
    return this.http.get<ICourseSession>(`${this.baseUrl}/getcoursesessionbyid/${courseSessionId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }
  
  getCourseSessionOfUser(courseSessionId: number, userId: number): Observable<ICourseSession> {
    return this.http.get<ICourseSession>(`${this.baseUrl}/getcoursesessionbyid/${courseSessionId}/${userId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  getRecentCourseSessionByCourse(courseId: number): Observable<ICourseSession> {
    return this.http.get<ICourseSession>(`${this.baseUrl}/getrecentcoursesessionbycourse/${courseId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  getCourseSessionResultByCourseSession(courseSessionId: number): Observable<ICourseSessionResult> {
    return this.http.get<ICourseSessionResult>(`${this.baseUrl}/getcoursesessionresultbycoursesession/${courseSessionId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  getCourseSessionResultQuestionMapInfoList(courseSessionQuestionnaireResultId: number): Observable<ICourseSessionResultQuestionMapInfo[]> {
    return this.http.get<ICourseSessionResultQuestionMapInfo[]>(`${this.baseUrl}/getcoursesessionresultquestionmapinfolist/${courseSessionQuestionnaireResultId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  getCourseSessionResultDisplayMapInfo(courseSessionQuestionnaireResultId: number): Observable<ICourseSessionResultDisplayMapInfo> {
    return this.http.get<ICourseSessionResultQuestionMapInfo>(`${this.baseUrl}/getcoursesessionresultdisplaymapinfo/${courseSessionQuestionnaireResultId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  updateCourseSessionProgress(courseSession: ICourseSession): Observable<number> {
    return this.http.post<number>(this.baseUrl +'/updatecoursesessionprogress',  courseSession)
    .map(courseSessionId => {
      
      if(courseSessionId && !courseSession.courseSessionId){
        courseSession.courseSessionId = courseSessionId;
      }

      this.courseSession = courseSession; //set the training engine property to hold the courseSession
    })
    .pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError)
    );
  }

  updateCourseAssignmentSchedule(data: IUpdateCourseAssignmentScheduleParam)
  {
    return this.http.post(`${this.baseUrl}/UpdateCourseAssignmentSchedule`, data)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  public initCourseSession(): ICourseSession {
    return {
      courseSessionId: 0,
      courseId: 0,
      userId: this.loginService.currentUser? this.loginService.currentUser.userId : 0,
      courseProgress: 0,
      currentCourseModuleId: null,
      currentCoursePageId: null,
      dateCompleted: null,
      status: ICourseSessionStatusType.NotStarted
    }
  }

  getCourseSessionUserData(courseSessionId: number, pageId: number): Observable<ICourseSessionUserData> {
    return this.http.get<ICourseSessionUserData>(`${this.baseUrl}/getcoursesessionuserdata/${courseSessionId}/${pageId}`)
      .pipe(
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError)
      );
  }

  saveCourseSessionUserData(courseSessionUserData: ICourseSessionUserData): Observable<ICourseSessionUserData> {
    //coursesessionuserdata
    if (courseSessionUserData.courseSessionUserDataId === 0) {
      //create new coursesessionuserdata
      return this.createCourseSessionUserData(courseSessionUserData);
    } else {
      //update existing coursesessionuserdata
      return this.updateCourseSessionUserData(courseSessionUserData);
    }
  }

  private createCourseSessionUserData(courseSessionUserData: ICourseSessionUserData): Observable<ICourseSessionUserData> {
    return this.http.post(`${this.baseUrl}/coursesessionuserdata`, courseSessionUserData)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateCourseSessionUserData(courseSessionUserData: ICourseSessionUserData): Observable<ICourseSessionUserData> {
    return this.http.put(`${this.baseUrl}/coursesessionuserdata/${courseSessionUserData.courseSessionUserDataId}`, courseSessionUserData)
      .map(this.extractData)
      .catch(this.handleError);
  }

  public initCourseSessionUserData(): ICourseSessionUserData {
    return {
      courseSessionUserDataId: 0,
      courseId: 0,
      courseModuleId: 0,
      coursePageId: 0,
      courseSessionId: 0,
      courseSessionUserDataQuestionResponses: []
    }
  }

  public initCourseSessionUserDataQuestionResponse(): ICourseSessionUserDataQuestionResponse {
    return {
      courseSessionUserDataQuestionResponseId: 0,
      coursePageContentQuestionId: 0,
      coursePageContentQuestionResponseId: 0,
      courseSessionId: 0,
      courseSessionUserDataId: 0,
      responseScore: 0,
      responseValue: ''
    }
  }

  public clearCache(): void {
    this.courseMapInfo = null;
    this.courseSession = null;
    this.courseSessionReadOnly = false;
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
