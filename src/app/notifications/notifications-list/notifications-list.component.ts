import { Component, OnInit } from '@angular/core';
import { INotification } from '../notification';
import { INotificationBatch } from '../notification-batch';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';
import { LoginService } from '../../login/login.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit {
  pageTitle: string = 'Notifications';
  notificationBatches: INotificationBatch[] = [];
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

    this.notificationService.getNotificationBatchesWithOrganisationId(this.loginService.currentUser.organisationId).subscribe(notificationBatches => {
        this.notificationBatches = notificationBatches;
      }, error => console.log(`Unexpected error: ${error} (ref loadNotifications)`)
    );
  }

  cmdViewNotificationBatch(notifBatch: INotificationBatch, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/notifications/manage', notifBatch.notificationBatchId]);
  }

  cmdCreateNotification(): void {
    this.router.navigate(['/notifications/manage', 0]);
  }

}
