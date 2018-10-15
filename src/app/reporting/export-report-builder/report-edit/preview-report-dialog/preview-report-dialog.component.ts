import { Component, OnInit, TemplateRef, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PapaParseService, PapaParseResult } from 'ngx-papaparse';
import { ExportReportService } from '../../export-report.service';
import { IExportReport } from '../../export-report';

@Component({
  selector: 'preview-report-dialog',
  templateUrl: './preview-report-dialog.component.html'
})
export class PreviewReportDialogComponent implements OnInit {
  @ViewChild('previewReportDialogTemplate') previewReportDialogTemplate: TemplateRef<any>;
  modalRef: BsModalRef;
  csvResults: PapaParseResult;
  showError: boolean;
  showLoading: boolean;
  constructor(private bsModalRef: BsModalRef, 
              private modalService: BsModalService,
              private papaParseService: PapaParseService,
              private exportReportService: ExportReportService) { }

  ngOnInit() {
    
  }

  generatePreviewCSV(exportReport: IExportReport): void {
    this.exportReportService.generatePreviewReport(exportReport).subscribe(csv => {
      this.showLoading = false;

      if(csv){
        this.papaParseService.parse(csv, {
          skipEmptyLines: true,
          complete: (results, file) => {
            if(!results.errors.length || results.data.length){
              this.csvResults = results;
            } else {
              this.showError = true;
            }
            
          //  console.log('Parsed:', results, file);
          }
        });
      }
      //console.log(`csv: ${csv}`);
    }, error => {
      console.log(`Unexpected error: ${error} (ref generatePreviewCSV)`)
      this.showError = true;
      this.showLoading = false;
    });
  }

  openModal(exportReport: IExportReport) {
    this.showLoading = true;
    this.generatePreviewCSV(exportReport);
    this.modalRef = this.modalService.show(this.previewReportDialogTemplate, {class: 'modal-lg'});
  }

  cmdClose() {
    this.modalRef.hide();
    this.csvResults = null;
    this.showError = false;
    this.showLoading = false;
  }

}
