import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportUserSelectionDialogComponent } from './support-user-selection-dialog.component';
import { ModalModule, BsModalRef, BsModalService } from 'ngx-bootstrap';
import { SettingsUsersService } from '../../settings-users/settings-users.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SupportUserSelectionDialogComponent', () => {
  let component: SupportUserSelectionDialogComponent;
  let fixture: ComponentFixture<SupportUserSelectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule,
        ModalModule.forRoot()
      ],
      declarations: [ SupportUserSelectionDialogComponent ],
      providers: [
        BsModalRef, 
        BsModalService,
        SettingsUsersService
      ]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportUserSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
