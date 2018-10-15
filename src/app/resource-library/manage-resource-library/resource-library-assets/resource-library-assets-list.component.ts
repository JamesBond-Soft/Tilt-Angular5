import { Component, OnInit } from '@angular/core';
import { IResourceLibraryAsset, IResourceLibraryAssetType, IResourceLibraryAssetStatus } from './resource-library-asset';
import { Router } from '@angular/router';
import { ResourceLibraryAssetService } from './resource-library-asset.service';

@Component({
  selector: 'resource-library-assets-list',
  templateUrl: './resource-library-assets-list.component.html',
  styleUrls: ['./resource-library-assets-list.component.scss']
})
export class ResourceLibraryAssetsListComponent implements OnInit {
  searchString: string;
  resourceLibraryAssets: IResourceLibraryAsset[];
  pageTitle: string = "Manage Resource Library";
  IResourceLibraryAssetType = IResourceLibraryAssetType;
  IResourceLibraryAssetStatus = IResourceLibraryAssetStatus;
  constructor(private router: Router,
              private resourceLibraryAssetService: ResourceLibraryAssetService) { }

  ngOnInit() {
    this.loadResourceLibraryAssets();
  }

  loadResourceLibraryAssets(): void {
    this.resourceLibraryAssetService.getResourceLibraryAssetsWithResourceGroupAssignment().subscribe(resourceLibraryAssets => {
      this.resourceLibraryAssets = resourceLibraryAssets;
    }, error => console.log(`Unexpected error: ${error} (ref: loadResourceLibraryAssets)`));
  }

  cmdAddResource(): void {
    this.router.navigate(['resourcelibrary/manage', 0, "Add"]);
  }

  cmdEditResource(resourceLibraryAsset: IResourceLibraryAsset): void {
    this.router.navigate(['resourcelibrary/manage', resourceLibraryAsset.resourceLibraryAssetId, resourceLibraryAsset.name]);
  }

}
