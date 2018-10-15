import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TrainingCourseComponent } from './course/training-course.component';
import { RouterModule } from '@angular/router';

import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ModalModule } from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { ManageCoursesService } from '../courses/manage-courses/manage-courses.service';
import { MyCoursesComponent } from './my-courses/my-courses.component';
import { CourseAssignmentInfoService } from './course-assignment-info.service';
//import { TrainingEngineService } from './training-engine.service';
import { CoursePageContentBlockService } from '../courses/manage-courses/course-page-content-blocks/course-page-content-block.service';
import { CourseModuleService } from '../courses/manage-courses/course-modules/course-module.service';

import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
import { VgStreamingModule } from 'videogular2/streaming';
import { DragulaModule, DragulaService } from 'ng2-dragula';

import { ResourceLibraryAssetService } from '../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';
import { CoursePageService } from '../courses/manage-courses/course-pages/course-page.service';
import { TrainingQuestionComponent } from './course/training-question/training-question.component';
import { TrainingContentComponent } from './course/training-content/training-content.component';

import { UtilityModule } from '../shared/utility.module';
import { TrainingContentResourceComponent } from './course/training-content-resource/training-content-resource.component';
import { TrainingHistoryComponent } from './training-history/training-history.component';
import { TrainingProgressIndicatorComponent } from './course/training-progress-indicator/training-progress-indicator.component';
import { TrainingNextModuleDialogComponent } from './course/training-next-module-dialog/training-next-module-dialog.component';
import { TrainingCourseCompleteDialogComponent } from './course/training-course-complete-dialog/training-course-complete-dialog.component';
import { CourseSessionStatusNamePipe } from '../shared/pipes/course-session-status-name.pipe';
import { ContentcreatorModule } from '../contentcreator/contentcreator.module';
import { TrainingDynamicContentComponent } from './course/training-dynamic-content/training-dynamic-content.component';
import { TrainingDynamicContentVideoComponent } from './course/training-dynamic-content/training-dynamic-content-video.component';
import { TrainingQuestionInteractiveComponent } from './course/training-question-interactive/training-question-interactive.component';
import { CourseSummaryComponent } from './training-history/course-summary/course-summary.component';
import { QuestionnaireSummaryComponent } from './training-history/course-summary/questionnaire-summary/questionnaire-summary.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    ButtonsModule.forRoot(),
    UtilityModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    VgStreamingModule,
    DragulaModule,
    RouterModule.forChild([
      { path: 'my-courses', component: MyCoursesComponent },
      { path: 'course/:courseId/:moduleId/:pageId', component: TrainingCourseComponent },
      { path: 'history', component: TrainingHistoryComponent },
      { path: 'history/:courseSessionId',  component: CourseSummaryComponent },
      { path: 'questioninteractivetesting', component: TrainingQuestionInteractiveComponent},
      { path: '', pathMatch: 'full', redirectTo: '/dashboard'},
    ]),
    ContentcreatorModule
  ],
  declarations: [
                TrainingCourseComponent, 
                MyCoursesComponent, 
                TrainingQuestionComponent, 
                TrainingContentComponent, 
                TrainingContentResourceComponent, 
                TrainingHistoryComponent, 
                TrainingProgressIndicatorComponent, 
                TrainingNextModuleDialogComponent, 
                TrainingCourseCompleteDialogComponent, 
                TrainingDynamicContentComponent,
                TrainingDynamicContentVideoComponent,
                TrainingQuestionInteractiveComponent,
                CourseSummaryComponent,
                QuestionnaireSummaryComponent
                ],
  providers: [ManageCoursesService, 
              CourseAssignmentInfoService, 
              CoursePageContentBlockService, 
              CourseModuleService, 
              ResourceLibraryAssetService,
              CoursePageService,
              BsModalRef,
              CourseSessionStatusNamePipe,
              DragulaService
              ],
  entryComponents: [TrainingDynamicContentVideoComponent],
  exports: [TrainingContentComponent, TrainingQuestionComponent, TrainingDynamicContentComponent]
})
export class TrainingModule { }
