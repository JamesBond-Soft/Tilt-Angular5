import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { environment } from '../../../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs';
import { IResourceLibraryAsset } from '../../resource-library-asset';

@Component({
  selector: 'resource-file-upload',
  templateUrl: './resource-file-upload.component.html',
  styleUrls: ['./resource-file-upload.component.scss']
})
export class ResourceFileUploadComponent implements OnInit {
  private baseUrl: string = `${environment.apiURL}/api/resourcelibraryassets`;
  uploadStatus: number;
  fileUploadItem: FileItem;
  uploadFinishedSubject: ReplaySubject<number>;
  _allowedMimeTypes: string[] = [];
  @Input() 
    set allowedMimeTypes(allowedMimeTypes: string[]){
      this._allowedMimeTypes = allowedMimeTypes;

      if(this.uploader){
        this.uploader.setOptions({ allowedMimeType: this.allowedMimeTypes });
        this.uploader.authToken = `Bearer ${localStorage.getItem('tsa_token')}`;
      }
    }

    get allowedMimeTypes(): string[] { return this._allowedMimeTypes; }

  invalidFile: boolean = false;
  public uploader:FileUploader = new FileUploader({url: `${this.baseUrl}/postwithupload`, maxFileSize: 4000 * 1024 * 1024, allowedMimeType: this.allowedMimeTypes});
  @ViewChild('uploadControl') uploadControl: ElementRef;

  constructor() { }

  ngOnInit() {
    this.initUploader();
  }

  initUploader(): void {
    this.uploadFinishedSubject = new ReplaySubject();
    this.uploadStatus = 0;
    this.uploader.authToken = `Bearer ${localStorage.getItem('tsa_token')}`;
    this.uploader.options.removeAfterUpload = true;

    this.uploader.onWhenAddingFileFailed = (fileItem) => {
      this.invalidFile = true;
      console.log("fail", fileItem);
      console.log("fail file size:", fileItem.size);
      //this type always gives "", i guess its not functioning as expected
      console.log("fail file type:", fileItem.type); 
      //this.failFlag = true;
      if(fileItem.size > this.uploader.options.maxFileSize){
        alert("Error, the file exceeds the maximum file size limit (4GB).");
      }
    }

    //this.uploader.onAfterAddingFile = this.onWhenAddingFile;
    this.uploader.onAfterAddingFile = (fileItem) => this.onWhenAddingFile(fileItem);

    this.uploader.onBeforeUploadItem = (item) => {
      item.withCredentials = false;
    }

    // this.uploader.onBuildItemForm = (form: any) => {
    //   form.formData.push({user: "hello"})
    //   console.log(form);
    // }

    // this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
    //   form.append('user', 'hello');
    //   form.append('name', 'world');

    //   this.uploadStatus = 0;
    //  };

     this.uploader.onCompleteItem = (item: any, response: string, status: any, headers: any) => {
      //console.log(headers);
      if(item.isSuccess){
        this.uploadFinishedSubject.next(1);
        if(response){
          let responseObject = JSON.parse(response);
          console.log(responseObject);
        }
        
        //this.uploader.clearQueue();
        
        this.uploadControl.nativeElement.value = null;
        this.uploadStatus = 1;
        this.resetMessageState();
      } else {
        this.uploadFinishedSubject.next(0);
        console.log(item);
        console.log(`Status: ${status}`)
        console.log(`Response: ${response}`)
        if(status === 401){
          this.uploadStatus = 3; //unauthorized
        } else {
          this.uploadStatus = 2; //error
        }
        
      }
    }
  }

  onWhenAddingFile(fileItem: FileItem): void {
    this.fileUploadItem = fileItem;
    this.invalidFile = false;
  }

  resetMessageState(): void {
    setTimeout(() => {
      this.uploadStatus = 0;
    }, 3000);
  }

  uploadFile(resourceLibraryAsset: IResourceLibraryAsset): Observable<number> {
   // this.uploader.uploadItem(this.fileUploadItem);
    this.uploadStatus = 0;

    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('resourceLibraryAssetJSON', JSON.stringify(resourceLibraryAsset));
      form.append('user', 'hello');
      form.append('name', 'world');

      
    };

   this.uploader.uploadAll();
   return this.uploadFinishedSubject;
  }

}
