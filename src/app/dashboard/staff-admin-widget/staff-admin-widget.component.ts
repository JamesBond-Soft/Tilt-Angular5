import { Component, OnInit } from '@angular/core';

import { DashboardService } from '../dashboard.service';
import { IUserStats } from '../user-stats';

@Component({
  selector: 'staff-admin-widget',
  templateUrl: './staff-admin-widget.component.html',
  styleUrls: ['./staff-admin-widget.component.scss']
})
export class StaffAdminWidgetComponent implements OnInit {
  userStats: IUserStats;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.dashboardService.getUserStats().subscribe(usObj => {
      this.userStats = usObj
    }, error => {
      alert("There was an unexpected error. Please refresh your browser. (ref: loadGroups)");
      console.log(`Error: ${<any>error}`);
      return;
    });
  }

}
