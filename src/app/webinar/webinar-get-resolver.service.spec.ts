import { TestBed, inject } from '@angular/core/testing';

import { WebinarGetResolverService } from './webinar-get-resolver.service';

describe('WebinarGetResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebinarGetResolverService]
    });
  });

  it('should be created', inject([WebinarGetResolverService], (service: WebinarGetResolverService) => {
    expect(service).toBeTruthy();
  }));
});
