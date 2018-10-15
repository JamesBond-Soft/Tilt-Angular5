import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { StaffListComponent } from './staff-list.component';
import { StaffDetailComponent } from './staff-detail.component';
import { SettingsUsersService } from '../settings/settings-users/settings-users.service';
import { SharedModuleB } from '../shared/shared.module';

import { TabsModule } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';

import { pgTabsModule } from '../@pages/components/tabs/tabs.module';
import { UtilityModule } from '../shared/utility.module';
import { ManageStaffService } from './manage-staff.service';

import { GetAssignedCoursesResolver, GetUserResolver, GetUserGroupsResolver } from './staff-edit-resolver.service';
import { CourseAssignmentInfoService } from '../training/course-assignment-info.service';

import { StaffCourseAssignmentComponent } from './course-assignment/staff-course-assignment.component';
import { StaffCourseAssignmentService } from './course-assignment/staff-course-assignment.service';
import { ManageCoursesService } from '../courses/manage-courses/manage-courses.service';
import { SettingsUsersOrganisationsResolver } from '../settings/settings-users/settings-users-organisations-resolver.service';
import { SettingsOrganisationsService } from '../settings/settings-organisations/settings-organisations.service';
import { CourseAdhocAssignmentService } from '../courses/staff-assignment/course-adhoc-assignment.service';

import { StaffGroupAssignmentService } from './group-assignment/staff-group-assignment.service';
import { StaffGroupAssignmentComponent } from './group-assignment/staff-group-assignment.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModuleB,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    pgTabsModule,
    UtilityModule,
    RouterModule.forChild([
      { path: '', component: StaffListComponent},
      { path: ':userId/:breadcrumb', component: StaffDetailComponent ,
       resolve: { assignedCourses : GetAssignedCoursesResolver, user : GetUserResolver, userGroups: GetUserGroupsResolver }},
      { path: 'courseassignment/:courseAdhocAssignmentId/:userId/:breadcrumb', component : StaffCourseAssignmentComponent,
      resolve: {orgs: SettingsUsersOrganisationsResolver, user: GetUserResolver}  },
      { path: 'groupassignment/:userId/:breadcrumb', component : StaffGroupAssignmentComponent,
      resolve : {userGroups: GetUserGroupsResolver, user: GetUserResolver}}
    ])
  ],
  declarations: [StaffListComponent, StaffDetailComponent, StaffCourseAssignmentComponent, StaffGroupAssignmentComponent],
  providers: [
    CourseAdhocAssignmentService,
    SettingsOrganisationsService,
    SettingsUsersOrganisationsResolver,
    SettingsUsersService,
    ManageStaffService,
    GetAssignedCoursesResolver,
    GetUserGroupsResolver,
    GetUserResolver,
    CourseAssignmentInfoService,
    StaffCourseAssignmentService,
    ManageCoursesService,
    StaffGroupAssignmentService
  ]
})
export class StaffModule { }
