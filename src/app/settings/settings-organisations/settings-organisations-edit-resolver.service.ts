import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import {SettingsOrganisationsService } from './settings-organisations.service';
import { IOrganisation } from './organisation';

@Injectable()
export class SettingsOrganisationsEditResolver implements Resolve<IOrganisation> {

  constructor(private settingsOrgService: SettingsOrganisationsService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IOrganisation> {
    let id = route.params['id'];

    return this.settingsOrgService.getOrg(+id)
        .map(org => {
            if(org){
                return org;
            }

            console.log(`Organisation was not found: ${id}`);
            this.router.navigate(['/settings/organisations']);
            return null;
        })
        .catch(error => {
            console.log(`Retrieval error: ${error}`);
            this.router.navigate(['/settings/organisations']);
            return Observable.of(null);
        })
}
}
