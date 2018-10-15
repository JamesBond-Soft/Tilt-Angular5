import { Directive,ElementRef,HostListener } from '@angular/core';
declare var pg: any;

@Directive({
  selector: '[pg-parallax]'
})
export class ParallaxDirective {
	private parrallax:any;
	constructor(private parallaxEl: ElementRef) { 
		
	}

	ngOnInit() {
		this.parrallax = new pg.Parallax(this.parallaxEl.nativeElement)
	}
	@HostListener("window:scroll", [])
	onWindowScroll() {
		this.parrallax.animate(this.parallaxEl.nativeElement)
	}
}
