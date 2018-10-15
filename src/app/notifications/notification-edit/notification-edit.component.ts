import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  ElementRef,
  Input,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn,
  FormArray,
  FormControlName,
  FormControl
} from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { moment } from 'ngx-bootstrap/chronos/test/chain';

import { GenericValidator } from '../../shared/generic-validator';
import { IOrganisation } from '../../settings/settings-organisations/organisation';
import { LoginService } from '../../login/login.service';
import { INotificationBatch, INotificationBatchGroupAssignment, INotificationBatchUserAssignment } from '../notification-batch';
import { NotificationService } from '../notification.service';
import { INotificationType } from '../notification';
import { BasketSelectorComponent } from '../../shared/basket-selector/basket-selector.component';
import { GroupService } from '../../groups/group.service';
import { IGroup } from '../../groups/group';
import { StaffBasketSelectorComponent } from '../../shared/staff-basket-selector/staff-basket-selector.component';
import { Subject } from 'rxjs/Subject';
import { SettingsUsersService } from '../../settings/settings-users/settings-users.service';
import { IUser } from '../../settings/settings-users/user';

@Component({
  templateUrl: './notification-edit.component.html',
  styleUrls: ['./notification-edit.component.scss']
})
export class NotificationEditComponent implements OnInit {
  pageTitle: string;
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('groupBasketSelector') groupBasketSelector: BasketSelectorComponent;
  @ViewChild('staffBasketSelector') staffBasketSelector: StaffBasketSelectorComponent;
  
