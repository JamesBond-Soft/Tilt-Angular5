import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CourseModuleService } from './course-module.service';

describe('CourseModuleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      providers: [CourseModuleService]
    });
  });

  it('should be created', inject([CourseModuleService], (service: CourseModuleService) => {
    expect(service).toBeTruthy();
  }));
});
