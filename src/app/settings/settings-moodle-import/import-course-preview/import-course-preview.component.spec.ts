import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCoursePreviewComponent } from './import-course-preview.component';

describe('ImportCoursePreviewComponent', () => {
  let component: ImportCoursePreviewComponent;
  let fixture: ComponentFixture<ImportCoursePreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportCoursePreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportCoursePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
