import { Component, OnInit, NgModule } from '@angular/core';
import { Router } from '@angular/router';
//import { Router, Event, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';


//import { LoginService } from './login/login.service';


//import $ from 'jquery';
//import { AfterViewChecked, AfterViewInit, AfterContentChecked } from '@angular/core/src/metadata/lifecycle_hooks';

//doesnt work correctly due to lifecyle issues
// function refreshMenu() {
//    // alert('well');
//     $(".menu-items a").click(function (e) {
//         if ($(this).attr("href") == '#') {
//             console.log('found');
//             e.preventDefault();
//              $(this).closest('li').children('ul').slideToggle( "fast", function() {
//                  // Animation complete.
//              });
//            // $(this).closest('li').children('ul').show();
//             //$(this).closest('li').children('ul').show();
//         }
//     });

//     return false;
// }

@Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    // pageTitle = 'TILT Suite';
    // loading: boolean = true;
    // displayName: string;
    // userId: number;

    constructor() {
        // router.events.subscribe((routerEvent: Event) => {
        //     this.checkRouterEvent(routerEvent);
        // });
    }

    
    ngOnInit() {
        // if(this.isLoggedIn()){
        //     this.displayName = this.loginService.currentUser.displayName;
        //     this.userId = this.loginService.currentUser.userId;
        // }
    }

    // checkRouterEvent(routerEvent: Event): void {
    //     if (routerEvent instanceof NavigationStart) {
    //         this.loading = true;
    //     }

    //     if (routerEvent instanceof NavigationEnd || routerEvent instanceof NavigationCancel || routerEvent instanceof NavigationError) {
    //         this.loading = false;

    //         if(!this.displayName && this.isLoggedIn()){
    //             this.displayName = this.loginService.currentUser.displayName;
    //             this.userId = this.loginService.currentUser.userId;
    //         }
    //     }
    // }

    // logOut(): void {
    //     this.loginService.logOut().subscribe(() => {
    //         this.displayName = null;
    //         this.router.navigateByUrl('/home');
    //     });
        
    // }

    // isLoggedIn(): boolean {
    //     return this.loginService.isLoggedIn();
    // }

    
}
