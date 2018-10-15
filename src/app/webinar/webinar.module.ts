import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '../forms/forms.module';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilityModule } from '../shared/utility.module';
import { WebinarListComponent } from './webinar-list/webinar-list.component';
import { WebinarDetailComponent } from './webinar-detail/webinar-detail.component';
import { WebinarBroadcastComponent } from './webinar-broadcast/webinar-broadcast.component';
import { WebinarNewBroadcastComponent } from './webinar-new-broadcast/webinar-new-broadcast.component';

import { GroupService } from '../groups/group.service';
import { ManageWebinarService } from './webinar.service';
import { AntMediaService } from './antMedia.service';
import { BsDatepickerModule, TimepickerModule } from 'ngx-bootstrap';
import { AuthGuard } from '../login/auth-guard.service';

import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
import { VgStreamingModule } from 'videogular2/streaming';
import { WebinarViewComponent } from './webinar-view/webinar-view.component';

import { WebinarGetResolverService } from './webinar-get-resolver.service';
import { ResourceLibraryAssetService } from '../resource-library/manage-resource-library/resource-library-assets/resource-library-asset.service';
import { NotificationService } from '../notifications/notification.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UtilityModule,
    RouterModule.forChild([
      { path: 'list', pathMatch: 'full', component: WebinarListComponent },
      { path: 'detail/:webinarId', pathMatch: 'full', component: WebinarDetailComponent, resolve: { webinar : WebinarGetResolverService}},
      { path: 'new-broadcast/:webinarId', component: WebinarNewBroadcastComponent },
      { path: 'broadcast/:webinarId', pathMatch: 'full', component: WebinarBroadcastComponent, resolve: { webinar : WebinarGetResolverService}},
      { path: 'view/:webinarId', pathMatch: 'full', component: WebinarViewComponent, resolve: { webinar : WebinarGetResolverService}},
      { path: '', pathMatch: 'full', redirectTo: 'list'}
    ]),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    VgStreamingModule,
  ],
  declarations: [
    WebinarListComponent,
    WebinarDetailComponent,
    WebinarBroadcastComponent,
    WebinarNewBroadcastComponent,
    WebinarViewComponent
  ],
  providers: [
    GroupService,
    ManageWebinarService,
    AntMediaService,
    WebinarGetResolverService,
    ResourceLibraryAssetService,
    NotificationService
  ]
})
export class WebinarModule { }
