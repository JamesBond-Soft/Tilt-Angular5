import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackComponent } from './feedback.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SupportService } from '../support.service';
import { LoginService } from '../../login/login.service';
import { UtilityModule } from '../../shared/utility.module';
import { ConfigurationSettingsService } from '../../settings/settings-configuration/configuration-settings.service';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientModule,
        ReactiveFormsModule,
        RouterTestingModule,
        UtilityModule.forRoot()
      ],
      declarations: [ FeedbackComponent ],
      providers:[
        SupportService,
        ConfigurationSettingsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
