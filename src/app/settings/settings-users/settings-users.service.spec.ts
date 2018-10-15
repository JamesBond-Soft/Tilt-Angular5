import { TestBed, getTestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SettingsUsersService } from './settings-users.service';

describe('SettingsUsersService', () => {
  let injector: TestBed;
  let service: SettingsUsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SettingsUsersService]
    });

    injector = getTestBed();
    service = injector.get(SettingsUsersService);
    httpMock = injector.get(HttpTestingController);
  });

  it('should be created', inject([SettingsUsersService], (service: SettingsUsersService) => {
    expect(service).toBeTruthy();
  }));
});
