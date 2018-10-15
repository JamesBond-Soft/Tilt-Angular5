import { NgModule } from '@angular/core';
import { CommonModule, Location, DatePipe } from '@angular/common';
import { LoginService } from '../login/login.service';
import { ModuleWithProviders } from '@angular/core';
import { OrganisationNamePipe } from './pipes/organisation-name.pipe';
import { FilterCoursesPipe } from './pipes/filter-courses.pipe';
import { CourseModuleSummaryInfoStatusNamePipe } from './pipes/course-module-summary-info-status-name.pipe';
import { CourseAdhocAssignmentSummaryInfoStatusNamePipe } from './pipes/course-adhoc-assignment-summary-info-status-name.pipe';
import { BasketSelectorComponent } from './basket-selector/basket-selector.component';
import { TreeBranchItemComponent } from './tree-branch-item/tree-branch-item.component';
import { GroupSelectionComponent } from './group-selection/group-selection.component';
import { GroupItemService } from '../groups/group-item.service';
import { GroupSelectionItemComponent } from './group-selection/group-selection-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaffBasketSelectorComponent } from './staff-basket-selector/staff-basket-selector.component';
import { CourseStatusNamePipe } from './pipes/course-status-name.pipe';
import { TinyEditorComponent } from './tiny-editor/tiny-editor.component';
import { ReorderCollectionService } from './helper-services/reorder-collection.service';
import { TrainingEngineService } from '../training/training-engine.service';
import { CourseSessionStatusNamePipe } from './pipes/course-session-status-name.pipe';
import { HtmlSanitizerPipe } from './pipes/html-sanitizer.pipe';
import { UrlSanitizerPipe } from './pipes/url-sanitizer.pipe';
import { GenericStatusNamePipe } from './pipes/generic-status-name.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { EnumToArrayPipe } from './pipes/enum-to-array.pipe';
import { FilterMyCoursesPipe } from './pipes/filter-my-courses.pipe';
import { FilterNotificationsPipe } from './pipes/filter-notifications.pipe';
import { FilterResourceLibraryAssetsPipe } from './pipes/filter-resource-library-assets.pipe';
import { MediaPickerDialogComponent } from './tiny-editor/media-picker-dialog/media-picker-dialog.component';
import {TimeAgoPipe} from 'time-ago-pipe';
import { QuestionPickerDialogComponent } from './question-picker-dialog/question-picker-dialog.component';
import { CoursePageContentQuestionService } from '../courses/manage-courses/course-page-content-questions/course-page-content-question.service';
import { CoursePageContentQuestionPackService } from '../courses/manage-courses/course-page-content-questions/course-page-content-question-pack.service';
import { FilterMyNotificationsPipe } from './pipes/filter-my-notifications.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
   OrganisationNamePipe,
   FilterCoursesPipe, 
   CourseModuleSummaryInfoStatusNamePipe,
   CourseAdhocAssignmentSummaryInfoStatusNamePipe,
   BasketSelectorComponent,
   GroupSelectionComponent,
   GroupSelectionItemComponent,
   StaffBasketSelectorComponent,
   CourseStatusNamePipe,
   TinyEditorComponent,
   CourseSessionStatusNamePipe,
   HtmlSanitizerPipe,
   UrlSanitizerPipe,
   GenericStatusNamePipe,
   TruncatePipe,
   EnumToArrayPipe,
   FilterMyCoursesPipe,
   FilterNotificationsPipe,
   FilterResourceLibraryAssetsPipe,
   MediaPickerDialogComponent,
   TimeAgoPipe,
   QuestionPickerDialogComponent,
   FilterMyNotificationsPipe
  ],
  declarations: [
                OrganisationNamePipe, 
                FilterCoursesPipe, 
                CourseModuleSummaryInfoStatusNamePipe, 
                CourseAdhocAssignmentSummaryInfoStatusNamePipe, 
                BasketSelectorComponent, 
                TreeBranchItemComponent, 
                GroupSelectionComponent, 
                GroupSelectionItemComponent, 
                StaffBasketSelectorComponent, 
                GenericStatusNamePipe, 
                TinyEditorComponent, 
                CourseSessionStatusNamePipe, 
                HtmlSanitizerPipe, 
                UrlSanitizerPipe, 
                CourseStatusNamePipe, 
                TruncatePipe, 
                EnumToArrayPipe,
                FilterMyCoursesPipe,
                FilterNotificationsPipe,
                FilterResourceLibraryAssetsPipe,
                MediaPickerDialogComponent,
                TimeAgoPipe,
                QuestionPickerDialogComponent,
                FilterMyNotificationsPipe
              ],
  providers: [ReorderCollectionService, Location, DatePipe, GenericStatusNamePipe, EnumToArrayPipe, CoursePageContentQuestionService, CoursePageContentQuestionPackService],
  entryComponents: [MediaPickerDialogComponent, QuestionPickerDialogComponent]
})

export class UtilityModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: UtilityModule, // take the normal version
      providers: [ // merge this to the providers array of the normal version
        LoginService,
        TrainingEngineService
      ]
  };
  }
}