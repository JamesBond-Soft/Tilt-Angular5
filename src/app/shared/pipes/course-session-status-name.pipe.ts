import { Pipe, PipeTransform } from '@angular/core';
import { ICourseSessionStatusType } from '../../training/course-session';

@Pipe({
  name: 'courseSessionStatusNamePipe'
})
export class CourseSessionStatusNamePipe implements PipeTransform {

  transform(courseSesssionStatusType: ICourseSessionStatusType): any {
    //convert the statusId into a string
    if(status != undefined && status != null){
      if(courseSesssionStatusType === ICourseSessionStatusType.NotStarted){
        return 'Pending';
      } else if(courseSesssionStatusType === ICourseSessionStatusType.Underway){
        return 'Underway';
      } else if(courseSesssionStatusType === ICourseSessionStatusType.Completed){
        return 'Completed';
      } else if(courseSesssionStatusType === ICourseSessionStatusType.Cancelled){
        return 'Cancelled'
      }
    }
    
    return null; //default is to return null
  }

}
