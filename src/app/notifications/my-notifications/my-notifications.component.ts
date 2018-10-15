import { Component, OnInit } from '@angular/core';
import { INotification } from '../notification';
import { INotificationBatch } from '../notification-batch';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';
import { LoginService } from '../../login/login.service';

@Component({
  selector: 'my-notifications',
  templateUrl: './my-notifications.component.html',
  styleUrls: ['./my-notifications.component.scss']
})
export class MyNotificationsComponent implements OnInit {
  notifications: INotification[] = [];
  searchString: string;
  
  constructor(private router: Router,
              private notificationService: NotificationService,
              private loginService: LoginService) { }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications(): void {
    if(!this.loginService.currentUser || !this.loginService.currentUser.organisationId){
      console.log('Error - User / OrganisationId not populated.');
      return;
    }

    this.notificationService.getMyNotifications().subscribe(notifications => {
      this.notifications = notifications.reverse();
    }, error => console.log(`Unexpected error: ${error} (ref loadNotifications)`));

   
  }

  cmdViewNotification(notification: INotification, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/notifications', notification.notificationId]);
  }

}
