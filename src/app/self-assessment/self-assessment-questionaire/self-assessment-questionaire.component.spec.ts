import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UtilityModule } from '../../shared/utility.module';

import { SelfAssessmentQuestionaireComponent } from './self-assessment-questionaire.component';
import { SelfAssessmentQuestionService } from '../self-assessment-question-builder/self-assessment-question.service';
import { SelfAssessmentService } from '../self-assessment.service';

describe('SelfAssessmentQuestionaireComponent', () => {
  let component: SelfAssessmentQuestionaireComponent;
  let fixture: ComponentFixture<SelfAssessmentQuestionaireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        UtilityModule.forRoot()
      ],
      declarations: [ SelfAssessmentQuestionaireComponent ],
      providers: [SelfAssessmentQuestionService, SelfAssessmentService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfAssessmentQuestionaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
