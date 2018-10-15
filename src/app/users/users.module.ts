import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UserProfileEditComponent } from './user-profile-edit.component';
import { UserSettingsEditComponent } from './user-settings-edit.component';

import {UserService } from './user.service';



@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      //{ path: '', component: GroupListComponent},
      { path: 'profile/:userId', component: UserProfileEditComponent}
      //{ path: 'settings', component: UserSettingsEditComponent}
    ])
  ],
  declarations: [UserProfileEditComponent, UserSettingsEditComponent],
  providers: [UserService]
})
export class UsersModule { }
