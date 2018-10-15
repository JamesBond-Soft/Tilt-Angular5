import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { IOrganisation } from './organisation';

import { GenericValidator } from '../../shared/generic-validator';
import { SettingsOrganisationsService } from './settings-organisations.service';

@Component({
  //selector: 'app-settings-organisations-edit',
  templateUrl: './settings-organisations-edit.component.html',
  styleUrls: ['./settings-organisations-edit.component.css']
})
export class SettingsOrganisationsEditComponent implements OnInit, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  pageTitle: string;
  org: IOrganisation;
  orgForm: FormGroup;


  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private settingsOrgService: SettingsOrganisationsService) { 
    this.validationMessages = {
      organisationName: {
        required: 'Organisation Name is required.',
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.orgForm = this.fb.group({
      organisationName: ['', Validators.required],
      description: ['']
    });

    this.route.data.subscribe(data => {
      this.org = data['organisation'];

      if(this.orgForm){
        this.orgForm.reset();
      }

      this.orgForm.patchValue({
        organisationName: this.org.organisationName, //keep names same
        description: this.org.description
      });

      if(this.org.organisationId == 0){
        this.pageTitle = 'Add New Organisation';
      } else {
        this.pageTitle = 'Edit Existing Organisation';
      }
    });
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
        .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.orgForm.valueChanges, ...controlBlurs).debounceTime(250).subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(this.orgForm);
    });
  }

  cmdSave(): void {
    if(this.orgForm.dirty && this.orgForm.valid){
      //attempt to save organsation
      //get a copy and merge the orgForm values with the organisation object
      let orgObj = Object.assign({}, this.org, this.orgForm.value);

      //call the service to save the org
      this.settingsOrgService.saveOrg(orgObj).subscribe(
        () => {
                //successful save, lets move away
                this.onSaveComplete();
              },
              (error: any) => alert(`'Unexpected error: ${error}`) //bugger
      );

    } else if(!this.orgForm.dirty) {
      this.onSaveComplete();
    }
  }

  cmdDelete(): void {
    if(confirm('Are you sure you want to delete this user?')){
      //call service to delete org
      this.settingsOrgService.deleteOrg(this.org.organisationId)
            .subscribe(() => this.onSaveComplete(),
            (error: any) => alert(`'Attention: ${error}`));
    }

  }

  private onSaveComplete(): void {
    this.orgForm.reset(); //clear any validation
    this.router.navigate(['/settings/organisations']);
  }
}