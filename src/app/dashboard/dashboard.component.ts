import { Component, OnInit } from '@angular/core';
import { LoginService, RoleType } from '../login/login.service';




@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userRole: RoleType;
  RoleType = RoleType;
  canShowSelfAssessmentValidation: boolean;
  
  constructor(private loginService: LoginService) { }

  ngOnInit() {
    this.userRole = this.loginService.getUserRoleType();

    //TODO - ADD CHECK IF USER IS A MANAGER, IF SO ENABLE THE SELFASSESSMENTVALIDATION
    this.canShowSelfAssessmentValidation = true;
  }

}
