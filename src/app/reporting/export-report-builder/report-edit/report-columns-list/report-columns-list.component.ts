import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { IExportReport } from '../../export-report';
import { IExportReportColumn } from '../../export-report-column';
import { ExportReportService } from '../../export-report.service';
import { ReorderCollectionService } from '../../../../shared/helper-services/reorder-collection.service';

@Component({
  selector: 'export-report-builder-columns-list',
  templateUrl: './report-columns-list.component.html',
  styleUrls: ['./report-columns-list.component.scss']
})
export class ReportColumnsListComponent implements OnInit {

  @Input() exportReport: IExportReport;
  @Output() onItemSelected = new EventEmitter<IExportReportColumn>(); //event to tell parent that editing is finished
  @Input() selectedExportReportColumn: IExportReportColumn;
  @Output() onFinishOrder = new EventEmitter();

  editColumnOrder: boolean;
  
  constructor(private exportReportService: ExportReportService,
              private reorderCollectionService: ReorderCollectionService) { }

  ngOnInit() {
  }

  public cmdAddReportColumn(): void {
    if(this.editColumnOrder) return;
    
    //init a new column!
    let column: IExportReportColumn = this.exportReportService.initExportReportColumn()
    column.order = this.exportReport.exportReportColumns.length;
    this.onItemSelected.emit(column);
  }

  public cmdSelectItem(column: IExportReportColumn): void {
    if(this.editColumnOrder) return;

    this.onItemSelected.emit(column);
  }

  cmdStartEditOrder(): void {
    // flag which enables re-ordering behaviour
    this.editColumnOrder = true;
  }

  cmdFinishEditOrder(): void {
    // save the reordered changes
    this.editColumnOrder = false;
    this.onFinishOrder.emit();
  }

  cmdMoveOrderUp(item: any, event: Event): void {
    //button click to move item backwards in collection
    event.stopPropagation();
    this.reorderCollectionService.moveOrderUp(item, this.exportReport.exportReportColumns);
  }

  cmdMoveOrderDown(item: any, event: Event): void {
    //button click to move item forwards in collection
    event.stopPropagation();
    this.reorderCollectionService.moveOrderDown(item, this.exportReport.exportReportColumns);
  }
}
