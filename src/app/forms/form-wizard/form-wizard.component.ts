import { Component, OnInit, ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
  selector: 'app-form-wizard',
  templateUrl: './form-wizard.component.html',
  styleUrls: ['./form-wizard.component.scss']
})
export class FormWizardComponent implements OnInit {
 	@ViewChild('staticTabs') staticTabs: TabsetComponent;
	constructor() { }

	ngOnInit() {
	}
	ngAfterViewChecked(){
		//TODO - Cheat fix waiting ngx-bootstrap customClass
		var el = window.document.querySelector(".nav.nav-tabs");
		el.classList.add("nav-tabs-linetriangle");
		el.classList.add("nav-tabs-separator");
	}
	selectTab(tab_id: number) {
		this.staticTabs.tabs[tab_id].active = true;
	}
}
