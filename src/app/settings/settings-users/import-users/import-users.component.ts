import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { IUser } from '../user';
import { IUserProfile } from '../../../users/user-profile';
import { SettingsOrganisationsService } from '../../settings-organisations/settings-organisations.service';
import { IOrganisation } from '../../settings-organisations/organisation';
import { SettingsUsersService } from '../settings-users.service';
import { IRole } from '../role';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-import-users',
  templateUrl: './import-users.component.html',
  styleUrls: ['./import-users.component.scss']
})
export class ImportUsersComponent implements OnInit {

  constructor(public bsModalRef: BsModalRef, private orgService: SettingsOrganisationsService, 
              private settingUserService: SettingsUsersService) { }

  ngOnInit() {
  }

  file:any;
  fileChanged(e) {
    this.file = e.target.files[0];
  }


  cmdImportUser(){
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let rowData = String(fileReader.result).split("\r\n");
      let users = new Array<IUser>();
      let orgs = Array<IOrganisation>();
      let roles = Array<IRole>();

      this.orgService.getOrganisations()
      .subscribe(orgData => {
        orgs = orgData;

        this.settingUserService.getRoleList()
        .subscribe(roleData=>{
          roles = roleData;

          rowData.forEach(function(r,i){
            if(i>0)
            {
              let splitData = r.split(",");
              if(splitData.length === 15)
              {
                  let matchingOrgId=-1;
                  orgs.forEach(o=>{
                    if(o.organisationName.toLowerCase()==splitData[10].toLowerCase())
                    {
                      matchingOrgId=o.organisationId
                    }
                  })
    
                  let matchingRoleId=-1
                  roles.forEach(r=>{
                    if(r.roleName.toLowerCase()==splitData[11].toLowerCase())
                    {
                      matchingRoleId= r.roleId;
                    }
                  })

                  let profile: IUserProfile = {
                    userProfileId: 0,
                    userId: 0,
                    managerId: null,
                    firstName: splitData[2],
                    lastName: splitData[4],
                    email: splitData[6],
                    phone: splitData[7],
                    dob: null,
                    workPhone: splitData[8],
                    workMobilePhone: splitData[9],
                    hrStaffReferenceID: splitData[12],
                    hrCostCentreReferenceID: splitData[14],
                    hrDepartmentReferenceID: splitData[13],
                    pin:"0000"
                  } 
  
                  let user : IUser = {
                    userId: 0,
                    username: splitData[0],
                    firstName: splitData[2],
                    phone: splitData[7],
                    pin: "0000",
                    lastName: splitData[4],
                    email: splitData[6],
                    password: splitData[1],
                    roleId: matchingRoleId,
                    organisationId: matchingOrgId,
                    userProfile: profile                
                  }

                  if(user.organisationId !=-1 && user.roleId != -1)
                  {
                    if(user.username != "" && user.password != "" )
                    {
                      if(user.firstName != "" && user.lastName != "")
                      {
                        if(user.password.length >= 4)
                        {
                          users.push(user)
                        }
                      }                      
                    }
                  }
              }
            }
          })

          console.log(users)
          let observes = new Array<any>();
          users.forEach(u=>{
            observes.push(this.settingUserService.saveUser(u));
          })

          Observable.forkJoin(observes)
          .subscribe(()=>{
            this.bsModalRef.hide();
          },error=>{
            this.bsModalRef.hide();
            alert("Error: " + error)
          })
        })
      });
    }
    fileReader.readAsText(this.file);
  } 
}
