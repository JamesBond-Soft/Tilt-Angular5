import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { SelfAssessmentService } from './self-assessment.service';
import {ISelfAssessmentReport } from './self-assessment-report';

@Injectable()
export class SelfAssessmentValidationResolver implements Resolve<ISelfAssessmentReport> {

  constructor(private selfAssessmentService: SelfAssessmentService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ISelfAssessmentReport> {
    let id = route.params['id'];

    return this.selfAssessmentService.getSelfAssesmentReportById(+id)
        .map(sarObj => {
            if(sarObj){
                return sarObj;
            }

            console.log(`Self-Assessment-Report was not found: ${id}`);
            this.router.navigate(['/selfassessments']);
            return null;
        })
        .catch(error => {
            console.log(`Retrieval error: ${error}`);
            this.router.navigate(['/selfassessments']);
            return Observable.of(null);
        })
}
}
