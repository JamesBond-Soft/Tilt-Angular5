import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSettingsEditComponent } from './user-settings-edit.component';

describe('UserSettingsEditComponent', () => {
  let component: UserSettingsEditComponent;
  let fixture: ComponentFixture<UserSettingsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSettingsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSettingsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
