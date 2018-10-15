import { Pipe, PipeTransform } from '@angular/core';
import { IOrganisation } from '../../settings/settings-organisations/organisation';

@Pipe({
  name: 'courseAdhocAssignmentSummaryInfoStatusNamePipe'
})
export class CourseAdhocAssignmentSummaryInfoStatusNamePipe implements PipeTransform {

  transform(status: number): any {
    //convert the statusId into a string
    if(status != undefined && status != null){
      if(status === 0){
        return 'Not Started';
      } else if(status === 1){
        return 'In Progress';
      } else if(status === 2){
        return 'Complete';
      } else if(status === 3){
        return 'Overdue';
      }
    }
    
    return null; //default is to return null
  }
}
