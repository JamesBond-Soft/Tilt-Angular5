import { Component, OnInit } from '@angular/core';
import { VgMedia } from 'videogular2/core';
import { IWebinar, IWebinarStatus, IWebinarNotificationType } from '../webinar';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageWebinarService } from '../webinar.service';
import { NotificationService } from '../../notifications/notification.service';
import { LoginService, RoleType } from '../../login/login.service';
import { IUserProfile } from '../../users/user-profile';
// tslint:disable-next-line:max-line-length
import { ResourceLibraryAssetService } from '../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';
@Component({
  selector: 'app-webinar-detail',
  templateUrl: './webinar-detail.component.html',
  styleUrls: ['./webinar-detail.component.scss']
})
export class WebinarDetailComponent implements OnInit {
  url: string;
  contentType: string;
  webinar: IWebinar;
  recordedFileUrl: string = null;
  canCreateWebinar: Boolean; // Sysadmin, Admin can created webinar
  userRole: RoleType;
  currentUserId: number;
  canBroadcast : Boolean;
  attendUserList : IUserProfile[];
  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private manageWebinarService: ManageWebinarService,
    private notificationService: NotificationService,
    private resourceLibraryAssetService: ResourceLibraryAssetService,
    private loginService: LoginService
  ) {
  }

  ngOnInit() {
    this.currentUserId = this.loginService.getCurrentUserId();
    this.route.data.subscribe( data => {
      this.webinar = data['webinar'];
      
      // get attended users of webinar
      this.manageWebinarService.getCurrentAttendedUsers(this.webinar.webinarId).subscribe(response => {
        this.attendUserList = response;
      }, error => {
        console.log(`getting attendedUser list error`, error);
      });

      // if record as Resource is set and Webinar is completed, show recorded File
      if (this.webinar.recordAsResource && this.webinar.status === IWebinarStatus.COMPLETED) {
        this.resourceLibraryAssetService.getResourceLibraryAsset(this.webinar.resourceLibraryAssetId).subscribe((response) => {
         this.recordedFileUrl = response.fileProperties.url;
        }, error => {
         console.log('unexpected error',  error);
        });
      }
    });
  }

  edit() {
    this.router.navigate(['/webinar/new-broadcast', this.webinar.webinarId]);
  }

  delete() {
    if (confirm(`Are you sure you want to delete the Webinar: '${this.webinar.name}'?`)) {
      // call service to delete object
      this.manageWebinarService.deleteWebinar(this.webinar.webinarId)
        .subscribe(() => {
          if(this.webinar.notificationType != IWebinarNotificationType.NO) {
            this.notificationService.deleteNotificationBatch(this.webinar.notificationBatchId).subscribe(() => {
              this.router.navigate(['/webinar/list']);
            },
            error => {
                console.log('unexpected error', error);
            });
          }
          this.router.navigate(['/webinar/list']);
        },
       (error: any) => alert(`'Attention: ${error}`));
    }
  }

  broadcast() {
    this.router.navigate(['/webinar/broadcast', this.webinar.webinarId]);
  }
}
