import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { IUser } from './user';
import { SettingsUsersService } from './settings-users.service';
import { SettingsOrganisationsService} from '../settings-organisations/settings-organisations.service';
import { IRole } from './role';
import { IOrganisation } from '../settings-organisations/organisation';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ImportUsersComponent } from './import-users/import-users.component';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-settings-users',
  templateUrl: './settings-users.component.html',
  styleUrls: ['./settings-users.component.css']
})
export class SettingsUsersComponent implements OnInit {
  pageTitle: string = 'Users';
  users: IUser[];
  errorMessage: string;
  roles: IRole[];
  organisations: IOrganisation[];
  searchString: string;
  subscriptions: Subscription[] = [];
  constructor(private settingsUserService: SettingsUsersService, private router: Router, 
              private route: ActivatedRoute, private organisationService: SettingsOrganisationsService,
              private modalService: BsModalService,private changeDetection: ChangeDetectorRef
              ) { }

  ngOnInit() {
    //lets get a list of organisations first
    this.organisationService.getOrganisations().subscribe(orgs => this.organisations = orgs,
      error => this.errorMessage = <any>error);

    //get the list of users
     this.settingsUserService.getUsers()
                .subscribe(users => this.users = users,
                 error => this.errorMessage = <any>error);

    this.roles = [{roleId:1, roleName: 'sysadmin'}];

    this.route.data.subscribe(data => {
      this.roles = data['roles'];
    });
  }

  cmdAddUser(): void {
    this.router.navigate(['/settings/users', 0]);
  }

  cmdEditUser(id: number): void {
    this.router.navigate(['/settings/users', id, {roles: this.roles}]);
  }

  getRoleName(roleId: number): string {
    if(!this.roles) return "";
    if(roleId > 0){
      var matchingRole: IRole = this.roles.find(r => r.roleId === roleId);
      if(matchingRole){
        return matchingRole.roleName;
      }
    }

    return "";
  }

  getOrganisationName(orgId: number): string {
    if(!this.organisations) return "";
    if(orgId > 0){
      var matchingOrg: IOrganisation = this.organisations.find(o => o.organisationId === orgId);
      if(matchingOrg){
        return matchingOrg.organisationName;
      }
    }

    return "";
  }

  cmdImportUser(){
    const initialState = {
      openedAsModal: true    
    };


    let importCSV = this.modalService.show(ImportUsersComponent, {initialState: initialState });
    const _combine = Observable.combineLatest(
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        const _reason = reason ? `, dismissed by ${reason}` : '';
        if (_reason.length === 0) {
          //the modal was closed normally (ie by use pressing a close button / hide js, not escape or clicked in the background)
          //simply refresh the listing
          this.settingsUserService.getUsers()
          .subscribe(users => this.users = users,
            error => this.errorMessage = <any>error);
        }
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );

    this.subscriptions.push(_combine);
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }
}
