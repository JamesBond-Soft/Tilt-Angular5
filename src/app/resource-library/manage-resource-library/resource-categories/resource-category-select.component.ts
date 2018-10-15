import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

import { IResourceCategory } from './resource-category';
import { ResourceCategoryItemService } from './resource-category-item.service';
import { ResourceCategoryService } from './resource-category.service';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'resource-category-select',
  templateUrl: './resource-category-select.component.html',
  styleUrls: ['./resource-category-select.component.scss'],
  providers: [ResourceCategoryService, ResourceCategoryItemService]
})
export class ResourceCategorySelectComponent implements OnInit, OnDestroy {
  categories: IResourceCategory[];
  selectedCategory: IResourceCategory;
  resourceCategoryItemSubscription: Subscription;

  @Input() organisationId: number;

  constructor(
    public bsModalRef: BsModalRef, 
    private resourceCategoryService: ResourceCategoryService, 
    private resourceCategoryItemService: ResourceCategoryItemService) {

      this.resourceCategoryItemSubscription = resourceCategoryItemService.selectedResourceCategoryAnnounced$.subscribe( category => {
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
       
       this.resourceCategoryService.getResourceCategories(this.organisationId).subscribe(categories => {
         this.categories = categories;
         this.resourceCategoryItemService.announceVisibility(3);
         },error => {
           alert("There was an unexpected error. Please refresh your browser. (ref: loadCategories)");
           console.log(`Error: ${<any>error}`);
           return;
         }
       );
     }

     cmdSelectCategory(category: IResourceCategory): void {
      if(confirm(`Are you sure you want to assign ${category.name}?`)){
  
          //set selected category &  hide the modal
          this.bsModalRef.hide();
        
        
      } else {
        this.selectedCategory = null;
        this.resourceCategoryItemService.announceSelectedResourceCategory(null);
      }
    }

    cmdSetNone(): void {
      if(confirm(`Are you sure you do not want to assign to any categories?`)){
        this.selectedCategory = null;
        this.bsModalRef.hide();
      }
    }

     ngOnDestroy(): void {
      //clean-up - unsubscribe from the resourceCategory selection observer
      this.resourceCategoryItemSubscription.unsubscribe();
    }

}
