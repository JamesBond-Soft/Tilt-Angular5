import { Component, OnInit, OnDestroy, ViewChild, HostListener, AfterViewInit, Input } from '@angular/core';
import { environment } from '../../../environments/environment';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { pagesToggleService } from '../../@pages/services/toggler.service';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';

declare var pg: any;

@Component({
  selector: 'app-condensed',
  templateUrl: './condensed.component.html',
  styleUrls: ['./condensed.component.scss']
})
export class CondensedComponent   implements OnInit {

  version: string = environment.version;
  layoutState:string;
  @ViewChild('root') root;

  constructor(private router: Router) {
  	if(this.layoutState){
  		pg.addClass(document.body,this.layoutState);
    }
    pg.removeClass(document.body,"sidebar-open");
  }

  changeLayout(type:string) {
  	pg.removeClass(document.body,this.layoutState);
  	pg.addClass(document.body,type);
  }

  removeLayout(type:string) {
  	pg.removeClass(document.body,type);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    
  }
}
