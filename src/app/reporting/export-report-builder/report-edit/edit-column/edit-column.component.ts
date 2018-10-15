import { Component, OnInit, Input, EventEmitter, Output, ViewChildren, ElementRef, OnChanges, AfterViewInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/combineLatest';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { GenericValidator } from '../../../../shared/generic-validator';
import { IExportReportColumn } from '../../export-report-column';
import { IColumnMapping } from '../../column-mapping';
import { ExportReportService } from '../../export-report.service';


@Component({
  selector: 'export-report-builder-edit-column',
  templateUrl: './edit-column.component.html'
})
export class EditColumnComponent implements OnInit, OnChanges, AfterViewInit  {
  pageTitle: string;
  reportColumnForm: FormGroup;
  columnMappings: IColumnMapping[];

  @Input() exportReportColumn: IExportReportColumn;
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @Output() onFinishEditEvent = new EventEmitter<boolean>(); //event to tell parent that editing is finished
  @Output() onDeleteEvent = new EventEmitter<IExportReportColumn>();
  

  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator; 

  constructor(private fb: FormBuilder,
              private exportReportService: ExportReportService) {
    this.validationMessages = {
      name: {
        required: 'Column Name is required.',
      },
      dataColumn: {
        required: 'Column Data Member is required.',
      },
      dataTable: {
        required: 'Column Data Table is required.'
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
    this.initReactiveForm();
   }

  ngOnInit() {
    //do nothing for a change
   this.loadColumnMappings();
  }

  loadColumnMappings(): void {
    this.exportReportService.getColumnMappings().subscribe(columnMappings => this.columnMappings = columnMappings, error => console.log(`Unexpected error ${error} (ref loadColumnMappings)`));
  }

  initReactiveForm(): void {
    this.reportColumnForm = this.fb.group({
      name: ['', Validators.required],
      dataColumn: ['', Validators.required],
      dataTable: ['', Validators.required]
    });
  }
  populateForm(): void {
    //set the pageTitle based on if its a new or existing object
    if(this.exportReportColumn.exportReportColumnId){
      this.pageTitle = 'Edit Existing Column';
    } else {
      this.pageTitle = 'Add New Column';
    }
    
    //update the reactive form
    this.reportColumnForm.patchValue({
      name: this.exportReportColumn.name,
      dataColumn: this.exportReportColumn.dataColumn,
      dataTable: this.exportReportColumn.dataTable
    });
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if(changes['exportReportColumn'] && this.exportReportColumn){
      //the exportReportColumn value changed - trigger updating the populateForm object
      if(this.exportReportColumn){
       this.populateForm();
      } else {
        this.reportColumnForm.reset(); //reset the form because the exportReportColumn doesnt exist
      }
    }
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.reportColumnForm.valueChanges, controlBlurs).debounceTime(250).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.reportColumnForm);
    });
  }

  public cmdSaveReportColumn(): void {
    if (this.reportColumnForm.dirty && this.reportColumnForm.valid) {
      //update the fields of the exportReportColumn object with the values in the reactive form
      this.exportReportColumn.name = this.reportColumnForm.get('name').value;
      this.exportReportColumn.dataColumn = this.reportColumnForm.get('dataColumn').value;
      this.exportReportColumn.dataTable = this.reportColumnForm.get('dataTable').value;
      
      this.onFinishEditEvent.emit(true);
      
    } else if (!this.reportColumnForm.dirty) {
      this.onFinishEditEvent.emit(false);
    }
  }

  public cmdCancelReportColumn(): void {
    this.onFinishEditEvent.emit(false);
  }

  public cmdDeleteReportColumn(): void {
    if(confirm(`Are you sure you want to delete the column '${this.exportReportColumn.name}'?`)){
      //remove it from the collection - not calling web service
      this.onDeleteEvent.emit(this.exportReportColumn);
    }
  }
}
