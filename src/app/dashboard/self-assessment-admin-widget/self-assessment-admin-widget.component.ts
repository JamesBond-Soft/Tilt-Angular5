import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { ISelfAssessmentReportStats } from '../self-assessment-report-stats';


@Component({
  selector: 'self-assessment-admin-widget',
  templateUrl: './self-assessment-admin-widget.component.html',
  styleUrls: ['./self-assessment-admin-widget.component.scss']
})
export class SelfAssessmentAdminWidgetComponent implements OnInit {
  selfAssesmentReportStats: ISelfAssessmentReportStats;
  
  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats(): void {
    this.dashboardService.getSelfAssessmentReportStats().subscribe(sarsObj => {
      this.selfAssesmentReportStats = sarsObj
    }, error => {
      alert("There was an unexpected error. Please refresh your browser. (ref: loadStats)");
      console.log(`Error: ${<any>error}`);
      return;
    });
  }

}
