import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CoursePageContentBlockService } from './course-page-content-block.service';

describe('CoursePageContentBlockService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CoursePageContentBlockService]
    });
  });

  it('should be created', inject([CoursePageContentBlockService], (service: CoursePageContentBlockService) => {
    expect(service).toBeTruthy();
  }));
});
