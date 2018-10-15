import { IResourceLibraryAsset } from "../../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset";

export interface ICoursePageContentBlock {
    coursePageContentBlockId: number,
    coursePageId: number,
    coursePageContentId: number,
    name: string,
    extRefNum: string,
    content: string,
    rawComponents: string,
    rawStyles: string,
    order: number,
    blockType: IContentBlockType,
    resourceLibraryAssetId: number,
    resourceLibraryAsset: IResourceLibraryAsset
}

export enum IContentBlockType {
    //enum which includes a type for each instruction
   HTML = 0,
   Video = 1,
   Resource = 2
  }