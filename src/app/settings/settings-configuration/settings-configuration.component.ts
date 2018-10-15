import { Component, OnInit, ViewChild, AfterViewInit, ViewChildren, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControlName } from '@angular/forms';
import { SupportUserSelectionDialogComponent } from './support-user-selection-dialog/support-user-selection-dialog.component';
import "rxjs/add/operator/debounceTime";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/merge";
//import 'rxjs/add/operator/map';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { GenericValidator } from '../../shared/generic-validator';
import { IConfigurationSettings } from './configuration-settings';
import { ConfigurationSettingsService } from './configuration-settings.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IOrganisation } from '../settings-organisations/organisation';
import { IConfigurationOrganisationSettings } from './configuration-organisation-settings';
import { map } from 'rxjs/operators/map';
import { moment } from 'ngx-bootstrap/chronos/test/chain';

@Component({
  selector: 'app-settings-configuration',
  templateUrl: './settings-configuration.component.html',
  styleUrls: ['./settings-configuration.component.scss']
})
export class SettingsConfigurationComponent implements OnInit, AfterViewInit {
  @ViewChild('supportUserSelectionDialogComponent') supportUserSelectionDialogComponent: SupportUserSelectionDialogComponent;
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  pageTitle: string = "TILT Suite Configuration";
  configurationSettings: IConfigurationSettings;
  dialogSubscription: any;
  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  settingsForm: FormGroup;
  organisations: IOrganisation[];


  constructor(private fb: FormBuilder,
    private configurationSettingsService: ConfigurationSettingsService,
    private router: Router,
    private route: ActivatedRoute) {
    this.validationMessages = {
      
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.initForm();
    this.loadOrganisations();
  }
loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.organisations = data["orgs"];
      this.loadConfigSettings();
    });
  }

  initForm(): void {
    this.settingsForm = this.fb.group({
      supportTicketEscalationEnabled: ["", Validators.required],
      supportSysAdminUserId: [""],
      supportSysAdminUserDisplayName: [""]
    });
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements.map(
      (formControl: ElementRef) =>
        Observable.fromEvent(formControl.nativeElement, "blur")
    );

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.settingsForm.valueChanges, ...controlBlurs)
      .debounceTime(250)
      .subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(
          this.settingsForm
        );
      });
  }

  formControlValueChanged(event: Event): void {
    this.settingsForm.markAsDirty();
  }

  private loadConfigSettings(): void {
    this.configurationSettingsService.getConfigurationSettings().subscribe(configurationSettings => {
      configurationSettings.configurationOrganisationSettingsList.map(cos => {
        if(cos.weeklyAdminReportStartDate){
          cos.weeklyAdminReportStartDate = moment.utc(cos.weeklyAdminReportStartDate).toDate();
        }
      });

      this.configurationSettings = configurationSettings;

      this.settingsForm.reset();

      this.settingsForm.patchValue({
        supportTicketEscalationEnabled: this.configurationSettings.supportTicketEscalationEnabled,
        supportSysAdminUserId: this.configurationSettings.supportSysAdminUserId,
        supportSysAdminUserDisplayName: this.configurationSettings.supportSysAdminUserDisplayName
      });

    }, error => console.log(`Unexpected error ${error} (ref loadConfigSettings)`));
  }

  cmdSelectSupportUser(): void {
    let existingSupportUserId: number;

    //grab the existing user id depending on the selection mode (topLevel = sysAdmin, !topLevel = admin)
    existingSupportUserId = this.settingsForm.get('supportSysAdminUserId').value;

    //open the user-selection dialog
    //specify organisationId of 0 for sysadmin's
    this.supportUserSelectionDialogComponent.openModal(0, existingSupportUserId);

  }

  cmdSelectAdminSupportUser(configurationOrganisationSettings: IConfigurationOrganisationSettings): void {
    let existingSupportUserId: number;

    //grab the existing user id depending on the selection mode (topLevel = sysAdmin, !topLevel = admin)
    existingSupportUserId = configurationOrganisationSettings.supportAdminUserId;

    //open the user-selection dialog
    //specify organisationId of 0 for sysadmin's
    this.supportUserSelectionDialogComponent.openModal(configurationOrganisationSettings.organisationId, existingSupportUserId);
  }

  supportUserSelectionDialogComponentModalHiddenHandler(): void {
    //get the selected user details
    let selectedSupportUserId: number;
    let selectedSupportUserDisplayName: string;

    if (this.supportUserSelectionDialogComponent.selectedUser) {
      selectedSupportUserId = this.supportUserSelectionDialogComponent.selectedUser.userId;
      selectedSupportUserDisplayName = this.supportUserSelectionDialogComponent.selectedUser.firstName + ' ' + this.supportUserSelectionDialogComponent.selectedUser.lastName;
    } else {
      selectedSupportUserId = 0;
      selectedSupportUserDisplayName = null;
    }

    if(this.supportUserSelectionDialogComponent.organisationId === 0){
      //it was an sysadmin selection
      this.settingsForm.patchValue({
        supportSysAdminUserId: selectedSupportUserId,
        supportSysAdminUserDisplayName: selectedSupportUserDisplayName
      });
      this.settingsForm.get('supportSysAdminUserId').markAsDirty();
    } else {
      //it was an admin selection
      //find the corresponding configurationOrganisationSettings item by org id
      let cosItem: IConfigurationOrganisationSettings = this.configurationSettings.configurationOrganisationSettingsList.find(cos => cos.organisationId === this.supportUserSelectionDialogComponent.organisationId);
      if(cosItem){
        cosItem.supportAdminUserId = selectedSupportUserId;
        cosItem.supportAdminUserDisplayName = selectedSupportUserDisplayName;
      }
      
      this.settingsForm.markAsDirty();
    }
  }

  cmdSave(): void {
    //check if anything was changed, otherwise skip saving
    if (this.settingsForm.dirty && this.settingsForm.valid) {
      //ask user to confirm before changing - to emphasis this section is SERIOUS!!

      if (confirm(`Attention: Are you absolutely, and positively sure that the settings are correct? Incorrect configuration can seriously impare function of TILT Suite.


      Are you sure you want to update the TILT Suite Configuration?`)) {


        //attempt to save configSettings via webService

        //merge form into revised ExportReport object
        let revisedConfigSettings: IConfigurationSettings = Object.assign(<IConfigurationSettings>{}, this.configurationSettings, this.settingsForm.value);

        this.configurationSettingsService.saveConfigurationSettings(revisedConfigSettings).subscribe(() => {
          this.onSaveComplete();
        }, error => alert(`Unexpected error: ${error} (ref cmdSave)`));
      }
    } else if (!this.settingsForm.dirty) {
      this.onSaveComplete();
    }
  }



  cmdCancel(): void {
    this.onSaveComplete();
  }

  private onSaveComplete(): void {
    this.settingsForm.reset(); //clear any validation

    this.router.navigate(["/dashboard"]);
  }
}
