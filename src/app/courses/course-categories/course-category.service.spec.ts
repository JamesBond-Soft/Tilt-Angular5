import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { UtilityModule } from '../../shared/utility.module';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CourseCategoryService } from './course-category.service';

describe('CourseCategoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CourseCategoryService]
    });
  });

  it('should be created', inject([CourseCategoryService], (service: CourseCategoryService) => {
    expect(service).toBeTruthy();
  }));
});
