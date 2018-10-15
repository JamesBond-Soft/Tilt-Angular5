import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import { IOrganisation } from '../../../settings/settings-organisations/organisation';
import { ResourceCategoryService } from './resource-category.service';
import { IResourceCategory } from './resource-category';

import { ResourceCategoryItemComponent } from './resource-category-item.component';
import { ResourceCategoryItemService } from './resource-category-item.service';

@Component({
  //selector: 'app-resource-category-list',
  templateUrl: './resource-category-list.component.html',
  styleUrls: ['./resource-category-list.component.scss'],
  providers: [ResourceCategoryService, ResourceCategoryItemService]
})
export class ResourceCategoryListComponent implements OnInit, OnDestroy {
  pageTitle: string = 'Resource Categories'
  orgs: IOrganisation[];
  selectedOrganisation: IOrganisation;
  showEditCard: boolean = false; // indicates if the category edit card is shown
  categories: IResourceCategory[];
  selectedCategory: IResourceCategory;
  parentCategory: IResourceCategory;
  parentResourceCategorySelectionEnabled: boolean = false;
  categoryItemSubscription: Subscription;
  parentCategoryItemSubscription: Subscription;

  constructor(private router: Router, 
              private route: ActivatedRoute, 
              private resourceCategoryService: ResourceCategoryService, 
              private resourceCategoryItemService: ResourceCategoryItemService) {

                this.categoryItemSubscription = resourceCategoryItemService.selectedResourceCategoryAnnounced$.subscribe( category => {
                  if(category != null){
                    //check we are not already editing. If we already are, don't do anything
                    if(!this.showEditCard){
                      this.selectedCategory = category;//Object.assign({}, group);
                      this.cmdEditCategory();
                    }
                  } else {
                    //don't do anything
                  }
                });
    
                this.parentCategoryItemSubscription = resourceCategoryItemService.selectedSecondaryResourceCategoryAnnounced$.subscribe( category => {
                  //check if group is not null (null group means a group was de-selected)
                  if(category != null){
                    //check we are not already editing. If we already are, don't do anything
                    if(category.resourceCategoryId == this.selectedCategory.resourceCategoryId){
                      //invalid selection
                      alert('Invalid Selection!');
                      this.resourceCategoryItemService.announceSecondarySelectedResourceCategory(this.parentCategory);
                      return;
                    }
                      this.parentCategory = category;
                  }
                });
   }

  ngOnInit() {
    this.loadOrganisations();
  }

  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.orgs = data['orgs'];

      this.selectedOrganisation = null;
      let organisationId: number = +this.route.snapshot.params['organisationId'];

      if (organisationId && organisationId > 0) {
        var matchingOrg: IOrganisation = this.orgs.find(o => o.organisationId === organisationId);
        if (matchingOrg) {
          this.selectedOrganisation = matchingOrg;
        }
      }

      if (!this.selectedOrganisation && this.orgs && this.orgs.length > 0) {
        //couldnt find a match - default to the first organisation
        this.selectedOrganisation = this.orgs[0];
      }

      //load the resources now
      this.loadCategories();
    });
  }

  loadCategories(): void {
 //private function that retrieves all groups for the organisation via a web service, and stores the collection into the variable. 
    //Note groups is a multi-level tree heirarchy

    if(!this.selectedOrganisation) return;
    
    this.resourceCategoryService.getResourceCategories(this.selectedOrganisation.organisationId).subscribe(categories => {
      this.categories = categories;
      this.resourceCategoryItemService.announceVisibility(3);
      },error => {
        alert("There was an unexpected error. Please refresh your browser. (ref: loadCategories)");
        console.log(`Error: ${<any>error}`);
        return;
      }
    );
  }

  cmdAddCategory(): void {
    this.selectedCategory = this.resourceCategoryService.initResourceCategory(); //get a new  initialised "empty" category
    this.selectedCategory.organisationId = this.selectedOrganisation.organisationId;
    this.onStartEdit(this.selectedCategory);
  }

  

  cmdEditCategory(): void {
    this.onStartEdit(this.selectedCategory);
  }

  private onStartEdit(category: IResourceCategory){
    if (category.parentResourceCategoryId > 0) {
      this.parentCategory = this.findCategoryWithId(category.parentResourceCategoryId );
    } else {
      this.parentCategory = null;
    }
    this.resourceCategoryItemService.allowClick = false;
    this.showEditCard = true;
  }

  onFinishEditEvent(shouldReload: boolean): void {
    //make sure parentGroup is set to expanded - which includes if it was changed
    if(this.parentCategory){
      this.resourceCategoryItemService.setExpandedState(this.parentCategory.resourceCategoryId, true);
    }

    this.showEditCard = false;
    this.resourceCategoryItemService.allowClick = true;
    this.resourceCategoryItemService.showSecondarySelection = false;
    this.resourceCategoryItemService.announceSelectedResourceCategory(null);
    this.resourceCategoryItemService.announceSecondarySelectedResourceCategory(null);
    this.parentResourceCategorySelectionEnabled = false;

     if(shouldReload){
        this.loadCategories();
     }
  }

  onSelectParent(parentGroupSelectionEnabled): void {
    //this responds to event from groupEditComponent. if parentGroupSelectionEnabled is true, it means the user is trying to select a new parent from the tree. False means they have finished selection.
    this.parentResourceCategorySelectionEnabled = parentGroupSelectionEnabled;

    if (this.parentResourceCategorySelectionEnabled) {
      //annouce who the secondaryGroup is to toggle showing the secondary parent group
        this.resourceCategoryItemService.announceSecondarySelectedResourceCategory(this.parentCategory);
        this.resourceCategoryItemService.allowClick = true;
    } else {
      this.resourceCategoryItemService.allowClick = false;
    }
     this.resourceCategoryItemService.showSecondarySelection = this.parentResourceCategorySelectionEnabled;
  }

  cmdChangeOrg(): void {
    this.loadCategories();
  }

  cmdExpandAll(): void {
    this.resourceCategoryItemService.announceVisibility(1); //show all
  }

  cmdHideAll(): void {
    this.resourceCategoryItemService.announceVisibility(0); //hide all
    this.resourceCategoryItemService.clearExpandedStates();
  }

  ngOnDestroy(): void {
    //clean-up - unsubscribe from the group selection observer
    this.categoryItemSubscription.unsubscribe();
    this.parentCategoryItemSubscription.unsubscribe();
  }
  
  private findCategoryWithId(resourceCategoryId: number): IResourceCategory {
    //recursive helper method to find a group in the deep multi-level collection

    var searchForCategory = function (categoryList: IResourceCategory[], resourceCategoryId: number): IResourceCategory {
      //the generic recursive function variable that keeps searching for a group in subgroups
      for (let categoryItem of categoryList) {
        if (categoryItem.resourceCategoryId === resourceCategoryId) {
          return categoryItem;
        } else {
          //look for subGroups
          var match = searchForCategory(categoryItem.subResourceCategories, resourceCategoryId);
          if (match) return match;
        }
      }
      return null;
    }

    //kick off the recursive reach
    var match = searchForCategory(this.categories, resourceCategoryId);
    return match; //this could be something - or null
  }
  

}
