import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ICourse } from '../../courses/manage-courses/course';
import { CourseAssignmentInfoService } from '../course-assignment-info.service';
import { ICourseAssignmentInfo } from '../course-assignment-info';
import { TrainingEngineService } from '../training-engine.service';
import { Observable } from 'rxjs/Observable';
import { ICourseSession, ICourseSessionStatusType, IUpdateCourseAssignmentScheduleParam } from '../course-session';
import { CourseSessionStatusNamePipe } from '../../shared/pipes/course-session-status-name.pipe';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.scss']
})
export class MyCoursesComponent implements OnInit {
  courseAssignmentInfos: ICourseAssignmentInfo[];
  ICourseSessionStatusType = ICourseSessionStatusType;
  searchString: string;

  constructor(private courseAssignmentInfoService: CourseAssignmentInfoService,
              private router: Router,
              private route: ActivatedRoute,
              private trainingEngineService: TrainingEngineService) { }

  ngOnInit() {
    this.trainingEngineService.clearCache();
    this.loadCourseAssignmentInfos();
  }

  private loadCourseAssignmentInfos(): void {
    this.courseAssignmentInfoService.getCourseAssignmentInfos().subscribe(courseAssignmentInfos => {
      this.courseAssignmentInfos = courseAssignmentInfos.filter(ca => ca.courseSession === null ||  ca.courseSession.status === ICourseSessionStatusType.NotStarted || ca.courseSession.status === ICourseSessionStatusType.Underway);
    },
    error => alert(`There has been an unexpected error. Please refresh the screen and try again (ref MyCoursesComponent)`)
    );
  }

  cmdOpenCourse(courseAssignmentInfo: ICourseAssignmentInfo, event: Event): void {
    event.stopPropagation();
    //get the first module and page ids for this course

    if(courseAssignmentInfo.courseSession && courseAssignmentInfo.courseSession.currentCourseModuleId && courseAssignmentInfo.courseSession.currentCoursePageId && courseAssignmentInfo.courseSession.status !== ICourseSessionStatusType.Completed){
      if(confirm('Do you want to resume the course where you last left off?')){
      //go to the page the user was previously up to
      this.trainingEngineService.courseSession = courseAssignmentInfo.courseSession;
      this.router.navigate(['/training/course', courseAssignmentInfo.courseId, courseAssignmentInfo.courseSession.currentCourseModuleId, courseAssignmentInfo.courseSession.currentCoursePageId]);
      return  
      }
    }

    this.trainingEngineService.getNextModule(courseAssignmentInfo.courseId, 0).subscribe(moduleId => {
      if(moduleId > 0){
        //we can load the module
        this.trainingEngineService.getNextPage(courseAssignmentInfo.courseId, moduleId, 0).subscribe(pageId => {
          if(pageId > 0){
            //we can load the first page of the module
            //record the progress
            let courseSession: ICourseSession;//
            if(courseAssignmentInfo.courseSession){
              courseSession = courseAssignmentInfo.courseSession;
            } else {
              courseSession = this.trainingEngineService.initCourseSession();
              courseSession.courseId = courseAssignmentInfo.courseId;
            }
            
            courseSession.currentCourseModuleId = moduleId;
            courseSession.currentCoursePageId = pageId;
            courseSession.status = ICourseSessionStatusType.Underway;

            this.trainingEngineService.updateCourseSessionProgress(courseSession).subscribe(courseSessionId => {
              let assignmentSessionUpdate:IUpdateCourseAssignmentScheduleParam =  {
                courseSessionId: courseSession.courseSessionId,
                id: courseAssignmentInfo.assignmentScheduleId,
                source: courseAssignmentInfo.source
              }
              this.trainingEngineService.updateCourseAssignmentSchedule(assignmentSessionUpdate).subscribe(()=>
              {
                this.trainingEngineService.courseSessionReadOnly = false;
                this.router.navigate(['/training/course', courseAssignmentInfo.courseId, moduleId, pageId]);
              });
            });
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
      alert(`Attention, there appears to be an issue with the training course. Please notify the system administrator (ref cmdOpenCourse; courseId: ${courseAssignmentInfo.courseId}`);
    });
    
  }

  cmdOpenCourseHistory(courseAssignmentInfo: ICourseAssignmentInfo, event: Event): void {
    event.stopPropagation();
    alert("STUB - Open Training History");
  }

  checkBeginPrerequisite(prerequisiteCourses)
  {
    let allPreqCompleted=true;
    if(prerequisiteCourses)
    {
      prerequisiteCourses.forEach(item => {
        if(!item.isCompleted)
        {
          allPreqCompleted=false;
        }
      });
    }
    return !allPreqCompleted;;
  }

}
