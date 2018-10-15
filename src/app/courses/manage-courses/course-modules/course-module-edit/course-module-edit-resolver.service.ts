import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
 
import {CourseModuleService } from '../course-module.service';
import { ICourseModule } from '../course-module';

@Injectable()
export class CourseModuleEditResolver implements Resolve<ICourseModule> { 
    constructor(private manageCourseModuleService: CourseModuleService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICourseModule> {
    let id = route.params['id'];
    let courseId = route.params['courseId'];

    return this.manageCourseModuleService.getCourseModule(+id)
        .map(courseModule => {
            if(courseModule){
                if(courseModule.courseModuleId === 0){
                    //this is a new courseModule - so set the courseId to the value that was passed
                    courseModule.courseId = courseId;
                }
                
                return courseModule;
            }

            console.log(`CourseModule was not found: ${id}`);
            return null;
        })
        .catch(error => {
            console.log(`Retrieval error: ${error}`);
            return Observable.of(null);
        })
}
}
