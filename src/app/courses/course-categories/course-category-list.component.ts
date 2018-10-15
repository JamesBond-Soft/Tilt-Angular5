import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import { IOrganisation } from '../../settings/settings-organisations/organisation';
import { CourseCategoryService } from './course-category.service';
import { ICourseCategory } from './course-category';

import { CourseCategoryItemComponent } from './course-category-item.component';
import { CourseCategoryItemService } from './course-category-item.service';

@Component({
  //selector: 'app-course-category-list',
  templateUrl: './course-category-list.component.html',
  styleUrls: ['./course-category-list.component.scss'],
  providers: [CourseCategoryService, CourseCategoryItemService]
})
export class CourseCategoryListComponent implements OnInit, OnDestroy {
  pageTitle: string = 'Course Categories'
  orgs: IOrganisation[];
  selectedOrganisation: IOrganisation;
  showEditCard: boolean = false; // indicates if the category edit card is shown
  categories: ICourseCategory[];
  selectedCategory: ICourseCategory;
  parentCategory: ICourseCategory;
  parentCourseCategorySelectionEnabled: boolean = false;
  categoryItemSubscription: Subscription;
  parentCategoryItemSubscription: Subscription;

  constructor(private router: Router, 
              private route: ActivatedRoute, 
              private courseCategoryService: CourseCategoryService, 
              private courseCategoryItemService: CourseCategoryItemService) {

                this.categoryItemSubscription = courseCategoryItemService.selectedCourseCategoryAnnounced$.subscribe( category => {
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
    
                this.parentCategoryItemSubscription = courseCategoryItemService.selectedSecondaryCourseCategoryAnnounced$.subscribe( category => {
                  //check if group is not null (null group means a group was de-selected)
                  if(category != null){
                    //check we are not already editing. If we already are, don't do anything
                    if(category.courseCategoryId == this.selectedCategory.courseCategoryId){
                      //invalid selection
                      alert('Invalid Selection!');
                      this.courseCategoryItemService.announceSecondarySelectedCourseCategory(this.parentCategory);
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

      //load the courses now
      this.loadCategories();
    });
  }

  loadCategories(): void {
 //private function that retrieves all groups for the organisation via a web service, and stores the collection into the variable. 
    //Note groups is a multi-level tree heirarchy

    if(!this.selectedOrganisation) return;
    
    this.courseCategoryService.getCourseCategories(this.selectedOrganisation.organisationId).subscribe(categories => {
      this.categories = categories;
      this.courseCategoryItemService.announceVisibility(3);
      },error => {
        alert("There was an unexpected error. Please refresh your browser. (ref: loadCategories)");
        console.log(`Error: ${<any>error}`);
        return;
      }
    );
  }

  cmdAddCategory(): void {
    this.selectedCategory = this.courseCategoryService.initCourseCategory(); //get a new  initialised "empty" category
    this.selectedCategory.organisationId = this.selectedOrganisation.organisationId;
    this.onStartEdit(this.selectedCategory);
  }

  

  cmdEditCategory(): void {
    this.onStartEdit(this.selectedCategory);
  }

  private onStartEdit(category: ICourseCategory){
    if (category.parentCourseCategoryId > 0) {
      this.parentCategory = this.findCategoryWithId(category.parentCourseCategoryId );
    } else {
      this.parentCategory = null;
    }
    this.courseCategoryItemService.allowClick = false;
    this.showEditCard = true;
  }

  onFinishEditEvent(shouldReload: boolean): void {
    //make sure parentGroup is set to expanded - which includes if it was changed
    if(this.parentCategory){
      this.courseCategoryItemService.setExpandedState(this.parentCategory.courseCategoryId, true);
    }

    this.showEditCard = false;
    this.courseCategoryItemService.allowClick = true;
    this.courseCategoryItemService.showSecondarySelection = false;
    this.courseCategoryItemService.announceSelectedCourseCategory(null);
    this.courseCategoryItemService.announceSecondarySelectedCourseCategory(null);
    this.parentCourseCategorySelectionEnabled = false;

     if(shouldReload){
        this.loadCategories();
     }
  }

  onSelectParent(parentGroupSelectionEnabled): void {
    //this responds to event from groupEditComponent. if parentGroupSelectionEnabled is true, it means the user is trying to select a new parent from the tree. False means they have finished selection.
    this.parentCourseCategorySelectionEnabled = parentGroupSelectionEnabled;

    if (this.parentCourseCategorySelectionEnabled) {
      //annouce who the secondaryGroup is to toggle showing the secondary parent group
        this.courseCategoryItemService.announceSecondarySelectedCourseCategory(this.parentCategory);
        this.courseCategoryItemService.allowClick = true;
    } else {
      this.courseCategoryItemService.allowClick = false;
    }
     this.courseCategoryItemService.showSecondarySelection = this.parentCourseCategorySelectionEnabled;
  }

  cmdChangeOrg(): void {
    this.loadCategories();
  }

  cmdExpandAll(): void {
    this.courseCategoryItemService.announceVisibility(1); //show all
  }

  cmdHideAll(): void {
    this.courseCategoryItemService.announceVisibility(0); //hide all
    this.courseCategoryItemService.clearExpandedStates();
  }

  ngOnDestroy(): void {
    //clean-up - unsubscribe from the group selection observer
    this.categoryItemSubscription.unsubscribe();
    this.parentCategoryItemSubscription.unsubscribe();
  }
  
  private findCategoryWithId(courseCategoryId: number): ICourseCategory {
    //recursive helper method to find a group in the deep multi-level collection

    var searchForCategory = function (categoryList: ICourseCategory[], courseCategoryId: number): ICourseCategory {
      //the generic recursive function variable that keeps searching for a group in subgroups
      for (let categoryItem of categoryList) {
        if (categoryItem.courseCategoryId === courseCategoryId) {
          return categoryItem;
        } else {
          //look for subGroups
          var match = searchForCategory(categoryItem.subCourseCategories, courseCategoryId);
          if (match) return match;
        }
      }
      return null;
    }

    //kick off the recursive reach
    var match = searchForCategory(this.categories, courseCategoryId);
    return match; //this could be something - or null
  }
  

}
