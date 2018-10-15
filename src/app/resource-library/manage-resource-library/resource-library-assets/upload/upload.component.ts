import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  private baseUrl: string = `${environment.apiURL}/api/resourcelibraryassets`;
  public uploader:FileUploader = new FileUploader({url: `${this.baseUrl}/upload`, maxFileSize: 4000 * 1024 * 1024});
  @ViewChild('uploadControl') uploadControl: ElementRef;
  uploadStatus: number;
  
  constructor() { }

  ngOnInit() {
    this.uploadStatus = 0;
    this.uploader.authToken = `Bearer ${localStorage.getItem('tsa_token')}`;
    this.uploader.options.removeAfterUpload = true;
    
    
    //this.uploader.authTokenHeader = `Bearer ${localStorage.getItem('tsa_token')}`;
    
    this.uploader.onWhenAddingFileFailed = (fileItem) => {
      console.log("fail", fileItem);
      console.log("fail file size:", fileItem.size);
      //this type always gives "", i guess its not functioning as expected
      console.log("fail file type:", fileItem.type); 
      //this.failFlag = true;
      if(fileItem.size > this.uploader.options.maxFileSize){
        alert("Error, the file exceeds the maximum file size limit (4GB).");
      }
    }

    this.uploader.onBeforeUploadItem = (item) => {
      item.withCredentials = false;
    }

    // this.uploader.onBuildItemForm = (form: any) => {
    //   form.formData.push({user: "hello"})
    //   console.log(form);
    // }

    this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append('user', 'hello');
      form.append('name', 'world');

      this.uploadStatus = 0;
     };

     this.uploader.onCompleteItem = (item: any, response: string, status: any, headers: any) => {
      //console.log(headers);
      if(item.isSuccess){
        let responseObject = JSON.parse(response);
        console.log(responseObject);
        //this.uploader.clearQueue();
        
        this.uploadControl.nativeElement.value = null;
        this.uploadStatus = 1;
        this.resetMessageState();
      } else {
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

  resetMessageState(): void {
    setTimeout(() => {
      this.uploadStatus = 0;
    }, 3000);
  }

}
