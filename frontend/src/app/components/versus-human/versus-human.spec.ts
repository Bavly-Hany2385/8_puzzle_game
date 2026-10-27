import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersusHuman } from './versus-human';

describe('VersusHuman', () => {
  let component: VersusHuman;
  let fixture: ComponentFixture<VersusHuman>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VersusHuman]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VersusHuman);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
