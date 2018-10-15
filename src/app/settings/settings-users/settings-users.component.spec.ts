import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SettingsUsersComponent } from './settings-users.component';
import { SettingsUsersService } from './settings-users.service';

describe('SettingsUsersComponent', () => {
  let component: SettingsUsersComponent;
  //let fixture: ComponentFixture<SettingsUsersComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   imports: [
    //     ReactiveFormsModule,
    //     RouterTestingModule,
    //     HttpClientTestingModule
    //   ],
    //   declarations: [ SettingsUsersComponent ],
    //   providers: [
    //     SettingsUsersService
    //   ]
    // })
    // .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(SettingsUsersComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
