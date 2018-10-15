import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExportReportService } from '../export-report.service';
import { IExportReport, IExportReportOrganisation, IExportReportStatusType } from '../export-report';
import { IExportReportColumn } from '../export-report-column';
import { IOrganisation } from '../../../settings/settings-organisations/organisation';

@Component({
  templateUrl: './export-report-builder-list.component.html',
  styleUrls: ['./export-report-builder-list.component.scss']
})
export class ExportReportBuilderListComponent implements OnInit {
  IExportReportStatusType = IExportReportStatusType;
  pageTitle: string = "Export Report Builder";
  exportReports: IExportReport[];
  orgs: IOrganisation[];
  
  constructor(private router: Router,
              private route: ActivatedRoute,
              private exportReportService: ExportReportService) { }

  ngOnInit() {
    this.loadOrganisations();
  }

  loadOrganisations(): void {
    this.route.data.subscribe(data => {
      this.orgs = data['orgs'];

      //load the exportReports now
      this.loadExportReports();
    });
  }

  private loadExportReports(): void {
    this.exportReportService.getExportReports().subscribe(exportReports => {
      this.exportReports = exportReports;
    }, error => console.log(`Unexpected error: ${error} (ref loadExportReports)`));
  }

  public cmdAddExportReport(): void {
    this.router.navigate(['reporting/export-report-builder', 0]);
  }

  public cmdEditReportColumn(event: Event, exportReport: IExportReport): void {
    event.stopPropagation();
    this.router.navigate(['reporting/export-report-builder', exportReport.exportReportId]);
  }

}
