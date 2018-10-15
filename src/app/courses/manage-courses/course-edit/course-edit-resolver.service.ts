import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import {ManageCoursesService } from '../manage-courses.service';
import { ICourse } from '../course';

@Injectable()
export class CourseEditResolver implements Resolve<ICourse> { 
    constructor(private manageCoursesService: ManageCoursesService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICourse> {
    let id = route.params['courseId'];

    return this.manageCoursesService.getCourse(+id)
        .map(course => {
            if(course){
                return course;
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

@Injectable()
export class BCInsertResolver implements Resolve<ICourse> { 
    constructor(private manageCoursesService: ManageCoursesService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICourse> {
    let courseId = route.params['courseId'];

    return this.manageCoursesService.getCourse(+courseId)
        .map(course => {
            console.log(course);
            return  [{
                label: course.name,
                params: {},
                url: "view/"+ course.courseId +"/" + course.name
            }]    
        })
        .catch(error => {
            console.log(`Retrieval error: ${error}`);
            return Observable.of(null);
        })
}
}

