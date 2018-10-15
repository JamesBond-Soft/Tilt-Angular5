import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { GroupService } from './group.service';
import { GroupListComponent } from './group-list.component';
import { GroupEditComponent } from './group-edit.component';
import { AuthGuard } from '../login/auth-guard.service';
import { GroupItemComponent } from './group-item.component';

import { SettingsOrganisationsService } from '../settings/settings-organisations/settings-organisations.service';
import { SettingsUsersOrganisationsResolver } from '../settings/settings-users/settings-users-organisations-resolver.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', component: GroupListComponent, resolve: {orgs: SettingsUsersOrganisationsResolver}},
      //{ path: ':id', component: GroupEditComponent}
      { path: ':organisationId', component: GroupListComponent, resolve: {orgs: SettingsUsersOrganisationsResolver}}
    ])
  ],
  declarations: [GroupListComponent, GroupEditComponent, GroupItemComponent],
  providers: [GroupService, SettingsOrganisationsService, SettingsUsersOrganisationsResolver]
})
export class GroupsModule { }