  organisations: IOrganisation[];
  notificationForm: FormGroup;
  notificationBatch: INotificationBatch;
  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  INotificationType = INotificationType;
  availableGroups: IGroup[];
  searchString: string;
  searchStringSubject$ = new Subject<string>();
  
  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private loginService: LoginService,
    private notificationService: NotificationService,
    private groupService: GroupService,
    private changeDetection: ChangeDetectorRef,
    private settingsUserService: SettingsUsersService) { 
      this.validationMessages = {
        subject: {
          required: 'Subject is required.'
        },
        body: {
          required: 'Body is required.'
        },
        priority: {
          required: 'Priority is required'
        },
        notificationType: {
          required: 'Notification Type is required.'
        },
        scheduledDate: {
          required: 'Scheduled Date is required.'
        }

      };
  
      this.genericValidator = new GenericValidator(this.validationMessages);
    }

  ngOnInit() {
    this.staffBasketSelector.basketItems = []; //define basket array
    this.initForm();
    this.loadNotification();
  }

  initForm(){
    this.notificationForm = this.fb.group({
      notificationType: [''],
      subject: ['', Validators.required],
      body: [''],
      priority: [''],
      scheduledDate: ['']
    });
  }

  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.organisations = data['orgs'];
    });
  }
 
  loadNotification(): void {
    this.route.paramMap.subscribe(params => {
      if (params.has('notificationBatchId')) {
        if (+params.get('notificationBatchId') === 0) {
          this.pageTitle = 'Create Notification';
          this.notificationBatch = this.notificationService.initNotificationBatch();
          this.notificationBatch.organisationId = this.loginService.currentUser.organisationId;
          this.populateForm();
          this.loadAvailableGroups();
          this.loadSelectedUsers();
        } else {
          this.pageTitle = 'View Notification'; 
          this.notificationService.getNotificationBatch(+params.get('notificationBatchId')).subscribe(notificationBatch => {
            if(notificationBatch.scheduledDate){
              notificationBatch.scheduledDate = moment.utc(notificationBatch.scheduledDate).toDate();
            }
            console.log(" ------------------ notification Batch -----------------");
            console.log(notificationBatch);
            this.notificationBatch = notificationBatch;
            this.populateForm();
            this.loadNotificationBatchGroupAssignments();
            this.loadSelectedUsers();
          }, error => {
            console.log(`Unexpected error ${error} (ref loadNotification)`)
            this.router.navigate(["/notifications/manage"]);
          });
        }
      } else {
        console.log("Warning - could not find notificationBatchId in route. Returning user to notifications list");
        this.router.navigate(["/notifications/manage"]);
      }
    });
  }

  populateForm(): void {
    this.notificationForm.patchValue({
      subject: this.notificationBatch.subject,
      body: this.notificationBatch.body,
      notificationType: this.notificationBatch.notificationType,
      priority: this.notificationBatch.priority,
      scheduledDate: new Date(this.notificationBatch.scheduledDate)
    })
  }

  loadAvailableGroups(): void {
    this.groupService.getGroups(this.loginService.currentUser.organisationId).subscribe(groups => {
      this.availableGroups = groups;

      this.groupBasketSelector.shelfItems = this.availableGroups;
      this.groupBasketSelector.basketItems = [];
    });
  }

  loadNotificationBatchGroupAssignments(): void {
    //loads the existing resourcegroupassignments into the basket item and populates the available with the remaining
    this.groupService.getGroups(this.loginService.currentUser.organisationId).subscribe(groups => {
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
      selectedCollection = this.notificationBatch.notificationBatchGroupAssignments.map((rga, i) => {
         let group: IGroup = this.findGroupWithId(rga.groupId, this.availableGroups);
         if(group){
           //make a copy of the group without the subgroups
           let groupCopy = Object.assign({}, group);
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

  basketSelectorIsDirtyEventHandler(isDirty: boolean): void {
    //event handler that is triggered if a user makes a changed to the group basket selection. This marks the courseGroupForm as dirty
    if(isDirty){
      this.notificationForm.markAsDirty();
    }
  }

  staffbasketSelectorIsDirtyEventHandler(isDirty: boolean): void {
    //event handler that is triggered if a user makes a changed to the group basket selection. This marks the courseGroupForm as dirty
    if(isDirty){
      this.staffBasketSelector.basketItems = this.settingsUserService.sortUsersByName(this.staffBasketSelector.basketItems);
      this.staffBasketSelector.shelfItems = this.settingsUserService.sortUsersByName(this.staffBasketSelector.shelfItems);
      this.notificationForm.markAsDirty();
    }
  }

  searchStringChangedEventHandler(searchString: string): void {
    this.searchStringSubject$.next(searchString);
  }

  private setupSearchForUsersObserver(): void {
    if(this.notificationBatch.notificationsCreated){
      return; //don't setup the observer because the notificationBatch was already sent.
    }
    //create observer on searchForUsersByOrganisationAndString service which is triggered every time the searchStringSubject fires a new event (ie search field changed)
    this.settingsUserService.searchForUsersByOrganisationAndString(this.loginService.currentUser.organisationId, this.searchStringSubject$).subscribe(users => {
      //filter out any users already in basket
      this.staffBasketSelector.basketItems.forEach((user, index) => {
        let matchingIndex = users.findIndex(u => u.userId === user.userId)
        if(matchingIndex > -1){
          //found a match in the new users collection, so drop it before being passed to the basketSelectorShelfItem property
          users.splice(matchingIndex, 1);
        }
      });
      this.staffBasketSelector.shelfItems = this.settingsUserService.sortUsersByName(users);
    })
    this.searchStringSubject$.next(''); //set the text to a blank field to load all users for the organisation
  }

  loadSelectedUsers(): void {
    this.setupSearchForUsersObserver();

    //build an number array of groupIds  from the above courseGroupAssignmentlist
    let userIdList = this.notificationBatch.notificationBatchUserAssignments.map(caa => caa.userId);
    
    if(this.notificationBatch.notificationsCreated){
      this.staffBasketSelector.shelfItems = []; //set the shelf items to empty because the notification had already been sent
    }

    if(!userIdList.length){
      this.staffBasketSelector.basketItems = []; //no selected users, so set empty array and finish up
      return;
    }
    //now call the web servie to load the groups in ONE request (special web service method)
    this.settingsUserService.getUserCollection(userIdList).subscribe(users => {
      //groups loaded - so set the groupBasketSelector data items

      //set the shelf items to nothing - because this is an edit
      //this.staffBasketSelector.shelfItems = [];

      //set the basket items to the loaded groups - because this is an edit of existing groups allocated to courseGroupAssignment objects
      this.staffBasketSelector.basketItems = users;
    });
  }

  cmdSave(): void {
    console.log(this.notificationForm.value);
    if (this.notificationForm.dirty && this.notificationForm.valid) {
      //attempt to save data via webService

      //merge form into revised object
      let revisedNotificationBatch: INotificationBatch = this.mergeFormValuesIntoNotificationBatchObject(this.notificationBatch);

      this.notificationService.saveNotificationBatch(revisedNotificationBatch).subscribe(() => {
        this.onSaveComplete();
      }, error => alert(`Unexpected error: ${error} (ref cmdSave)`));

    } else if (!this.notificationForm.dirty) {
      this.onSaveComplete();
    }
  }

  private mergeFormValuesIntoNotificationBatchObject(origNotificationBatch: INotificationBatch): INotificationBatch {
    //merge reactive form into object
    let revisedObj: INotificationBatch = Object.assign({}, origNotificationBatch, this.notificationForm.value);
    if(!revisedObj.createdDate) revisedObj.createdDate = new Date(); //this is set on server but there is a bug with data binding so this needs to be passed
    if(!revisedObj.createdByUserId) revisedObj.createdByUserId = this.loginService.currentUser.userId; //this is set on server but there is a bug with data binding so this needs to be passed
    

    //process the basket for group assignments
    this.processSelectedGroupAssignments(revisedObj);
    this.processSelectedUserAssignments(revisedObj);

    //STUB FOR TESTING - GROUP AND USER MANUAL ASSIGNMENT
    // if(!revisedObj.notificationBatchGroupAssignments.length){
    //   let groupAss: INotificationBatchGroupAssignment = this.notificationService.initNotificationBatchGroupAssignment();
    //   groupAss.groupId = 50; //MANUALLY SET TO A EXISTING GROUP ID CLINICAL
    //   revisedObj.notificationBatchGroupAssignments.push(groupAss);
    // }

    // if(!revisedObj.notificationBatchUserAssignments.length){
    //   let userAss: INotificationBatchUserAssignment = this.notificationService.initNotificationBatchUserAssignment();
    //   userAss.userId = 17;//this.loginService.currentUser.userId; //MANUALLY SET TO CURRENT USER // JIMMY!
    //   revisedObj.notificationBatchUserAssignments.push(userAss);
    // }

    
    


    return revisedObj;
  }

  private processSelectedGroupAssignments(revisedObj: INotificationBatch) {
    this.groupBasketSelector.basketItems.forEach((group: IGroup, i) => {
      let findExistingGroupProcessing = (group: IGroup) => {
        //find existing resourceGroupAssignment
        let existingResourceGroupAssignment = revisedObj.notificationBatchGroupAssignments.find(rga => rga.groupId === group.groupId);
        if (!existingResourceGroupAssignment) {
          //could not find existing resourceGroupAssignment, so add a new one
          let newResourceGroupAssignment: INotificationBatchGroupAssignment = this.notificationService.initNotificationBatchGroupAssignment();
          newResourceGroupAssignment.notificationBatchId = revisedObj.notificationBatchId;
          newResourceGroupAssignment.groupId = group.groupId;
          revisedObj.notificationBatchGroupAssignments.push(newResourceGroupAssignment);
        } //no need to handle edit as nothing will change if existing is kept
      };
      //process group
      findExistingGroupProcessing(group);
      //process any subGroups
      if (group.subGroups) {
        group.subGroups.forEach((subGroupItem: IGroup, index) => {
          findExistingGroupProcessing(subGroupItem);
        });
      }
    });
    //now look for any resourceGroupAssignments that are no longer selected (on the shelf now), and remove them
    this.groupBasketSelector.shelfItems.forEach((group: IGroup, i) => {
      let removeExistingResourceGroupAssignmentsProcessing = (group: IGroup) => {
        let existingResourceGroupAssignmentIndex = revisedObj.notificationBatchGroupAssignments.findIndex(rga => rga.groupId === group.groupId);
        if (existingResourceGroupAssignmentIndex >= 0) {
          //found an existing item - which needs to be removed
          revisedObj.notificationBatchGroupAssignments.splice(existingResourceGroupAssignmentIndex, 1);
          //console.log(`removed one - ${group.groupId}`);
        }
        if (group.subGroups && group.subGroups.length > 0) {
          //check if there are any matching subgroups
          group.subGroups.forEach((subGroupItem: IGroup) => removeExistingResourceGroupAssignmentsProcessing(subGroupItem));
        }
      };
      removeExistingResourceGroupAssignmentsProcessing(group);
    });
  }

  private processSelectedUserAssignments(revisedObj: INotificationBatch): void {
    //process the basket for group assignments
    this.staffBasketSelector.basketItems.forEach((user: IUser, i) => {

      let findExistingUserAssignmentProcessing = (user: IUser) => {
        //find existing resourceGroupAssignment
      let existingResourceUserAssignment = revisedObj.notificationBatchUserAssignments.find(rga => rga.userId === user.userId);
      if(!existingResourceUserAssignment){
        //could not find existing resourceGroupAssignment, so add a new one
        let newResourceUserAssignment: INotificationBatchUserAssignment = this.notificationService.initNotificationBatchUserAssignment();
        newResourceUserAssignment.notificationBatchId = revisedObj.notificationBatchId;
        newResourceUserAssignment.userId = user.userId;
        revisedObj.notificationBatchUserAssignments.push(newResourceUserAssignment);
      } //no need to handle edit as nothing will change if existing is kept
      };

      //process user
      findExistingUserAssignmentProcessing(user);
      
    });

    
    
    
    //now look for any resourceGroupAssignments that are no longer selected (on the shelf now), and remove them
    this.staffBasketSelector.shelfItems.forEach((user: IUser, i) => {
      let removeExistingResourceUserAssignmentsProcessing = (user: IUser) =>{
        let existingResourceUserAssignmentIndex = revisedObj.notificationBatchUserAssignments.findIndex(rga => rga.userId === user.userId);
        if(existingResourceUserAssignmentIndex >= 0){
          //found an existing item - which needs to be removed
          revisedObj.notificationBatchUserAssignments.splice(existingResourceUserAssignmentIndex,1);
          //console.log(`removed one - ${group.groupId}`);
        } 
      }

      removeExistingResourceUserAssignmentsProcessing(user);
    });
  }

  cmdDelete(): void {
    if (this.notificationBatch.notificationBatchId <= 0) return; //basic validator in-case any user is trying to be clever...

    if (confirm(`Are you sure you want to delete the Notification: '${this.notificationBatch.subject}'?`)) {
      //call service to delete org
      this.notificationService.deleteNotificationBatch(this.notificationBatch.notificationBatchId)
        .subscribe(() => this.onSaveComplete(true),
          (error: any) => alert(`'Attention: ${error}`));
    }
  }

  cmdCancel(): void {
    //do nothing - go back to the manage courses screen
    this.onSaveComplete();
  }

  private onSaveComplete(takeBacktoCourseList: boolean = false): void {
    this.notificationForm.reset(); //clear any validation
    this.router.navigate(["/notifications/manage"]);
  }

}
