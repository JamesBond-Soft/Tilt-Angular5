import { IResourceCategory } from "../resource-categories/resource-category";

export interface IResourceLibraryAsset {
    resourceLibraryAssetId: number,
    name: string,
    description: string,
    extRefNum: string,
    assetType: IResourceLibraryAssetType
    assetStatus: IResourceLibraryAssetStatus,
    organisationId: number,
    fileProperties: IResourceLibraryFileProperties
    cacheableFileProperties: IResourceLibraryFileProperties
    preProcessedFileProperties: IResourceLibraryFileProperties,
    thumbnailFileProperties: IResourceLibraryFileProperties,
    resourceGroupAssignments: IResourceGroupAssignment[],
    resourceCategoryId: number,
    resourceCategory: IResourceCategory,
    modifiedDate: Date
}

export enum IResourceLibraryAssetType {
    //enum which includes a type the asset
    Image = 0,
    Video = 1,
    PDF = 2,
    HTML = 3,
    Other = 4
  }

  export enum IResourceLibraryAssetStatus {
    //enum which includes the status of the asset
    Uploading = 0, //asset currently uploading, not ready to use
    Processing = 1, //asset is being processed, not ready to use
    Available = 2 //asset is available, use it!
  }

  export interface IResourceLibraryFileProperties {
      fileName: string,
      fileExtension: string,
      contentType: string,
      fileSize: number,
      url: string,
      extKey: string
  }

  export interface IResourceGroupAssignment {
    resourceGroupAssignmentId: number,
    resourceLibraryAssetId: number,
    groupId: number
  }