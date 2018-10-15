import { Routes } from '@angular/router';
import { FormWizardComponent } from './form-wizard/form-wizard.component';

export const FormsRoutes: Routes = [
  {
    path: '',
    children: [{
      path: 'wizard',
      component: FormWizardComponent
    }]
  }
];