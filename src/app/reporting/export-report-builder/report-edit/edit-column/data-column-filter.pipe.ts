import { Pipe, PipeTransform } from '@angular/core';
import { IColumnMapping } from '../../column-mapping';

@Pipe({
  name: 'dataColumnFilterPipe'
})
export class DataColumnFilterPipe implements PipeTransform {

  transform(columnMappings: IColumnMapping[], dataTableName: string): string[] {
    if(dataTableName && columnMappings){
      return columnMappings.find(cm => cm.tableName === dataTableName)['columnNames'];
    }
    return null;
  }
}
