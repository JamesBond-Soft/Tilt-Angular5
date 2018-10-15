import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IMoodleImportSummary, IMoodleMappedCourseModule } from '../moodle-import-summary';

@Component({
  selector: 'import-course-preview',
  templateUrl: './import-course-preview.component.html',
  styles: []
})
export class ImportCoursePreviewComponent implements OnInit {
  @Input() moodleImportSummary: IMoodleImportSummary;
  
  constructor() { }

  ngOnInit() {
  }

  cmdRemoveModule(moodleMappedCourseModule: IMoodleMappedCourseModule): void {
    if(confirm(`Are you sure you do not want to import the module '${moodleMappedCourseModule.courseModule.name}'?`)){
      //remove item from collection
      let courseModuleIndex = this.moodleImportSummary.moodleMappedCourseModules.findIndex(x => x === moodleMappedCourseModule);
      if(courseModuleIndex > -1){
        //found the item
        this.moodleImportSummary.moodleMappedCourseModules.splice(courseModuleIndex, 1);
      } else {
        console.log("Error - could not find existing courseModule item in collection.");
      }
    }
  }

}
