import { TestBed, inject } from '@angular/core/testing';

import { TreeBranchItemService } from './tree-branch-item.service';

describe('TreeBranchItemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TreeBranchItemService]
    });
  });

  it('should be created', inject([TreeBranchItemService], (service: TreeBranchItemService) => {
    expect(service).toBeTruthy();
  }));
});
