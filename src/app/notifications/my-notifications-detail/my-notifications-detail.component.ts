import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../notification.service';
import { INotification } from '../notification';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { map } from 'rxjs/operators/map';

@Component({
  templateUrl: './my-notifications-detail.component.html',
  styleUrls: ['./my-notifications-detail.component.scss']
})
export class MyNotificationsDetailComponent implements OnInit {
  pageTitle: string;
  notification: INotification;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private notificationService: NotificationService) { }

  ngOnInit() {
    this.loadNotification();
  }

  private loadNotification(): void {
    //load the notification using notificationId from route
    this.route.paramMap.subscribe(params => {

      if(params.has('notificationId')){
      //get notificationId from routeParams
        let notificationId: number = +params.get('notificationId'); //cast to number

        //validate id!
        if(notificationId){
          this.notificationService.getMyNotificationItem(notificationId).subscribe(notification => {
            this.notification = notification;
            this.notification.sentDate = this.notification.sentDate ? moment.utc(this.notification.sentDate).toDate() : new Date();
            
            this.pageTitle = `Viewing Notification : ${notification.subject}`;
            //check if notification has been read before, if not, mark it as read
            if(!notification.read){
              this.markNotificationAsRead();
            }
          }, error => console.log(`Unexpected error ${error} (ref loadNotification)`));
        } else {
          //invalid id, redirect back to my-notifications component
          console.log('Invalid notification id');
          this.router.navigate(['/notifications']);
        }
      }
    })
  }

  private markNotificationAsRead(): void {
    if(this.notification){
      this.notificationService.markNotificationAsRead(this.notification.notificationId).subscribe(() => {

      }, error => console.log(`Unexpected error: ${error} (ref markNotificationAsRead)`));
    }
  }

  cmdBack(): void {
    this.router.navigate(['/notifications']);
  }
}
