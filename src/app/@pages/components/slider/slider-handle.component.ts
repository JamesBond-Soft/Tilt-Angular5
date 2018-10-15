import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';

import { toBoolean } from '../util/convert';
import { pgSliderComponent } from './slider.component';

@Component({
  selector     : 'pg-slider-handle',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <div [class]="ClassName" [ngStyle]="style"></div>
  `
})
export class pgSliderHandleComponent implements OnChanges {

  // Static properties
  @Input() ClassName: string;
  @Input() Vertical: string;
  @Input() Offset: number;
  @Input() Value: number; // [For tooltip]
  @Input() TipFormatter: (value: number) => string; // [For tooltip]
  @Input() set Active(value: boolean) { // [For tooltip]
    const show = toBoolean(value);
    // if (this.tooltip) {
    //   if (show) {
    //     this.tooltip.show();
    //   } else {
    //     this.tooltip.hide();
    //   }
    // }
  }

  // Locals
  //@ViewChild('tooltip') tooltip: ToolTipComponent; // [For tooltip]
  tooltipTitle: string; // [For tooltip]
  style: object = {};

  constructor(private _slider: pgSliderComponent) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.Offset) {
      this._updateStyle();
    }
    if (changes.Value) {
      this._updateTooltipTitle(); // [For tooltip]
      this._updateTooltipPosition(); // [For tooltip]
    }
  }

  // Hover to toggle tooltip when not dragging
  @HostListener('mouseenter', [ '$event' ])
  onMouseEnter($event: MouseEvent): void {
    if (!this._slider.isDragging) {
      this.Active = true;
    }
  }
  @HostListener('mouseleave', [ '$event' ])
  onMouseLeave($event: MouseEvent): void {
    if (!this._slider.isDragging) {
      this.Active = false;
    }
  }

  private _updateTooltipTitle(): void { // [For tooltip]
  //  this.tooltipTitle = this.TipFormatter ? this.TipFormatter(this.Value) : `${this.Value}`;
  }

  private _updateTooltipPosition(): void { // [For tooltip]
    // if (this.tooltip) {
    //   window.setTimeout(() => this.tooltip.updatePosition(), 0); // MAY use ngAfterViewChecked? but this will be called so many times.
    // }
  }

  private _updateStyle(): void {
    this.style[ this.Vertical ? 'bottom' : 'left' ] = `${this.Offset}%`;
  }
}
