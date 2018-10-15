import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardDirective } from './card/card.directive';
import { CardBodyDirective } from './card/card-body.directive';
import { CardToggleDirective } from './card/card-toggle.directive';
import { CardMaximizeDirective } from './card/card-maximize.directive';

import { ParallaxDirective } from './parallax/parallax.directive';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { FormGroupDefaultDirective } from './forms/form-group-default.directive';
import { ViewDirective } from './view/view.directive';
import { FilterUserPipe } from '../settings/settings-users/filter-user.pipe';



@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  CardDirective,
  CardBodyDirective,
  CardToggleDirective,
  CardMaximizeDirective,
  ParallaxDirective,
  BreadcrumbComponent,
  FormGroupDefaultDirective,
  ViewDirective,
  FilterUserPipe,
  ],
  exports: [
  CardDirective,
  CardBodyDirective,
  CardToggleDirective,
  ParallaxDirective,
  BreadcrumbComponent,
  FormGroupDefaultDirective,
  ViewDirective,
  FilterUserPipe
  ]

})
export class SharedModuleB { }
