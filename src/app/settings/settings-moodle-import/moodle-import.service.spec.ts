import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MoodleImportService } from './moodle-import.service';

describe('MoodleImportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MoodleImportService]
    });
  });

  it('should be created', inject([MoodleImportService], (service: MoodleImportService) => {
    expect(service).toBeTruthy();
  }));
});
