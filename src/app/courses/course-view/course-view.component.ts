import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import { ICourse } from '../manage-courses/course';
import { ICourseCategory } from '../course-categories/course-category';
import { CourseCategoryService } from '../course-categories/course-category.service';
import { ICourseModule } from '../manage-courses/course-modules/course-module';
import { CourseModuleService } from '../manage-courses/course-modules/course-module.service';
import { ICourseModuleSummaryInfo } from '../manage-courses/course-modules/course-module-summary-info';
import { CourseGroupAssignmentService } from '../group-assignment/course-group-assignment.service';
import { ICourseGroupAssignmentSummaryInfo } from '../group-assignment/course-group-assignment-summary-info';
import { CourseAdhocAssignmentService } from '../staff-assignment/course-adhoc-assignment.service';
import { ICourseAdhocAssignmentSummaryInfo } from '../staff-assignment/course-adhoc-assignment-summary-info';
import { CoursePrerequisitesService } from '../course-prerequisites/course-prerequisites.service';
import { ICoursePrerequisites } from '../course-prerequisites/course-prerequisites';

@Component({
  selector: 'app-course-view',
  templateUrl: './course-view.component.html',
  styleUrls: ['./course-view.component.scss']
})
export class CourseViewComponent implements OnInit {
  course: ICourse;
  selectedCourseCategory: ICourseCategory;
  courseModuleSummaryInfoList: ICourseModuleSummaryInfo[];
  courseGroupAssignmentSummaryInfoList: ICourseGroupAssignmentSummaryInfo[];
  courseAdhocAssignmentSummaryInfoList: ICourseAdhocAssignmentSummaryInfo[];
  courseGroupAssignmentForm: FormGroup;
  coursePrerequisistes: ICoursePrerequisites[];

  hasCoursePrerequisites: boolean;
  editCourseModuleOrder: boolean;

  selectedCourseGroupAssignmentIdList: number[] = [];
  selectedCourseAdhocAssignmentIdList: number[] = [];

  constructor(private route: ActivatedRoute,
    private router: Router,
    private courseCategoryService: CourseCategoryService,
    private manageCourseModuleService: CourseModuleService,
    private courseGroupAssignmentService: CourseGroupAssignmentService,
    private courseAdhocAssignmentService: CourseAdhocAssignmentService,
    private coursePrerequisisteService: CoursePrerequisitesService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.loadForm();
  }

  loadForm(): void {
    this.route.data.subscribe(data => {
      this.course = data['course'];

      if(!this.course){
        console.log("Error - cannot view course as it was not loaded (ref Course-View.component");
        this.router.navigate(['/courses/manage']); //redirect user back to course list as the course was not loaded
      }

      this.coursePrerequisisteService.getCoursePrerequisites(this.course.courseId).subscribe(data=>{
        this.coursePrerequisistes = data;
        if(this.coursePrerequisistes.length>0)
        {
          this.hasCoursePrerequisites=true;
        }
      });

      if(this.course.courseCategoryId){
        //load the courseCategory object
        this.courseCategoryService.getCourseCategory(+this.course.courseCategoryId).subscribe(courseCategory => {
          this.selectedCourseCategory = courseCategory;
        });
      } else {
        this.selectedCourseCategory = null;
      }

      //get course modules summary info list
      this.manageCourseModuleService.getCourseModuleSummaryInfoList(this.course.courseId).subscribe(courseModuleSummaryInfoList => {
        this.courseModuleSummaryInfoList = courseModuleSummaryInfoList
      },
      error => console.log(`Unexpected error: ${error} (ref loadForm: courseModuleSummaryInfoList)`));

      //get courseGroupAssigned
      this.courseGroupAssignmentService.getCourseGroupAssignmentSummaryInfoListByCourseId(this.course.courseId).subscribe(courseGroupAssignmentSummaryInfoList => {
        this.courseGroupAssignmentSummaryInfoList = courseGroupAssignmentSummaryInfoList;
      },
      error => console.log(`Unexpected error: ${error} (ref loadForm: courseGroupAssignmentSummaryInfoList)`));

      //get courseadhocassigned
      this.courseAdhocAssignmentService.getCourseAdhocAssignmentSummaryInfoListByCourseId(this.course.courseId).subscribe(courseAdhocAssignmentSummaryInfoList => {
        this.courseAdhocAssignmentSummaryInfoList = courseAdhocAssignmentSummaryInfoList
      },
      error => console.log(`Unexpected error: ${error} (ref loadForm: courseAdhocAssignmentSummaryInfoList)`));

    });
  }

  getCourseModuleBadgeCSS(courseModuleSummaryInfo: ICourseModuleSummaryInfo) {
    let cssClasses = {
      'badge': true,
      'badge-success': courseModuleSummaryInfo.status === 1,
      'badge-default': !courseModuleSummaryInfo.status,
      'badge-danger': courseModuleSummaryInfo.status === 2
    }
    return cssClasses;
  }

