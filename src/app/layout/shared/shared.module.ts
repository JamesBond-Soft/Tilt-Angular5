import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilityModule } from '../../shared/utility.module';
//import { SidebarComponent } from './sidebar/sidebar.component';
//import { HeaderComponent } from './header/header.component';

@NgModule({
  imports: [
    CommonModule,
    UtilityModule
  ],
  declarations: []//[SidebarComponent,  HeaderComponent]
})
export class SharedModule { }
