import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategortyTreeNzComponent } from './category-tree-nz.component';

describe('CategortyTreeNzComponent', () => {
  let component: CategortyTreeNzComponent;
  let fixture: ComponentFixture<CategortyTreeNzComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CategortyTreeNzComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategortyTreeNzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
