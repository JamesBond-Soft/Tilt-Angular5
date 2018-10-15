import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { SettingsUsersService } from './settings-users.service';
import { IRole } from './role';

@Injectable()
export class SettingsUsersRolesResolver implements Resolve<IRole> {
    constructor(private settingsusersService: SettingsUsersService, private router: Router){ }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IRole> {
        return this.settingsusersService.getRoles()
            .map(roles => {
                if(roles){
                    return roles;
                }

                console.log(`Roles not found`);
                this.router.navigate(['/settings/users']);
                return null;
            })
            .catch(error => {
                console.log(`Retrieval error: ${error}`);
                this.router.navigate(['/settings/users']);
                return Observable.of(null);
            })
    }
}