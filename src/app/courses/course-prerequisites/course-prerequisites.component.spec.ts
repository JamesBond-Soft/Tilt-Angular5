import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursePrerequisitesComponent } from './course-prerequisites.component';

describe('CoursePrerequisitesComponent', () => {
  let component: CoursePrerequisitesComponent;
  let fixture: ComponentFixture<CoursePrerequisitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoursePrerequisitesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursePrerequisitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
