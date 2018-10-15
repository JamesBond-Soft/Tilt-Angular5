// customization 6.9.2018 by Vlad

import { Component, OnInit,Inject,forwardRef } from '@angular/core';
import { CondensedComponent } from '../../condensed/condensed.component';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';

import { LoginService } from '../../../login/login.service';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../notifications/notification.service';
import { INotification } from '../../../notifications/notification';
import { pgCollapseComponent } from '../../../shared/collapse';

import { pagesToggleService } from '../../../@pages/services/toggler.service';

import {
    animate,
    state,
    style,
    transition,
    trigger,
  } from '@angular/animations';

declare var pg: any;


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    latestNotifications: INotification[] = [];
	displayName: string;
	userId: number;
    containsUnreadMsg =  false;
    isEmptyNotification = false;
    constructor(@Inject(forwardRef(() => CondensedComponent)) public layout,
    private router: Router,
    private loginService: LoginService,
    private toggler: pagesToggleService,
    private notificationService: NotificationService) {
        // get latest 5 notifications
        if (!this.loginService.currentUser || !this.loginService.currentUser.organisationId){
            console.log('Error - User / OrganisationId not populated.');
            return;
        }
        this.notificationService.getMyNotifications().subscribe(notifications => {
        this.latestNotifications = notifications.slice(0, 5);
        this.latestNotifications.forEach(item => {
            if (item.read === false) {
                this.containsUnreadMsg = true;
            }
        });
        if (this.latestNotifications.length > 0) {
            this.isEmptyNotification = false;
        } else {
            this.isEmptyNotification = true;
        }
      }, error => console.log(`Unexpected error: ${error} (ref loadNotifications)`));
    }


    toggleContent($event) {
        $event.stopPropagation();
        const target = $event.currentTarget;
        const pElement = target.parentElement.parentElement.parentElement;
        pElement.classList.toggle('open');
    }

    _mobileSidebar:boolean = false;
    
    toggleMobileSidebar(){
        if(this._mobileSidebar){
          this._mobileSidebar = false;
          pg.removeClass(document.body,"sidebar-open");
        }
        else{
          this._mobileSidebar = true;
          pg.addClass(document.body,"sidebar-open");
        }
        this.toggler.toggleMobileSideBar(this._mobileSidebar);
    }

	openQuickView(){
		this.layout.openQuickView();
	}
	openSearch(){
		this.layout.openSearch();
	}
	ngOnInit() {
		if(this.isLoggedIn()){
            this.displayName = this.loginService.currentUser.displayName;
            this.userId = this.loginService.currentUser.userId;
        }
	}

	checkRouterEvent(routerEvent: Event): void {
        // if (routerEvent instanceof NavigationStart) {
        //     this.loading = true;
        // }

        if (routerEvent instanceof NavigationEnd || routerEvent instanceof NavigationCancel || routerEvent instanceof NavigationError) {
            //this.loading = false;

            if(!this.displayName && this.isLoggedIn()){
                this.displayName = this.loginService.currentUser.displayName;
                this.userId = this.loginService.currentUser.userId;
            }
        }
	}
	
	logOut(): void {
        this.loginService.logOut().subscribe(() => {
            this.displayName = null;
            if(!environment.production && environment.autoLogin){
                window.sessionStorage.setItem('autoLogin','false'); //prevent this from logging in over and over
            }

            this.router.navigateByUrl('/');
        });
	}
	
	isLoggedIn(): boolean {
        return this.loginService.isLoggedIn();
    }

    cmdGotoDetailPage(item: INotification ): void {
        this.router.navigate(['/notifications', item.notificationId]);
}

}
