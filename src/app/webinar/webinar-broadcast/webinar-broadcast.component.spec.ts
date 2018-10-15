import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebinarBroadcastComponent } from './webinar-broadcast.component';

describe('WebinarBroadcastComponent', () => {
  let component: WebinarBroadcastComponent;
  let fixture: ComponentFixture<WebinarBroadcastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebinarBroadcastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebinarBroadcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
