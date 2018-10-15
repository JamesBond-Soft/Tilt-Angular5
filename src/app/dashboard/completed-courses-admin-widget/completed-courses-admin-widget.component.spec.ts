import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedCoursesAdminWidgetComponent } from './completed-courses-admin-widget.component';

describe('CompletedCoursesAdminWidgetComponent', () => {
  let component: CompletedCoursesAdminWidgetComponent;
  let fixture: ComponentFixture<CompletedCoursesAdminWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompletedCoursesAdminWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedCoursesAdminWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
