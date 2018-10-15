import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CourseModuleEditComponent } from './course-module-edit.component';
import { CoursePageListComponent } from './../../course-pages/course-page-list.component';
import { CoursePageEditComponent } from '../../../manage-courses/course-pages/course-page-edit/course-page-edit.component';
import { CoursePageContentBlockListComponent } from '../../../manage-courses/course-page-content-blocks/course-page-content-block-list.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoursePageContentQuestionListComponent } from '../../course-page-content-questions/course-page-content-question-list.component';
import { CoursePageContentBlockEditComponent } from '../../course-page-content-blocks/course-page-content-block-edit/course-page-content-block-edit.component';
import { CoursePageContentQuestionEditComponent } from '../../course-page-content-questions/course-page-content-question-edit/course-page-content-question-edit.component';
import { UtilityModule } from '../../../../shared/utility.module';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalService, BsModalRef, ModalModule, BsDatepickerModule } from 'ngx-bootstrap';
import { CourseModuleService } from '../course-module.service';
import { CoursePageService } from '../../course-pages/course-page.service';
import { CoursePageContentBlockService } from '../../course-page-content-blocks/course-page-content-block.service';
import { CoursesComponent } from '../../../courses.component';
import { CourseCategoryListComponent } from '../../../course-categories/course-category-list.component';
import { CourseCategoryEditComponent } from '../../../course-categories/course-category-edit.component';
import { ManageCourseListComponent } from '../../manage-course-list.component';
import { CourseEditComponent } from '../../course-edit/course-edit.component';
import { CourseCategoryItemComponent } from '../../../course-categories/course-category-item.component';
import { CourseViewComponent } from '../../../course-view/course-view.component';
import { GroupAssignmentComponent } from '../../../group-assignment/group-assignment.component';
import { StaffAssignmentComponent } from '../../../staff-assignment/staff-assignment.component';
import { TemplateListComponent } from '../../../templates/template-list.component';
import { TemplateViewComponent } from '../../../templates/template-view.component';
import { CoursePageEditDialogComponent } from '../../course-pages/course-page-edit-dialog/course-page-edit-dialog.component';
import { CoursePagePreviewDialogComponent } from '../../course-pages/course-page-preview-dialog/course-page-preview-dialog.component';
import { VideoSelectionDialogComponent } from '../../course-page-content-blocks/video-selection-dialog/video-selection-dialog.component';
import { ManageCoursesService } from '../../manage-courses.service';
import { SettingsUsersOrganisationsResolver } from '../../../../settings/settings-users/settings-users-organisations-resolver.service';
import { SettingsOrganisationsService } from '../../../../settings/settings-organisations/settings-organisations.service';
import { CourseEditResolver } from '../../course-edit/course-edit-resolver.service';
import { CourseGroupAssignmentService } from '../../../group-assignment/course-group-assignment.service';
import { CourseAdhocAssignmentService } from '../../../staff-assignment/course-adhoc-assignment.service';
import { CourseModuleEditResolver } from './course-module-edit-resolver.service';
import { GroupAssignmentEditResolver } from '../../../group-assignment/group-assignment-edit-resolver.service';
import { GroupService } from '../../../../groups/group.service';
import { ResourceLibraryAssetService } from '../../../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';
import { CoursePageContentQuestionService } from '../../course-page-content-questions/course-page-content-question.service';
import { UtilityCourseModule } from '../../../../shared/utility-course.module';
import { ActivatedRoute, Data } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ContentcreatorModule } from '../../../../contentcreator/contentcreator.module';
import { TrainingModule } from '../../../../training/training.module';



describe('CourseModuleEditComponent', () => {
  let component: CourseModuleEditComponent;
  let fixture: ComponentFixture<CourseModuleEditComponent>;

  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    UtilityModule,
    UtilityCourseModule,
    RouterTestingModule,
    ContentcreatorModule,
    TrainingModule,
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
     GroupAssignmentEditResolver, 
     GroupService, 
     CoursePageContentBlockService, 
     ResourceLibraryAssetService,
     CoursePageContentQuestionService,
     {
      provide: ActivatedRoute,
      useValue: {
        data: {
          subscribe: (fn: (value: Data) => void) => fn({
            courseModuleId: '0', //dont think this works
            courseModule: {} //fudge courseModule data that is required by the component and passed via routing dependency
          })
        },
        params: Observable.of({courseModuleId: 0}) //nor dont think this one works either
      }
    }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    
    fixture = TestBed.createComponent(CourseModuleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
