import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule }from '@angular/forms';

import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
import { VgStreamingModule } from 'videogular2/streaming';

import { ResourcesListComponent } from './resources-list/resources-list.component';
import { ResourcesDetailComponent } from './resources-detail/resources-detail.component';
import { SharedModuleB } from '../shared/shared.module';
import { ResourceLibraryAssetService } from '../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';
import { UtilityModule } from '../shared/utility.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModuleB,
    UtilityModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    VgStreamingModule,
    RouterModule.forChild([
      { path: ':resourceLibraryAssetId', pathMatch:'full', component: ResourcesDetailComponent},
      { path: '', component: ResourcesListComponent},
    ])
  ],
  declarations: [
                  ResourcesListComponent, 
                  ResourcesDetailComponent
                ],
  providers:[
    ResourceLibraryAssetService
  ]
})


export class ResourcesModule { }
