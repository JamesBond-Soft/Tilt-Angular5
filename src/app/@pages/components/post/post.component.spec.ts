import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { pgPost } from './post.component';

describe('pgPost', () => {
  let component: pgPost;
  let fixture: ComponentFixture<pgPost>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ pgPost ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(pgPost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
