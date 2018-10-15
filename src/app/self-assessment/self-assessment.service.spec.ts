import { TestBed, inject } from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import { SelfAssessmentService } from './self-assessment.service';

describe('SelfAssessmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SelfAssessmentService]
    });
  });

  it('should be created', inject([SelfAssessmentService], (service: SelfAssessmentService) => {
    expect(service).toBeTruthy();
  }));
});
