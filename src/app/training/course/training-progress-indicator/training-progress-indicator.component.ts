import { Component, OnInit, Input } from '@angular/core';
import { ICourseModuleProgressInfo } from './course-module-progress-info';
import { TrainingEngineService } from '../../training-engine.service';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'training-progress-indicator',
  templateUrl: './training-progress-indicator.component.html'
})
export class TrainingProgressIndicatorComponent implements OnInit {
  
  courseModuleProgressInfoList: ICourseModuleProgressInfo[];

  private _courseId: number;
  @Input() 
  set courseId (courseId: number){
    this._courseId = courseId;
    this.loadCourseModuleProgressInfoList();
  }
  get courseId(): number { return this._courseId };


  private _moduleId: number;
  @Input() 
  set moduleId (moduleId: number){
    this._moduleId = moduleId;
    this.updateCourseModuleProgress();
  }
  get moduleId(): number { return this._moduleId };

  @Input() moduleProgress: number;

  
  constructor(private trainingEngineService: TrainingEngineService) { }

  ngOnInit() {
    
  }

  private loadCourseModuleProgressInfoList(): void {
    this.trainingEngineService.getCourseModuleProgressInfoList(this.courseId).subscribe(courseModuleProgressInfoList => {
      this.courseModuleProgressInfoList = courseModuleProgressInfoList;

      //if we also have a moduleId, trigger the update progress method
      if(this.moduleId){
        this.updateCourseModuleProgress();
      }

    }, error => console.log(`Unexpected error: ${error} (ref loadCourseModuleProgressInfoList)`))
  }

  private updateCourseModuleProgress(): void {
    if(!this.courseId || !this.courseModuleProgressInfoList){
      return; //fail safe
    }

    //get the index of the current module first as anything before it will have been completed
    let currentModuleIndex: number = this.courseModuleProgressInfoList.findIndex(cm => cm.courseModuleId === this.moduleId);

    //find the current selected module
    this.courseModuleProgressInfoList.forEach((courseModuleProgressInfo, index) => {
      if(courseModuleProgressInfo.courseModuleId === this.moduleId){
        courseModuleProgressInfo.selected = true;
      } else {
        courseModuleProgressInfo.selected = false;
        if(index <= currentModuleIndex){
          courseModuleProgressInfo.completed = true;
        }
      }
    })
  }

  getModuleIconCSS(courseModuleProgressInfo: ICourseModuleProgressInfo) {
    //gets the css for the font-awesome icon in the module heading
    if(courseModuleProgressInfo.selected){
      return {'fa fa-minus-circle': true }; 
    } else if(courseModuleProgressInfo.completed){
      return {'fa fa-check-circle': true};
    } else {
      return {'fa fa-circle-o': true};
    }
  }

  getModuleHeadingCSS(courseModuleProgressInfo: ICourseModuleProgressInfo) {
    //get the overall css for the module heading
    if(courseModuleProgressInfo.selected){
      return {}; //no styles for selected item
    } else if(courseModuleProgressInfo.completed){
      return {'module-complete': true, 
              'font-weight-bold': true};
    } else {
      return {'module-pending': true};
    }
  }

}
