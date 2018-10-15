import { TestBed, inject } from '@angular/core/testing';

import { CompletedCoursesService } from './completed-courses.service';

describe('CompletedCoursesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompletedCoursesService]
    });
  });

  it('should be created', inject([CompletedCoursesService], (service: CompletedCoursesService) => {
    expect(service).toBeTruthy();
  }));
});
