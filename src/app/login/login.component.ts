import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './login.service';
import { environment } from '../../environments/environment';
import { SelfAssessmentService } from '../self-assessment/self-assessment.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;
  results: any;
  errorMessage: string;
  version: string = environment.version;
  constructor(private _route: ActivatedRoute, private _router: Router, private _loginService: LoginService, private selfAssessmentService: SelfAssessmentService) { }

  ngOnInit() {
    
    // for debugging
    if(!environment.production && environment.autoLogin){
      if(window.sessionStorage.getItem('autoLogin') && window.sessionStorage.getItem('autoLogin') === 'false'){
        return;
      }
       this.username = 'admin';
       this.password = 'password';

      //  if(!this._loginService.redirectUrl){
      //    this._loginService.redirectUrl = "notifications"; //force it to go to a specific component to make dev easier
      //  }
      
      this.cmdLogin();
    }
    
  }

  cmdLogin(): void {
    this.errorMessage = null; //clear any error message before trying again
    let selfAssessmentRequired: boolean = false;

    if(!environment.production && environment.autoLogin){
      window.sessionStorage.removeItem('autoLogin'); //delete session variable if it exists - to reenable autologin
    }

    // alert(`hello: ${this.username} success!!`);
    if ((!this.username || !this.username.length) || (!this.password || !this.password.length)) {
      //alert('Invalid Username or Password');
      this.errorMessage = 'Invalid Username or Password';
      return;
    }

    this._loginService.authenticate(this.username, this.password)
      .subscribe(result => {
        this.results = result;

        if(this.results){
          //ok now check if the user is a staff member
          //check if staff member - if so, take them to the self-assessment-questionaire
          let roleType: string = this.findUserRoleType();
          if(roleType.indexOf('Staff') === 0){
            //staff member - questionaire
            //IsSelfAssessmentReportRequired
            let obs = this.selfAssessmentService.IsSelfAssessmentReportRequired().subscribe(result => {
              if(result){
                //user is required to complete a self-assessment, redirect them to this page
                this._router.navigate(['/selfassessments/questionaire']);
              } else {
                if(this._loginService.redirectUrl){
                  //take the user to the page they are supposed to be on
                  this._router.navigateByUrl(this._loginService.redirectUrl);
                } else {
                  //take the user to the dashboard
                  this._router.navigate(['/dashboard']);
                }
              }
            }, error => console.log(error));
           } else {
             //anyone else
             if(this._loginService.redirectUrl){
              //take the user to the page they are supposed to be on
              this._router.navigateByUrl(this._loginService.redirectUrl);
            } else {
              //take the user to the dashboard
              this._router.navigate(['/dashboard']);
            }
             //this._router.navigate(['/dashboard']);
           }
        }
      },
      error => {
        if(error.status === 401){
          //invalid login
          this.errorMessage = 'Invalid Username or Password';
          return;
        } else {
          //something else is wrong
          alert('There has been an unexpected error. Please try again (ref _loginService.authenticate');
          console.log(<any>error)
        }
        
      });

    
  }

  private findUserRoleType(): string {
    //find the role the user is assigned to
    let result: string = '';
    if (this._loginService.currentUser && this._loginService.currentUser.roles) {
       this._loginService.currentUser.roles.forEach(roleItem => {
        if (roleItem.toLowerCase().indexOf('sysadmin') === 0) {
          result = 'Sysadmin';
          return;
        } else if (roleItem.toLowerCase().indexOf('admin') === 0) {
          result = 'Admin';
          return;
        } else if (roleItem.toLowerCase().indexOf('staff') === 0) {
          result = 'Staff';
          return;
        }
      });
    }
    return result;
  }

  cmdReset(): void {
    this.username = '';
    this.password = '';
  }

  cmdHelp(event: Event): void {
    event.stopPropagation();
    this._router.navigate(['/support/feedback']);
  }
}
