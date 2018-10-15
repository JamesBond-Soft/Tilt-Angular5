import { Component, OnInit, Input, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { VgMedia } from 'videogular2/core';

@Component({
  selector: 'training-dynamic-content-video',
  template:`<vg-player #vgplayer class="embed-responsive embed-responsive-16by9">
  <video class="embed-responsive-item" [vgHls]="url" #media  id="singleVideo"
    preload="auto" controls type="contentType">
  </video>
</vg-player>`
})
export class TrainingDynamicContentVideoComponent implements OnInit, AfterViewInit {
 // @Input() data: string = "";
  @Input() url: string;
  @Input() contentType: string;
  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    // this.url = "https://tilt-test.s3.ap-southeast-2.amazonaws.com/08311746-6581-47a1-9054-c8f43295dc0d.mp4"; 
    // this.contentType = "video/mp4";
  }

  ngAfterViewInit() {
  //  this.cd.detectChanges();
  }

}
