import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { IUser } from '../settings/settings-users/user';
import { SettingsUsersService } from '../settings/settings-users/settings-users.service';

@Component({
  selector: 'app-staff-list',
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss']
})
export class StaffListComponent implements OnInit {
  pageTitle: string = "Staff";
  users: IUser[];
  errorMessage: string;
  searchString: string;

  constructor(private settingsUserService: SettingsUsersService, private router: Router, private route: ActivatedRoute ) { }

  ngOnInit() {
    // get the list of users
    this.settingsUserService.getUsers()
    .subscribe(users => this.users = users,
     error => this.errorMessage = <any>error);
  }

  cmdViewStaffDetail(userId: number, userName : string): void {
    this.router.navigate(['/staff/', userId, userName]);
  }

  cmdAddUser(): void {

  }

}
