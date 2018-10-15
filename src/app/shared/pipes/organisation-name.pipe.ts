import { Pipe, PipeTransform } from '@angular/core';
import { IOrganisation } from '../../settings/settings-organisations/organisation';

@Pipe({
  name: 'organisationNamePipe'
})
export class OrganisationNamePipe implements PipeTransform {

  transform(orgId: number, orgs: IOrganisation[]): any {
    if(orgId && orgId > 0){
      var matchingOrg: IOrganisation = orgs.find(o => o.organisationId === orgId);
      if(matchingOrg){
        return matchingOrg.organisationName;
      }
    }
    return null;
  }
}
