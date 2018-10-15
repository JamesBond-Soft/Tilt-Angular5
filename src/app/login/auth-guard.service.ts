import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, CanLoad, Router, Route } from '@angular/router';

import { environment } from '../../environments/environment';
import { LoginService } from './login.service';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

    constructor(private loginService: LoginService, private router: Router, private location: Location) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.checkLoggedIn(state.url);
    }

    canLoad(route: Route): boolean {
        //return this.checkLoggedIn(route.path);
        let url = `/${this.location.path()}`; //fix to get lazy loaded components path as activated route does not contain it at this stage
        return this.checkLoggedIn(url);
    }

    checkLoggedIn(url: string): boolean {
        if(this.loginService.isLoggedIn()){
            return true;
        }

        this.loginService.redirectUrl = url;
        this.router.navigate(['/login']);
        return false;
    }
}