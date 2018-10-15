import { TestBed, inject } from '@angular/core/testing';

import { GroupResolverService } from './group-resolver.service';

describe('GroupResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupResolverService]
    });
  });

  it('should be created', inject([GroupResolverService], (service: GroupResolverService) => {
    expect(service).toBeTruthy();
  }));
});
