import { Directive, ElementRef, Renderer2, Input, HostListener } from '@angular/core';
declare var pg: any;

@Directive({
  selector: '[pg-view-trigger]'
})
export class ViewDirective {
	@Input() parent: string;
	@Input() animationType: string;

 	constructor(private parallaxEl: ElementRef,private renderer: Renderer2) { 
 	}
	@HostListener('click', ['$event']) 
	onClick(e) {
		if(this.parent != null){
			var parent = document.getElementById(this.parent);
			if(parent){
				if(this.animationType!= null){
					pg.toggleClass(parent, this.animationType);
				}
				else{
					pg.toggleClass(parent, 'push-parrallax');
				}
			}
		}
	}
}
