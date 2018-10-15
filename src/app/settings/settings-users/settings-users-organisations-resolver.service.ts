import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { SettingsOrganisationsService } from '../settings-organisations/settings-organisations.service';
import { IOrganisation } from '../settings-organisations/organisation';

@Injectable()
export class SettingsUsersOrganisationsResolver implements Resolve<IOrganisation[]> {
    constructor(private orgService: SettingsOrganisationsService, private router: Router){ }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IOrganisation[]> {
        return this.orgService.getOrganisations()
            .map(orgs => {
                if(orgs){
                    return orgs;
                }
                console.log(`Organisations not found`);
                return Observable.of(null);
                //this.router.navigate(['/settings/users']);
            })
            .catch(error => {
                console.log(`Retrieval error: ${error}`);
                //this.router.navigate(['/settings/users']);
                return Observable.of(null);
            })
    }
}