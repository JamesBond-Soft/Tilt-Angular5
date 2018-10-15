import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UtilityModule } from '../shared/utility.module';
import { AuthGuard } from '../login/auth-guard.service';


import { CondensedComponent } from '../layout/condensed/condensed.component';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { SelfAssessmentAdminWidgetComponent } from './self-assessment-admin-widget/self-assessment-admin-widget.component';
import { StaffAdminWidgetComponent } from './staff-admin-widget/staff-admin-widget.component';
import { CoursesAdminWidgetComponent } from './courses-admin-widget/courses-admin-widget.component';
import { NoncomplianceAdminWidgetComponent } from './noncompliance-admin-widget/noncompliance-admin-widget.component';
import { CompletedCoursesAdminWidgetComponent } from './completed-courses-admin-widget/completed-courses-admin-widget.component';
import { MyCoursesStaffWidgetComponent } from './my-courses-staff-widget/my-courses-staff-widget.component';
@NgModule({
  imports: [
    CommonModule,
    UtilityModule,
    RouterModule.forChild([
      
     { path: '', canActivate: [AuthGuard], component: DashboardComponent }
     //{ path: 'dashboard', canLoad: [AuthGuard], canActivate: [AuthGuard], loadChildren: 'app/dashboard/dashboard.module#DashboardModule', component: DashboardComponent},
    ])
  ],
  declarations: [DashboardComponent, SelfAssessmentAdminWidgetComponent, StaffAdminWidgetComponent, CoursesAdminWidgetComponent, NoncomplianceAdminWidgetComponent, CompletedCoursesAdminWidgetComponent, MyCoursesStaffWidgetComponent],
  providers: [DashboardService]
})
export class DashboardModule { }
