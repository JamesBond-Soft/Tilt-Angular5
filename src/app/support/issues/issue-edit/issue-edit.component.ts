import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  ElementRef,
  Input,
  ChangeDetectorRef,
  ViewChild
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn,
  FormArray,
  FormControlName,
  FormControl
} from "@angular/forms";

import "rxjs/add/operator/debounceTime";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/merge";
import 'rxjs/add/operator/map';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";

import { GenericValidator } from "../../../shared/generic-validator";
import { IOrganisation } from "../../../settings/settings-organisations/organisation";
import { ITicket, ITicketStatusType, ITicketType, ITicketResolutionType } from "../../ticket";
import { SupportService } from "../../support.service";
import { ITicketNote } from "../../ticket-note";
import { LoginService, RoleType } from "../../../login/login.service";
import { BsDropdownDirective } from "ngx-bootstrap";
import { ConfigurationSettingsService } from "../../../settings/settings-configuration/configuration-settings.service";
import { IConfigurationSettings } from "../../../settings/settings-configuration/configuration-settings";
import { IConfigurationOrganisationSettings } from "../../../settings/settings-configuration/configuration-organisation-settings";

@Component({
  templateUrl: './issue-edit.component.html',
  styleUrls: ['./issue-edit.component.scss']
})
export class IssueEditComponent implements OnInit, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  pageTitle: string;
  issueForm: FormGroup;
  ticket: ITicket;
  organisations: IOrganisation[];
  ITicketStatusType = ITicketStatusType;
  ITicketType = ITicketType;
  ITicketResolutionType = ITicketResolutionType;
  configurationSettings: IConfigurationSettings;
  configurationOrganisationSettings: IConfigurationOrganisationSettings;
  canEscalateTicket: boolean;
  canChangeStatus: boolean;
  canDeEscalateTicket: boolean;

  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private supportService: SupportService,
    private loginService: LoginService,
    private configurationSettingsService: ConfigurationSettingsService
  ) {

    this.validationMessages = {
      title: {
        required: "Title is required."
      },
      organisationId: {
        //required: "Organisation is required."
      },
      comment: {
        // required: "Comment is required"
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.initForm();

    this.loadConfigurationSettings();
  }
  initForm(): void {
    this.issueForm = this.fb.group({
      title: ["", Validators.required],
      description: [""],
      organisationId: [""],
      status: ["0", Validators.required],
      ticketType: ["", Validators.required],
      ticketResolution: [""],
      ticketNotesForm: this.fb.group({
        comment: [""]
      })
    });
  }

  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.organisations = data["orgs"];

      //load the courses now
      this.loadTicket();
    });
  }

  loadConfigurationSettings(): void {
    this.configurationSettingsService.getConfigurationSettings().subscribe(configurationSettings => {
      this.configurationSettings = configurationSettings;

      //attempt to find the user's current organisation configuration
      this.configurationOrganisationSettings = this.configurationSettings.configurationOrganisationSettingsList.find(cos => cos.organisationId === this.loginService.currentUser.organisationId);

      this.loadOrganisations();

    },
      error => console.log(`Unexpected error ${error} (ref loadConfigurationSettings)`))
  }

  loadTicket(): void {
    this.route.paramMap.subscribe(params => {
      if (params.has("ticketId")) {
        if (+params.get("ticketId") === 0) {
          this.pageTitle = "Add New Ticket";
          this.ticket = this.supportService.initTicket();
          this.ticket.reportedByUserId = this.loginService.currentUser.userId;
          this.ticket.reportedByUserDisplayName = this.loginService.currentUser.displayName;

          //set the org id to the current user's organisation id if it's present
          if(this.loginService.currentUser.organisationId){
            this.ticket.organisationId = this.loginService.currentUser.organisationId;
          } else {
            this.ticket.organisationId = 0;
          }


          this.loadForm();
        } else {
          this.pageTitle = "Update Ticket";
          this.supportService.getTicket(+params.get("ticketId")).subscribe(ticket => {
            this.ticket = ticket;
            this.loadForm();
          }, error => {
            console.log(`Unexpected error ${error} (ref loadTicket)`)
            this.router.navigate(["/support/issues"]);
          });
        }


        



      } else {
        console.log("Warning - could not find ticketId in route. Returning user to issues list");
        this.router.navigate(["/support/issues"]);
      }
    });
  }

  loadForm(): void {
    if (this.issueForm) {
      this.issueForm.reset();
    }

    this.issueForm.patchValue({
      title: this.ticket.title, //keep names same
      description: this.ticket.description,
      status: this.ticket.status,
      ticketType: this.ticket.ticketType,
      ticketResolution: this.ticket.ticketResolution,
      organisationId: this.ticket.organisationId
    });

    this.setButtonPermissions();
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements.map(
      (formControl: ElementRef) =>
        Observable.fromEvent(formControl.nativeElement, "blur")
    );

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.issueForm.valueChanges, ...controlBlurs)
      .debounceTime(250)
      .subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(
          this.issueForm
        );
      });
  }

  private mergeFormValuesIntoTicketObject(origTicketObj: ITicket): ITicket {
    //merge reactive form into object
    let revisedTicket: ITicket = Object.assign({}, origTicketObj, this.issueForm.value);

    return revisedTicket;
  }

  cmdSave(): void {

    if (this.issueForm.dirty && this.issueForm.valid) {
      //attempt to save exportReport via webService

      //merge form into revised ExportReport object
      let revisedTicket: ITicket = this.mergeFormValuesIntoTicketObject(this.ticket);

      //set the assigned value if it's not already defined
      if(!+revisedTicket.assignedUserId){
        if(!+revisedTicket.organisationId){
          //no organisation, so assign to sysadmin
          revisedTicket.assignedUserId = +this.configurationSettings.supportSysAdminUserId;
        } else {
          //ticket is for a particular organisation, so lets try to find if there is a specific configuration for that organisation
          let ticketOrgConfig = this.configurationSettings.configurationOrganisationSettingsList.find(cos => cos.organisationId === +revisedTicket.organisationId);
          if(ticketOrgConfig && +ticketOrgConfig.supportAdminUserId){
            //we have found the configuration and admin user for that organisation - assign ticket to them
            revisedTicket.assignedUserId = +ticketOrgConfig.supportAdminUserId;
          } else {
            //couldn't find config or the admin user is not defined for the org, so set it to the sysadmin
            revisedTicket.assignedUserId = +this.configurationSettings.supportSysAdminUserId;
          }
        }
      }
      

      this.supportService.saveTicket(revisedTicket).subscribe(() => {
        this.onSaveComplete();
      }, error => alert(`Unexpected error: ${error} (ref cmdSave)`));

    } else if (!this.issueForm.dirty) {
      this.onSaveComplete();
    }
  }

  cmdDelete(): void {
    if (this.ticket.ticketId <= 0) return; //basic validator in-case any user is trying to be clever...

    if (confirm(`Are you sure you want to delete the Ticket: '${this.ticket.title}'?\r\nNote tickets should normally be closed rather than deleted.`)) {
      //call service to delete org
      this.supportService.deleteTicket(this.ticket.ticketId)
        .subscribe(() => this.onSaveComplete(true),
          (error: any) => alert(`'Attention: ${error}`));
    }
  }

  cmdCancel(): void {
    //do nothing - go back to the manage courses screen
    this.onSaveComplete();
  }

  private onSaveComplete(takeBacktoCourseList: boolean = false): void {
    this.issueForm.reset(); //clear any validation

    if(this.loginService.getUserRoleType() === RoleType.Staff){
      this.router.navigate(["/dashboard"]);
    } else {
      this.router.navigate(["/support/issues"]);
    }
    
  }

  cmdAddTicketNote(): void {
    if (this.issueForm.get('ticketNotesForm.comment').value) {
      // let ticketNote: ITicketNote = this.supportService.initTicketNode();
      // ticketNote.comment = this.issueForm.get('ticketNotesForm.comment').value;
      // if(!this.loginService.currentUser){
      //   ticketNote.createdByUserDisplayName = 'Unknown';
      // } else {
      //   ticketNote.createdByUserDisplayName = this.loginService.currentUser.displayName;
      // }

      // ticketNote.createdDate = new Date();
      // this.ticket.ticketNotes.push(ticketNote);
      this.addTicketNote(this.issueForm.get('ticketNotesForm.comment').value);
      this.issueForm.get('ticketNotesForm').reset();
      this.issueForm.markAsDirty();
    }
  }

  cmdChangeStatus(event: Event, status: ITicketStatusType, dropdown: BsDropdownDirective): void {
    event.stopPropagation();
    this.ticket.status = status;

    this.issueForm.patchValue({
      status: status
    });

    this.addTicketNote(`Status changed to ${ITicketStatusType[status]}`);

    if (status !== ITicketStatusType.Closed && this.ticket.ticketResolution !== null) {
      this.ticket.ticketResolution = null;
      this.issueForm.patchValue({
        ticketResolution: null
      });
      this.addTicketNote(`Ticket Resolution cleared`);
    }

    this.issueForm.markAsDirty();
    dropdown.hide();
  }

  private setButtonPermissions(): void {
    this.canEscalateTicket = false; //default
    this.canChangeStatus = false; //default
    this.canDeEscalateTicket = false; //default

    //sysadmin - always has permission to do anything
    //admin - can escalate ticket if it's still assigned to them
    //      - can change status only if ticket is assigned to them
    //      - can always add notes to ticket even if it's assigned to sysadmin

    let currentUserId: number = this.loginService.currentUser.userId;
    let currentUserRole: RoleType = this.loginService.getUserRoleType();

    let isSupportSysadmin: boolean = currentUserId === this.configurationSettings.supportSysAdminUserId && currentUserRole === RoleType.Sysadmin;
    let isSupportAdmin: boolean = false;
    if(!isSupportSysadmin){
      //not a sysadmin, so check if the user is THE supportadmin of the org
      if(this.configurationOrganisationSettings){
        //we have settings specific to this organisation (of current user)
        if(currentUserId === this.configurationOrganisationSettings.supportAdminUserId){
          //yes this is the supportAdmin user
          isSupportAdmin = true;
        }
      }
    }

    if(isSupportSysadmin){
      this.canChangeStatus = true;
      if(this.ticket.assignedUserId !== currentUserId){
        this.canEscalateTicket = true;
      } else {
        this.canDeEscalateTicket = +this.issueForm.get('organisationId').value > 0;
      }
    } else if(isSupportAdmin){
      //if ticket is currently assigned to the user - then they can change status & escalate
      if(this.ticket.assignedUserId === currentUserId || !this.ticket.assignedUserId){
        this.canChangeStatus = true;
        this.canEscalateTicket = true;
      } 
    }
  }

  cmdChangeTicketResolution(event: Event, ticketResolution: ITicketResolutionType, dropdown: BsDropdownDirective): void {
    event.stopPropagation();
    this.ticket.ticketResolution = ticketResolution;

    this.issueForm.patchValue({
      ticketResolution: ticketResolution
    });

    if (ticketResolution != null) {
      this.addTicketNote(`Ticket Resolution changed to ${ITicketResolutionType[ticketResolution]}`);
    } else {
      this.addTicketNote(`Ticket Resolution cleared`);
    }

    this.issueForm.markAsDirty();
    dropdown.hide();
  }

  private addTicketNote(comment: string): ITicketNote {
    let ticketNote: ITicketNote = this.supportService.initTicketNode();
    ticketNote.comment = comment;//this.issueForm.get('ticketNotesForm.comment').value;
    if (!this.loginService.currentUser) {
      ticketNote.createdByUserDisplayName = 'Unknown';
    } else {
      ticketNote.createdByUserDisplayName = this.loginService.currentUser.displayName;
    }

    ticketNote.createdDate = new Date();
    this.ticket.ticketNotes.push(ticketNote);

    return ticketNote;
  }

  cmdEscalateTicket(): void {
    if (confirm('Are you sure you want to assign the ticket to the System Administrator?')) {
      //reassign-ticket to sysadmin based on settings
      this.canEscalateTicket = false; //hide the escalate button
      this.canChangeStatus = false;

      //set the status to assign
      let status: ITicketStatusType = ITicketStatusType.Assigned;
      this.ticket.status = status;

      this.issueForm.patchValue({
        status: status
      });

      this.addTicketNote(`Status changed to ${ITicketStatusType[status]}`);

      if (status.valueOf() !== ITicketStatusType.Closed.valueOf() && this.ticket.ticketResolution !== null) {
        this.ticket.ticketResolution = null;
        this.issueForm.patchValue({
          ticketResolution: null
        });
        this.addTicketNote(`Ticket Resolution cleared`);
      }

      this.issueForm.markAsDirty();

      this.ticket.assignedUserId = this.configurationSettings.supportSysAdminUserId;
      this.ticket.assignedUserDisplayName = this.configurationSettings.supportSysAdminUserDisplayName;
      this.addTicketNote(`Ticket assigned to ${this.configurationSettings.supportSysAdminUserDisplayName}`);
    }
  }

  cmdDeEscalateTicket(): void {
    //find the tickets organisationId and relavent config settings
    let orgId = +this.issueForm.get('organisationId').value;
    let ticketOrgConfig : IConfigurationOrganisationSettings;
    if(orgId){
      //find the org config settings
      ticketOrgConfig = this.configurationSettings.configurationOrganisationSettingsList.find(cos => cos.organisationId === orgId);
    } else {
      //ticket has no org
      console.log("Warning - ticket is not assigned to any organisation - cannot assign to an admin");
      return;
    }

    if(!ticketOrgConfig){
      alert("Attention - there can been an unexpected error. Please log out and try again. (ref cmdDeEscalateTicket)");
      console.log('Error - could not find relavent configurationOrganisationSettings');
      return;
    }


    if (confirm(`Are you sure you want to assign the ticket to ${ticketOrgConfig.supportAdminUserDisplayName}?`)) {
      //reassign-ticket to to organisation administration based on org settings
      this.canEscalateTicket = false; //hide the escalate button
      this.canDeEscalateTicket = false;
      this.canChangeStatus = true;

      //set the status to assign
      let status: ITicketStatusType = ITicketStatusType.Assigned;
      this.ticket.status = status;

      this.issueForm.patchValue({
        status: status
      });

      this.addTicketNote(`Status changed to ${ITicketStatusType[status]}`);

      if (status.valueOf() !== ITicketStatusType.Closed.valueOf() && this.ticket.ticketResolution !== null) {
        this.ticket.ticketResolution = null;
        this.issueForm.patchValue({
          ticketResolution: null
        });
        this.addTicketNote(`Ticket Resolution cleared`);
      }

      this.issueForm.markAsDirty();

      this.ticket.assignedUserId = ticketOrgConfig.supportAdminUserId;
      this.ticket.assignedUserDisplayName = ticketOrgConfig.supportAdminUserDisplayName;
      this.addTicketNote(`Ticket assigned to ${ticketOrgConfig.supportAdminUserDisplayName}`);
    }
  }

}
