import { TestBed, inject } from '@angular/core/testing';

import { GroupItemService } from './group-item.service';

describe('GroupItemServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupItemService]
    });
  });

  it('should be created', inject([GroupItemService], (service: GroupItemService) => {
    expect(service).toBeTruthy();
  }));
});
