import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MyCoursesStaffWidgetComponent } from './my-courses-staff-widget.component';
import { DashboardService } from '../dashboard.service';

describe('MyCoursesStaffWidgetComponent', () => {
  let component: MyCoursesStaffWidgetComponent;
  let fixture: ComponentFixture<MyCoursesStaffWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, 
        HttpClientTestingModule
      ],
      declarations: [ MyCoursesStaffWidgetComponent ],
      providers: [DashboardService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCoursesStaffWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
