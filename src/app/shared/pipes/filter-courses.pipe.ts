import { Pipe, PipeTransform } from '@angular/core';
import { ICourse } from '../../courses/manage-courses/course';

@Pipe({
  name: 'filterCourses'
})
export class FilterCoursesPipe implements PipeTransform {

  transform(items: ICourse[], searchValue: string): any {
    if (!items) {
      return [];
    }
    if (!searchValue) {
      return items;
    }

    return items.filter(singleItem => {
      let searchStr: string = searchValue.toLowerCase();

      return (singleItem.name && singleItem.name.toLowerCase().includes(searchStr))
        || (singleItem.description && singleItem.description.toLowerCase().includes(searchStr))
      });
  }

}
