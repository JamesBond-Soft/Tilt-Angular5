import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsRoutes } from './forms.routing';
import { TabsModule } from 'ngx-bootstrap';
import { FormWizardComponent } from './form-wizard/form-wizard.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(FormsRoutes),
    TabsModule.forRoot()
  ],
  declarations: [FormWizardComponent]
})
export class FormsModule { }
