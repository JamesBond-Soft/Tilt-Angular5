import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { pgCollapseComponent } from './collapse.component';
import { pgCollapsesetComponent } from './collapseset.component';

describe('My First Test', () => {
  it('should get "Hello Taobao"', () => null);
});

describe('pgCollapsesetComponent', () => {
  let component: pgCollapsesetComponent;
  let fixture: ComponentFixture<pgCollapsesetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [pgCollapseComponent, pgCollapsesetComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(pgCollapsesetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('测试input - accordion : string', () => {
    //component.nzAccordion = true;
    fixture.detectChanges();
    // expect(a).toEqual(b);
  });
});
