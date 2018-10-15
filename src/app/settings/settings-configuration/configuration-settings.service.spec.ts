import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfigurationSettingsService } from './configuration-settings.service';

describe('ConfigurationSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [ConfigurationSettingsService]
    });
  });

  it('should be created', inject([ConfigurationSettingsService], (service: ConfigurationSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
