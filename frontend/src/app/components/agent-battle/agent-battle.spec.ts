import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentBattle } from './agent-battle';

describe('AgentBattle', () => {
  let component: AgentBattle;
  let fixture: ComponentFixture<AgentBattle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentBattle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentBattle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
