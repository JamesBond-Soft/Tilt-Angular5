import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ExportReportService } from './export-report.service';

describe('ExportReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExportReportService]
    });
  });

  it('should be created', inject([ExportReportService], (service: ExportReportService) => {
    expect(service).toBeTruthy();
  }));
});
