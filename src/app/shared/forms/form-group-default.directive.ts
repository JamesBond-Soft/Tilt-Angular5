import { Directive,ElementRef,HostListener } from '@angular/core';

@Directive({
  selector: '[pgFormGroupDefault]'
})
export class FormGroupDefaultDirective {
 		
	constructor(private El: ElementRef) { 
		console.log("asdsad")
	}

	@HostListener('focus') onFocus() {
		console.log("asdsad")
    	this.El.nativeElement.parentNode.classList.add('focused');
	}

	@HostListener('focusout') onFocusOut() {
    	this.El.nativeElement.parentNode.classList.remove('focused');
	}
}