  getCourseAdhocAssignmentProgressBarCSS(courseAdhocAssignmentSummaryInfo: ICourseAdhocAssignmentSummaryInfo) {
    let cssClasses = {
      'progress-bar': true,
      'progress-bar-primary': courseAdhocAssignmentSummaryInfo.status !== 3,
      'progress-bar-danger': courseAdhocAssignmentSummaryInfo.status === 3
    }
    return cssClasses;
  }

  cmdViewCourseModule(event: Event, courseModuleSummaryInfo: ICourseModuleSummaryInfo): void {
    event.stopPropagation();
    this.router.navigate(['/courses/module', courseModuleSummaryInfo.courseModuleId, courseModuleSummaryInfo.courseId, courseModuleSummaryInfo.courseModuleName]);
  }

  cmdViewCourseGroupAssigned(event: Event, courseGroupAssignmentSummaryInfo: ICourseGroupAssignmentSummaryInfo): void {
    event.stopPropagation();
    this.router.navigate(['/courses/groupassignment', courseGroupAssignmentSummaryInfo.courseGroupAssignmentId, this.course.courseId,courseGroupAssignmentSummaryInfo.groupName]);
  }

  cmdOnChangeCourseGroupAssignment(courseGroupAssignmentSummaryInfo: ICourseGroupAssignmentSummaryInfo, isChecked: boolean): void {
    if(isChecked){
      //add the id to the selection
      this.selectedCourseGroupAssignmentIdList.push(courseGroupAssignmentSummaryInfo.courseGroupAssignmentId);
    } else {
      //remove the id from the selection
      let index: number = this.selectedCourseGroupAssignmentIdList.findIndex(x => x === courseGroupAssignmentSummaryInfo.courseGroupAssignmentId);
      if(index > -1){
        this.selectedCourseGroupAssignmentIdList.splice(index, 1);
      }
    }
  }
  cmdEditSelectedCourseGroupAssignments(): void {
    //user selected one or more courseGroupAssignments - get the selected id's, pass them as optional parameters to the groupassignment component
    this.router.navigate(['/courses/groupassignment', -2, this.course.courseId, { idList: this.selectedCourseGroupAssignmentIdList }, "Edit"]);
  }

  cmdViewCourseAdhocAssigment(event: Event, courseAdhocAssignmentSummaryInfo: ICourseAdhocAssignmentSummaryInfo): void {
    event.stopPropagation();
    this.router.navigate(['/courses/staffassignment', courseAdhocAssignmentSummaryInfo.courseAdhocAssignmentId, this.course.courseId, courseAdhocAssignmentSummaryInfo.staffName]);
  }

  cmdOnChangeCourseAdhocAssignment(caasInfo: ICourseAdhocAssignmentSummaryInfo, isChecked: boolean): void {
    if(isChecked){
      //add the id to the selection
      this.selectedCourseAdhocAssignmentIdList.push(caasInfo.courseAdhocAssignmentId);
    } else {
      //remove the id from the selection
      let index: number = this.selectedCourseAdhocAssignmentIdList.findIndex(x => x === caasInfo.courseAdhocAssignmentId);
      if(index > -1){
        this.selectedCourseAdhocAssignmentIdList.splice(index, 1);
      }
    }
  }
  
  cmdEditSelectedCourseAdhocAssignments(): void {
    //user selected one or more courseAdhocAssignments - get the selected id's, pass them as optional parameters to the staff-assignment component
    this.router.navigate(['/courses/staffassignment', -2, this.course.courseId, { idList: this.selectedCourseAdhocAssignmentIdList }, "Edit"]);
  }


  cmdEditCourseModuleOrder(): void {
    this.editCourseModuleOrder = true;
  }

  cmdDoneEditCourseModuleOrder(): void {
    this.manageCourseModuleService.updateCourseModuleOrder(this.courseModuleSummaryInfoList).subscribe(() => {
      this.editCourseModuleOrder = false;
    },
    error => alert("There has been an unexpected error. Please try again. (ref cmdDoneEditCourseModuleOrder)"));
    
    
  }

  cmdMoveOrderUp(courseModuleSummaryInfo: ICourseModuleSummaryInfo, event: Event): void {
    event.stopPropagation();
    this.adjustQuestionOrder(courseModuleSummaryInfo, -1);
  }

  cmdMoveOrderDown(courseModuleSummaryInfo: ICourseModuleSummaryInfo, event: Event): void {
    event.stopPropagation();
    this.adjustQuestionOrder(courseModuleSummaryInfo, 1);
  }

  cmdBack() {
    this.router.navigate(['/courses/manage']);
  }
  
  private adjustQuestionOrder(courseModuleSummaryInfo: ICourseModuleSummaryInfo, increment: number) {
    //find this objects current index
    let currentCourseModuleIndex = this.courseModuleSummaryInfoList.findIndex(q => q == courseModuleSummaryInfo);

    if(currentCourseModuleIndex == 0 && increment < 0){
      return; //don't move backward because the item is already at the top
    }

    //move question in array
    this.array_move(this.courseModuleSummaryInfoList, currentCourseModuleIndex, (currentCourseModuleIndex + increment));

    //modify all question orders according to array index
    this.courseModuleSummaryInfoList.forEach((courseModuleItem, index) => {
      courseModuleItem.order = index;
    });

    //we are done!
  }

  private array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  };


}
