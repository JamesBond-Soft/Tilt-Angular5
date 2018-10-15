import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GenericStatusNamePipe } from './generic-status-name.pipe';
import { INotificationBatch } from '../../notifications/notification-batch';


@Pipe({
  name: 'filterNotificationsPipe'
})
export class FilterNotificationsPipe implements PipeTransform {

  constructor(private datePipe: DatePipe, private genericStatusNamePipe: GenericStatusNamePipe){

  }
  
  transform(items: INotificationBatch[], searchValue: string): any {
    if (!items) {
      return [];
    }
    if (!searchValue) {
      return items;
    }

    return items.filter(item => {
      let searchStr: string = searchValue.toLowerCase();

      return (item.subject && item.subject.toLowerCase().includes(searchStr))
        || (item.scheduledDate && this.datePipe.transform(item.scheduledDate).toLowerCase().includes(searchStr))
        || (item.notificationType && this.genericStatusNamePipe.transform(item.notificationType, 'INotificationType').toLowerCase().includes(searchStr))
        || (item.priority && this.genericStatusNamePipe.transform(item.priority, 'Priority').toLowerCase().includes(searchStr))
      });
  }
}
