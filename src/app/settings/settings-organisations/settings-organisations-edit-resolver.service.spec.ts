import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SettingsOrganisationsEditResolver } from './settings-organisations-edit-resolver.service';
import { SettingsOrganisationsService } from './settings-organisations.service';

describe('SettingsOrganisationsEditResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [SettingsOrganisationsEditResolver, SettingsOrganisationsService]
    });
  });

  it('should be created', inject([SettingsOrganisationsEditResolver], (service: SettingsOrganisationsEditResolver) => {
    expect(service).toBeTruthy();
  }));
});
