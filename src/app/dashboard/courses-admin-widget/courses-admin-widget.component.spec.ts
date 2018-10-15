import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CoursesAdminWidgetComponent } from './courses-admin-widget.component';
import { DashboardService } from '../dashboard.service';

describe('CoursesAdminWidgetComponent', () => {
  let component: CoursesAdminWidgetComponent;
  let fixture: ComponentFixture<CoursesAdminWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, 
        HttpClientTestingModule
      ],
      declarations: [ CoursesAdminWidgetComponent ],
      providers:[DashboardService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesAdminWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
