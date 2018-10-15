import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/combineLatest';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { SettingsUsersService } from './settings-users.service';
import { SettingsOrganisationsService } from '../settings-organisations/settings-organisations.service';
import { IRole } from './role';
import { IUser } from './user';
import { IUserProfile } from '../../users/user-profile';
import { IOrganisation } from '../settings-organisations/organisation';
import { UserService } from '../../users/user.service';

import { GenericValidator } from '../../shared/generic-validator';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { ManagerSelectionComponent } from './manager-selection/manager-selection.component';


import { ConfirmPasswordValidator } from '../../shared/confirm-password-validator';
import { IUserGroup } from './user-group';

function emailMatcher(c: AbstractControl) {
  let emailControl = c.get('email');
  let confirmControl = c.get('confirmEmail');

  if (emailControl.pristine && confirmControl.pristine) {
    return null;
  }

  if (emailControl.value === confirmControl.value) {
    return null;
  }

  return { 'match': true };
}

function resetPasswordValidator(c: AbstractControl) {
  let resetPasswordCtrl = c.get('resetPassword');
  let passwordCtrl = c.get('password');

  if (!resetPasswordCtrl || !passwordCtrl) {
    return null; //not yet initialised or invalid controls
  }

  if (resetPasswordCtrl.pristine && passwordCtrl.pristine) {
    return null;
  }

  if (resetPasswordCtrl.value) {
    if (!passwordCtrl.value || passwordCtrl.value.length === 0) {
      return { 'invalid': true }
    }
  }
  return null;
}



