import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericValidator } from '../../shared/generic-validator';
import { moment } from 'ngx-bootstrap/chronos/test/chain';

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
import 'rxjs/add/observable/combineLatest';
import { map } from 'rxjs/operators/map';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { filter } from 'rxjs/operators';


import { BasketSelectorComponent } from '../../shared/basket-selector/basket-selector.component';
import { IGroup } from '../../groups/group';
import { GroupService } from '../../groups/group.service';
import { ManageWebinarService } from '../webinar.service';
import { LoginService } from '../../login/login.service';

// Import for notification 
// tslint:disable-next-line:max-line-length
import { INotificationBatch, INotificationBatchGroupAssignment, INotificationBatchUserAssignment } from '../../notifications/notification-batch';
import { NotificationService } from '../../notifications/notification.service';
import { INotificationType } from '../../notifications/notification';

import { IWebinar, IWebinarGroupAssignment, IWebinarNotificationType } from '../webinar';
@Component({
  selector   : 'app-webinar-new-broadcast',
  templateUrl: './webinar-new-broadcast.component.html',
  styleUrls  : ['./webinar-new-broadcast.component.scss']
})
export class WebinarNewBroadcastComponent implements OnInit, AfterViewInit {

                pageTitle                                               : string;
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild   ('groupBasketSelector') groupBasketSelector              : BasketSelectorComponent;
                availableGroups                                         : IGroup[];
                webinarItem                                             : IWebinar;
                webinarForm                                             : FormGroup;
                displayMessage                                          : { [key: string]: string } = {};
  private       validationMessages                                      : { [key: string]: { [key: string]: string } };
  public        dateTime                                                : Date;
  public        scheduledDate                                           : Date;
  public        scheduledTime                                           : Date;
  private       genericValidator                                        : GenericValidator;

  // Variable for notification
  private notificationBatch: INotificationBatch;
  private webinarNotificationPriority = 3;  // set Webinar Notification Priority

