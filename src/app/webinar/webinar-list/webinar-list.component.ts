import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IWebinar } from '../webinar';
import { LoginService, RoleType } from '../../login/login.service';
import { ManageWebinarService } from '../webinar.service';
import { IWebinarStatus } from '../webinar';
@Component({
  selector: 'app-webinar-list',
  templateUrl: './webinar-list.component.html',
  styleUrls: ['./webinar-list.component.scss']
})
export class WebinarListComponent implements OnInit {

  liveWebinarList: IWebinar[] = []; // Webinars which are current live
  unliveWebinarList: IWebinar[] = [];
  webinarList: IWebinar[]; // Scheduled Webinars or Past webinars
  currentUserId: number;
  userRole: RoleType;
  canCreateWebinar: Boolean;
  constructor(
    private loginService: LoginService,
    private webinarManageService: ManageWebinarService,
    private router: Router
    ) {
    this.loadWebinars();
    this.currentUserId = this.loginService.getCurrentUserId();
    this.userRole = this.findUserRoleType();
    if (this.userRole === RoleType.Admin || this.userRole === RoleType.Sysadmin)
    {
        this.canCreateWebinar = true;
    }
  }

  private findUserRoleType(): number {
    return this.loginService.getUserRoleType();
  }

  // load webinars according to User Role
  // If admin, get all webinars in his organisation.
  // If normal staff, get assigned webinars
  loadWebinars() {
    this.webinarManageService.getWebinars().subscribe( webinars => {
      this.webinarList = webinars;
      const $this = this;
       this.webinarList.forEach(item => {
          // separte live webinars and completed or schduled webinars to show
          // if normal staff, completed webinars are not shown
          if (item.status === IWebinarStatus.LIVE) {
            $this.liveWebinarList.push(item);
          } else {
            // $this.unliveWebinarList.push(item);
            $this.unliveWebinarList.push(item);
          }
      });
    }, error => {
      console.log(`unexpected Error: ${error}`);
    });
  }

  attendWebinar(item: IWebinar) {
    // Go to Webinar view page
    this.router.navigate(['/webinar/view', item.webinarId]);
  }

  ngOnInit() {
    // Get live webinar list and normal webinar list
    // Call Service
  }

  detail(item: IWebinar) {
    // Show Webinar Detail Page
    this.router.navigate(['/webinar/detail', item.webinarId]);
  }

  createWebinar() {
    this.router.navigate(['/webinar/new-broadcast', 0]);
  }
}
