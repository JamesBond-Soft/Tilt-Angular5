import { TestBed, inject } from '@angular/core/testing';

import { CoursePrerequisitesService } from './course-prerequisites.service';

describe('CoursePrerequisitesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoursePrerequisitesService]
    });
  });

  it('should be created', inject([CoursePrerequisitesService], (service: CoursePrerequisitesService) => {
    expect(service).toBeTruthy();
  }));
});
