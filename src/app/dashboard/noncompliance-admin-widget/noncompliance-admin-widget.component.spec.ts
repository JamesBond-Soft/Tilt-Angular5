import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoncomplianceAdminWidgetComponent } from './noncompliance-admin-widget.component';

describe('NoncomplianceAdminWidgetComponent', () => {
  let component: NoncomplianceAdminWidgetComponent;
  let fixture: ComponentFixture<NoncomplianceAdminWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoncomplianceAdminWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoncomplianceAdminWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
