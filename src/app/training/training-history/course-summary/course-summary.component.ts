import { Component, OnInit } from '@angular/core';
import { ICourseTrainingHistoryInfo } from '../course-training-history-info';
import { CourseAssignmentInfoService } from '../../course-assignment-info.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ICourseSession } from '../../course-session';
import { TrainingEngineService } from '../../training-engine.service';
import { ICourseSessionResult } from '../../course-session-result';

@Component({
  selector: 'app-course-summary',
  templateUrl: './course-summary.component.html',
  styleUrls: ['./course-summary.component.scss']
})
export class CourseSummaryComponent implements OnInit {
  trainingHistory: ICourseTrainingHistoryInfo;
  courseSessionResult: ICourseSessionResult;
  courseSessionId: number;
  constructor(private courseAssignmentInfoService: CourseAssignmentInfoService,
              private route: ActivatedRoute,
              private router: Router,
              private trainingEngineService: TrainingEngineService) { }

  ngOnInit() {
    this.loadTrainingHistory();
  }

  private loadTrainingHistory(): void {
    this.route.paramMap.subscribe(params => {
      if(params.has('courseSessionId')){
        this.courseSessionId = +params.get('courseSessionId');

        this.courseAssignmentInfoService.getCourseTrainingHistoryItem(this.courseSessionId).subscribe(trainingHistory => {
          this.trainingHistory = trainingHistory;
        }, error => console.log(`Unexpected error: ${error} (ref loadTrainingHistory - getCourseTrainingHistoryItem)`));

        this.trainingEngineService.getCourseSessionResultByCourseSession(this.courseSessionId).subscribe(courseSessionResult => {
          this.courseSessionResult = courseSessionResult;
        }, error => console.log(`Unexpected error: ${error} (ref loadTrainingHistory - getCourseSessionResultByCourseSession)`));

      } else {
        console.log('error - could not find courseSessionId, redirecting back to training history');
        this.router.navigate(['training/history']);
      }
    });
  }

  cmdViewCompletedCourse(): void {
    //basic validation to ensure any tricky users arent trying to bypass viewing an archived/pending course

    if(this.trainingHistory.courseStatus !== 1){
      alert("Error - cannot view course as is it no longer available.");
      console.log("Warning - User attempted to view course that is no longer active");
      return;
    }

    this.trainingEngineService.getNextModule(this.trainingHistory.courseId, 0).subscribe(moduleId => {
      if(moduleId > 0){
        //we can load the module
        this.trainingEngineService.getNextPage(this.trainingHistory.courseId, moduleId, 0).subscribe(pageId => {
          if(pageId > 0){
            //we can load the first page of the module
            
            //load the EXISTING courseSession object
            let courseSession: ICourseSession;
            this.trainingEngineService.getCourseSessionById(this.trainingHistory.courseSessionId).subscribe(courseSession => {
              this.trainingEngineService.courseSession = courseSession;
              this.trainingEngineService.courseSessionReadOnly = true;
              this.router.navigate(['/training/course', this.trainingHistory.courseId, moduleId, pageId, { sessionId: courseSession.courseSessionId }]);
            }, error => {
              alert("Attention, could not load course session. Please log out and try again. (ref cmdViewCompletedCourse)");
              return;
            })
            
          } else {
            //there is something wrong with the course module (most likely the page does not exist)
            alert(`Attention, there appears to be an issue with the training course. Please notify the system administrator (ref cmdOpenCourse; pageId: ${pageId}`);
            return;
          }
          
        }); 
      } else {
        //there is something wrong the course (most likely there are no modules).
        alert(`Attention, there appears to be an issue with the training course. Please notify the system administrator (ref cmdOpenCourse; pageId: ${moduleId}`);
        return;
      }
    },
    e => {
      alert(`Attention, there appears to be an issue with the training course. Please notify the system administrator (ref cmdOpenCourse; courseId: ${this.trainingHistory.courseId}`);
    });

  }

  cmdBack(): void {
    // this.router.navigate(['training/history']);
    window.history.back();
  }

}
