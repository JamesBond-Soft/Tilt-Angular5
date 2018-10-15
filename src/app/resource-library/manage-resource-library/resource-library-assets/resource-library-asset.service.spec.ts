import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResourceLibraryAssetService } from './resource-library-asset.service';

describe('ResourceLibraryAssetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule],
      providers: [ResourceLibraryAssetService]
    });
  });

  it('should be created', inject([ResourceLibraryAssetService], (service: ResourceLibraryAssetService) => {
    expect(service).toBeTruthy();
  }));
});
