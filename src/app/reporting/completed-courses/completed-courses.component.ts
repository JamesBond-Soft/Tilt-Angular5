import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IOrganisation } from '../../settings/settings-organisations/organisation';
import { ICompletedCourseSummary } from '../course-report';
import { CompletedCoursesService } from './completed-courses.service';
@Component({
  selector: 'app-completed-courses',
  templateUrl: './completed-courses.component.html',
  styleUrls: ['./completed-courses.component.scss']
})
export class CompletedCoursesComponent implements OnInit {

  pageTitle = 'Completed Courses';
  orgs: IOrganisation[];
  selectedOrganisation: IOrganisation;
  searchString: string;
  courses: ICompletedCourseSummary[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private completedCoursesService: CompletedCoursesService
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
      this.loadCompletedCourses();
    });
  }

  cmdChangeOrg(): void {
    // organisation dropdown value was changed, load the courses
    this.loadCompletedCourses();
  }

  loadCompletedCourses() {
      // load the courses for the selected organisation
      if (!this.selectedOrganisation) {
        return;
      }

      this.completedCoursesService.getCompletedCourses(this.selectedOrganisation.organisationId).subscribe(
        courses => {
        this.courses = courses;
        },
        error => console.log(`Unexpected error: ${error}`)
      );
  }

  cmdView(event: Event, courseSession: ICompletedCourseSummary) {
    event.stopPropagation();
    this.router.navigate(['/training/history', courseSession.courseSessionId]);
  }

}
