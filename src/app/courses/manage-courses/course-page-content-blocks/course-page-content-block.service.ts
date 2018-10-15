import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { environment } from '../../../../environments/environment';
import { ICoursePageContentBlock, IContentBlockType } from './course-page-content-block';

@Injectable()
export class CoursePageContentBlockService {
  private baseUrl: string = `${environment.apiURL}/api/coursepagecontentblocks`;

  constructor(private http: HttpClient) { }

  getCoursePageContentBlocksByPageId(coursePageId: number): Observable<ICoursePageContentBlock[]> {
    return this.http.get(`${this.baseUrl}/bypage/${coursePageId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCoursePageContentBlocksByCoursePageContentId(coursePageContentId: number): Observable<ICoursePageContentBlock[]> {
    return this.http.get(`${this.baseUrl}/bycoursepagecontent/${coursePageContentId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveCoursePage(coursePageContentBlock: ICoursePageContentBlock): Observable<ICoursePageContentBlock> {
    if (coursePageContentBlock.coursePageContentBlockId === 0) {
      //create new coursePageContentBlock
      return this.createCoursePageContentBlock(coursePageContentBlock);
    } else {
      //update existing coursePageContentBlock
      return this.updateCoursePageContentBlock(coursePageContentBlock);
    }
  }

  deleteCoursePageContentBlock(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  initialiseCoursePageContentBlock(): ICoursePageContentBlock {
    return {
      coursePageContentBlockId: 0,
      coursePageId: 0,
      coursePageContentId: 0,
      name: '',
      extRefNum: '',
      content: '',
      rawComponents: '',
      rawStyles: '',
      blockType: IContentBlockType.HTML,
      order: 0,
      resourceLibraryAssetId: null,
      resourceLibraryAsset: null
    }
  }

  private createCoursePageContentBlock(coursePageContentBlock: ICoursePageContentBlock): Observable<ICoursePageContentBlock> {
    return this.http.post(this.baseUrl, coursePageContentBlock)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateCoursePageContentBlock(coursePageContentBlock: ICoursePageContentBlock): Observable<ICoursePageContentBlock> {
    return this.http.put(`${this.baseUrl}/${coursePageContentBlock.coursePageContentBlockId}`, coursePageContentBlock)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateCoursePageContentBlockOrder(contentBlockList: ICoursePageContentBlock[]): Observable<any> {
    return this.http.put(this.baseUrl +'/updateorder',  contentBlockList)
    .catch(this.handleError);
  }

  sortCoursePageContentBlockList(coursePageContentBlockList: ICoursePageContentBlock[]): ICoursePageContentBlock[] {
    return coursePageContentBlockList.sort((a: ICoursePageContentBlock, b: ICoursePageContentBlock) => {
      return a.order.valueOf() - b.order.valueOf();
    });
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
