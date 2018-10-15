import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueEditComponent } from './issue-edit.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilityModule } from '../../../shared/utility.module';
import { BsDropdownModule } from 'ngx-bootstrap';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';
import { SupportService } from '../../support.service';
import { ConfigurationSettingsService } from '../../../settings/settings-configuration/configuration-settings.service';

describe('IssueEditComponent', () => {
  let component: IssueEditComponent;
  let fixture: ComponentFixture<IssueEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        UtilityModule.forRoot(),
        BsDropdownModule.forRoot()
      ],
      declarations: [ 
        IssueEditComponent, 
        TicketDetailsComponent ],
      providers:[
        SupportService,
        ConfigurationSettingsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
