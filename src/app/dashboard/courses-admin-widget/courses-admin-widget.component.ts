import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardService } from '../dashboard.service';
import { ICourseStats } from '../course-stats';

@Component({
  selector: 'courses-admin-widget',
  templateUrl: './courses-admin-widget.component.html',
  styleUrls: ['./courses-admin-widget.component.scss']
})
export class CoursesAdminWidgetComponent implements OnInit {
  courseStats: ICourseStats;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.dashboardService.getCoursesStats().subscribe(courseStats => {
      this.courseStats = courseStats
    }, error => {
      console.log(`Error: ${<any>error} (ref: CoursesAdminWidgetComponent)`);
      return;
    });
  }

}
