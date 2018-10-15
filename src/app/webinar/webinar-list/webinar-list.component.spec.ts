import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebinarListComponent } from './webinar-list.component';

describe('WebinarListComponent', () => {
  let component: WebinarListComponent;
  let fixture: ComponentFixture<WebinarListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebinarListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebinarListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
