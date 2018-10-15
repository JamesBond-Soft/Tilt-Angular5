import { Component, OnInit, AfterViewInit, ViewChildren, ViewChild, ElementRef, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray, FormControlName } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/zip';

import { GenericValidator } from '../../shared/generic-validator';
import { ICourse } from '../../courses/manage-courses/course';
import { IGroup } from '../../groups/group';
import { GroupService } from '../../groups/group.service';
import { ICourseGroupAssignment } from '../../courses/group-assignment/course-group-assignment';
import { BasketSelectorComponent} from '../../shared/basket-selector/basket-selector.component';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { IUser } from '../../settings/settings-users/user';
import { StaffGroupAssignmentService } from './staff-group-assignment.service';
import { IUserGroup } from '../../settings/settings-users/user-group';
@Component({
  selector: 'app-staff-group-assignment',
  templateUrl: './staff-group-assignment.component.html',
  styleUrls: ['./staff-group-assignment.component.scss'],
  providers: [GroupService]
})
export class StaffGroupAssignmentComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  @ViewChild('groupBasketSelector') groupBasketSelector: BasketSelectorComponent;

  pageTitle: string;
  course: ICourse;
  user: IUser;
  availableGroups: IGroup[];
  currentAssignedUserGroups: IUserGroup[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private groupService: GroupService,
    private staffGroupAssignmentService: StaffGroupAssignmentService
  ) {
   }

  ngOnInit() {
    this.route.data.subscribe(data => {
        this.user = data['user'];
        this.currentAssignedUserGroups = data['userGroups'];
    });
    this.loadAvailableGroups();
  }

  // this method aims to flag assinged  true
  setAssignedGroupsUnavailable(groups: IGroup[]): void {
    groups.forEach((item, index) => {
      let assigned = false;
      this.currentAssignedUserGroups.forEach((group, key) => {
        if (item.groupId === group.groupID) {
            assigned = true;
        }
        if (item.subGroups.length > 0 ) {
          this.setAssignedGroupsUnavailable(item.subGroups);
        }
      });
      item.assigned = assigned;
    });
  }

  loadAvailableGroups(): void {
    this.groupService.getGroups(this.user.organisationId).subscribe(groups => {
        this.availableGroups = groups;
        // set assignedFlag ture
        this.setAssignedGroupsUnavailable(this.availableGroups);
        console.log('------------ mark assigned groups ----------');
        console.log(this.availableGroups);
        this.groupBasketSelector.shelfItems = this.availableGroups;
        this.groupBasketSelector.basketItems = [];
      });
  }

  cmdSaveStaffGroupAssignments(): void {
    var tasks$ = []; //array to hold observables if there are multiple items being deleted

    this.groupBasketSelector.basketItems.forEach((group: IGroup, index) => {
       tasks$.push(this.staffGroupAssignmentService.CreateUserGroup(this.user.userId, group.groupId));
    });

    Observable.forkJoin(tasks$).subscribe(results => {
        this.onFinishSave();
      },
    error => alert(`There has been an unexpected error. Please log out and log back in and try again.`));

  }

  onFinishSave(): void {
    this.router.navigate(['/staff', this.user.userId, this.user.username]);
  }

  cmdBack(): void {
   this.onFinishSave();
  }

  basketSelectorIsDirtyEventHandler(isDirty: boolean): void {
  }

}
