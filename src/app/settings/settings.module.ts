import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FileUploadModule } from 'ng2-file-upload';
//import { HttpClientModule } from '@angular/common/http';
import { ModalModule, BsDatepickerModule, TimepickerModule } from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { SharedModuleB } from '../shared/shared.module';
import { UserService } from '../users/user.service';
import { SettingsMoodleImportComponent } from './settings-moodle-import/settings-moodle-import.component';
import { SettingsOrganisationsEditResolver } from './settings-organisations/settings-organisations-edit-resolver.service';
import { SettingsOrganisationsEditComponent } from './settings-organisations/settings-organisations-edit.component';
import { SettingsOrganisationsComponent } from './settings-organisations/settings-organisations.component';
import { SettingsOrganisationsService } from './settings-organisations/settings-organisations.service';
import { ManagerSelectionComponent } from './settings-users/manager-selection/manager-selection.component';
import { SettingsUsersEditComponent } from './settings-users/settings-users-edit.component';
import { SettingsUsersOrganisationsResolver } from './settings-users/settings-users-organisations-resolver.service';
import { SettingsUsersResolver } from './settings-users/settings-users-resolver.service';
import { SettingsUsersRolesResolver } from './settings-users/settings-users-roles-resolver.service';
import { SettingsUsersComponent } from './settings-users/settings-users.component';
import { SettingsUsersService } from './settings-users/settings-users.service';
import { BackupSummaryComponent } from './settings-moodle-import/backup-summary/backup-summary.component';
import { BackupUploadComponent } from './settings-moodle-import/backup-upload/backup-upload.component';
import { ImportCourseConfigComponent } from './settings-moodle-import/import-course-config/import-course-config.component';

import { ImportCoursePreviewComponent } from './settings-moodle-import/import-course-preview/import-course-preview.component';
import { UtilityCourseModule } from '../shared/utility-course.module';
import { MoodleImportService } from './settings-moodle-import/moodle-import.service';
import { SettingsConfigurationComponent } from './settings-configuration/settings-configuration.component';
import { RestrictedAuthGuard } from '../login/restricted-auth-guard.service';
import { SupportUserSelectionDialogComponent } from './settings-configuration/support-user-selection-dialog/support-user-selection-dialog.component';
import { ConfigurationSettingsService } from './settings-configuration/configuration-settings.service';
import { UtilityModule } from '../shared/utility.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModuleB,
    FileUploadModule,
    ModalModule.forRoot(),
    UtilityModule.forRoot(),
    UtilityCourseModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    //HttpClientModule,
    RouterModule.forChild([
      //{ path: 'settings', children:[
       // { path: '', component: SettingsUsersComponent},
        { path: 'users', component: SettingsUsersComponent, resolve: { roles: SettingsUsersRolesResolver } },
        // loading from case 0 : direct from setting page, 1: direct from Staff module
        { path: 'users/:id', component: SettingsUsersEditComponent, resolve: {user: SettingsUsersResolver, roles: SettingsUsersRolesResolver, orgs: SettingsUsersOrganisationsResolver}},
        { path: 'organisations', component: SettingsOrganisationsComponent },
        { path: 'organisations/:id', component: SettingsOrganisationsEditComponent, resolve: {organisation: SettingsOrganisationsEditResolver} },
        { path: 'users/:id/manager', component: ManagerSelectionComponent },
        { path: 'moodle-import', component: SettingsMoodleImportComponent, canLoad: [RestrictedAuthGuard], canActivate: [RestrictedAuthGuard], resolve: {orgs: SettingsUsersOrganisationsResolver} },
        { path: 'configuration', component: SettingsConfigurationComponent, canLoad: [RestrictedAuthGuard], canActivate: [RestrictedAuthGuard], resolve: {orgs: SettingsUsersOrganisationsResolver} },
        { path: '', redirectTo: 'users', pathMatch: 'full'},
     // ]//, canActivate: [AuthGuard]
     //},
     
      
     ]
  )
  ],
  declarations: [ 
                  SettingsUsersComponent,
                  SettingsUsersEditComponent,
                  SettingsOrganisationsComponent,
                  SettingsOrganisationsEditComponent,
                  ManagerSelectionComponent,
                  SettingsMoodleImportComponent,
                  BackupSummaryComponent,
                  BackupUploadComponent,
                  ImportCourseConfigComponent,
                  ImportCoursePreviewComponent,
                  SettingsConfigurationComponent,
                  SupportUserSelectionDialogComponent
                ],
  providers: [
                SettingsUsersService,
                SettingsUsersResolver,
                SettingsUsersRolesResolver,
                SettingsOrganisationsService,
                SettingsOrganisationsEditResolver,
                SettingsUsersOrganisationsResolver,
                UserService,
                MoodleImportService,
                BsModalRef,
                ConfigurationSettingsService
              ]
  
})
export class SettingsModule { }
