import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, Input  } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { IUserProfile } from './user-profile';
import { UserService } from './user.service';

import { GenericValidator } from '../shared/generic-validator';

function MustMatchPin(AC: AbstractControl) {
  
  if(!AC.get('pin').value && !AC.get('pinRepeat').value)
    return null;

  let pin = AC.get('pin').value; // to get value in input tag
  let pinRepeat = AC.get('pinRepeat').value; // to get value in input tag
  
  if(pin.length < 4)
    return {PinLengthValid:true}


  if(pin != pinRepeat) {
      return { DoesPinMatch: true}
  } else {          
      return null          
  }
}

@Component({
  //selector: 'app-user-profile-edit',
  templateUrl: './user-profile-edit.component.html',
  styleUrls: ['./user-profile-edit.component.css']
})
export class UserProfileEditComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  pageTitle: string = 'User Profile';
  profileForm: FormGroup;
  userProfile: IUserProfile;

  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private userService: UserService) {
    this.validationMessages = {
      firstName: {
        required: 'First Name is required.',
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
   }

  ngOnInit() {
    this.profileForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: [''],
        dob: [''],
        emailGroup: this.fb.group({
          email: [''],
          },
          { }),
        email: [''],
        phone: [''],
        workPhone: [''],
        workMobilePhone: [''],
        pin: [''],
        pinRepeat: ['']
      },{
        validator: MustMatchPin
      }  
    );

    this.loadUserProfile();


  }

  ngAfterViewInit() {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.profileForm.valueChanges, ...controlBlurs).debounceTime(250).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.profileForm);
    });
  }

  private loadUserProfile(): void {
    let userId = this.route.snapshot.params['userId'];
    if(!userId){
      //userId missing from user - need to retrieve the userId from somewhere...
      userId = 1;
    }

    this.userService.getUserProfile(userId).subscribe(userProfile => {
      this.userProfile = userProfile

      this.profileForm.patchValue({
        firstName: this.userProfile.firstName,
        lastName: this.userProfile.lastName,
        email: this.userProfile.email,
        workPhone: this.userProfile.workPhone,
        workMobilePhone: this.userProfile.workMobilePhone,
        dob: this.userProfile.dob,
        pin: this.userProfile.pin
      });

    }, error => {
      alert("There was an unexpected error. Please refresh your browser. (ref: loadUserProfile)");
      console.log(`Error: ${<any>error}`);
      return;
    });
  }

  cmdSave(): void {
    if(this.profileForm.dirty && this.profileForm.valid){
      //attempt to save user profile - only if form is valid

      //get a copy and merge the form values with the original profile object
      let updatedUserProfile: IUserProfile = Object.assign({}, this.userProfile, this.profileForm.value);

      //call the service to save the org
      this.userService.saveUserProfile(updatedUserProfile).subscribe(
        () => {
                //successful save, lets move away
                this.onSaveComplete();
              },
              (error: any) => alert(`'Unexpected error: ${error}`) //bugger
      );

    } else if(!this.profileForm.dirty) {
      //skip the save as nothing was changed
      this.onSaveComplete();
    }
  }

  private onSaveComplete(): void {
    this.router.navigate(['/dashboard']);
  }

  cmdCancel(): void {
    //NEEDS TO CHANGE BEHAVIOUR BASED ON IMPLEMENTATION
   //this.router.navigate(['/dashboard']);
   this.onSaveComplete();
  }

}
