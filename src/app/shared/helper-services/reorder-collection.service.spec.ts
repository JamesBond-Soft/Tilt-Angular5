import { TestBed, inject } from '@angular/core/testing';

import { ReorderCollectionService } from './reorder-collection.service';

describe('ReorderCollectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReorderCollectionService]
    });
  });

  it('should be created', inject([ReorderCollectionService], (service: ReorderCollectionService) => {
    expect(service).toBeTruthy();
  }));
});
