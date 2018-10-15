import { Component, OnInit, Input } from '@angular/core';
import { ICoursePage } from '../../../courses/manage-courses/course-pages/course-page';
import { ICoursePageContentBlock, IContentBlockType } from '../../../courses/manage-courses/course-page-content-blocks/course-page-content-block';
import { ICourseSession, ICourseSessionStatusType } from '../../course-session';
import { VgMedia } from 'videogular2/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'training-content',
  templateUrl: './training-content.component.html',
  styleUrls: ['./training-content.component.scss']
})
export class TrainingContentComponent implements OnInit {
  ICourseSessionStatusType = ICourseSessionStatusType;
  IContentBlockType = IContentBlockType;
  
  @Input() page: ICoursePage;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  getSafeHtml(content): SafeHtml {
    // return content
    return this.sanitizer.bypassSecurityTrustHtml(content);
   }
}
