import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IOrganisation } from '../../settings/settings-organisations/organisation';
import { INoncomplianceCourseSummary } from '../course-report';
import { NoncomplianceCoursesService } from './noncompliance-courses.service';

@Component({
  selector: 'app-noncompliance-courses',
  templateUrl: './noncompliance-courses.component.html',
  styleUrls: ['./noncompliance-courses.component.scss']
})
export class NoncomplianceCoursesComponent implements OnInit {

  pageTitle = 'NonCompliance Courses';
  orgs: IOrganisation[];
  selectedOrganisation: IOrganisation;
  searchString: string;
  courses: INoncomplianceCourseSummary[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private noncomplianceCoursesService: NoncomplianceCoursesService
  ) { }

  ngOnInit() {
    this.loadOrganisations();
  }

  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.orgs = data['orgs'];

      this.selectedOrganisation = null;
      const organisationId: number = +this.route.snapshot.params['organisationId'];

      if (organisationId && organisationId > 0) {
        const matchingOrg: IOrganisation = this.orgs.find(o => o.organisationId === organisationId);
        if (matchingOrg) {
          this.selectedOrganisation = matchingOrg;
        }
      }

      if (!this.selectedOrganisation && this.orgs && this.orgs.length > 0) {
        // couldnt find a match - default to the first organisation
        this.selectedOrganisation = this.orgs[0];
      }

      // load the courses now
       this.loadNonComplianceCourses();
    });
  }

  cmdChangeOrg(): void {
    // organisation dropdown value was changed, load the courses
    this.loadNonComplianceCourses();
  }

  loadNonComplianceCourses() {
      // load the courses for the selected organisation
      if (!this.selectedOrganisation) {
        return;
      }

      this.noncomplianceCoursesService.getNonComplianceCourses(this.selectedOrganisation.organisationId).subscribe(
        courses => {
        this.courses = courses;
        },
        error => console.log(`Unexpected error: ${error}`)
      );
  }

  cmdView(event: Event, course : INoncomplianceCourseSummary) {
    event.stopPropagation();
    this.router.navigate(['/staff', course.userId, course.staffName]);
  }

}
