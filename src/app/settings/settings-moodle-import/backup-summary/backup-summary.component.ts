import { Component, OnInit, Input } from '@angular/core';
import { IMoodleImportSummary } from '../moodle-import-summary';

@Component({
  selector: 'backup-summary',
  templateUrl: './backup-summary.component.html'
})
export class BackupSummaryComponent implements OnInit {
  @Input() moodleImportSummary: IMoodleImportSummary;

  constructor() { }

  ngOnInit() {
  }

}
