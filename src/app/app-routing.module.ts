import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { AuthGuard } from './login/auth-guard.service';

import { CondensedComponent } from './layout/condensed/condensed.component';
import { BlankComponent } from './layout/blank/blank.component';

const routes: Routes = [
   { path: 'pagenotfound', component: CondensedComponent, children: [{path: '', component: PageNotFoundComponent}]},
   //{ path: 'dashboard', canLoad: [AuthGuard], canActivate: [AuthGuard], loadChildren: 'app/dashboard/dashboard.module#DashboardModule'}, //this has guards which should be enabled later
   { path: 'dashboard',data : { breadcrumb : 'dashboard'}, component: CondensedComponent, loadChildren: 'app/dashboard/dashboard.module#DashboardModule'},
   // tslint:disable-next-line:max-line-length
   { path: 'settings', data : {breadcrumb : 'Settings'}, component: CondensedComponent, canLoad: [AuthGuard], canActivate: [AuthGuard], loadChildren: 'app/settings/settings.module#SettingsModule'},
   { path: 'groups', data: { breadcrumb : ' Groups'} ,component: CondensedComponent, canLoad: [AuthGuard], canActivate: [AuthGuard], loadChildren: 'app/groups/groups.module#GroupsModule'},
   { path: 'users' , data : { breadcrumb : 'Users'} ,component: CondensedComponent, canLoad: [AuthGuard], canActivate: [AuthGuard], loadChildren: 'app/users/users.module#UsersModule'},
   { path: 'staff', data: { breadcrumb : 'Staff'} , component: CondensedComponent, canLoad: [AuthGuard], canActivate: [AuthGuard], loadChildren: 'app/staff/staff.module#StaffModule'},
   { path: 'selfassessments', data : {breadcrumb : 'Self Assessments'}, component: CondensedComponent, canLoad: [AuthGuard], canActivate: [AuthGuard], loadChildren: 'app/self-assessment/self-assessment.module#SelfAssessmentModule'},
   { path: 'courses', data : { breadcrumb : 'Courses'}, component: CondensedComponent, loadChildren: 'app/courses/courses.module#CoursesModule'},
    { path: 'resources', data: { breadcrumb : 'Resources'} ,component: CondensedComponent, loadChildren: 'app/resources/resources.module#ResourcesModule'},
   { path: 'resourcelibrary', data : {breadcrumb : 'Resources '}, component: CondensedComponent, loadChildren: 'app/resource-library/resource-library.module#ResourceLibraryModule'},
   //{ path: 'questionaire', component: BlankComponent, loadChildren: 'app/self-assessment/self-assessment.module#SelfAssessmentModule'},
   { path: 'training', data : { breadcrumb : 'Training History'} ,canLoad: [AuthGuard], canActivate: [AuthGuard], component: CondensedComponent, loadChildren: 'app/training/training.module#TrainingModule'},
   { path: 'reporting', data : {breadcrumb : 'Reporting '}, component: CondensedComponent, loadChildren: 'app/reporting/reporting.module#ReportingModule'},
   { path: 'support', data : { breadcrumb : 'Support'} ,component: CondensedComponent, loadChildren: 'app/support/support.module#SupportModule'},
   { path: 'notifications',data : { breadcrumb : 'Notifications'} , canLoad: [AuthGuard], canActivate: [AuthGuard], component: CondensedComponent, loadChildren: 'app/notifications/notifications.module#NotificationsModule'},
   { path: 'contentcreator', component: CondensedComponent, loadChildren: 'app/contentcreator/contentcreator.module#ContentcreatorModule'},
   { path: 'webinar', data : { breadcrumb : 'Webinar'} , canLoad: [AuthGuard], canActivate: [AuthGuard],component: CondensedComponent, loadChildren: 'app/webinar/webinar.module#WebinarModule'},
   //{ path: 'bugger', component: BlankComponent, loadChildren: 'app/support/support.module#SupportModule'},
   { path: '', redirectTo: 'login', pathMatch: 'full' }, //redirect user to login page <- current option
  //{ path: '', redirectTo: 'home', pathMatch: 'full' }, //redirect user to page called home
  //{ path: '', data: { breadcrumb: 'Home' }, component: HomeComponent },  //load component called home
  { path: '**', redirectTo: 'pagenotfound', pathMatch: 'full' }

]

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes, 
      { enableTracing: false }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
