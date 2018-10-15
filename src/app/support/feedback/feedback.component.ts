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

import { GenericValidator } from "../../shared/generic-validator";
import { ITicket, ITicketStatusType, ITicketType, ITicketResolutionType } from "../ticket";
import { SupportService } from "../support.service";
import { ITicketNote } from "../ticket-note";
import { LoginService, RoleType } from "../../login/login.service";
import { ConfigurationSettingsService } from "../../settings/settings-configuration/configuration-settings.service";
import { tick } from "@angular/core/testing";

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  feedbackForm: FormGroup;
  pageTitle: string = 'Feedback';
  showThanks: boolean = false;
  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private router: Router,
              private fb: FormBuilder,
              private supportService: SupportService,
              private loginService: LoginService,
              private configurationSettingsService: ConfigurationSettingsService) {

      this.validationMessages = {
        title: {
          required: "Title is required."
        },
        comment: {
          // required: "Comment is required"
        }
      };
  
      this.genericValidator = new GenericValidator(this.validationMessages);
     }

  ngOnInit() {
    this.initForm();
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements.map(
      (formControl: ElementRef) =>
        Observable.fromEvent(formControl.nativeElement, "blur")
    );

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.feedbackForm.valueChanges, ...controlBlurs)
      .debounceTime(250)
      .subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(
          this.feedbackForm
        );
      });
  }

  private mergeFormValuesIntoTicketObject(origTicketObj: ITicket): ITicket {
    //merge reactive form into object
    let revisedTicket: ITicket = Object.assign({}, origTicketObj, this.feedbackForm.value);

    return revisedTicket;
  }

  initForm(): void {
    this.feedbackForm = this.fb.group({
      title: ["", Validators.required],
      description: [""]
    });
  }

  cmdSave(): void {
    if (this.feedbackForm.dirty && this.feedbackForm.valid) {
      //attempt to save feedback via webService

      //create a new ticket 
      let ticket = this.supportService.initTicket();
      ticket.ticketType = ITicketType.Feedback;
      ticket.title = this.feedbackForm.get('title').value;
      ticket.description = this.feedbackForm.get('description').value;

      if(this.loginService.currentUser && this.loginService.currentUser.userId){
        ticket.reportedByUserId = this.loginService.currentUser.userId;

        if(this.loginService.currentUser.organisationId){
          ticket.organisationId = this.loginService.currentUser.organisationId;
        }
      }

      this.supportService.saveTicket(ticket).subscribe(() => {
        this.onSaveComplete();
      }, 
        error => {
          console.log(`There was an unexpected error: ${error} (ref cmdSave - feedback)`);
          this.onSaveComplete();
        }
      );

    } else if (!this.feedbackForm.dirty) {
      this.onSaveComplete();
    }
  }

  private onSaveComplete(takeBacktoCourseList: boolean = false): void {
    this.feedbackForm.reset(); //clear any validation
    this.showThanks = true;
  }

  cmdReturn(direction: string){
    if(direction === 'home'){
      //unauthenticated user - take back to home page
      this.router.navigate(["/"]);
    } else if(direction === 'dashboard'){
      if(this.loginService.currentUser){
        //redirect user back to dashboard
        this.router.navigate(["/dashboard"]);
      } else {
        //unauthenticated user - take back to home page
        this.router.navigate(["/"]);
      }
    }
  }

  isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }
}
