import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';


import {ISelfAssessmentReport } from './self-assessment-report';
import {FilterSelfAssessmentReportPipe } from './filter-self-assessment-report.pipe';
import { SelfAssessmentService } from './self-assessment.service';
import { LoginService } from '../login/login.service';

@Component({
  templateUrl: './self-assessment-list.component.html',
  styleUrls: ['./self-assessment-list.component.scss']
})
export class SelfAssessmentListComponent implements OnInit {
  pageTitle: string = "Self Assessment Validation"
  searchString: string;
  selfAssessments: ISelfAssessmentReport[];

  constructor(private router: Router, route: ActivatedRoute, private selfAssessmentService: SelfAssessmentService, private loginService: LoginService) { }

  ngOnInit() {
    // this.selfAssessments = [];
    // this.selfAssessments.push(
    //     {
    //       firstName: 'Robert',
    //       lastName: 'Citizen',
    //       dob: new Date(),
    //       userId: 1,
    //       selfAssessmentReportId: 1,
    //       createdDate: new Date(),
    //       groupIdOveride: -1,
    //       groupId: 1,
    //       hrStaffReferenceID: '12345',
    //       overrideByManagerId: 1,
    //       status: 1,
    //       details: []
    //   });
    this.loadSelfAssessmentReports();
  }

  loadSelfAssessmentReports(): void {
    this.selfAssessmentService.getSelfAssessmentReportForValidation(this.loginService.currentUser.userId).subscribe(sarList => {
      this.selfAssessments = sarList;
    },
    error => console.log(`Error: ${<any>error}`)
    );
  }

  cmdOpenSelfAssessment(sarObj: ISelfAssessmentReport) {
    //open the self-assessment-validation component - to view the self-assessment details
    this.router.navigate(['/selfassessments','validation', sarObj.selfAssessmentReportID])
  }

}
