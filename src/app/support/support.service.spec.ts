import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SupportService } from './support.service';

describe('SupportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [SupportService]
    });
  });

  it('should be created', inject([SupportService], (service: SupportService) => {
    expect(service).toBeTruthy();
  }));
  
  it('initTicket should return defined object', inject([SupportService], (service: SupportService) => {
    expect(service.initTicket).toBeDefined();
  }));

  it('initTicketNote should return defined object', inject([SupportService], (service: SupportService) => {
    expect(service.initTicketNode).toBeDefined();
  }));
  
  
});
