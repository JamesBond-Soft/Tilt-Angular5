/* import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CourseViewComponent } from './course-view.component';
import { UtilityModule } from '../../shared/utility.module';
import { CourseCategoryService } from '../course-categories/course-category.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManageCourseModuleService } from '../manage-courses/manage-course-modules/manage-course-module.service';
import { CourseGroupAssignmentService } from '../group-assignment/course-group-assignment.service';
import { CourseAdhocAssignmentService } from '../staff-assignment/course-adhoc-assignment.service';

describe('CourseViewComponent', () => {
  let component: CourseViewComponent;
  let fixture: ComponentFixture<CourseViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule,
                HttpClientTestingModule,
                UtilityModule.forRoot()],
      declarations: [ CourseViewComponent ],
      providers: [CourseCategoryService, ManageCourseModuleService, CourseGroupAssignmentService, CourseAdhocAssignmentService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
 */
