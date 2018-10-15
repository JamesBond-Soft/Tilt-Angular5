import { TestBed, inject } from '@angular/core/testing';

import { CourseCategoryItemService } from './course-category-item.service';

describe('GroupItemServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CourseCategoryItemService]
    });
  });

  it('should be created', inject([CourseCategoryItemService], (service: CourseCategoryItemService) => {
    expect(service).toBeTruthy();
  }));
});
