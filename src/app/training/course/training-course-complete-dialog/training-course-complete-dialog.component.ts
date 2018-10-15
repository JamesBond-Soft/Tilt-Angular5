import { Component, OnInit, TemplateRef, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TrainingEngineService } from '../../training-engine.service';
import { StringifyOptions } from 'querystring';
import { Router } from '@angular/router';

@Component({
  selector: 'training-course-complete-dialog',
  templateUrl: './training-course-complete-dialog.component.html'
})
export class TrainingCourseCompleteDialogComponent implements OnInit {
  @ViewChild('courseCompleteDialogTemplate') courseCompleteDialogTemplate: TemplateRef<any>;
  
  modalRef: BsModalRef;
  courseReadOnly: boolean;

  @Input() currentCourseName: string;
  
  @Output() onConfirm = new EventEmitter<boolean>();
  

  constructor(private bsModalRef: BsModalRef, 
              private modalService: BsModalService,
              private trainingEngineService: TrainingEngineService,
              private router: Router) { }

  ngOnInit() {
    if(this.trainingEngineService.courseSessionReadOnly){
      this.courseReadOnly = true;
    } else {
      this.courseReadOnly = false;
    }
  }

  openModal(currentCourseName: string) {
    this.currentCourseName = currentCourseName;
    this.modalRef = this.modalService.show(this.courseCompleteDialogTemplate, {class: 'modal-sm'});
  }
 
  cmdReturnToMyCourses(): void {
    this.modalRef.hide();
    this.router.navigate(['/training/my-courses']);
  }

  cmdReturnToTrainingHistory(): void {
    this.modalRef.hide();
    this.router.navigate(['/training/history']);
  }

}
