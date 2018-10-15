import { TestBed, inject } from '@angular/core/testing';

import { NoncomplianceCoursesService } from './noncompliance-courses.service';

describe('NoncomplianceCoursesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NoncomplianceCoursesService]
    });
  });

  it('should be created', inject([NoncomplianceCoursesService], (service: NoncomplianceCoursesService) => {
    expect(service).toBeTruthy();
  }));
});
