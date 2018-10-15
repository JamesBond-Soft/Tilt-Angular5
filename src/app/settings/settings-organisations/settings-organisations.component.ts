import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SettingsOrganisationsService } from './settings-organisations.service';

import { IOrganisation } from './organisation';

@Component({
  selector: 'app-settings-organisations',
  templateUrl: './settings-organisations.component.html',
  styleUrls: ['./settings-organisations.component.css']
})
export class SettingsOrganisationsComponent implements OnInit {
  organisations: IOrganisation[];
  pageTitle: string = 'Organisations';

  constructor(private settingsOrgService: SettingsOrganisationsService, private router: Router) { }

  ngOnInit() {
    this.settingsOrgService.getOrganisations()
          .subscribe(orgs => {
            this.organisations = orgs;
          },
          error => console.log(`Error: ${<any>error}`)
    );
  }

  cmdAddOrganisation(): void {
    this.router.navigate(['/settings/organisations', 0]);
  }

  cmdEditOrganisation(organisationId: number): void {
    this.router.navigate(['/settings/organisations', organisationId]);
  }

}
