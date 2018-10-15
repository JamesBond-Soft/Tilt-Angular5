import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TrainingCourseComponent } from './training-course.component';
import { ManageCoursesService } from '../../courses/manage-courses/manage-courses.service';
import { TrainingEngineService } from '../training-engine.service';
import { CoursePageContentBlockService } from '../../courses/manage-courses/course-page-content-blocks/course-page-content-block.service';
import { CourseModuleService } from '../../courses/manage-courses/course-modules/course-module.service';
import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
import { VgStreamingModule } from 'videogular2/streaming';
import { CoursePageService } from '../../courses/manage-courses/course-pages/course-page.service';
import { TrainingContentComponent } from './training-content/training-content.component';
import { TrainingNextModuleDialogComponent } from './training-next-module-dialog/training-next-module-dialog.component';
import { TrainingCourseCompleteDialogComponent } from './training-course-complete-dialog/training-course-complete-dialog.component';
import { TrainingProgressIndicatorComponent } from './training-progress-indicator/training-progress-indicator.component';
import { TrainingQuestionComponent } from './training-question/training-question.component';
import { UtilityModule } from '../../shared/utility.module';
import { ModalModule } from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TrainingContentResourceComponent } from '../course/training-content-resource/training-content-resource.component';
import { TrainingDynamicContentComponent } from './training-dynamic-content/training-dynamic-content.component';
import { TrainingDynamicContentVideoComponent } from './training-dynamic-content/training-dynamic-content-video.component';

describe('TrainingCourseComponent', () => {
  let component: TrainingCourseComponent;
  let fixture: ComponentFixture<TrainingCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule,
                ReactiveFormsModule,
                FormsModule,
                UtilityModule.forRoot(),
                ModalModule.forRoot(),
                HttpClientTestingModule,
                VgCoreModule,
                VgControlsModule,
                VgOverlayPlayModule,
                VgBufferingModule,
                VgStreamingModule],
      declarations: [ TrainingCourseComponent, TrainingContentComponent, TrainingQuestionComponent, TrainingNextModuleDialogComponent, TrainingCourseCompleteDialogComponent, TrainingProgressIndicatorComponent, TrainingContentResourceComponent, TrainingDynamicContentComponent, TrainingDynamicContentVideoComponent ],
      providers: [ManageCoursesService, TrainingEngineService, CoursePageContentBlockService, CourseModuleService, CoursePageService, BsModalRef],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
