import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';

import { StaffAssignedCourseSummaryInfo } from './staff-course-assigned-summary-info';
import { CourseAssignmentInfoService } from '../training/course-assignment-info.service';
import { SettingsUsersService } from '../settings/settings-users/settings-users.service';
import { IUser } from '../settings/settings-users/user';
import { IUserGroup } from '../settings/settings-users/user-group';

import { StaffGroupAssignmentService } from './group-assignment/staff-group-assignment.service';
@Injectable()
export class GetAssignedCoursesResolver implements Resolve<StaffAssignedCourseSummaryInfo[]> {
    constructor(private  courseAssignmentInfoService: CourseAssignmentInfoService){}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<StaffAssignedCourseSummaryInfo[]> {
        //   return this.courseAssignmentInfoService.getCourseAssignmentInfos( userID )
        //   assigned Courses for specific user
        const userId = route.params['userId'];
        return this.courseAssignmentInfoService.getCourseAssignmentInfosByUser(+userId)
        .map( infos => {
            if (infos) {
                return infos;
            }
        })
        .catch(error => {
            console.log(`Retrieval error: ${error}`);
            return Observable.of(null);
        });
    }
}

@Injectable()
export class GetUserResolver implements Resolve<IUser> {
    constructor(private  settingsUsersService: SettingsUsersService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IUser> {
        //   return this.courseAssignmentInfoService.getCourseAssignmentInfos( userID )
        //   assigned Courses for specific user
        const userId = route.params['userId'];
        return this.settingsUsersService.getUser(+userId)
        .map( user => {
            if (user) {
                return user;
            }
        })
        .catch(error => {
            console.log(`Retrieval error: ${error}`);
            return Observable.of(null);
        });
    }
}
@Injectable()
export class GetUserGroupsResolver implements Resolve<IUserGroup[]> {
    constructor(private  staffGroupAssignmentService: StaffGroupAssignmentService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IUserGroup[]> {
        //   return this.courseAssignmentInfoService.getCourseAssignmentInfos( userID )
        //   assigned Courses for specific user
        const userId = route.params['userId'];
        return this.staffGroupAssignmentService.getUserGroup(+userId)
        .map( data => {
            if(data) {
                return data;
            }
        })
        .catch(error => {
            console.log(`Retrieval error: ${error}`);
            return Observable.of(null);
        });
    }
}

