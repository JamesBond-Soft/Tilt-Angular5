import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ManageCourseListComponent } from './manage-course-list.component';
import { FormsModule } from '@angular/forms';
import { UtilityModule } from '../../shared/utility.module';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManageCoursesService } from './manage-courses.service';

describe('ManageCoursesComponent', () => {
  let component: ManageCourseListComponent;
  let fixture: ComponentFixture<ManageCourseListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        HttpClientTestingModule,
        UtilityModule],
      declarations: [ ManageCourseListComponent ],
      providers:[ ManageCoursesService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCourseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
