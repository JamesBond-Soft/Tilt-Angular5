import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';

import { environment } from '../../../../environments/environment';
import { IResourceLibraryAsset, IResourceLibraryAssetType, IResourceLibraryAssetStatus, IResourceLibraryFileProperties, IResourceGroupAssignment } from './resource-library-asset';


@Injectable()
export class ResourceLibraryAssetService {
  private baseUrl: string = `${environment.apiURL}/api/resourcelibraryassets`;

  constructor(private http: HttpClient) { }

  getResourceLibraryAssets(): Observable<IResourceLibraryAsset[]> {
    return this.http.get(`${this.baseUrl}/`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getResourceLibraryAssetListOfType(assetType: IResourceLibraryAssetType): Observable<IResourceLibraryAsset[]> {
    return this.http.get(`${this.baseUrl}/oftype/${assetType}`)
      .map(this.extractData)
      .catch(this.handleError);
  }
  
  getResourceLibraryAssetsWithResourceGroupAssignment(): Observable<IResourceLibraryAsset[]> {
    return this.http.get(`${this.baseUrl}/withresourcegroupassignment`)
      .map(this.extractData)
      .catch(this.handleError);
  }
  
  getMyResources(): Observable<IResourceLibraryAsset[]> {
    return this.http.get(`${this.baseUrl}/myresources`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getResourceLibraryAsset(resourceLibraryAssetId): Observable<IResourceLibraryAsset> {
    return this.http.get(`${this.baseUrl}/${resourceLibraryAssetId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getResourceLibraryAssetWithResourceGroupAssignment(resourceLibraryAssetId): Observable<IResourceLibraryAsset> {
    return this.http.get(`${this.baseUrl}/withresourcegroupassignment/${resourceLibraryAssetId}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  saveResourceLibraryAsset(resourceLibraryAsset: IResourceLibraryAsset): Observable<IResourceLibraryAsset> {
    if (resourceLibraryAsset.resourceLibraryAssetId === 0) {
      //create new item
      return this.createResourceLibraryAsset(resourceLibraryAsset);
    } else {
      //update existing item
      return this.updateResourceLibraryAsset(resourceLibraryAsset);
    }
  }

  deleteResourceLibraryAsset(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`)
      .catch(this.handleError);
  }

  private createResourceLibraryAsset(resourceLibraryAsset: IResourceLibraryAsset): Observable<IResourceLibraryAsset> {
    return this.http.post(this.baseUrl, resourceLibraryAsset)
      .map(this.extractData)
      .catch(this.handleError);
  }

  private updateResourceLibraryAsset(resourceLibraryAsset: IResourceLibraryAsset): Observable<IResourceLibraryAsset> {
    return this.http.put(`${this.baseUrl}/${resourceLibraryAsset.resourceLibraryAssetId}`, resourceLibraryAsset)
      .map(this.extractData)
      .catch(this.handleError);
  }

  initResourceLibraryAsset(): IResourceLibraryAsset {
    return {
      resourceLibraryAssetId: 0,
      name: '',
      description: '',
      assetType: IResourceLibraryAssetType.Image,
      assetStatus: IResourceLibraryAssetStatus.Uploading,
      extRefNum: '',
      organisationId: 0,
      preProcessedFileProperties: null,
      cacheableFileProperties: null,
      fileProperties: null,
      thumbnailFileProperties: null,
      resourceGroupAssignments: [],
      resourceCategoryId: null,
      resourceCategory: null,
      modifiedDate: new Date()
    }
  }

  initResourceLibraryFileProperties(): IResourceLibraryFileProperties {
    return {
      fileName: null,
      fileSize: null,
      contentType: null,
      extKey: null,
      fileExtension: null,
      url: null
    }
  }

  initResourceGroupAssignment(): IResourceGroupAssignment {
    return {
      resourceGroupAssignmentId: 0,
      resourceLibraryAssetId: null,
      groupId: null
    }
  }

  sortResourceLibraryAssetList(resourceLibraryAssetList: IResourceLibraryAsset[]): IResourceLibraryAsset[] {
    return resourceLibraryAssetList.sort((a: IResourceLibraryAsset, b: IResourceLibraryAsset) => {
      return this.getTime(a.modifiedDate) - this.getTime(b.modifiedDate);
    });
  }

  private getTime(date?: Date) {
    return date != null ? +new Date(date).getTime() : 0;
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
