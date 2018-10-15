import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { StaffAdminWidgetComponent } from './staff-admin-widget.component';
import { DashboardService } from '../dashboard.service';

describe('StaffAdminWidgetComponent', () => {
  let component: StaffAdminWidgetComponent;
  let fixture: ComponentFixture<StaffAdminWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, 
        HttpClientTestingModule
      ],
      declarations: [ StaffAdminWidgetComponent ],
      providers:[DashboardService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffAdminWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
