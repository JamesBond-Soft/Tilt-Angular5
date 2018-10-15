import { Component, OnInit,ElementRef, ViewChild } from '@angular/core';
import { ListItemComponent } from '../list-item/list-item.component'
@Component({
  selector: 'pg-list-view-container',
  templateUrl: './list-view-container.component.html',
  styleUrls: ['./list-view-container.component.scss']
})
export class ListViewContainerComponent implements OnInit {
  
  _items: ListItemComponent[] = [];
  elems = [];
  topHeader:any;
  topElement;
  fakeHeaderHidden = false;
  topClassAnimated = false;
  @ViewChild('itemListWrapper') itemListWrapper: ElementRef;

  constructor(private el: ElementRef) { }

  ngOnInit() {
  }

  cacheElements(){
    var rootRect = this.el.nativeElement.getBoundingClientRect();
    var els = this.el.nativeElement.querySelectorAll('.list-view-group-container');
    for (var i=0; i<els.length; i++){
        var rect = els[i].getBoundingClientRect();
        var offsetTop =  rect.top - rootRect.top;
        var headerElement = els[i].querySelector(".list-view-group-header")
        this.elems.push({
          'listHeight': rect.height,
          'headerHeight': headerElement.offsetHeight,
          'listOffset': offsetTop,
          'listBottom': rect.height + offsetTop,
          'animated':false
        })
        
    }
    this.computeHeader();
  }

  computeHeader(){
    let currentTop = this.itemListWrapper.nativeElement.scrollTop;
    let offscreenElement, topElementBottom,topIndex = 0;
    let i = 0;
    while ((this.elems[i].listOffset - currentTop) <= 0) {
      this.topElement = this.elems[i];
      topIndex = i;
      topElementBottom = this.topElement.listBottom - currentTop;
      if (topElementBottom < -this.topElement.headerHeight) {
          offscreenElement = this.topElement;
      }
      i++;
      if (i >= this.elems.length) {
          break;
      }
    }

    if ((topElementBottom < 0) && (topElementBottom > -this.topElement.headerHeight)) {
      this.fakeHeaderHidden = true;
      this.topElement.animated = true;
    } else {
        this.fakeHeaderHidden = false;
        if (this.topElement) {
          this.topElement.animated = false;
        }
    }

    if (this.topElement) {
      this.topHeader =this._items[topIndex]._itemHeading
    }
  }

  
}
