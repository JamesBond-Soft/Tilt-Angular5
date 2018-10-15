import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { ICompletedCourseInfo } from '../completed-course-info';

@Component({
  selector: 'completed-courses-admin-widget',
  templateUrl: './completed-courses-admin-widget.component.html',
  styleUrls: ['./completed-courses-admin-widget.component.scss']
})
export class CompletedCoursesAdminWidgetComponent implements OnInit {
  info: ICompletedCourseInfo;
  constructor(
    private dashboardService: DashboardService) { }

  ngOnInit() {
    this.dashboardService.getCompletedCourseCount().subscribe(response => {
      this.info = response;
    },
    error => {
      alert('There was an unexpected error. Please refresh your browser. (ref: loadGroups)');
      console.log(`Error: ${<any>error}`);
      return;
    });
  }

}
