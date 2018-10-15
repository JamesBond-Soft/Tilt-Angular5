import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardService } from '../dashboard.service';
import { IMyCourseStatsInfo } from './my-course-stats-info';

@Component({
  selector: 'my-courses-staff-widget',
  templateUrl: './my-courses-staff-widget.component.html',
  styleUrls: ['./my-courses-staff-widget.component.scss']
})
export class MyCoursesStaffWidgetComponent implements OnInit {
  myCourseStatsInfo: IMyCourseStatsInfo;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.dashboardService.getMyCoursesStats().subscribe(myCourseStats => {
      this.myCourseStatsInfo = myCourseStats;
    }, error => {
      console.log(`Error: ${<any>error} (ref: MyCoursesStaffWidgetComponent)`);
      return;
    });
  }

}
