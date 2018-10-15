import { Component, OnInit } from '@angular/core';
import { IResourceLibraryAsset, IResourceLibraryAssetType } from '../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceLibraryAssetService } from '../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';
import { VgMedia } from 'videogular2/core';

@Component({
  selector: 'app-resources-detail',
  templateUrl: './resources-detail.component.html',
  styleUrls: ['./resources-detail.component.scss']
})
export class ResourcesDetailComponent implements OnInit {
  resourceLibraryAsset: IResourceLibraryAsset;
  pageTitle: string;
  IResourceLibraryAssetType = IResourceLibraryAssetType;
  constructor(private route: ActivatedRoute,
              private router: Router,
              private resourceLibraryAssetService: ResourceLibraryAssetService) { }

  ngOnInit() {
    this.loadResource();
  }

  loadResource(): void {
    this.route.paramMap.subscribe(params => {
      if (params.has("resourceLibraryAssetId")) {
        if (+params.get("resourceLibraryAssetId") === 0) {
          console.log("Warning - could not find resourceLibraryAssetId in route. Returning user to resource list");
        this.router.navigate(["/resources"]);
        } else {
          this.resourceLibraryAssetService.getResourceLibraryAssetWithResourceGroupAssignment(+params.get("resourceLibraryAssetId")).subscribe(resourceLibraryAsset => {
            this.resourceLibraryAsset = resourceLibraryAsset;
            this.pageTitle = this.resourceLibraryAsset.name ? this.resourceLibraryAsset.name : 'Unnamed Resource';
          }, error => {
            console.log(`Unexpected error ${error} (ref loadResourceLibraryAsset)`)
            this.router.navigate(["/resourcelibrary/manage"]);
          });
        }
      } else {
        console.log("Warning - could not find resourceLibraryAssetId in route. Returning user to resource list");
        this.router.navigate(["/resources"]);
      }
    });
  }

}
