import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageWebinarService } from '../webinar.service';
import { IWebinar,IWebinarStatus } from '../webinar';

@Component({
  selector: 'app-webinar-view',
  templateUrl: './webinar-view.component.html',
  styleUrls: ['./webinar-view.component.scss']
})
export class WebinarViewComponent implements OnInit, OnDestroy {
  webinar: IWebinar;
  IWebinarStatus = IWebinarStatus;
  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private manageWebinarService: ManageWebinarService
  ) {
  }

  ngOnInit() {
    this.route.data.subscribe( data => {
      this.webinar = data['webinar'];
      console.log(this.webinar);
    });
    // set this staff to attended users of the this webinar
    this.manageWebinarService.setAttended(this.webinar.webinarId).subscribe(response => {
    }, error => {
      console.log('unexpected error', error);
    });
  }

  ngOnDestroy() {
    this.manageWebinarService.removeAttended(this.webinar.webinarId).subscribe(response => {
    }, error => {
      console.log('unexpected error', error);
    });
  }

}
