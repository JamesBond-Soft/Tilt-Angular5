import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { ICoursePage } from '../course-page';
import { ICoursePageContent } from '../course-page-content';
import { ICoursePageContentBlock } from '../../course-page-content-blocks/course-page-content-block';

@Component({
  selector: 'app-course-page-preview-dialog',
  templateUrl: './course-page-preview-dialog.component.html',
  styleUrls: ['./course-page-preview-dialog.component.scss']
})
export class CoursePagePreviewDialogComponent implements OnInit {
  modalTitle: string;

  page: ICoursePage;
  coursePageContentBlocks: ICoursePageContentBlock[];

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    if(this.page){
      this.modalTitle = `Preview ${this.page.name}`;
    } else {
      this.modalTitle = 'Preview Page';
    }
  }

  cmdClose() {
    this.bsModalRef.hide();
  }

}
