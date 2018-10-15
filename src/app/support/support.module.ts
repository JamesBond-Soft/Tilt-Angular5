import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SettingsOrganisationsService } from "../settings/settings-organisations/settings-organisations.service";
import { SettingsUsersOrganisationsResolver } from "../settings/settings-users/settings-users-organisations-resolver.service";
import { UtilityModule } from "../shared/utility.module";
import { FeedbackComponent } from "./feedback/feedback.component";
import { IssueEditComponent } from "./issues/issue-edit/issue-edit.component";
import { TicketDetailsComponent } from "./issues/issue-edit/ticket-details/ticket-details.component";
import { IssueListComponent } from "./issues/issue-list/issue-list.component";
import { SupportService } from "./support.service";
import { ConfigurationSettingsService } from "../settings/settings-configuration/configuration-settings.service";
import { AuthGuard } from "../login/auth-guard.service";



@NgModule({
  imports: [
    CommonModule,
    UtilityModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    RouterModule.forChild([
      {
        path: "issues/:ticketId/:breadcrumb",
        pathMatch: "full",
        component: IssueEditComponent,
        canLoad: [AuthGuard], 
        canActivate: [AuthGuard],
        resolve: { orgs: SettingsUsersOrganisationsResolver }
      },
      {
        path: "issues",
        component: IssueListComponent,
        canLoad: [AuthGuard], 
        canActivate: [AuthGuard],
        resolve: { orgs: SettingsUsersOrganisationsResolver }
      },
      { path: "my-issues", pathMatch: "full", component: IssueListComponent },
      { path: "feedback", data : { breadcrumb : 'Feedback'} ,  component: FeedbackComponent },
      { path: "", pathMatch: "full", redirectTo: "issues" }
    ])
  ],
  declarations: [
    FeedbackComponent,
    IssueEditComponent,
    IssueListComponent,
    TicketDetailsComponent
  ],
  providers: [
    SupportService,
    SettingsUsersOrganisationsResolver,
    SettingsOrganisationsService,
    ConfigurationSettingsService
  ]
})
export class SupportModule {}
