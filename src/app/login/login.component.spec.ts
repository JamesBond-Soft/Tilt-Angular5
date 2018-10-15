import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { DebugElement }    from '@angular/core';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import {FormsModule } from '@angular/forms';

import { LoginComponent } from './login.component';
import { LoginService } from './login.service';
import { SelfAssessmentService } from '../self-assessment/self-assessment.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let de:      DebugElement;
  let el:      HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        HttpClientTestingModule
      ],
      declarations: [ 
        LoginComponent
        
      ],
      providers: [
        LoginService,
        SelfAssessmentService
      ]
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance; //LoginComponent test instance

     // query for the title <h1> by CSS element selector
     de = fixture.debugElement.query(By.css('input'));
     el = de.nativeElement;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cmdReset should clear fields', () => {
    component.username = 'username';
    component.password = 'password';
    component.cmdReset();
    expect(component.username).toBe('');
    expect(component.password).toBe('');
  });

  it('cmdLogin to show error alert when empty fields passed', () => {
    component.username = '';
    component.password = '';
    spyOn(window, 'alert');
    expect(window.alert).toHaveBeenCalled;
  });
  // it('fail test', () => {
  //   expect(true).toBe(false);
  // });
});
