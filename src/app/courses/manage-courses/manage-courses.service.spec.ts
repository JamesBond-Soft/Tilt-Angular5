import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ManageCoursesService } from './manage-courses.service';

describe('ManageCoursesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ManageCoursesService]
    });
  });

  it('should be created', inject([ManageCoursesService], (service: ManageCoursesService) => {
    expect(service).toBeTruthy();
  }));
});
