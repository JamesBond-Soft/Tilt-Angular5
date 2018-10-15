import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SettingsOrganisationsService } from './settings-organisations.service';

describe('SettingsOrganisationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SettingsOrganisationsService]
    });
  });

  it('should be created', inject([SettingsOrganisationsService], (service: SettingsOrganisationsService) => {
    expect(service).toBeTruthy();
  }));
});
