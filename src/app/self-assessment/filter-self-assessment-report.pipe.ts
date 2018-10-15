import { Pipe, PipeTransform } from '@angular/core';
import { ISelfAssessmentReport } from './self-assessment-report';
@Pipe({
  name: 'filterSelfAssessmentReport'
})
export class FilterSelfAssessmentReportPipe implements PipeTransform {

  transform(items: ISelfAssessmentReport[], searchValue: string): any {
    if (!items) {
      return [];
    }
    if (!searchValue) {
      return items;
    }

    return items.filter(singleItem => {
      let searchStr: string = searchValue.toLowerCase();

      return (singleItem.userProfile.hrStaffReferenceID && singleItem.userProfile.hrStaffReferenceID.toLowerCase().includes(searchStr))
        || (singleItem.userProfile.firstName && singleItem.userProfile.firstName.toLowerCase().includes(searchStr))
        || (singleItem.userProfile.lastName && singleItem.userProfile.lastName.toLowerCase().includes(searchStr))

        //TODO: ADD DOB FILTERING BY STRING?? PLUS DATE LODGED FILTERING BY STRING??
      });
  }

}
