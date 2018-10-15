import { Directive, Inject, forwardRef, ElementRef } from '@angular/core';
import { CardDirective } from './card.directive';

@Directive({
  selector: '[pgCardToggle]',
  host: {
    '(click)': 'toggleOpen()'
  }
})
export class CardToggleDirective {
	anchorEl;
	constructor(@Inject(forwardRef(() => CardDirective)) public card, private _elementRef: ElementRef) {
	this.anchorEl = _elementRef.nativeElement;
	}

	toggleOpen() { 
		this.card.toggle(); 
	}

}
