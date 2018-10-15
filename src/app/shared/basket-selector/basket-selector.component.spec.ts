import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketSelectorComponent } from './basket-selector.component';
import { TreeBranchItemComponent } from '../tree-branch-item/tree-branch-item.component';
import { TreeBranchItemService } from '../tree-branch-item/tree-branch-item.service';

describe('BasketSelectorComponent', () => {
  let component: BasketSelectorComponent;
  let fixture: ComponentFixture<BasketSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasketSelectorComponent, TreeBranchItemComponent ],
      providers: [ TreeBranchItemService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
