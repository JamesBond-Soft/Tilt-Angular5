import { Directive, Inject, forwardRef, ElementRef } from '@angular/core';
import { CardDirective } from './card.directive';

@Directive({
  selector: '[pgCardMaximize]',
  host: {
    '(click)': 'maximize()'
  }
})
export class CardMaximizeDirective {
	anchorEl;
	constructor(@Inject(forwardRef(() => CardDirective)) public card, private _elementRef: ElementRef) {
	this.anchorEl = _elementRef.nativeElement;
	}

	maximize() { 
		this.card.maximize(); 
	}

}
