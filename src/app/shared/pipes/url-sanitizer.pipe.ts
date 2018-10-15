import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

@Pipe({
  name: 'sanitizeUrlPipe'
})
export class UrlSanitizerPipe implements PipeTransform {

  constructor(private _sanitizer: DomSanitizer){}

  transform(value: any): any {
    //console.log(this._sanitizer.bypassSecurityTrustResourceUrl(value));
    return this._sanitizer.bypassSecurityTrustResourceUrl(value);
  }

}