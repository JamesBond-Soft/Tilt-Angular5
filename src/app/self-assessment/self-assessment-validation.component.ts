import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { SelfAssessmentService } from './self-assessment.service';
import { ISelfAssessmentReport } from './self-assessment-report';
import { IGroup } from '../groups/group';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-self-assessment-validation',
  templateUrl: './self-assessment-validation.component.html',
  styleUrls: ['./self-assessment-validation.component.scss']
})
export class SelfAssessmentValidationComponent implements OnInit {
  pageTitle: string = 'Self Assessment Report';
  selfAssessmentReport: ISelfAssessmentReport;
  constructor(private router: Router, private route: ActivatedRoute, private selfAssessmentService: SelfAssessmentService, private loginService: LoginService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.selfAssessmentReport = data['selfAssessmentReport'];
    });

    //check if we came back from the group selector - if so, set the override groupid
    this.route.queryParamMap.subscribe(params => {
      if (params.has("groupId")) {
        //url has the groupId parameter meaning it just came back from the group selection screen
        this.selfAssessmentReport.groupIdOverride = +params.get('groupId');
        if (+params.get('groupId') > 0) {
          this.selfAssessmentReport.groupIdOverride = +params.get('groupId');
          this.selfAssessmentReport.groupOvveride = <IGroup>{ groupId: +params.get('groupId'), name: params.get('groupName') };
          //this.selfAssessmentReport.overrideByManagerId = 1;//this.loginService.currentUser.userId;// this is current userid TODO
        }
      } 
    });
  }

  cmdApprove(): void {
    //save changes
    
    //set the status to approved (1)
    this.selfAssessmentReport.status = 1;

    this.selfAssessmentService.finalizeAssessmentReport(this.selfAssessmentReport).subscribe(() => {
        this.router.navigate(['/selfassessments']);
      }, 
      error => console.log(`Error: ${<any>error}`));
  }

  cmdOverrideGroup(): void {
    this.router.navigate(['/selfassessments/validation',this.selfAssessmentReport.selfAssessmentReportID, 'group', {organisationId: this.loginService.currentUser.organisationId, groupId: this.selfAssessmentReport.groupID}]);
  }
}
