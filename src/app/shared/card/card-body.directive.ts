import { Directive, } from '@angular/core';
import { CardDirective } from './card.directive';

@Directive({
  selector: '[pgCardBody]'
})
export class CardBodyDirective {

  constructor() { }

}
