import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { ModalModule } from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { SelfAssessmentListComponent } from './self-assessment-list.component';
import { SelfAssessmentValidationComponent } from './self-assessment-validation.component';
import { SelfAssessmentQuestionaireComponent } from './self-assessment-questionaire/self-assessment-questionaire.component';
import { SelfAssessmentGroupSelectionComponent } from './self-assessment-group-selection.component';
import { SelfAssessmentQuestionaireBuilderComponent } from './self-assessment-question-builder/self-assessment-questionaire-builder.component';
import { SelfAssessmentQuestionaireEditComponent } from './self-assessment-question-builder/self-assessment-questionaire-edit.component';
import { FilterSelfAssessmentReportPipe } from './filter-self-assessment-report.pipe';
import { SelfAssessmentService } from './self-assessment.service';
import { SelfAssessmentValidationResolver } from './self-assessment-validation-resolver.service';
import { SelfAssessmentGroupSelectionItemComponent } from './self-assessment-group-selection-item.component';
import { GroupService } from '../groups/group.service';
import { GroupItemService } from '../groups/group-item.service';
import { SelfAssessmentQuestionService } from './self-assessment-question-builder/self-assessment-question.service';

import { SettingsOrganisationsService } from '../settings/settings-organisations/settings-organisations.service';
import { SettingsUsersOrganisationsResolver } from '../settings/settings-users/settings-users-organisations-resolver.service';

import { UtilityModule } from '../shared/utility.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    UtilityModule,
    RouterModule.forChild([
      
      { path: '', component: SelfAssessmentListComponent },
      { path: 'validation/:id', component: SelfAssessmentValidationComponent, resolve: {selfAssessmentReport: SelfAssessmentValidationResolver} },
      { path: 'validation/:id/group', component: SelfAssessmentGroupSelectionComponent },
      { path: 'questionaire/builder', component: SelfAssessmentQuestionaireBuilderComponent, resolve: {orgs: SettingsUsersOrganisationsResolver}},
      { path: 'questionaire/builder/group', component: SelfAssessmentGroupSelectionComponent},
      { path: 'questionaire', component: SelfAssessmentQuestionaireComponent, pathMatch: 'full' },
      { path: 'questionaire/:index', component: SelfAssessmentQuestionaireComponent },
      
      //{ path: 'questionaire/builder/:id/edit', component: SelfAssessmentQuestionaireBuilderComponent, resolve: {orgs: SettingsUsersOrganisationsResolver}}
      //{ path: 'questionaire/builder/:id', component: SelfAssessmentQuestionaireComponent }

     ])
  ],
  declarations: [SelfAssessmentListComponent, SelfAssessmentValidationComponent, SelfAssessmentQuestionaireComponent, SelfAssessmentGroupSelectionComponent, SelfAssessmentQuestionaireBuilderComponent, SelfAssessmentQuestionaireEditComponent, FilterSelfAssessmentReportPipe, SelfAssessmentGroupSelectionItemComponent],
  providers:[SelfAssessmentService, SelfAssessmentValidationResolver, GroupItemService, GroupService, SelfAssessmentQuestionService, SettingsOrganisationsService, SettingsUsersOrganisationsResolver, BsModalRef]
  
})
export class SelfAssessmentModule { }
