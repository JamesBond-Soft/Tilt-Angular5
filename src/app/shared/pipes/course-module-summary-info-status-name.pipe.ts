import { Pipe, PipeTransform } from '@angular/core';
import { IOrganisation } from '../../settings/settings-organisations/organisation';

@Pipe({
  name: 'courseModuleSummaryInfoStatusNamePipe'
})
export class CourseModuleSummaryInfoStatusNamePipe implements PipeTransform {

  transform(status: number): any {
    //convert the statusId into a string
    if(status != undefined && status != null){
      if(status === 0){
        return 'Inactive';
      } else if(status === 1){
        return 'Active';
      } else if(status === 2){
        return 'Draft';
      }
    }
    
    return null; //default is to return null
  }
}
