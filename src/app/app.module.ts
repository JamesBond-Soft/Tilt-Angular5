import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpModule } from '@angular/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ProgressModule } from './shared/progress/progress.module';
import { pgCollapseModule } from './shared/collapse';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { TokenInterceptor } from './shared/token-interceptor'; //class that auto injects bearer token into all http requests//Basic Bootstrap Modules

//Layouts
import { CondensedComponent } from './layout/condensed/condensed.component';
import {BreadcrumbsModule} from "ng2-breadcrumbs";
//Shared Components
import { SidebarComponent } from './layout/shared/sidebar/sidebar.component';
import { HeaderComponent } from './layout/shared/header/header.component';
import { SharedModuleB } from './shared/shared.module';

//Basic Bootstrap Modules
import { BsDropdownModule } from 'ngx-bootstrap';
import { AccordionModule } from 'ngx-bootstrap';
import { AlertModule } from 'ngx-bootstrap';
import { ButtonsModule } from 'ngx-bootstrap';
import { CollapseModule } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import { ProgressbarModule } from 'ngx-bootstrap';
import { TabsModule } from 'ngx-bootstrap';
import { TooltipModule } from 'ngx-bootstrap';
import { BlankComponent } from './layout/blank/blank.component';
import { FormWizardModule } from 'angular2-wizard';

/* Features Modules */
import { LoginModule } from './login/login.module';
import { NotificationService } from './notifications/notification.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './login/auth-guard.service';
import { FormsModule } from '@angular/forms';

import {UtilityModule } from './shared/utility.module';
//import { LoginService } from './login/login.service';

import { pagesToggleService } from './@pages/services/toggler.service';
@NgModule({
  declarations: [
    AppComponent,
    CondensedComponent,
    SidebarComponent,
    HeaderComponent,
    BlankComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    BreadcrumbsModule,
    FormWizardModule,
    FormsModule,
    LoginModule,
    HttpModule,
    SharedModuleB,
    ProgressModule,
    pgCollapseModule,
    UtilityModule.forRoot(),
    BrowserAnimationsModule,
    BsDropdownModule.forRoot(),
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    ButtonsModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    ProgressbarModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
  ],
  exports: [],
  providers: [pagesToggleService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    AuthGuard,
    NotificationService
  ],
  bootstrap: [AppComponent],
  schemas: [  NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
