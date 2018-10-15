import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceFileDetailsComponent } from './resource-file-details.component';

describe('ResourceFileDetailsComponent', () => {
  let component: ResourceFileDetailsComponent;
  let fixture: ComponentFixture<ResourceFileDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourceFileDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceFileDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
