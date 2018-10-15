import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebinarNewBroadcastComponent } from './webinar-new-broadcast.component';

describe('WebinarNewBroadcastComponent', () => {
  let component: WebinarNewBroadcastComponent;
  let fixture: ComponentFixture<WebinarNewBroadcastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebinarNewBroadcastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebinarNewBroadcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
