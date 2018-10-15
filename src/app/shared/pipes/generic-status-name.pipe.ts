import { Pipe, PipeTransform } from '@angular/core';
import { ITicketStatusType, ITicketType } from '../../support/ticket';
import { INotificationType } from '../../notifications/notification';
import { IWebinarStatus, IWebinarNotificationType } from '../../webinar/webinar';

@Pipe({
  name: 'genericStatusNamePipe'
})
export class GenericStatusNamePipe implements PipeTransform {
  //generic pipe that can be extended for simple status enums to string instead of lots of custom instantiated ones that are nearly identical
  transform(status: number, objectType: string): any {
    switch (objectType) {
      case 'IExportReportStatusType': {
        if(status != undefined && status != null){
          if(status === 0){
            return 'Pending';
          } else if(status === 1){
            return 'Active';
          } else if(status === 2){
            return 'Archived';
          } 
        }
        break;
      }
      case 'ITicketStatusType': {
        if(status === ITicketStatusType.Open){
          return 'Open';
        } else if(status === ITicketStatusType.Assigned){
          return 'Assigned';
        } else if(status === ITicketStatusType.Underway){
          return 'Underway';
        } else if(status === ITicketStatusType.Closed) {
          return 'Closed';
        }
        break;
      }
      case 'ITicketType': {
        if(status === ITicketType.Feedback){
          return 'Feedback';
        } else if(status === ITicketType.Issue){
          return 'Issue';
        } else if(status === ITicketType.Other){
          return'Other';
        } 
        break;
      }
      case 'IWebinarStatus': {
        if ( status === IWebinarStatus.LIVE) {
          return 'Live now';
        } else if ( status === IWebinarStatus.SCHEDULED) {
          return 'Scheduled';
        } else if ( status === IWebinarStatus.COMPLETED) {
          return 'Completed';
        } else if ( status === IWebinarStatus.STARTING) {
          return 'Starting';
        }
      }
      case 'INotificationType': {
        if(status === INotificationType.Email){
          return 'Email';
        } else if(status === INotificationType.Push){
          return 'App Push Notification';
        } else if(status === INotificationType.Silent){
          return 'Silent';
        }
        break; 
      } 
      case 'IWebinarNotificationType' : {
         if(status === IWebinarNotificationType.NO) {
           return 'NO';
         } else if (status === IWebinarNotificationType.EMAIL) {
           return 'Email';
         } else if ( status === IWebinarNotificationType.PUSH) {
           return 'Push';
         } 
         break;
      }
      case 'Priority':{
        switch (status){
          case 0:{
            return 'None';
          }
          case 1:{
            return 'Very Low';
          }
          case 2:{
            return 'Low';
          }
          case 3:{
            return 'Medium';
          }
          case 4:{
            return 'High';
          }
          case 5:{
            return 'Very High';
          }
        }
        break;
      }
    }
    
    return null; //default is to return null
  }
}
