import { TestBed, inject } from '@angular/core/testing';

import { ResourceCategoryItemService } from './resource-category-item.service';

describe('GroupItemServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResourceCategoryItemService]
    });
  });

  it('should be created', inject([ResourceCategoryItemService], (service: ResourceCategoryItemService) => {
    expect(service).toBeTruthy();
  }));
});
