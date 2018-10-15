import { Component, OnInit, ElementRef, ViewEncapsulation, Inject, forwardRef, Input,ViewChild,TemplateRef,ContentChild,HostListener,HostBinding } from '@angular/core';
import { CondensedComponent } from '../../condensed/condensed.component';
import { LoginService, RoleType } from '../../../login/login.service';
import { prototype } from 'events';
import { pagesToggleService} from '../../../@pages/services/toggler.service';
import { Subscription } from 'rxjs/Subscription';
import { SelfAssessmentService } from '../../../self-assessment/self-assessment.service';
declare var pg: any;


// customization 6.8.2018 by Vlad

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  host: { 'class': 'page-sidebar' },
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {

  userRole: RoleType;
  RoleType = RoleType;
  subscription: Subscription;
  pin:boolean = false;
  drawer:boolean = false;
  sidebar;
  timer;
  @HostBinding('style.transform')
  style:string;
  private sideBarWidth = 280; 
  private sideBarWidthCondensed = 280 - 70;
  IsSelfAssessmentReportRequired:boolean = false
  
  @HostBinding('class.visible') mobileSidebar:boolean;

  @ContentChild('sideBarOverlay') sideBarOverlay: TemplateRef<void>;
  @ContentChild('sideBarHeader') sideBarHeader: TemplateRef<void>;
  @ContentChild('menuItems') menuItems: TemplateRef<void>;

  constructor(@Inject(forwardRef(() => CondensedComponent)) public layout, private appSidebar: ElementRef, private loginService: LoginService,private toggler:pagesToggleService,private selfAssessmentService: SelfAssessmentService) {
    this.subscription = this.toggler.sideBarToggle.subscribe(toggle => { this.toggleMobile(toggle) });
  	this.subscription = this.toggler.pageContainerHover.subscribe(message => { this.closeSideBar() });
    this.subscription = this.toggler.menuDrawer.subscribe(message => { this.toggleDrawer() });
    this.mobileSidebar = false;
  }

  ngOnInit() {
    new pg.SideBar(this.appSidebar.nativeElement);

    this.userRole = this.findUserRoleType(); //find which role the user belongs in
    this.selfAssessmentService.IsSelfAssessmentReportRequired().subscribe(result => {
      this.IsSelfAssessmentReportRequired = result;
    })
  }

  toggleMenuPin() {
    if (this.pin) {
      this.pin = false;
      this.layout.removeLayout("menu-pin");
    }
    else {
      this.pin = true;
      this.layout.changeLayout("menu-pin");
    }
  }

  toggleDrawer(){
    if(this.drawer)
      this.drawer = false;
    else
      this.drawer = true;
    }

    isLoggedIn(): boolean {
      return this.loginService.isLoggedIn();
    }

    isAdmin(): boolean {
      return this.userRole === RoleType.Admin;
    }

    isSysadmin(): boolean {
      return this.userRole === RoleType.Sysadmin;
    }

    isStaff(): boolean {
      return this.userRole === RoleType.Staff;
    }

  private findUserRoleType(): number {
    //find the role the user is assigned to
    return this.loginService.getUserRoleType();

      // let result: number = RoleType.None;
      // if (this.loginService.currentUser && this.loginService.currentUser.roles) {
      //    this.loginService.currentUser.roles.forEach(roleItem => {
      //     if (roleItem.toLowerCase().indexOf('sysadmin') === 0) {
      //       result = RoleType.Sysadmin;
      //       return;
      //     } else if (roleItem.toLowerCase().indexOf('admin') === 0) {
      //       result = RoleType.Admin;
      //       return;
      //     } else if (roleItem.toLowerCase().indexOf('staff') === 0) {
      //       result = RoleType.Staff;
      //       return;
      //     }
      //   });
      // }
      // return result;
  }
 
     openSideBar(){
      if (pg.isVisibleSm() || pg.isVisibleXs()) return false
      if(this.pin) return false;
  
      this.style = 'translate3d(' +this. sideBarWidthCondensed + 'px, 0,0)'
      pg.addClass(document.body,"sidebar-visible");
    } 
  
    closeSideBar(){
      if (pg.isVisibleSm() || pg.isVisibleXs()) return false
      if(this.pin) return false;
  
      this.style = 'translate3d(0,0,0)'
      pg.removeClass(document.body,"sidebar-visible");
      
      //this.drawer = false;
    }
  
    toggleMobile(toggle:boolean){
        clearTimeout(this.timer);
        if(toggle){
          this.mobileSidebar = toggle;
        }
        else{
          this.timer = setTimeout(()=>{  
            this.mobileSidebar = toggle;
          },400)
        }
    }
}
