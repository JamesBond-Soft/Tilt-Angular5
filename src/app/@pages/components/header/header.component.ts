import { Component, OnInit,Inject,forwardRef,Input } from '@angular/core';
import { pagesToggleService } from '../../services/toggler.service'
import { Subscriber } from 'rxjs/Subscriber'
declare var pg: any;
@Component({
  selector: 'pg-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [pagesToggleService]
})
export class HeaderComponent implements OnInit {
	_headerClass = "";
	isHorizontalLayout:false;
	@Input()
	boxed:boolean = false;

	@Input()
	extraClass:string = "";

	constructor(private toggler:pagesToggleService) {
	}

	ngOnInit() {
		this.isHorizontalLayout = pg.isHorizontalLayout;
		this.toggler.headerClass
		.subscribe(state => {
		  this._headerClass = state;
		});
	}

}
