import { Component, OnInit, Input } from '@angular/core';
import { ICoursePageContentBlock } from '../../../courses/manage-courses/course-page-content-blocks/course-page-content-block';

@Component({
  selector: 'training-content-resource',
  template: `<div class="embed-responsive embed-responsive-16by9" *ngIf="contentBlock?.resourceLibraryAsset?.fileProperties?.url">
  <object class="embed-responsive-item" [data]="contentBlock.resourceLibraryAsset.fileProperties.url | sanitizeUrlPipe" width="100%" height="100%" type='application/pdf'>
    <p>Sorry, the Resource couldn't be displayed. Please click the link below to open the resource in a new window:(</p>
    <a href="contentBlock.resourceLibraryAsset.fileProperties.url | sanitizeUrlPipe" target="_blank">Open Resource</a>
  </object>
</div>`,
  styleUrls: ['./training-content-resource.component.scss']
})
export class TrainingContentResourceComponent implements OnInit {
  @Input() contentBlock: ICoursePageContentBlock;
  
  constructor() { }

  ngOnInit() {
  }

}
