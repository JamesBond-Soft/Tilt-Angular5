import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { IResourceLibraryAsset, IResourceLibraryAssetType } from '../../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset';
import { ResourceLibraryAssetService } from '../../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';

@Component({
  selector: 'app-media-picker-dialog',
  templateUrl: './media-picker-dialog.component.html',
  styleUrls: ['./media-picker-dialog.component.scss']
})
export class MediaPickerDialogComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
  IMediaPickerMode = IMediaPickerMode;
  IMediaPickerDisplayMode = IMediaPickerDisplayMode;

  pageTitle: string = "Media Picker";
  mediaPickerMode: IMediaPickerMode;
  displayMode: IMediaPickerDisplayMode =  IMediaPickerDisplayMode.Gallery; //default mode is list
  searchString: string;
  resourceLibraryAssets: IResourceLibraryAsset[];
  selectedAsset: IResourceLibraryAsset;

  constructor(private bsModalRef: BsModalRef, 
    private modalService: BsModalService,
    private resourceLibraryAssetService: ResourceLibraryAssetService) { }

  ngOnInit() {
    if(this.mediaPickerMode === IMediaPickerMode.Image){
      this.pageTitle = "Media Picker - Image";
    } else if(this.mediaPickerMode === IMediaPickerMode.Video){
      this.pageTitle = "Media Picker - Video";
    }
    
    this.loadResources();
  }

  loadResources(): void {
    let assetType: IResourceLibraryAssetType;
    if(this.mediaPickerMode === IMediaPickerMode.Image) {
      assetType = IResourceLibraryAssetType.Image;
    } else if(this.mediaPickerMode === IMediaPickerMode.Video){
      assetType = IResourceLibraryAssetType.Video;
    }

    this.resourceLibraryAssetService.getResourceLibraryAssetListOfType(assetType).subscribe(resourceLibraryAssets => {
        this.resourceLibraryAssets = this.resourceLibraryAssetService.sortResourceLibraryAssetList(resourceLibraryAssets).reverse();
      }, error => console.log(`Unexpected error: ${error} (ref loadResources)`)
    );
  }

  cmdInsert(resourceLibraryAsset: IResourceLibraryAsset): void { 
    this.selectedAsset = resourceLibraryAsset;
    this.cmdClose();
  }

  cmdClose() {
    this.bsModalRef.hide();
  }

  cmdChangeDisplayMode(displayMode: IMediaPickerDisplayMode): void {
    this.displayMode = displayMode;
  }
}

export enum IMediaPickerMode {
  Image = 0,
  Video = 1
}

export enum IMediaPickerDisplayMode {
  List = 0,
  Gallery = 1
}