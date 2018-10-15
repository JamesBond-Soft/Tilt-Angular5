import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IResourceLibraryAsset, IResourceLibraryAssetType, IResourceLibraryAssetStatus } from '../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset';
import { ResourceLibraryAssetService } from '../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';


@Component({
  selector: 'app-resources-list',
  templateUrl: './resources-list.component.html',
  styleUrls: ['./resources-list.component.scss']
})
export class ResourcesListComponent implements OnInit {
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
    this.resourceLibraryAssetService.getMyResources().subscribe(resourceLibraryAssets => {
      this.resourceLibraryAssets = resourceLibraryAssets;
    }, error => console.log(`Unexpected error: ${error} (ref: loadResourceLibraryAssets)`));
  }

  cmdOpenResource(event: Event, resourceLibraryAsset: IResourceLibraryAsset){
    event.stopPropagation();

    this.router.navigate(['resources', resourceLibraryAsset.resourceLibraryAssetId]);
  }

}
