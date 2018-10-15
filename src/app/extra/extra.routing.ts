import { Routes } from '@angular/router';
import { BlankpageComponent } from './blankpage/blankpage.component';
import { LoginComponent } from './login/login.component';

export const ExtraRouts: Routes = [
  {
    path: '',
    children: [{
      path: 'blank',
      component: BlankpageComponent
    },{
      path: 'login',
      component: LoginComponent
    }]
  }
];