@Component({
  selector: 'app-settings-users-edit',
  templateUrl: './settings-users-edit.component.html',
  styleUrls: ['./settings-users-edit.component.css']
})
export class SettingsUsersEditComponent implements OnInit, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  pageTitle: string;
  user: IUser;
  userForm: FormGroup;
  roles: IRole[];
  orgs: IOrganisation[];
  manager: IUser;
  managerSelectionModalRef: BsModalRef;
  subscriptions: Subscription[] = [];
  userGroup: IUserGroup;

  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;


  constructor(private route: ActivatedRoute, 
              private router: Router, 
              private fb: FormBuilder, 
              private settingsUserService: SettingsUsersService, 
              private organisationService: SettingsOrganisationsService, 
              private userService: UserService,
              private modalService: BsModalService, 
              private changeDetection: ChangeDetectorRef) {

    this.validationMessages = {
      username: {
        required: 'Username is required.',
        unique: 'Username is already taken. Try another name'
      },
      firstName: {
        required: 'First Name is required.'
      },
      password: {
        required: 'Password is required',
        minlength: 'Password must be minimum 4 characters'
      },
      confirmPassword: {
        match: 'Confirm password must match password'
      },
      pin: {
        required: 'PIN is required',
        minlength: "PIN must be minimum 4 digits long",
        maxlength: "PIN cannot be longer than 10 digits"
      },
      roleId: {
        required: 'Role is required',
        min: 'Role is required'
      },
      email: {
        required: 'Email is required'
      },
      confirmEmail: {
        required: 'Confirm Email is required',
        match: 'must match'
      },
      emailGroup: {

      },
      manager: {

      },
      userGroup: {

      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    //initialise the formBuilder
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      middlename: [''],
      lastName: [''],

      emailGroup: this.fb.group({
        email: [''],
        confirmEmail: ['']
      },
        { validator: emailMatcher }),
      roleId: ['', [Validators.required, Validators.min(1)]],
      passwordGroup: this.fb.group({
        resetPassword: [false],
        password: [''],
        confirmPassword: ['', ConfirmPasswordValidator.match('password')]
      }, { validator: resetPasswordValidator }),
      userProfileGroup: this.fb.group({
        dob: [''],
        phone: [''],
        workPhone: [''],
        workMobilePhone: [''],
        hrStaffReferenceID: [''],
        hrDepartmentReferenceID: [''],
        hrCostCentreReferenceID: ['']
      }),
      pin: ['', [Validators.minLength(4), Validators.maxLength(10)]],
      organisationId: [''],
      userGroup: ['']
    });

    this.route.data.subscribe(data => {
      this.user = data['user'];
      this.roles = data['roles'];
      this.orgs = data['orgs'];
      if (this.userForm) {
        this.userForm.reset();
      }

      this.userForm.patchValue({
        username: this.user.username,
        firstName: this.user.userProfile.firstName,
        //middlename: this.user.userProfile.middlename,
        lastName: this.user.userProfile.lastName,
        emailGroup: {
          email: this.user.userProfile.email
        },
        roleId: +this.user.roleId,
        organisationId: this.user.organisationId,
        passwordGroup: {
          resetPassword: this.user.userId == 0
        },
        userProfileGroup: {
          dob: this.user.userProfile.dob,
          phone: this.user.userProfile.phone,
          workPhone: this.user.userProfile.workPhone,
          workMobilePhone: this.user.userProfile.workMobilePhone,
          hrStaffReferenceID: this.user.userProfile.hrStaffReferenceID,
          hrDepartmentReferenceID: this.user.userProfile.hrDepartmentReferenceID,
          hrCostCentreReferenceID: this.user.userProfile.hrCostCentreReferenceID
        }
      });

      if (this.user.userId == 0) {
        this.pageTitle = 'Add New User';
        this.userForm.get('username').enable();

        this.userForm.get('passwordGroup.password').setValidators([Validators.required, Validators.minLength(4)]);
        this.userGroup = null;
      } else {
        this.pageTitle = 'Edit Existing User';
        this.userForm.get('username').disable(); //disable changing username for an existing user

        this.userForm.get('passwordGroup.password').setValidators([Validators.minLength(4)]);

        //load the userGroup for the particular user
        this.settingsUserService.getUserGroup(this.user.userId).subscribe(userGroup => {
          if(userGroup){
            this.userGroup = userGroup;  
          } else {
            this.userGroup = null;
          }
        }, error => console.log(`Unexpected error: ${error} (ref settings-user-edit)`));
      }

      this.route.queryParamMap.subscribe(params => {
        if (params.has("managerId")) {
          //url has the managerId parameter meaning it just came back from the manager selection screen
          this.userForm.markAsDirty(); //mark the form as dirty as the user just came back from the manager selection screen
          if (+params.get('managerId') > 0) {
            this.manager = <IUser>{ userId: +params.get('managerId'), firstName: params.get('firstName'), lastName: params.get('lastName') }
          } else {
            this.manager = null;
          }
        } else {
          //no managerId in url, so populate the managerId with what is in the user object
          //but load the manager object from the db to get first name and last name
          if (this.user.userProfile.managerId > 0) {
            this.settingsUserService.getUser(this.user.userProfile.managerId).subscribe(manager => this.manager = manager,
              (error: any) => alert(`'Unexpected error: ${error}`));
          } else {
            this.manager = null;
          }

        }
      })
    })
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.userForm.valueChanges, controlBlurs).debounceTime(250).subscribe(value => {
      //console.log(JSON.stringify(this.userForm.get('passwordGroup.password').errors));

      this.displayMessage = this.genericValidator.processMessages(this.userForm);
    });
  }

  cmdSave(): void {
    if (this.userForm.dirty && this.userForm.valid) {
      //attempt to save user

      //get a copy / merge values from original and modified user object
      let userObj = Object.assign({}, this.user, this.userForm.value);

      //since email and passwords are part of seperate group, we have to manually move them
      userObj.email = userObj.emailGroup.email;
      userObj.password = userObj.passwordGroup.password;
      userObj.emailGroup = null;
      userObj.passwordGroup = null;
      userObj.phone = userObj.userProfile.phone;

      //assign the manager id in the profile if needed
      if (this.manager) {
        userObj.userProfile.managerId = this.manager.userId;
      } else {
        userObj.userProfile.managerId = null;
      }

      //assign the user profile fields
      let upObj: IUserProfile = Object.assign(userObj.userProfile, userObj.userProfile, this.userForm.get('userProfileGroup').value);
      upObj.firstName = userObj.firstName;
      upObj.lastName = userObj.lastName;
      upObj.email = userObj.email;

      userObj.userProfile = null; //clear the profile object to prevent it from being transmitted to server when updating the User obj (as profile is saved seperately)

      //save the user in the db
      this.settingsUserService.saveUser(userObj).subscribe(updatedUserObj => {
        //check if the user profile is missing the userid or userprofileid (which is the case when it's a new user being created)
        if (!upObj.userId || !upObj.userProfileId) {
          //one or both are blank, so updated the userProfile object to use the userId and userProfileId returned by the service
          upObj.userId = updatedUserObj.userId;
          upObj.userProfileId = updatedUserObj.userProfile.userProfileId;
        }

        this.userService.saveUserProfile(upObj).subscribe(() => {
          this.onSaveComplete()
        },
          (error: any) => alert(`'Unexpected error: ${error}`));
      },
        (error: any) => alert(`'Unexpected error: ${error}`));

    } else if (!this.userForm.dirty) {
      //no changes to the form, so skip changes
      this.onSaveComplete();
    }
  }

  onSaveComplete(): void {
    //clear the form and return back to the user list
    this.userForm.reset();
    // check if this page come from setting module or Staff Module
    history.back();
  }

  cancel(): void {
    history.back();
  }

  cmdDelete(): void {
    if (confirm('Are you sure you want to delete this user?')) {
      //call service to delete user
      this.settingsUserService.deleteUser(this.user.userId)
        .subscribe(() => this.onSaveComplete(),
          (error: any) => alert(`'Attention: ${error}`));
    }
  }

  cmdSelectManager(): void {
    //validate to make sure there is an organisation
    if(!+this.userForm.get('organisationId').value){
      this.displayMessage.manager = "Please select an organisation first";
      return;
    } 

    //this.router.navigate(['/settings/users', this.user.userId, 'manager']);
    this.openManagerSelectionModal();
  }

  cmdClearManager(): void {
    if (confirm('Are you sure you want to clear the manager?')) {
      this.manager = null;
      this.userForm.markAsDirty();
    }
  }

  openManagerSelectionModal() {
    
    const initialState = {
      openedAsModal: true,
      selectedUser: this.manager,
      hideUserId: this.user.userId,
      organisationId: +this.userForm.get('organisationId').value
    };

    this.managerSelectionModalRef = this.modalService.show(ManagerSelectionComponent, {initialState: initialState, class: 'modal-lg'});
    
    
    const _combine = Observable.combineLatest(
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        const _reason = reason ? `, dismissed by ${reason}` : '';
        if(_reason.length === 0){
          //the modal was closed normally (ie by use pressing a close button / hide js, not escape or clicked in the background)
          
          //get any data from the component if needed
          let managerSelectionComponent: ManagerSelectionComponent = <ManagerSelectionComponent> this.managerSelectionModalRef.content;
          if(managerSelectionComponent){
            //set the selected manager
            this.manager = managerSelectionComponent.selectedUser;
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
