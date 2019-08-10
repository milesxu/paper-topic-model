import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTreeNzComponent } from './category-tree-nz.component';

describe('CategoryTreeNzComponent', () => {
  let component: CategoryTreeNzComponent;
  let fixture: ComponentFixture<CategoryTreeNzComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CategoryTreeNzComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryTreeNzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
