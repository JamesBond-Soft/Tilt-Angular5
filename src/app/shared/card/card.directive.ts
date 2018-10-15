import { Directive, ContentChild, ElementRef } from '@angular/core';

@Directive({
  selector: '[pgCard]',
  host: {'[class.card-collapsed]': 'collapsed','[class.card-maximized]': 'maximized'}
})
export class CardDirective {
	anchorEl;
	collapsed:boolean = false;
	maximized:boolean = false;
	constructor(private _elementRef: ElementRef) { 
		this.anchorEl = _elementRef.nativeElement;
	}

	toggle(): void {
		this.collapsed = (this.collapsed === true ? false : true);
	}

	maximize():void{
		if(this.maximized){
			this.maximized = false;
			this.anchorEl.style.left = null;
			this.anchorEl.style.top = null;
		}
		else{
			this.maximized = true;
			var pagecontainer = document.querySelector(".content");
			var rect = pagecontainer.getBoundingClientRect();
			var style = window.getComputedStyle(pagecontainer);

			this.anchorEl.style.left = rect.left+"px" ;
			this.anchorEl.style.top = (parseFloat(style["padding-top"])+ rect.top)+"px";			
		}
	}
}
