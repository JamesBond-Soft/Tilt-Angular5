import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'courseStatusNamePipe'
})
export class CourseStatusNamePipe implements PipeTransform {

  transform(status: number): any {
    //convert the statusId into a string
    if(status != undefined && status != null){
      if(status === 0){
        return 'Pending';
      } else if(status === 1){
        return 'Active';
      } else if(status === 2){
        return 'Inactive';
      } 
    }
    
    return null; //default is to return null
  }
}
