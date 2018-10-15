import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExtraRouts } from './extra.routing';
import { BlankpageComponent } from './blankpage/blankpage.component';
import { LoginComponent } from './login/login.component';

import { SharedModuleB } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    SharedModuleB,
    RouterModule.forChild(ExtraRouts),
  ],
  declarations: [BlankpageComponent, LoginComponent]
})
export class ExtraModule { }
