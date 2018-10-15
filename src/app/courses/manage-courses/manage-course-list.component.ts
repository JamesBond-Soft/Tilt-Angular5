import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { IOrganisation } from '../../settings/settings-organisations/organisation';
import { ICourse } from './course';
import { ManageCoursesService } from './manage-courses.service';

@Component({
  selector: 'app-settings-courses',
  templateUrl: './manage-course-list.component.html',
  styleUrls: ['./manage-course-list.component.scss']
})
export class ManageCourseListComponent implements OnInit {
  pageTitle: string = 'Courses';

  orgs: IOrganisation[];
  selectedOrganisation: IOrganisation;
  courses: ICourse[];
  searchString: string;

  constructor(private router: Router, private route: ActivatedRoute, private settingsCoursesService: ManageCoursesService) { }

  ngOnInit() {
    this.loadOrganisations();
  }

  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.orgs = data['orgs'];

      this.selectedOrganisation = null;
      let organisationId: number = +this.route.snapshot.params['organisationId'];

      if (organisationId && organisationId > 0) {
        var matchingOrg: IOrganisation = this.orgs.find(o => o.organisationId === organisationId);
        if (matchingOrg) {
          this.selectedOrganisation = matchingOrg;
        }
      }

      if (!this.selectedOrganisation && this.orgs && this.orgs.length > 0) {
        //couldnt find a match - default to the first organisation
        this.selectedOrganisation = this.orgs[0];
      }

      //load the courses now
      this.loadCourses();
    });
  }

  loadCourses(): void {
    //load the courses for the selected organisation
    if(!this.selectedOrganisation){
      return;
    }

    this.settingsCoursesService.getCourses(this.selectedOrganisation.organisationId).subscribe(courses => {
      this.courses = courses;
    },
    error => console.log(`Unexpected error: ${error}`) 
    );
  }

  cmdChangeOrg(): void {
    // organisation dropdown value was changed, load the courses
    this.loadCourses();
  }

  cmdAddCourse(): void {
    // add a new course for the selected organisation
    this.router.navigate(['/courses/manage', 0, 'Add']);
  }

  cmdEditCourse(course: ICourse): void {
    this.router.navigate(['/courses/manage', course.courseId, course.name]);
  }

  cmdView(event: Event, course: ICourse) {
    event.stopPropagation();
    this.router.navigate(['/courses/view', course.courseId, course.name]);
  }
}
