import { Pipe, PipeTransform } from '@angular/core';
import { IUser } from './user';

@Pipe({
  name: 'filterUser'
})
export class FilterUserPipe implements PipeTransform {

  transform(items: IUser[], searchValue: string): any {
    if (!items) {
      return [];
    }
    if (!searchValue) {
      return items;
    }

    return items.filter(singleItem => {
      let searchStr: string = searchValue.toLowerCase();

      return (singleItem.username && singleItem.username.toLowerCase().includes(searchStr))
        || (singleItem.firstName && singleItem.firstName.toLowerCase().includes(searchStr))
        || (singleItem.lastName && singleItem.lastName.toLowerCase().includes(searchStr))
        || (singleItem.email && singleItem.email.toLowerCase().includes(searchStr))
      });
  }
}
