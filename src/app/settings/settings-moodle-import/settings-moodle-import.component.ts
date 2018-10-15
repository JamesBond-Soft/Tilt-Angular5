import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FileUploader } from 'ng2-file-upload';

import { IMoodleImportSummary } from './moodle-import-summary';
import { IOrganisation } from '../settings-organisations/organisation';
import { ImportCourseConfigComponent } from './import-course-config/import-course-config.component';
import { ICourse } from '../../courses/manage-courses/course';
import { MoodleImportService } from './moodle-import.service';
import { environment } from '../../../environments/environment';

@Component({
  templateUrl: './settings-moodle-import.component.html',
  styleUrls: ['./settings-moodle-import.component.scss']
})
export class SettingsMoodleImportComponent implements OnInit {
  moodleImportSummary: IMoodleImportSummary;
  visibleSectionIndex: number;
  orgs: IOrganisation[];
  selectedOrganisation: IOrganisation;
  @ViewChild('summarySection') summarySectionRef:ElementRef;
  @ViewChild('importCourseConfig') importCourseConfigRef: ImportCourseConfigComponent;

  importing: boolean;
  importResultStatus: number;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private moodleImportService: MoodleImportService) { }

  ngOnInit() {
    this.visibleSectionIndex = 0;

  }

  onFinishUploadEventHandler(moodleImportSummary: IMoodleImportSummary): void {
    this.moodleImportSummary = moodleImportSummary;
    if (moodleImportSummary != null) {
      this.visibleSectionIndex = 2;
      setTimeout(() => {
        this.summarySectionRef.nativeElement.scrollIntoView(); //this doesnt work
      }, 100);

    }
  }

  cmdNextSection(): void {
    this.visibleSectionIndex++;
  }

  cmdImportCourse(): void {
    this.importing = true;

    //build a new Course object
    let courseObj: ICourse = Object.assign({}, this.importCourseConfigRef.courseForm.value);
    
    //set the courseObject to the property in the moodleImportSummary object
    this.moodleImportSummary.course = courseObj;

    //call the webservice to import the course
    this.moodleImportService.importMoodleCourse(this.moodleImportSummary).subscribe(result => {
      this.visibleSectionIndex = 4;
      this.importResultStatus = 0; //success
      this.importing = false;

      //FOR DEBUG - keep showing the import button
      if(!environment.production){
        this.visibleSectionIndex = 3;
        console.log("Import success");
      }
    },
    error => {
      this.visibleSectionIndex = 4;
      console.log(`Unexpected error while importing Moodle Course: ${error}`)
      this.importResultStatus = 2; //error
      this.importing = false;

       //FOR DEBUG - keep showing the import button
       if(!environment.production){
        this.visibleSectionIndex = 3;
        console.log("Import error");
      }
    });

    // setTimeout(() => {
    //   this.visibleSectionIndex = 4;
    //   this.importing = false;
    // }, 1000);
  }

  cmdResetImport(): void {
    //clears all fields, to prepare for another import
    this.moodleImportSummary = null;
    this.visibleSectionIndex = 1; //show the upload control section, skipping the intro as the user already would have read it during the first import
    this.importing = false;
  }

  cmdManageCourse(): void {
    this.router.navigate(['courses/view', 10]); //STUB - get new course id
  }

}
