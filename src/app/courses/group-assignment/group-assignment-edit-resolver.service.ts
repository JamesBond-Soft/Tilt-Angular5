import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { ICourseGroupAssignment } from './course-group-assignment';
import { CourseGroupAssignmentService } from './course-group-assignment.service';

@Injectable()
export class GroupAssignmentEditResolver implements Resolve<ICourseGroupAssignment> {

  constructor(private courseGroupAssignmentService: CourseGroupAssignmentService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICourseGroupAssignment> {
    let courseGroupAssignmentId: number = +route.params['courseGroupAssignmentId'];
    let courseId = +route.paramMap.get('courseId');// +route.params['courseId'];

    if(courseGroupAssignmentId === -2){
        //this means this is a multi-select edit, don't load the courseGroups - leave it for the component!
        return null;
    }
    return this.courseGroupAssignmentService.getCourseGroupAssignmentById(courseGroupAssignmentId)
        .map(courseGroupAssignment => {
            if(courseGroupAssignment){
                if(courseGroupAssignment.courseGroupAssignmentId === 0){
                    //this is a new courseGroupAssignment - so set the courseId to the value that was passed
                    courseGroupAssignment.courseId = courseId;
                }
                
                return courseGroupAssignment;
            }

            console.log(`CourseGroupAssignment was not found: ${courseGroupAssignmentId}`);
            return null;
        })
        .catch(error => {
            console.log(`Retrieval error: ${error}`);
            return Observable.of(null);
        })
  }
}
