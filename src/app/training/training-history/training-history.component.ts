import { Component, OnInit } from '@angular/core';
import { ICourseTrainingHistoryInfo } from './course-training-history-info';
import { CourseAssignmentInfoService } from '../course-assignment-info.service';
import { TrainingEngineService } from '../training-engine.service';
import { ICourseSession } from '../course-session';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'training-history',
  templateUrl: './training-history.component.html',
  styleUrls: ['./training-history.component.scss']
})
export class TrainingHistoryComponent implements OnInit {
  trainingHistoryList: ICourseTrainingHistoryInfo[];   

  constructor(private courseAssignmentInfoService: CourseAssignmentInfoService,
              private trainingEngineService: TrainingEngineService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.trainingEngineService.clearCache();
    this.loadTrainingHistory();
  }

  loadTrainingHistory(): void {
    this.courseAssignmentInfoService.getCourseTrainingHistory().subscribe(trainingHistoryList => {
      this.trainingHistoryList = trainingHistoryList;
    }, error => console.log(`Unexpected Error: ${error} (ref loadTrainingHistory)`))
  }
 
  cmdViewCompletedCourse(trainingHistoryItem: ICourseTrainingHistoryInfo): void {
    //basic validation to ensure any tricky users arent trying to bypass viewing an archived/pending course


    this.router.navigate(['/training/history', trainingHistoryItem.courseSessionId]);
    

    // if(trainingHistoryItem.courseStatus !== 1){
    //   alert("Error - cannot view course as is it no longer available.");
    //   console.log("Warning - User attempted to view course that is no longer active");
    //   return;
    // }

    // this.trainingEngineService.getNextModule(trainingHistoryItem.courseId, 0).subscribe(moduleId => {
    //   if(moduleId > 0){
    //     //we can load the module
    //     this.trainingEngineService.getNextPage(trainingHistoryItem.courseId, moduleId, 0).subscribe(pageId => {
    //       if(pageId > 0){
    //         //we can load the first page of the module
            
    //         //load the EXISTING courseSession object
    //         let courseSession: ICourseSession;
    //         this.trainingEngineService.getCourseSessionById(trainingHistoryItem.courseSessionId).subscribe(courseSession => {
    //           this.trainingEngineService.courseSession = courseSession;
    //           this.trainingEngineService.courseSessionReadOnly = true;
    //           this.router.navigate(['/training/course', trainingHistoryItem.courseId, moduleId, pageId, { sessionId: courseSession.courseSessionId }]);
    //         }, error => {
    //           alert("Attention, could not load course session. Please log out and try again. (ref cmdViewCompletedCourse)");
    //           return;
    //         })
            
    //       } else {
    //         //there is something wrong with the course module (most likely the page does not exist)
    //         alert(`Attention, there appears to be an issue with the training course. Please notify the system administrator (ref cmdOpenCourse; pageId: ${pageId}`);
    //         return;
    //       }
          
    //     }); 
    //   } else {
    //     //there is something wrong the course (most likely there are no modules).
    //     alert(`Attention, there appears to be an issue with the training course. Please notify the system administrator (ref cmdOpenCourse; pageId: ${moduleId}`);
    //     return;
    //   }
    // },
    // e => {
    //   alert(`Attention, there appears to be an issue with the training course. Please notify the system administrator (ref cmdOpenCourse; courseId: ${trainingHistoryItem.courseId}`);
    // });

  }

}