  constructor(
  private groupService       : GroupService,
  private route              : ActivatedRoute,
  private router             : Router,
  private fb                 : FormBuilder,
  private webinarService     : ManageWebinarService,
  private loginService       : LoginService,
  private notificationService: NotificationService) {
    this.validationMessages = {
      name : {
        required: 'WebinarName is required.'
      },
      description : {
        required: 'Description is requird.'
      },
      scheduledDate : {
        required: 'Scheduled Date is required'
      },
      agenda : {
        required: 'Agenda Body is required'
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }


  ngOnInit() {
    this.groupBasketSelector.basketItems = [];  // define basket array
    this.initForm();
    this.loadAvailableGroups();
    this.loadWebinar();
  }

  initForm() {
    this.webinarForm = this.fb.group({
      name            : ['', Validators.required],
      description     : ['', Validators.required],
      scheduledDate   : [Validators.required],
      scheduledTime   : [''],
      duration        : [''],
      recordAsResource: [''],
      notificationType: [''],
      agenda          : ['']
    });
  }

  loadWebinar(): void {
    this.route.paramMap.subscribe(params => {
      if (params.has('webinarId')) {
          if (+params.get('webinarId') === 0) {

            /// if create option
            this.pageTitle   = 'Create Webinar';
            this.webinarItem = this.webinarService.initWebinar();
            this.populateForm();
            this.loadAvailableGroups();

            // create new notification for webinar alarm
            this.notificationBatch                = this.notificationService.initNotificationBatch();
            this.notificationBatch.organisationId = this.loginService.currentUser.organisationId;
            
          } else {

            // edit option
            this.pageTitle = 'Edit Webinar';
            this.webinarService.getWebinarDeatil(+params.get('webinarId')).subscribe(webinarBatch => {
             /*  if(webinarBatch.scheduledDate){
                webinarBatch.scheduledDate = moment.utc(webinarBatch.scheduledDate).toDate();
            } */
            
            // load notification if notiication type is not NO
            if(webinarBatch.notificationType !== IWebinarNotificationType.NO) {
                const notificationBatchId = webinarBatch.notificationBatchId;
                this.notificationService.getNotificationBatch(notificationBatchId).subscribe(notificationBatch => {
                  if (notificationBatch.scheduledDate) {
                      notificationBatch.scheduledDate = moment.utc(notificationBatch.scheduledDate).toDate();
                    }
                    this.notificationBatch = notificationBatch;
                    console.log(this.notificationBatch);
                  }, error => {
                      console.log('unexpected error', error);
                });
            } else {
               // create new notification for webinar alarm
               // create new notification for webinar alarm
               this.notificationBatch                = this.notificationService.initNotificationBatch();
               this.notificationBatch.organisationId = this.loginService.currentUser.organisationId;
            }
           

            this.webinarItem = webinarBatch;
            this.populateForm();
            this.webinarBatchGroupAssignments();
              
            }, error => {
              console.log(`Unexpected error ${error} (ref loadWebinar)`)
              this.router.navigate(['/webinar/list']);
            });
          }
      } else {
        console.log('Warning - could not find WebinarId in route. Returning user to webinar list');
        this.router.navigate(['/webinar']);
      }
    });
  }
 
  webinarBatchGroupAssignments(): void {
    // loads the existing resourcegroupassignments into the basket item and populates the available with the remaining
    this.groupService.getGroups(this.loginService.currentUser.organisationId).subscribe(groups => {
      this.availableGroups = groups;

      this.groupBasketSelector.shelfItems  = [];  //this.availableGroups;
      this.groupBasketSelector.basketItems = [];

      let selectedCollection: any[];
      // iterate through all the items in the resourceGroupAssignment collection and find the associated group in the available shelf and move into the basket
      // selectedCollection = this.availableGroups.filter(g => {
      //   if(this.resourceLibraryAsset.resourceGroupAssignments.findIndex(rga => rga.groupId === g.groupId) > -1){
      //     return g;
      //   }
      // });
      selectedCollection = this.webinarItem.webinarGroupAssignments.map((rga, i) => {
         let group: IGroup = this.findGroupWithId(rga.groupId, this.availableGroups);
         if(group){
           // make a copy of the group without the subgroups
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
          // current group isnt a match, search subgroups
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
    // recursive helper method to find a group in the deep multi-level collection

    let searchForGroup = function (groupList: IGroup[], groupId: number): IGroup {
      //the generic recursive function variable that keeps searching for a group in subgroups
      for (const groupItem of groupList) {
        if (groupItem.groupId === groupId) {
          return groupItem;
        } else {
          // look for subGroups
          var match = searchForGroup(groupItem.subGroups, groupId);
          if (match) return match;
        }
      }
      return null;
    }

    // kick off the recursive reach
    var match = searchForGroup(groupList, groupId);
    return match; // this could be something - or null
  }

  populateForm(): void {
    this.webinarForm.patchValue({
      name            : this.webinarItem.name,
      description     : this.webinarItem.description,
      scheduledDate   : new Date(this.webinarItem.scheduledDate),
      scheduledTime   : new Date(this.webinarItem.scheduledDate),
      duration        : this.webinarItem.duration,
      recordAsResource: this.webinarItem.recordAsResource,
      notificationType: this.webinarItem.notificationType,
      agenda          : this.webinarItem.agenda
    });
  }

  loadAvailableGroups(): void {
   this.groupService.getGroups(this.loginService.currentUser.organisationId).subscribe(groups => {
      this.availableGroups                 = groups;
      this.groupBasketSelector.shelfItems  = this.availableGroups;
      this.groupBasketSelector.basketItems = [];
    });
  }

  cmdSave(): void {
       if (this.webinarForm.dirty && this.webinarForm.valid) {
          // attempt to save data via webService
          // merge form into revised object
      const revisedWebinarBatch: IWebinar = this.mergeFormValuesIntoWebinarBatchObject(this.webinarItem);
      if (revisedWebinarBatch.notificationType !== IWebinarNotificationType.NO) {

              // Save notifications info for webinar schedule
              this.notificationBatch.subject          = `Webinar : ${revisedWebinarBatch.name} invited you will start soon!`;
              this.notificationBatch.body             = revisedWebinarBatch.description;
              this.notificationBatch.scheduledDate    = revisedWebinarBatch.scheduledDate;
              if (revisedWebinarBatch.notificationType === IWebinarNotificationType.PUSH) {
                this.notificationBatch.notificationType = INotificationType.Push;
              } else if ( revisedWebinarBatch.notificationType === IWebinarNotificationType.EMAIL) {
                this.notificationBatch.notificationType = INotificationType.Email;
              }
              // tslint:disable-next-line:max-line-length
              this.notificationBatch.createdDate = new Date();  // this is set on server but there is a bug with data binding so this needs to be passed
              // tslint:disable-next-line:max-line-length
              this.notificationBatch.createdByUserId = this.loginService.currentUser.userId;  // this is set on server but there is a bug with data binding so this needs to be passed
              this.notificationBatch.priority        = this.webinarNotificationPriority;

              // Save notification for webinar and obtain notificationBatchID
              this.notificationService.saveNotificationBatch(this.notificationBatch).subscribe((response: INotificationBatch) => {
                    const notificationBatchId                     = response.notificationBatchId;
                          revisedWebinarBatch.notificationBatchId = notificationBatchId;
                    this.webinarService.saveWebinar(revisedWebinarBatch).subscribe(() => {
                    this.onSaveComplete();

                    // if webinar creation is success, make reminder notificaton
                    }, error => alert(`Unexpected error: ${error} (ref cmdSave)`));
                  }, error => alert(`Unexpected error: ${error} (ref cmdSave)`));
              } else {
                // if notificationType is no
                this.webinarService.saveWebinar(revisedWebinarBatch).subscribe(() => {
                  this.onSaveComplete();
                  // if webinar creation is success, make reminder notificaton
                  }, error => alert(`Unexpected error: ${error} (ref cmdSave)`));
              }
        } else if (!this.webinarForm.dirty) {
              this.onSaveComplete();
      }
  }

  private mergeFormValuesIntoWebinarBatchObject(origWebinarBatch: IWebinar): IWebinar {
    // merge reactive form into object
    var revisedObj: IWebinar = Object.assign({}, origWebinarBatch, this.webinarForm.value);
    var scheduledTime        = new Date(this.webinarForm.controls['scheduledTime'].value);
    revisedObj.scheduledDate.setHours(scheduledTime.getHours());
    revisedObj.scheduledDate.setMinutes(scheduledTime.getMinutes());
    // if(!revisedObj.createdDate) revisedObj.createdDate = new Date(); //this is set on server but there is a bug with data binding so this needs to be passed
    // if(!revisedObj.createdByUserId) revisedObj.createdByUserId = this.loginService.currentUser.userId; //this is set on server but there is a bug with data binding so this needs to be passed

    // process the basket for group assignments
    this.processSelectedGroupAssignments(revisedObj);

    return revisedObj;
  }

  private processSelectedGroupAssignments(revisedObj: IWebinar) {
    this.groupBasketSelector.basketItems.forEach((group: IGroup, i) => {
      const findExistingGroupProcessing = (group: IGroup) => {
        // find existing resourceGroupAssignment
        const existingResourceGroupAssignment = revisedObj.webinarGroupAssignments.find(rga => rga.groupId === group.groupId);
        if (!existingResourceGroupAssignment) {
          // could not find existing resourceGroupAssignment, so add a new one
          const newWebinarGroupAssignment: IWebinarGroupAssignment = this.webinarService.initWebinarGroupAssignment();
                newWebinarGroupAssignment.webinarId                = revisedObj.webinarId;
                newWebinarGroupAssignment.groupId                  = group.groupId;
          revisedObj.webinarGroupAssignments.push(newWebinarGroupAssignment);

          // add new notificationGroupAssignment according to new Webinargroupassignment
          // tslint:disable-next-line:max-line-length
         if (revisedObj.notificationType !== IWebinarNotificationType.NO) {
          const newResourceGroupAssignment: INotificationBatchGroupAssignment = this.notificationService.initNotificationBatchGroupAssignment();
              newResourceGroupAssignment.notificationBatchId                = this.notificationBatch.notificationBatchId;
              newResourceGroupAssignment.groupId                            = group.groupId;
          this.notificationBatch.notificationBatchGroupAssignments.push(newResourceGroupAssignment)
         }
        } // no need to handle edit as nothing will change if existing is kept
      };
      // process group
      findExistingGroupProcessing(group);
      // process any subGroups
      if (group.subGroups) {
        group.subGroups.forEach((subGroupItem: IGroup, index) => {
          findExistingGroupProcessing(subGroupItem);
        });
      }
    });
    // now look for any resourceGroupAssignments that are no longer selected (on the shelf now), and remove them
    this.groupBasketSelector.shelfItems.forEach((group: IGroup, i) => {
      let removeExistingResourceGroupAssignmentsProcessing = (group: IGroup) => {
        let existingResourceGroupAssignmentIndex = revisedObj.webinarGroupAssignments.findIndex(rga => rga.groupId === group.groupId);
        if (existingResourceGroupAssignmentIndex >= 0) {
          // found an existing item - which needs to be removed
          revisedObj.webinarGroupAssignments.splice(existingResourceGroupAssignmentIndex, 1);

          // Splice removed notificatoinAssignmentGroup according to remove WebinarGroupAssignment
          if (revisedObj.notificationType !== IWebinarNotificationType.NO) {
            this.notificationBatch.notificationBatchGroupAssignments.splice(existingResourceGroupAssignmentIndex, 1);
          }
          // console.log(`removed one - ${group.groupId}`);
        }
        if (group.subGroups && group.subGroups.length > 0) {
          // check if there are any matching subgroups
          group.subGroups.forEach((subGroupItem: IGroup) => removeExistingResourceGroupAssignmentsProcessing(subGroupItem));
        }
      };
      removeExistingResourceGroupAssignmentsProcessing(group);
    });
  }


  basketSelectorIsDirtyEventHandler(isDirty: boolean): void {
    // event handler that is triggered if a user makes a changed to the group basket selection. This marks the courseGroupForm as dirty
    if(isDirty){
      // this.resourceForm.markAsDirty();
    }
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    const controlBlurs: Observable<any>[] = this.formInputElements.map(
      (formControl: ElementRef) => 
        Observable.fromEvent(formControl.nativeElement, 'blur')
    );

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.webinarForm.valueChanges, ...controlBlurs)
      .debounceTime(250)
      .subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(
          this.webinarForm
        );
      });
  }


  cmdCancel(): void {
    // do nothing - go back to the manage courses screen
    this.onSaveComplete();
  }

  private onSaveComplete(takeBacktoCourseList: boolean = false): void {
    this.webinarForm.reset(); // clear any validation
    this.router.navigate(['/webinar/list']);
  }

}
