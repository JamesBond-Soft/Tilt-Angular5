import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ModalModule } from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { CoursesComponent } from './courses.component';
import { CourseCategoryListComponent } from './course-categories/course-category-list.component';
import { CourseCategoryItemComponent } from './course-categories/course-category-item.component';
import { CourseCategoryEditComponent } from './course-categories/course-category-edit.component';
import { ManageCoursesService } from './manage-courses/manage-courses.service';
import { ManageCourseListComponent } from './manage-courses/manage-course-list.component';
import { CourseEditComponent } from './manage-courses/course-edit/course-edit.component';
import { CourseEditResolver, BCInsertResolver } from './manage-courses/course-edit/course-edit-resolver.service';
import { SettingsOrganisationsService } from '../settings/settings-organisations/settings-organisations.service';
import { SettingsUsersOrganisationsResolver } from '../settings/settings-users/settings-users-organisations-resolver.service';
import { UtilityModule } from '../shared/utility.module';

import { CourseModuleService } from './manage-courses/course-modules/course-module.service';
import { CourseModuleEditComponent } from './manage-courses/course-modules/course-module-edit/course-module-edit.component';
import { CourseModuleEditResolver } from './manage-courses/course-modules/course-module-edit/course-module-edit-resolver.service';
import { CoursePageListComponent } from './manage-courses/course-pages/course-page-list.component';
import { CoursePageEditComponent } from './manage-courses/course-pages/course-page-edit/course-page-edit.component';
import { CoursePageService } from './manage-courses/course-pages/course-page.service';
import { CourseViewComponent } from './course-view/course-view.component';
import { GroupAssignmentComponent } from './group-assignment/group-assignment.component';
import { StaffAssignmentComponent } from './staff-assignment/staff-assignment.component';
import { CourseGroupAssignmentService } from './group-assignment/course-group-assignment.service';
import { CourseAdhocAssignmentService } from './staff-assignment/course-adhoc-assignment.service';

import { GroupAssignmentEditResolver } from './group-assignment/group-assignment-edit-resolver.service';
import { GroupSelectionComponent } from '../shared/group-selection/group-selection.component';
import { GroupService } from '../groups/group.service';
import { TemplateListComponent } from './templates/template-list.component';
import { TemplateViewComponent } from './templates/template-view.component';
import { CoursePageContentBlockService } from './manage-courses/course-page-content-blocks/course-page-content-block.service';
import { CoursePageEditDialogComponent } from './manage-courses/course-pages/course-page-edit-dialog/course-page-edit-dialog.component';
import { CoursePageContentBlockListComponent } from './manage-courses/course-page-content-blocks/course-page-content-block-list.component';
import { CoursePageContentBlockEditComponent } from './manage-courses/course-page-content-blocks/course-page-content-block-edit/course-page-content-block-edit.component';
import { CoursePageContentQuestionListComponent } from './manage-courses/course-page-content-questions/course-page-content-question-list.component';
import { CoursePageContentQuestionEditComponent } from './manage-courses/course-page-content-questions/course-page-content-question-edit/course-page-content-question-edit.component';
import { CoursePagePreviewDialogComponent } from './manage-courses/course-pages/course-page-preview-dialog/course-page-preview-dialog.component';
import { CoursePageContentQuestionService } from './manage-courses/course-page-content-questions/course-page-content-question.service';

import { VideoSelectionDialogComponent } from './manage-courses/course-page-content-blocks/video-selection-dialog/video-selection-dialog.component';
import { ResourceLibraryAssetService } from '../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';
import { UtilityCourseModule } from '../shared/utility-course.module';

