import { Pipe, PipeTransform } from '@angular/core';
//import { GenericStatusNamePipe } from './generic-status-name.pipe';
import { IResourceLibraryAsset, IResourceLibraryAssetType, IResourceLibraryAssetStatus } from '../../resource-library/manage-resource-library/resource-library-assets/resource-library-asset';
import { EnumToArrayPipe } from './enum-to-array.pipe';

@Pipe({
  name: 'filterResourceLibraryAssetsPipe'
})
export class FilterResourceLibraryAssetsPipe implements PipeTransform {
  
  constructor(//private genericStatusNamePipe: GenericStatusNamePipe,
              private enumToArrayPipe: EnumToArrayPipe){

  }

  transform(items: IResourceLibraryAsset[], searchValue: string): any {
    if (!items) {
      return [];
    }
    if (!searchValue) {
      return items;
    }

    return items.filter(item => {
      let searchStr: string = searchValue.toLowerCase();

      return (item.name && item.name.toLowerCase().includes(searchStr))
        || (item.description && item.description.toLowerCase().includes(searchStr))
        || ((item.assetType != undefined && item.assetType != null) && this.enumToArrayPipe.transform(IResourceLibraryAssetType)[item.assetType].toLowerCase().includes(searchStr))
        || ((item.assetStatus != undefined && item.assetStatus != null) && this.enumToArrayPipe.transform(IResourceLibraryAssetStatus)[item.assetStatus].toLowerCase().includes(searchStr))
        || (item.resourceCategory && item.resourceCategory.name.toLowerCase().includes(searchStr))
      });
  }

}
