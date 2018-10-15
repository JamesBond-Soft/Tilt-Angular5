import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';


import { AuthGuard } from './auth-guard.service';
import { LoginComponent } from './login.component';
import { UtilityModule } from '../shared/utility.module';
import { SelfAssessmentService } from '../self-assessment/self-assessment.service';
import { RestrictedAuthGuard } from './restricted-auth-guard.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    UtilityModule,
     RouterModule.forChild([
       { path: 'login', component: LoginComponent },
     ]),
    HttpClientModule
  ],
  declarations: [LoginComponent],
  providers: [AuthGuard, SelfAssessmentService, RestrictedAuthGuard]
})
export class LoginModule { }
