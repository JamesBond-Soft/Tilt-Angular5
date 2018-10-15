import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BsModalRef } from 'ngx-bootstrap';
import { IUser } from '../user';
import { SettingsUsersService } from '../settings-users.service';

@Component({
  selector: 'app-manager-selection',
  templateUrl: './manager-selection.component.html',
  styleUrls: ['./manager-selection.component.scss']
})
export class ManagerSelectionComponent implements OnInit {
  pageTitle: string = "Manager Selection";
  users: IUser[];
  errorMessage: string;
  searchString: string;
  openedAsModal: boolean = false;
  selectedUser: IUser;
  hideUserId: number;
  organisationId: number;

  constructor(private settingsUserService: SettingsUsersService, private router: Router, private route: ActivatedRoute, public bsModalRef: BsModalRef) { }

  ngOnInit() {
    //get the list of users

    if(!this.organisationId){
      this.users = [];
      return;
    }
    //this.settingsUserService.getUsers().subscribe(users => {
    this.settingsUserService.getUsersByOrganisation(this.organisationId).subscribe(users => {
      this.users = users.filter(u => u.userId != this.hideUserId)
    },
      error => this.errorMessage = <any>error);
  }

  cmdSelectUser(manager: IUser): void {
    if(confirm(`Are you sure you want to select ${manager.firstName + ' ' + manager.lastName} as the manager?`)){
      this.selectedUser = manager;
      if(this.openedAsModal){
        //set selected group &  hide the modal
        this.bsModalRef.hide();
      } else {
        this.router.navigate(['settings/users/',this.route.snapshot.params.id],{queryParams: {managerId: manager.userId, firstName: manager.firstName, lastName: manager.lastName}});
      }
    }
  }

  cmdBack(): void {
    this.router.navigate(['settings/users/',this.route.snapshot.params.id]);  
  }

}
