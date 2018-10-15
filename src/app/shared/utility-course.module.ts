import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseCategoryService } from '../courses/course-categories/course-category.service';
import { CourseCategorySelectComponent } from '../courses/course-categories/course-category-select.component';
import { CourseCategorySelectionItemComponent } from '../courses/course-categories/course-category-selection-item.component';
import { CoursePrerequisitesComponent } from '../courses/course-prerequisites/course-prerequisites.component';
import { ImportUsersComponent } from '../settings/settings-users/import-users/import-users.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [CourseCategorySelectComponent, CourseCategorySelectionItemComponent,CoursePrerequisitesComponent,ImportUsersComponent],
  declarations: [CourseCategorySelectComponent, CourseCategorySelectionItemComponent,CoursePrerequisitesComponent,ImportUsersComponent],
  providers: [CourseCategoryService],
  entryComponents: [CourseCategorySelectComponent, CourseCategorySelectionItemComponent,CoursePrerequisitesComponent,ImportUsersComponent]
})
export class UtilityCourseModule { }
