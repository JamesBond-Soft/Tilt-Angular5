import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { IUser } from './user';
import { SettingsUsersService } from './settings-users.service';

@Injectable()
export class SettingsUsersResolver implements Resolve<IUser> {
    constructor(private settingsusersService: SettingsUsersService, private router: Router){ }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IUser> {
        let id = route.params['id'];

        return this.settingsusersService.getUser(+id)
            .map(user => {
                if(user){
                    return user;
                }

                console.log(`User was not found: ${id}`);
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