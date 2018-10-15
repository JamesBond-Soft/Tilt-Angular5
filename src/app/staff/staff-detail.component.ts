import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IUser } from '../settings/settings-users/user';
import { SettingsUsersService } from '../settings/settings-users/settings-users.service';
import { ICourseAssignmentInfo } from '../training/course-assignment-info';
import { StaffAssignedCourseSummaryInfo } from './staff-course-assigned-summary-info';
import { IUserGroup } from '../settings/settings-users/user-group';
import { IGroup } from '../groups/group';
import { StaffGroupAssignmentService } from './group-assignment/staff-group-assignment.service';
import { CourseAssignmentInfoService } from '../training/course-assignment-info.service';

import { ICourseTrainingHistoryInfo } from '../training/training-history/course-training-history-info';
import { TrainingEngineService } from '../training/training-engine.service';
import { ICourseSession } from '../training/course-session';

import { ModalDirective } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-staff-detail',
  templateUrl: './staff-detail.component.html',
  styleUrls: ['./staff-detail.component.scss']
})
export class StaffDetailComponent implements OnInit {

  @ViewChild('mdSlideUp') mdSlideUp: ModalDirective;
  slideUp: any = {
    type: 'md'
  };
  user: IUser;
  userID: number;
  errorMessage: string;
  assignedCourses: StaffAssignedCourseSummaryInfo[];
  coursesAssingedGroupLists: StaffAssignedCourseSummaryInfo[];
  userGroups: IUserGroup[];
  toDeleteUserGroupID: number;
  removeConfirmMsg: string;
  // Courses result tab
  trainingHistoryList: ICourseTrainingHistoryInfo[];
  constructor(
    private settingsUserService: SettingsUsersService,
    private router: Router, private route: ActivatedRoute,
    private staffGroupAssignmentService: StaffGroupAssignmentService,
    private courseAssignmentInfoService: CourseAssignmentInfoService,
    private trainingEngineService: TrainingEngineService,
    ) {
      this.route.params.subscribe(params => {
          this.userID = +params['userId'];
    });

    this.route.data.subscribe(data => {
      this.assignedCourses = data ['assignedCourses'];
      this.user = data ['user'];
      this.userGroups = data['userGroups'];
    });
    this.loadCoursesResultsList();
  }

    
  ngOnInit() {
  }

  // Get Course Results list
  loadCoursesResultsList(): void {
    this.courseAssignmentInfoService.getCourseResult(this.userID).subscribe(trainingHistoryList => {
      this.trainingHistoryList = trainingHistoryList;
    }, error => console.log(`Unexpected Error: ${error} (ref loadTrainingHistory)`))
  }

  cmdViewCompletedCourse(trainingHistoryItem: ICourseTrainingHistoryInfo): void {
    //basic validation to ensure any tricky users arent trying to bypass viewing an archived/pending course
    if(trainingHistoryItem.courseStatus !== 1){
      alert("Error - cannot view course as is it no longer available.");
      console.log("Warning - User attempted to view course that is no longer active");
      return;
    }

    this.trainingEngineService.getNextModule(trainingHistoryItem.courseId, 0).subscribe(moduleId => {
      if (moduleId > 0) {
        // we can load the module
        this.trainingEngineService.getNextPage(trainingHistoryItem.courseId, moduleId, 0).subscribe(pageId => {
          if (pageId > 0) {
            // we can load the first page of the module
            // load the EXISTING courseSession object
            let courseSession: ICourseSession;
            this.trainingEngineService.getCourseSessionOfUser(trainingHistoryItem.courseSessionId, this.userID).subscribe(courseSession => {
              this.trainingEngineService.courseSession = courseSession;
              this.trainingEngineService.courseSessionReadOnly = true;
              this.router.navigate(['/training/course', trainingHistoryItem.courseId, moduleId, pageId, 
              { sessionId: courseSession.courseSessionId }]);
            }, error => {
              alert('Attention, could not load course session. Please log out and try again. (ref cmdViewCompletedCourse)');
              return;
            })
          } else {
            // there is something wrong with the course module (most likely the page does not exist)
            alert(`Attention, there appears to be an issue with the training course. Please notify the system administrator (ref cmdOpenCourse; pageId: ${pageId}`);
            return;
          }
          
        });
      } else {
        // there is something wrong the course (most likely there are no modules).
        alert(`Attention, there appears to be an issue with the training course. Please notify the system administrator (ref cmdOpenCourse; pageId: ${moduleId}`);
        return;
      }
    },
    e => {
      alert(`Attention, there appears to be an issue with the training course. Please notify the system administrator (ref cmdOpenCourse; courseId: ${trainingHistoryItem.courseId}`);
    });

  }

  // Go to StaffCourseAssignment Page for editing selected course
  cmdMoveCourseEditAssigment ($event, info: StaffAssignedCourseSummaryInfo) {
    if (info.courseAdhocAssignmentId === 0) {
       alert('This course is assigned to a user group, to make changes to this assignment please change this on the courses page. Please note that this will change for all users in this group');
       this.router.navigate(['/courses/view', info.courseId  , info.courseName]);
    } else { this.router.navigate(['/staff/courseassignment', info.courseAdhocAssignmentId, this.userID, this.user.username]); }
  }

  // this function aims to delete assigned group from staff when confirm remove
  cmdRemoveGroup () {
    const $this = this;
    this.staffGroupAssignmentService.deleteUserGroup(this.toDeleteUserGroupID).subscribe(result => {
         $this.userGroups.forEach(function(item, index) {
           if (item.userGroupID === $this.toDeleteUserGroupID) {
            $this.userGroups.splice(index, 1);
           }
         });
    },
    error => {
      console.log(error);
    });
    this.mdSlideUp.hide();
  }

  // This functions aims to confirm if admin wants to remove assinged group from staff.
  async cmdRemoveAssignedGroupConfirmAlert(userGroup: IUserGroup) {
    this.toDeleteUserGroupID = userGroup.userGroupID;
    const groupID = userGroup.groupID;
    let removeCouresList: string = '';
    // Get assigned courses to this group
    this.coursesAssingedGroupLists = await this.courseAssignmentInfoService.GetCoursesAssignedToGroup(groupID);
   /*  this.coursesAssingedGroupLists.forEach((item, index) => {
      removeCouresList = removeCouresList + item.courseName + '\n';
    }); */
    if(this.coursesAssingedGroupLists && this.coursesAssingedGroupLists.length >0)
      this.removeConfirmMsg = `${this.user.firstName} ${this.user.lastName} has the following courses assigned via this group. If you remove this user from this group, they will be removed from these courses.\n`;
    else 
      this.removeConfirmMsg = `Are you sure to remove group from ${this.user.firstName} ${this.user.lastName}`;
    //this.removeConfirmMsg += removeCouresList;
    // confirm if user delete group even though it has assigned courses.
    this.mdSlideUp.show();
  }

  cmdMoveEditStaffpage() {
    this.router.navigate(['/settings/users', this.userID ]);
  }

  cmdMoveCourseDetailPage(course) {
    this.router.navigate(['/courses/view', course.courseId  ,  course.name ]);
  }

  // Go to StaffCourseAssignment Page for assigning new course
  cmdMoveCourseAssignmentPage() {
    this.router.navigate(['/staff/courseassignment/', 0, this.userID, this.user.username]);
  }

  // Go to GroupAssignment page
  cmdMoveAssignGroupPage() {
      this.router.navigate(['/staff/groupassignment/', this.userID, 'Assign Group']);
  }
}
