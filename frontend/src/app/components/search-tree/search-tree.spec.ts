import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTree } from './search-tree';

describe('SearchTree', () => {
  let component: SearchTree;
  let fixture: ComponentFixture<SearchTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
