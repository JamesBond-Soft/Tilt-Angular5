import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { NotificationEditComponent } from './notification-edit/notification-edit.component';
import { UtilityModule } from '../shared/utility.module';
import { AuthGuard } from '../login/auth-guard.service'; 
import { RouterModule } from '@angular/router';
import { NotificationService } from './notification.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule, TimepickerModule } from 'ngx-bootstrap';
import { GroupService } from '../groups/group.service';
import { SettingsUsersService } from '../settings/settings-users/settings-users.service';
import { MyNotificationsComponent } from './my-notifications/my-notifications.component';
import { MyNotificationsDetailComponent } from './my-notifications-detail/my-notifications-detail.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
     
      
      {
        path: "manage",
        component: NotificationsListComponent,
        pathMatch: 'full',
        canLoad: [AuthGuard],
        canActivate: [AuthGuard]
      },
      {
        path: "manage/:notificationBatchId",
        pathMatch: "full",
        component: NotificationEditComponent,
        canLoad: [AuthGuard],
        canActivate: [AuthGuard]
      },
      {
        path: ':notificationId',
        component: MyNotificationsDetailComponent,
        pathMatch: 'full'
      },
      {
        path: "",
        component: MyNotificationsComponent
      },
      
    ]),
    UtilityModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
  ],
  declarations: [
                  NotificationsListComponent,
                  NotificationEditComponent,
                  MyNotificationsComponent,
                  MyNotificationsDetailComponent
                ],
  providers: [
    NotificationService,
    GroupService,
    SettingsUsersService
  ]
})
export class NotificationsModule { }
