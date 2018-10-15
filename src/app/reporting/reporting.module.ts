import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportReportBuilderListComponent } from './export-report-builder/export-report-builder-list/export-report-builder-list.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UtilityModule } from '../shared/utility.module';
import { RouterModule } from '@angular/router';

import { ModalModule } from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { ReportEditComponent } from './export-report-builder/report-edit/report-edit.component';
import { SettingsUsersOrganisationsResolver } from '../settings/settings-users/settings-users-organisations-resolver.service';
import { SettingsOrganisationsService } from '../settings/settings-organisations/settings-organisations.service';
import { EditColumnComponent } from './export-report-builder/report-edit/edit-column/edit-column.component';
import { ReportColumnsListComponent } from './export-report-builder/report-edit/report-columns-list/report-columns-list.component';
import { ExportReportService } from './export-report-builder/export-report.service';
import { ReorderCollectionService } from '../shared/helper-services/reorder-collection.service';
import { DataColumnFilterPipe } from './export-report-builder/report-edit/edit-column/data-column-filter.pipe';
import { PreviewReportDialogComponent } from './export-report-builder/report-edit/preview-report-dialog/preview-report-dialog.component';

import { PapaParseModule } from 'ngx-papaparse';
import { CompletedCoursesComponent } from './completed-courses/completed-courses.component';
import { NoncomplianceCoursesComponent } from './noncompliance-courses/noncompliance-courses.component';
import { CompletedCoursesService } from './completed-courses/completed-courses.service';
import { NoncomplianceCoursesService } from './noncompliance-courses/noncompliance-courses.service';
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    FormsModule,
    ModalModule.forRoot(),
    UtilityModule.forRoot(),
    PapaParseModule,
    RouterModule.forChild([
      { path: 'export-report-builder', pathMatch: 'full', component: ExportReportBuilderListComponent, resolve: {orgs: SettingsUsersOrganisationsResolver}},
      { path: 'export-report-builder/:exportReportId', pathMatch: 'full', component: ReportEditComponent, resolve: {orgs: SettingsUsersOrganisationsResolver}},
      { path: 'completed-courses',data: {breadcrumb : 'CompletedCourses'}, pathMatch: 'full', component: CompletedCoursesComponent, resolve: {orgs: SettingsUsersOrganisationsResolver}},
      { path: 'noncompliance-courses', data: {breadcrumb : 'NonCompliance'}, pathMatch: 'full', component: NoncomplianceCoursesComponent, resolve: {orgs: SettingsUsersOrganisationsResolver}}
     // { path: '', pathMatch: 'full', redirectTo:'manage'}
    ])
  ],
  declarations: [ ExportReportBuilderListComponent,
                  ReportEditComponent,
                  EditColumnComponent,
                  ReportColumnsListComponent,
                  DataColumnFilterPipe,
                  PreviewReportDialogComponent,
                  CompletedCoursesComponent,
                  NoncomplianceCoursesComponent],

  providers: [SettingsUsersOrganisationsResolver,
              SettingsOrganisationsService,
              ExportReportService,
              ReorderCollectionService,
              BsModalRef,
              CompletedCoursesService,
              NoncomplianceCoursesService
              ]
})
export class ReportingModule { }
