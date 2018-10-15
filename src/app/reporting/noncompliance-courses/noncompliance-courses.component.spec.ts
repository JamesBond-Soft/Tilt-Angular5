import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoncomplianceCoursesComponent } from './noncompliance-courses.component';

describe('NoncomplianceCoursesComponent', () => {
  let component: NoncomplianceCoursesComponent;
  let fixture: ComponentFixture<NoncomplianceCoursesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoncomplianceCoursesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoncomplianceCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
