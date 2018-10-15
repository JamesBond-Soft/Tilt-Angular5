import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ResourceLibraryAssetService } from '../resource-library-asset.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName, FormControl } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/combineLatest';
import { map } from 'rxjs/operators/map';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { filter } from 'rxjs/operators';

import { GenericValidator } from '../../../../shared/generic-validator';
import { IResourceLibraryAsset, IResourceLibraryAssetType, IResourceLibraryAssetStatus, IResourceGroupAssignment } from '../resource-library-asset';
import { LoginService } from '../../../../login/login.service';
import { IOrganisation } from '../../../../settings/settings-organisations/organisation';
import { ResourceFileUploadComponent } from './resource-file-upload/resource-file-upload.component';
import { BasketSelectorComponent } from '../../../../shared/basket-selector/basket-selector.component';
import { GroupService } from '../../../../groups/group.service';
import { IGroup } from '../../../../groups/group';
import { IResourceCategory } from '../../resource-categories/resource-category';
import { ResourceCategoryService } from '../../resource-categories/resource-category.service';
import { ResourceCategorySelectComponent } from '../../resource-categories/resource-category-select.component';

@Component({
  templateUrl: './resource-library-asset-edit.component.html',
  styleUrls: ['./resource-library-asset-edit.component.scss']
})
export class ResourceLibraryAssetEditComponent implements OnInit, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('groupBasketSelector') groupBasketSelector: BasketSelectorComponent;
  @ViewChild('resourceFileUploadComponent') resourceFileUploadComponent: ResourceFileUploadComponent;
  allowedMimeTypes: string[] = ['image/png'];
  pageTitle: string;
  resourceForm: FormGroup
  resourceLibraryAsset: IResourceLibraryAsset;
  IResourceLibraryAssetType = IResourceLibraryAssetType;
  IResourceLibraryAssetStatus = IResourceLibraryAssetStatus;
  organisations: IOrganisation[];
  currentlySaving: boolean;
  uploadCanceled: boolean;
  availableGroups: IGroup[];
  selectedResourceCategory: IResourceCategory;
  subscriptions: Subscription[] = [];
  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private resourceLibraryAssetService: ResourceLibraryAssetService,
              private fb: FormBuilder,
              private loginService: LoginService,
              private groupService: GroupService,
              private modalService: BsModalService, 
              private changeDetection: ChangeDetectorRef,
              private resourceCategoryService: ResourceCategoryService) {

    this.validationMessages = {
      name: {
        required: 'Name is required.'
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);

  }

  ngOnInit() {
    this.initForm();
    this.loadOrganisations();
  }

  initForm(): void {
    this.resourceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      extRefNum: [''],
      assetType: [''],
      organisationId: ['']
    });
  }

  loadResourceLibraryAsset(): void {
    this.route.paramMap.subscribe(params => {
      if (params.has('resourceLibraryAssetId')) {
        if (+params.get('resourceLibraryAssetId') === 0) { 
          this.pageTitle = 'Add New Resource';
          this.resourceLibraryAsset = this.resourceLibraryAssetService.initResourceLibraryAsset();

          //set the org id to the current user's organisation id if it's present
          if(this.loginService.currentUser.organisationId){
            this.resourceLibraryAsset.organisationId = this.loginService.currentUser.organisationId;
          } else {
            this.resourceLibraryAsset.organisationId = 0;
          }

          this.loadAvailableGroups();
          this.loadForm();
        } else {
          this.pageTitle = 'Update Resource';
          this.resourceLibraryAssetService.getResourceLibraryAssetWithResourceGroupAssignment(+params.get('resourceLibraryAssetId')).subscribe(resourceLibraryAsset => {
            this.resourceLibraryAsset = resourceLibraryAsset;
            this.loadForm();
            this.loadResourceGroupAssignments();
          }, error => {
            console.log(`Unexpected error ${error} (ref loadResourceLibraryAsset)`)
            this.router.navigate(['/resourcelibrary/manage']);
          });
        }
      } else {
        console.log('Warning - could not find resourceLibraryAssetId in route. Returning user to resource-library manage list');
        this.router.navigate(['/resourcelibrary/manage']);
      }
    });
  }

  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.organisations = data['orgs'];

      //load the resourceLibraryAsset now
      this.loadResourceLibraryAsset();
    });
  }

  cmdChangeOrg(): void {
    //organisation dropdown value was changed, load the courses
   // this.loadCourses();
   if(this.selectedResourceCategory && this.selectedResourceCategory.organisationId != +this.resourceForm.get('organisationId').value){
     //the course catagory is from a different organisation, so clear it's value
    this.selectedResourceCategory = null;
   }
  }

  loadForm(): void {
    if (this.resourceForm) {
      this.resourceForm.reset();
    }

    this.resourceForm.patchValue({
      name: this.resourceLibraryAsset.name, //keep names same
      description: this.resourceLibraryAsset.description,
      organisationId: this.resourceLibraryAsset.organisationId,
      extRefNum: this.resourceLibraryAsset.extRefNum,
      assetType: this.resourceLibraryAsset.assetType
    });

    if(this.resourceLibraryAsset.resourceLibraryAssetId){
      this.resourceForm.controls['assetType'].disable();
      this.resourceForm.controls['organisationId'].disable();
    }

    this.assetTypeOnChange(null);

    if(this.resourceLibraryAsset.resourceCategoryId){
      //load the courseCategory object
      this.resourceCategoryService.getResourceCategory(+this.resourceLibraryAsset.resourceCategoryId).subscribe(resourceCategory => {
        this.selectedResourceCategory = resourceCategory;
      });
    } else {
      this.selectedResourceCategory = null;
    }
  }

  loadAvailableGroups(): void {
    this.groupService.getGroups(this.resourceLibraryAsset.organisationId).subscribe(groups => {
      this.availableGroups = groups;

      this.groupBasketSelector.shelfItems = this.availableGroups;
      this.groupBasketSelector.basketItems = [];
    });
  }

  loadResourceGroupAssignments(): void {
    //loads the existing resourcegroupassignments into the basket item and populates the available with the remaining
    this.groupService.getGroups(this.resourceLibraryAsset.organisationId).subscribe(groups => {
      this.availableGroups = groups;

      this.groupBasketSelector.shelfItems = [];//this.availableGroups;
      this.groupBasketSelector.basketItems = [];

      let selectedCollection: any[];
      //iterate through all the items in the resourceGroupAssignment collection and find the associated group in the available shelf and move into the basket
      // selectedCollection = this.availableGroups.filter(g => {
      //   if(this.resourceLibraryAsset.resourceGroupAssignments.findIndex(rga => rga.groupId === g.groupId) > -1){
      //     return g;
      //   }
      // });
      selectedCollection = this.resourceLibraryAsset.resourceGroupAssignments.map((rga, i) => {
         let group: IGroup = this.findGroupWithId(rga.groupId, this.availableGroups);
         if(group){
           //make a copy of the group without the subgroups
           let groupCopy           = Object.assign({}, group);
               groupCopy.subGroups = null;
           return groupCopy;
         }
      //   let group: IGroup = this.availableGroups.find(g => g.groupId === rga.groupId);
      //     if(group){
      //       return group;
      //     }
       });

       this.groupBasketSelector.shelfItems = this.availableGroups.filter(function f(o){
        if(!selectedCollection.find(sg => sg.groupId === o.groupId)){
          //current group isnt a match, search subgroups
          if(o.subGroups && o.subGroups.length > 0){
            return (o.subGroups = o.subGroups.filter(f)).length;
          } else {
            return true;
          }
        }

       });

      //  this.groupBasketSelector.shelfItems = this.availableGroups.filter(g => {
      //    if(!selectedCollection.find(sg => sg.groupId === g.groupId)){
      //      //no match, so search in subgroups for current group (if there is subgroup with items)
      //      if(g.subGroups && g.subGroups.length > 0){
      //       //search in subgroups
      //       if(!)
      //      }
      //      return g;
      //    } else {
      //      console.log(`found match ${g.name}`);
      //    }
      //  });
       this.groupBasketSelector.basketItems = selectedCollection;

      let i: number = 0;
    });
  }
  

  private findGroupWithId(groupId: number, groupList: IGroup[]): IGroup {
    //recursive helper method to find a group in the deep multi-level collection

    var searchForGroup = function (groupList: IGroup[], groupId: number): IGroup {
      //the generic recursive function variable that keeps searching for a group in subgroups
      for (let groupItem of groupList) {
        if (groupItem.groupId === groupId) {
          return groupItem;
        } else {
          //look for subGroups
          var match = searchForGroup(groupItem.subGroups, groupId);
          if (match) return match;
        }
      }
      return null;
    }

    //kick off the recursive reach
    var match = searchForGroup(groupList, groupId);
    return match; //this could be something - or null
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements.map(
      (formControl: ElementRef) => 
        Observable.fromEvent(formControl.nativeElement, 'blur')
    ); 

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.resourceForm.valueChanges, ...controlBlurs)
      .debounceTime(250)
      .subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(
          this.resourceForm
        );
      });
  }

  assetTypeOnChange(event: Event): void {
    let selectedAssetType: IResourceLibraryAssetType = +this.resourceForm.get('assetType').value;
    if(selectedAssetType === IResourceLibraryAssetType.Image){
      this.allowedMimeTypes = ['image/png','image/jpeg'];
    } else if(selectedAssetType === IResourceLibraryAssetType.Video){
      this.allowedMimeTypes = ['video/mp4','application/x-mpegURL'];
    } else if(selectedAssetType === IResourceLibraryAssetType.PDF){
      this.allowedMimeTypes = ['application/pdf'];
    } else if(selectedAssetType === IResourceLibraryAssetType.HTML){
      this.allowedMimeTypes = ['text/html'];
    } else {
      //anything goes!
      this.allowedMimeTypes = null;
    }

    if(this.resourceFileUploadComponent){
      //forcibly update the property in the fileUpload component
      this.resourceFileUploadComponent.allowedMimeTypes = this.allowedMimeTypes;
    }
  }

  private mergeFormValuesIntoObject(origResourceLibraryAsset: IResourceLibraryAsset): IResourceLibraryAsset {
    //merge reactive form into object
    let revisedObj: IResourceLibraryAsset = Object.assign({}, origResourceLibraryAsset, this.resourceForm.value);

    return revisedObj;
  }

  cmdSave(): void {
    this.currentlySaving = true;

    if(this.selectedResourceCategory && this.resourceLibraryAsset.resourceCategoryId != this.selectedResourceCategory.resourceCategoryId){
      //resource category has changed
      this.resourceLibraryAsset.resourceCategoryId = this.selectedResourceCategory.resourceCategoryId;
      this.resourceForm.markAsDirty();
    } else if(!this.selectedResourceCategory && this.resourceLibraryAsset.resourceCategoryId){
      //resource category was changed to null
      this.resourceLibraryAsset.resourceCategoryId = null;
      this.resourceForm.markAsDirty();
    }

    if (this.resourceForm.dirty && this.resourceForm.valid) {
      //attempt to save exportReport via webService

      //merge form into revised object
      let revisedObj = this.mergeFormValuesIntoObject(this.resourceLibraryAsset);

      // --- process resourceGroupAssignments

      //process the basket for group assignments
      this.groupBasketSelector.basketItems.forEach((group: IGroup, i) => {
        
        

        let findExistingGroupProcessing = (group: IGroup) => {
          //find existing resourceGroupAssignment
        let existingResourceGroupAssignment = revisedObj.resourceGroupAssignments.find(rga => rga.groupId === group.groupId);
        if(!existingResourceGroupAssignment){
          //could not find existing resourceGroupAssignment, so add a new one
          let newResourceGroupAssignment: IResourceGroupAssignment = this.resourceLibraryAssetService.initResourceGroupAssignment();
          newResourceGroupAssignment.resourceLibraryAssetId = revisedObj.resourceLibraryAssetId;
          newResourceGroupAssignment.groupId = group.groupId;
          revisedObj.resourceGroupAssignments.push(newResourceGroupAssignment);
        } //no need to handle edit as nothing will change if existing is kept
        };

        //process group
        findExistingGroupProcessing(group);

        //process any subGroups
        if(group.subGroups){
          group.subGroups.forEach((subGroupItem: IGroup, index) => {
            findExistingGroupProcessing(subGroupItem);
          });
        }
        
      });

      
      
      
      //now look for any resourceGroupAssignments that are no longer selected (on the shelf now), and remove them
      this.groupBasketSelector.shelfItems.forEach((group: IGroup, i) => {
        let removeExistingResourceGroupAssignmentsProcessing = (group: IGroup) =>{
          let existingResourceGroupAssignmentIndex = revisedObj.resourceGroupAssignments.findIndex(rga => rga.groupId === group.groupId);
          if(existingResourceGroupAssignmentIndex >= 0){
            //found an existing item - which needs to be removed
            revisedObj.resourceGroupAssignments.splice(existingResourceGroupAssignmentIndex,1);
            //console.log(`removed one - ${group.groupId}`);
          } 
          
          if (group.subGroups && group.subGroups.length > 0) {
            //check if there are any matching subgroups
            group.subGroups.forEach((subGroupItem: IGroup) => removeExistingResourceGroupAssignmentsProcessing(subGroupItem));
          }
        }

        removeExistingResourceGroupAssignmentsProcessing(group);
      });

      // --- perform the save via web service ---

      if(this.resourceLibraryAsset.resourceLibraryAssetId === 0){
        //this is an add, so perform upload
          //attempt to upload the file & create the accompanying resourceLibraryAsset at the same time
          this.resourceFileUploadComponent.uploadFile(revisedObj).subscribe(status => {
            if (status === 1) {
              //all good
              setTimeout(() => {
                //trigger returning to resourceList after momentary detail to give use chance to see upload status success message
                this.onSaveComplete();
              }, 250);
            } else {
              //somethough went wrong
              if(!this.uploadCanceled){
                alert('There has been an unexpected error. Please log out and try again.');
              } else {
                console.log('User cancelled upload event');
              }
            }
          });
      } else {
        //this is an edit, so only update the resourceLibraryAsset metadata (eg name, description only)
        this.resourceLibraryAssetService.saveResourceLibraryAsset(revisedObj).subscribe(() => {
            this.onSaveComplete(); //TODO - change to update
          }, error => console.log(`Unexpected error: ${error} (ref cmdSave)`)
        );
        
      }
      
    } else if (!this.resourceForm.dirty) {
      this.onSaveComplete();
    }
  }

  cmdDelete(): void {
    if (this.resourceLibraryAsset.resourceLibraryAssetId <= 0) return; //basic validator in-case any user is trying to be clever...

    if (confirm(`Are you sure you want to delete the Resource: '${this.resourceLibraryAsset.name}'?`)) {
      //call service to delete object
      this.resourceLibraryAssetService.deleteResourceLibraryAsset(this.resourceLibraryAsset.resourceLibraryAssetId)
        .subscribe(() => this.onSaveComplete(),
          (error: any) => alert(`'Attention: ${error}`));
    }
  }

  cmdCancel(): void {
    //do nothing - go back to the manage courses screen
    this.onSaveComplete();
  }

  private onSaveComplete(): void {
    //this.issueForm.reset(); //clear any validation
    this.currentlySaving = false;
    this.router.navigate(['/resourcelibrary/manage']);
  }

  cmdTestUpload(): void {
    let revisedObj = this.mergeFormValuesIntoObject(this.resourceLibraryAsset);
    this.resourceFileUploadComponent.uploadFile(revisedObj).subscribe(status => {
      setTimeout(() => {
        alert(`Upload result: ${status}`);
      }, 3000);
      
    });
  }

  cmdCancelUpload(): void {
    if(this.currentlySaving && confirm('Are you sure you want to cancel the upload?')){
      this.uploadCanceled = true;
      this.resourceFileUploadComponent.uploader.cancelAll();
      this.currentlySaving = false;
    }
  }

  basketSelectorIsDirtyEventHandler(isDirty: boolean): void {
    //event handler that is triggered if a user makes a changed to the group basket selection. This marks the courseGroupForm as dirty
    if(isDirty){
      this.resourceForm.markAsDirty();
    }
  }

  cmdSelectResourceCategory(): void {
    const initialState = {
      openedAsModal: true,
      organisationId: +this.resourceForm.get('organisationId').value, //this.course.organisationId,
      selectedCategory: this.selectedResourceCategory
    };
    let resourceCategorySelectCompModalRef = this.modalService.show(ResourceCategorySelectComponent, {initialState: initialState, class: 'modal-lg'});

    const _combine = Observable.combineLatest(
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        const _reason = reason ? `, dismissed by ${reason}` : '';
        if (_reason.length === 0) {
          //the modal was closed normally (ie by use pressing a close button / hide js, not escape or clicked in the background)
          
          //get any data from the component if needed
          let resourceCategorySelectComp: ResourceCategorySelectComponent = resourceCategorySelectCompModalRef.content;
          if(resourceCategorySelectComp){
            //set the selectedCategory as what to was selected in the component which could be a category OR NULL!!
            this.selectedResourceCategory = resourceCategorySelectComp.selectedCategory;  
          }
        }
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    this.subscriptions.push(_combine);
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }
}
