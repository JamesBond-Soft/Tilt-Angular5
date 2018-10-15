import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentCreatorComponent } from './contentcreator.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UtilityModule } from '../shared/utility.module';
import { RouterModule } from '@angular/router';
import { ResourceLibraryAssetService } from '../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';
import { AuthGuard } from '../login/auth-guard.service';
import { CoursePageContentBlockService } from '../courses/manage-courses/course-page-content-blocks/course-page-content-block.service';
import { ModalModule, BsModalRef } from 'ngx-bootstrap/modal';
import { SimpleComponent } from './simple.component';
import { ClarityComponent } from './clarity.component';
//import { ClarityComponent } from './clarity.component';

import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
import { VgStreamingModule } from 'videogular2/streaming';
import { CoursePageContentQuestionPackService } from '../courses/manage-courses/course-page-content-questions/course-page-content-question-pack.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule.forRoot(),
    UtilityModule,
    RouterModule.forChild([
      
//      { path: 'manage', pathMatch: 'full', component: ResourceLibraryAssetsListComponent},
      { path: '', pathMatch: 'full', canActivate: [AuthGuard], component: ContentCreatorComponent}
      //{ path: '', pathMatch: 'full', redirectTo:'manage'}
    ]),
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    VgStreamingModule,
  ],
  declarations: [ContentCreatorComponent, SimpleComponent, ClarityComponent],
  providers: [
    ResourceLibraryAssetService,
    CoursePageContentBlockService,
    BsModalRef,
    CoursePageContentQuestionPackService
  ],
  entryComponents:[SimpleComponent, ClarityComponent ],
  exports:[ContentCreatorComponent]
})
export class ContentcreatorModule { }
