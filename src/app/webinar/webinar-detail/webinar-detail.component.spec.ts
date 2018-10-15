import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebinarDetailComponent } from './webinar-detail.component';

describe('WebinarDetailComponent', () => {
  let component: WebinarDetailComponent;
  let fixture: ComponentFixture<WebinarDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebinarDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebinarDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
