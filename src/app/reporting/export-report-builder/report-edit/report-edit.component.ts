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
import { IExportReport, IExportReportOrganisation, IExportReportStatusType } from "../export-report";
import { ExportReportService } from "../export-report.service";
import { IExportReportColumn } from "../export-report-column";
import { PreviewReportDialogComponent } from "./preview-report-dialog/preview-report-dialog.component";

function minLengthArray(min: number) {
  return (c: AbstractControl): {[key: string]: any} => {
      if (c.value.length >= min){
        if(c.value.findIndex(v => v === true) >= 0){
          return null;
        }
      }
        

      return { 'minLengthArray': {valid: false }};
  }
}

@Component({
  templateUrl: "./report-edit.component.html",
  styleUrls: ["./report-edit.component.scss"]
})
export class ReportEditComponent implements OnInit, AfterViewInit {
  selectedExportReportColumn: IExportReportColumn;
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('previewReportDialogComponent') previewReportDialogComponent: PreviewReportDialogComponent;
  
  pageTitle: string;
  reportForm: FormGroup;
  orgFormArray: FormArray;
  organisations: IOrganisation[];
  reportColumns: (any)[];
  exportReport: IExportReport;
  IExportReportStatusType = IExportReportStatusType;

  // Use with the generic validation message class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  showEditColumnSection: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private exportReportService: ExportReportService
    ) {
    this.validationMessages = {
      name: {
        required: "Report Name is required."
      },
      organisations: {
        minLengthArray: "At least one Organisation is required"
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {

   

    this.loadOrganisations();
  }

  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.organisations = data["orgs"];

      this.orgFormArray = new FormArray(this.organisations.map(org => {
        return new FormControl(false);
      }), minLengthArray(1));
      
       //create an org formArray
    this.reportForm = this.fb.group({
      name: ["", Validators.required],
      description: [""],
      extRefReportNum: [""],
      organisations: this.orgFormArray,
      status: ["0", Validators.required]
    });

      //load the courses now
      this.loadExportReport();
    });
  }

  loadExportReport(): void {
    this.route.paramMap.subscribe(params => {
      if (params.has("exportReportId")) {
        if (+params.get("exportReportId") === 0) {
          this.pageTitle = "Add New Report";
          this.exportReport = this.exportReportService.initExportReport();
          this.loadForm();
        } else {
          this.pageTitle = "Edit Existing Report";
          this.exportReportService.getExportReport(+params.get("exportReportId")).subscribe(exportReport => {
            exportReport.exportReportColumns = this.exportReportService.sortExportReportColumns(exportReport.exportReportColumns);
            this.exportReport = exportReport;
            this.loadForm();
          }, error => {
            console.log(`Unexpected error ${error} (ref loadExportReport)`)
            this.router.navigate(["/reporting/export-report-builder"]);    
          });
        }
      } else {
        console.log("Warning - could not find reportId in route. Returning user to export-report-builder-list");
        this.router.navigate(["/reporting/export-report-builder"]);
      }
    });
  }

  loadForm(): void {
    if (this.reportForm) {
      this.reportForm.reset();
    }

    this.reportForm.patchValue({
       name: this.exportReport.name, //keep names same
       description: this.exportReport.description,
       extRefCourseNum: this.exportReport.extRefReportNum,
       status: this.exportReport.status,
      // organisations: [true,true,true]
        organisations: this.organisations.map((org, i) => 
         this.exportReport.exportReportOrganisations.findIndex(o => o.organisationId === org.organisationId) > -1
        )
    });
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements.map(
      (formControl: ElementRef) =>
        Observable.fromEvent(formControl.nativeElement, "blur")
    );

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.reportForm.valueChanges, ...controlBlurs)
      .debounceTime(250)
      .subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(
          this.reportForm
        );
      });
  }

  cmdSave(): void {
    // if(this.selectedCourseCategory && this.course.courseCategoryId != this.selectedCourseCategory.courseCategoryId){
    //   //course category has changed
    //   this.course.courseCategoryId = this.selectedCourseCategory.courseCategoryId;
    //   this.courseForm.markAsDirty();
    // } else if(!this.selectedCourseCategory && this.course.courseCategoryId){
    //   //course category was changed to null
    //   this.course.courseCategoryId = null;
    //   this.courseForm.markAsDirty();
    // }

    if (this.reportForm.dirty && this.reportForm.valid) {
      //attempt to save exportReport via webService

      //merge form into revised ExportReport object
      let revisedExportReport: IExportReport = this.mergeFormValuesIntoExportReportObject(this.exportReport);

      this.exportReportService.saveExportReport(revisedExportReport).subscribe(() => {
        this.onSaveComplete();
      }, error => alert(`Unexpected error: ${error} (ref cmdSave)`));
      
    } else if (!this.reportForm.dirty) {
      this.onSaveComplete();
    }
  }

  cmdDelete(): void {
    if(this.exportReport.exportReportId <= 0) return; //basic validator in-case any user is trying to be clever...

    if (confirm(`Are you sure you want to delete the Report: '${this.exportReport.name}'?`)) {
      //call service to delete org
      this.exportReportService.deleteExportReport(this.exportReport.exportReportId)
            .subscribe(() => this.onSaveComplete(true),
            (error: any) => alert(`'Attention: ${error}`));
    }
  }

  cmdCancel(): void {
    //do nothing - go back to the manage courses screen
    this.onSaveComplete();
  }

  private onSaveComplete(takeBacktoCourseList: boolean = false): void {
    this.reportForm.reset(); //clear any validation

    this.router.navigate(["/reporting/export-report-builder"]);
  }

  private buildExportReportOrganisationList(exportReport: IExportReport): IExportReportOrganisation[] {
    //this method processes the checked organisation selection and updates (in memory ONLY) the exportReportOrganisation array that is inside the exportReport object.
    
    //get selected values (org array)
    let selectedOrganisations: IOrganisation[] = this.convertToValue('organisations');
    
    //make a copy of the exportReportOrganisations object that is in the passed exportReport
    let exportReportOrganisations: IExportReportOrganisation[] = Object.assign(<IExportReportOrganisation[]>[], this.exportReport.exportReportOrganisations);

    //remove any existing orgs that are not present in selection
    exportReportOrganisations = exportReportOrganisations.filter(ero => selectedOrganisations.findIndex(so => so.organisationId === ero.organisationId) >= 0);

    //add any new selected orgs that are not already present
    selectedOrganisations.forEach(org => {
      if(exportReportOrganisations.findIndex(ero => ero.organisationId === org.organisationId) <= -1){
        //couldn't find org, add it to the exportReportOrganisations array
        exportReportOrganisations.push({exportReportId: 0, organisationId: org.organisationId});
      }
    });

    return exportReportOrganisations;
  }

  private mergeFormValuesIntoExportReportObject(origExportReportObj: IExportReport): IExportReport {
    //merge reactive form into object
    let revisedExportReport: IExportReport = Object.assign({}, origExportReportObj, this.reportForm.value);

    //clear the organisations object as it is a FormArray that is NOT part of the IExportReport
    if(revisedExportReport['organisation']){
      revisedExportReport['organisations'] = null;
    }

    //build the exportReportOrganisations array and assign it to the new revisedExportReport
    revisedExportReport.exportReportOrganisations = this.buildExportReportOrganisationList(revisedExportReport);

    return revisedExportReport;
  }

  private convertToValue(key: string) {
    return this.reportForm.value[key].map((x, i) => x && this[key][i]).filter(x => !!x);
  }

  public cmdPreview(event: Event): void {
    this.previewReportDialogComponent.openModal(this.mergeFormValuesIntoExportReportObject(this.exportReport));
    //alert("stub - should open a basic dialog with a dummy report");
  }

  public onColumnItemSelectedEventHandler(column: IExportReportColumn) {
    this.showEditColumnSection = true;
    this.selectedExportReportColumn = column;
  }

  onFinishEditEventHandler(shouldRefreshColumns: boolean) {
    //check if the selectedExportColumn is in the column array - if not its because it was an add new column, so add it
    if(!this.exportReport.exportReportColumns.find(erc => erc === this.selectedExportReportColumn)){
      this.exportReport.exportReportColumns.push(this.selectedExportReportColumn);
    }

    this.selectedExportReportColumn = null;
    this.showEditColumnSection = false;

    if(shouldRefreshColumns){
      //mark the reportForm as dirty as something changed
      this.reportForm.markAsDirty();
    }
  }

  onDeleteEventHandler(exportReportColumn: IExportReportColumn): void {
    if(!exportReportColumn) return; //failsafe

    //remove the exportReportColumn from the collection - dont delete via WebService
    //find index of object in collection

    let columnIndex: number = this.exportReport.exportReportColumns.findIndex(erc => erc == exportReportColumn);
    if(columnIndex >= 0){
      //validation - failsafe in case we cannot find the column
      this.exportReport.exportReportColumns.splice(columnIndex, 1);
    } else {
      console.log('Unexpected error - could not find exportReportColumn in collection (ref onDeleteEventHandler)'); //should never happen!
    }
    this.selectedExportReportColumn = null;
    this.showEditColumnSection = false;
    this.reportForm.markAsDirty();
  }

  onFinishOrderHandler(): void {
    //the columns may have been reordered - mark the form as dirty
    this.reportForm.markAsDirty();
  }
}
