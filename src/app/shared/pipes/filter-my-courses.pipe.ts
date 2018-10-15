import { Pipe, PipeTransform } from '@angular/core';
import { ICourseAssignmentInfo } from '../../training/course-assignment-info';
import { CourseSessionStatusNamePipe } from './course-session-status-name.pipe';
import { DatePipe } from '@angular/common';


@Pipe({
  name: 'filterMyCoursesPipe'
})
export class FilterMyCoursesPipe implements PipeTransform {

  constructor(private courseSessionStatusNamePipe: CourseSessionStatusNamePipe, private datePipe: DatePipe){

  }
  
  transform(items: ICourseAssignmentInfo[], searchValue: string): any {
    if (!items) {
      return [];
    }
    if (!searchValue) {
      return items;
    }

    return items.filter(singleItem => {
      let searchStr: string = searchValue.toLowerCase();

      return (singleItem.course.name && singleItem.course.name.toLowerCase().includes(searchStr))
        || (singleItem.dueDate && this.datePipe.transform(singleItem.dueDate).toLowerCase().includes(searchStr))
        || (singleItem.courseSession.status && this.courseSessionStatusNamePipe.transform(singleItem.courseSession.status).toLowerCase().includes(searchStr))
      });
  }
}