import { TabsModule } from 'ngx-bootstrap';
import { pgTabsModule } from '../@pages/components/tabs/tabs.module';
import { TrainingModule } from '../training/training.module';
import { ContentcreatorModule } from '../contentcreator/contentcreator.module';
import { CoursePrerequisitesService } from './course-prerequisites/course-prerequisites.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TabsModule.forRoot(),
    pgTabsModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    UtilityModule,
    UtilityCourseModule,
    RouterModule.forChild([
      
      { path: 'view', pathMatch: 'full', redirectTo:'manage'},
      { path: 'view/:courseId/:breadcrumb', component: CourseViewComponent, resolve: {course: CourseEditResolver, orgs: SettingsUsersOrganisationsResolver} },
      { path: 'manage', pathMatch: 'full', component: ManageCourseListComponent, resolve: {orgs: SettingsUsersOrganisationsResolver} },
      { path: 'manage/:courseId/:breadcrumb', component: CourseEditComponent, resolve: {course: CourseEditResolver, orgs: SettingsUsersOrganisationsResolver} },
      { path: 'categories', data : { breadcrumb :'Course Categories'} ,pathMatch: 'full', component: CourseCategoryListComponent, resolve: {orgs: SettingsUsersOrganisationsResolver} },
      { path: 'categories/:id', pathMatch: 'full', component: CourseCategoryEditComponent },
      { path: 'groupassignment', pathMatch: 'full', redirectTo: 'manage' },
      { path: 'groupassignment/:courseGroupAssignmentId/:courseId/:breadcrumb', component: GroupAssignmentComponent, resolve: {course: CourseEditResolver, courseGroupAssignment: GroupAssignmentEditResolver,bcs: BCInsertResolver} },
      { path: 'staffassignment', pathMatch: 'full', redirectTo: 'manage' },
      { path: 'staffassignment/:courseAdhocAssignmentId/:courseId/:breadcrumb', component: StaffAssignmentComponent, resolve: {course: CourseEditResolver,bcs: BCInsertResolver } },
      { path: 'module/:id/:courseId/:breadcrumb', component: CourseModuleEditComponent, 
       resolve: {courseModule: CourseModuleEditResolver,bcs: BCInsertResolver }},
      { path: 'pageedit', pathMatch: 'full', component: CoursePageEditComponent },
      { path: 'pages', pathMatch: 'full', component: CoursePageListComponent },
      { path: 'templates', data : { breadcrumb :'Course Templates'} ,pathMatch: 'full', component: TemplateListComponent },
      { path: 'templates/view', pathMatch: 'full', component: TemplateViewComponent },
      { path: '', pathMatch: 'full', redirectTo:'manage'}
    ]),
    ContentcreatorModule,
    TrainingModule
  ],
  declarations: [CoursesComponent, 
                 CourseCategoryListComponent, 
                 CourseCategoryEditComponent, 
                 ManageCourseListComponent, 
                 CourseEditComponent, 
                 CourseCategoryItemComponent, 
                 CourseModuleEditComponent, 
                 CoursePageListComponent, 
                 CoursePageEditComponent, 
                 CourseViewComponent, 
                 GroupAssignmentComponent, 
                 StaffAssignmentComponent, 
                 TemplateListComponent, 
                 TemplateViewComponent, 
                 CoursePageEditDialogComponent, 
                 CoursePageContentBlockListComponent, 
                 CoursePageContentBlockEditComponent, 
                 CoursePageContentQuestionListComponent, 
                 CoursePageContentQuestionEditComponent, 
                 CoursePagePreviewDialogComponent,
                 VideoSelectionDialogComponent],

  providers: [ManageCoursesService,
              SettingsUsersOrganisationsResolver,
              SettingsOrganisationsService,
              CourseEditResolver,
              CourseModuleService,
              BsModalRef,
              CoursePageService,
              CourseGroupAssignmentService,
              CourseAdhocAssignmentService,
              CourseModuleEditResolver,
              BCInsertResolver,
              GroupAssignmentEditResolver,
              GroupService,
              CoursePageContentBlockService,
              ResourceLibraryAssetService,
              CoursePageContentQuestionService,
              CoursePrerequisitesService],

  entryComponents: [CourseModuleEditComponent,
                    CoursePageListComponent,
                    GroupSelectionComponent,
                    CoursePageEditDialogComponent,
                    CoursePagePreviewDialogComponent,
                    VideoSelectionDialogComponent],
  schemas: [  NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA ]
})
export class CoursesModule { }
