import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebinarViewComponent } from './webinar-view.component';

describe('WebinarViewComponent', () => {
  let component: WebinarViewComponent;
  let fixture: ComponentFixture<WebinarViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebinarViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebinarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
