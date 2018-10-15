import { Component, OnInit } from '@angular/core';

import { INoncomplianceCourseInfo } from '../noncompliance-course-info';
import { DashboardService } from '../dashboard.service';
@Component({
  selector: 'noncompliance-admin-widget',
  templateUrl: './noncompliance-admin-widget.component.html',
  styleUrls: ['./noncompliance-admin-widget.component.scss']
})
export class NoncomplianceAdminWidgetComponent implements OnInit {

  info: INoncomplianceCourseInfo;
  constructor(
    private dashboardService: DashboardService) { }

  ngOnInit() {
    this.dashboardService.getNoncomplianceCourseCount().subscribe(response => {
      this.info = response;
    },
    error => {
      alert('There was an unexpected error. Please refresh your browser. (ref: loadGroups)');
      console.log(`Error: ${<any>error}`);
      return;
    });
  }
}
