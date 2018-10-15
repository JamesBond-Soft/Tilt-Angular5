import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { IWebinar } from './webinar';
import { ManageWebinarService } from './webinar.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class WebinarGetResolverService implements Resolve<IWebinar> {

  constructor(private manageWebinarService: ManageWebinarService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IWebinar> {
    const id = route.params['webinarId'];
    return this.manageWebinarService.getWebinarDeatil(+id)
        .map(webinar => {
            if (webinar) {
                return webinar;
            }

            console.log(`Course was not found: ${id}`);
            return null;
        })
        .catch(error => {
            console.log(`Retrieval error: ${error}`);
            return Observable.of(null);
        })
  }

}
