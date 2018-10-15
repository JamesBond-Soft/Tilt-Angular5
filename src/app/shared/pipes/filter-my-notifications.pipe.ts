import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GenericStatusNamePipe } from './generic-status-name.pipe';
import { INotification } from '../../notifications/notification';

@Pipe({
  name: 'filterMyNotificationsPipe'
})
export class FilterMyNotificationsPipe implements PipeTransform {

  constructor(private datePipe: DatePipe, private genericStatusNamePipe: GenericStatusNamePipe){

  }

  transform(items: INotification[], searchValue: string): any {
    if (!items) {
      return [];
    }
    if (!searchValue) {
      return items;
    }

    let searchStr: string = searchValue.toLowerCase();

    return items.filter(item => {

      return (item.subject && item.subject.toLowerCase().includes(searchStr))
        || (item.sentDate && this.datePipe.transform(item.sentDate).toLowerCase().includes(searchStr))
        || (item.notificationType && this.genericStatusNamePipe.transform(item.notificationType, 'INotificationType').toLowerCase().includes(searchStr))
        || (item.priority && this.genericStatusNamePipe.transform(item.priority, 'Priority').toLowerCase().includes(searchStr))
     });
  }

}
