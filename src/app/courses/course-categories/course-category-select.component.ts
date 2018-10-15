import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

import { ICourseCategory } from './course-category';
import { CourseCategoryItemService } from './course-category-item.service';
import { CourseCategoryService } from './course-category.service';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'course-category-select',
  templateUrl: './course-category-select.component.html',
  styleUrls: ['./course-category-select.component.scss'],
  providers: [CourseCategoryService, CourseCategoryItemService]
})
export class CourseCategorySelectComponent implements OnInit, OnDestroy {
  categories: ICourseCategory[];
  selectedCategory: ICourseCategory;
  courseCategoryItemSubscription: Subscription;

  @Input() organisationId: number;

  constructor(
    public bsModalRef: BsModalRef, 
    private courseCategoryService: CourseCategoryService, 
    private courseCategoryItemService: CourseCategoryItemService) {

      this.courseCategoryItemSubscription = courseCategoryItemService.selectedCourseCategoryAnnounced$.subscribe( category => {
        //check if category is not null (null group means a group was de-selected)
        if(category != null){
            this.selectedCategory = category;
            this.cmdSelectCategory(this.selectedCategory);
        } 
      });

     }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories(): void {
    //private function that retrieves all groups for the organisation via a web service, and stores the collection into the variable. 
       //Note groups is a multi-level tree heirarchy
   
       if(!this.organisationId) return;
       
       this.courseCategoryService.getCourseCategories(this.organisationId).subscribe(categories => {
         this.categories = categories;
         this.courseCategoryItemService.announceVisibility(3);
         },error => {
           alert("There was an unexpected error. Please refresh your browser. (ref: loadCategories)");
           console.log(`Error: ${<any>error}`);
           return;
         }
       );
     }

     cmdSelectCategory(category: ICourseCategory): void {
      if(confirm(`Are you sure you want to assign ${category.name}?`)){
  
          //set selected category &  hide the modal
          this.bsModalRef.hide();
        
        
      } else {
        this.selectedCategory = null;
        this.courseCategoryItemService.announceSelectedCourseCategory(null);
      }
    }

    cmdSetNone(): void {
      if(confirm(`Are you sure you do not want to assign to any categories?`)){
        this.selectedCategory = null;
        this.bsModalRef.hide();
      }
    }

     ngOnDestroy(): void {
      //clean-up - unsubscribe from the courseCategory selection observer
      this.courseCategoryItemSubscription.unsubscribe();
    }

}
