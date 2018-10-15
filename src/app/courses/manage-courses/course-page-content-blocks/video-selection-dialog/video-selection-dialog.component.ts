import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { IResourceLibraryAsset, IResourceLibraryAssetType, IResourceLibraryAssetStatus } from '../../../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset';
import { ResourceLibraryAssetService } from '../../../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';

@Component({
  selector: 'app-video-selection-dialog',
  templateUrl: './video-selection-dialog.component.html',
  styleUrls: ['./video-selection-dialog.component.scss']
})
export class VideoSelectionDialogComponent implements OnInit {
  modalTitle: string;
  selectedAsset: IResourceLibraryAsset;
  resourceLibraryAssets: IResourceLibraryAsset[];

  constructor(public bsModalRef: BsModalRef,
              private resourceLibraryAssetService: ResourceLibraryAssetService) { }

  ngOnInit() {
    this.loadResourceLibraryAssets();
  }

  loadResourceLibraryAssets(): void {
    this.resourceLibraryAssetService.getResourceLibraryAssets().subscribe(resourceLibraryAssets => {
      this.resourceLibraryAssets = resourceLibraryAssets;
    }, error => console.log(`Unexpected error: ${error}`));
  }

  cmdClose() {
    this.bsModalRef.hide();
  }

  cmdSelectVideo(resourceLibraryAsset: IResourceLibraryAsset) {
    this.selectedAsset = resourceLibraryAsset;
    this.cmdClose();
  }

}
