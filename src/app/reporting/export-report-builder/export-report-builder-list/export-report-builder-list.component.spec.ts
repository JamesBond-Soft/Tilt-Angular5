import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExportReportBuilderListComponent } from './export-report-builder-list.component';
import { UtilityModule } from '../../../shared/utility.module';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExportReportService } from '../export-report.service';

describe('ExportReportBuilderListComponent', () => {
  let component: ExportReportBuilderListComponent;
  let fixture: ComponentFixture<ExportReportBuilderListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        UtilityModule],
      declarations: [ ExportReportBuilderListComponent ],
      providers:[ExportReportService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportReportBuilderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
