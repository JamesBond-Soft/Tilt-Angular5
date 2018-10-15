import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ModalModule } from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { ResourceLibraryAssetsListComponent } from './manage-resource-library/resource-library-assets/resource-library-assets-list.component';
import { UtilityModule } from '../shared/utility.module';
import { ResourceLibraryAssetService } from './manage-resource-library/resource-library-assets/resource-library-asset.service';
import { UploadComponent } from './manage-resource-library/resource-library-assets/upload/upload.component';
import { FileUploadModule } from 'ng2-file-upload';
import { ResourceLibraryAssetEditComponent } from './manage-resource-library/resource-library-assets/resource-library-asset-edit/resource-library-asset-edit.component';
import { SettingsUsersOrganisationsResolver } from '../settings/settings-users/settings-users-organisations-resolver.service';
import { SettingsOrganisationsService } from '../settings/settings-organisations/settings-organisations.service';
import { ResourceFileDetailsComponent } from './manage-resource-library/resource-library-assets/resource-library-asset-edit/resource-file-details/resource-file-details.component';
import { ResourceFileUploadComponent } from './manage-resource-library/resource-library-assets/resource-library-asset-edit/resource-file-upload/resource-file-upload.component';
import { GroupService } from '../groups/group.service';
import { ResourceCategoryEditComponent } from './manage-resource-library/resource-categories/resource-category-edit.component';
import { ResourceCategoryItemComponent } from './manage-resource-library/resource-categories/resource-category-item.component';
import { ResourceCategoryListComponent } from './manage-resource-library/resource-categories/resource-category-list.component';
import { ResourceCategorySelectComponent } from './manage-resource-library/resource-categories/resource-category-select.component';
import { ResourceCategorySelectionItemComponent } from './manage-resource-library/resource-categories/resource-category-selection-item.component';
import { ResourceCategoryItemService } from './manage-resource-library/resource-categories/resource-category-item.service';
import { ResourceCategoryService } from './manage-resource-library/resource-categories/resource-category.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UtilityModule,
    FileUploadModule,
    ModalModule.forRoot(),
    RouterModule.forChild([
      
      { path: 'manage/upload', pathMatch: 'full', component: UploadComponent},
      { path: 'manage/:resourceLibraryAssetId/:breadcrumb', pathMatch: 'full', component: ResourceLibraryAssetEditComponent, resolve: { orgs: SettingsUsersOrganisationsResolver }},
      { path: 'categories', data: {breadcrumb : 'Resource Categories'}, pathMatch: 'full', component: ResourceCategoryListComponent, resolve: {orgs: SettingsUsersOrganisationsResolver} },
      { path: 'categories/:id', pathMatch: 'full', component: ResourceCategoryEditComponent },
      { path: 'manage', pathMatch: 'full', component: ResourceLibraryAssetsListComponent},
      { path: '', pathMatch: 'full',  component: ResourceLibraryAssetsListComponent}
    ])
  ],
  declarations: [ ResourceLibraryAssetsListComponent, 
                  UploadComponent, 
                  ResourceLibraryAssetEditComponent,
                  ResourceFileDetailsComponent,
                  ResourceFileUploadComponent,
                  ResourceCategoryEditComponent,
                  ResourceCategoryItemComponent,
                  ResourceCategoryListComponent,
                  ResourceCategorySelectComponent,
                  ResourceCategorySelectionItemComponent

                ],
  providers: [
              ResourceLibraryAssetService, 
              SettingsUsersOrganisationsResolver,
              SettingsOrganisationsService,
              GroupService,
              ResourceCategoryItemService,
              SettingsOrganisationsService,
              ResourceCategoryService
            ],
  entryComponents: [ResourceCategorySelectComponent]
})
export class ResourceLibraryModule { }
