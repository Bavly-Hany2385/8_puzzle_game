import { Component, OnDestroy, ViewChild, inject } from '@angular/core';
import { Board, BoardSnapshot, MoveInfo, SolveInfo } from '../board/board';
import { GameConfig } from '../../models/gameConfig';
import { GameConfigService } from '../../services/gameConfigService';

type Phase = 'setup' | 'solving' | 'racing' | 'done';
type First = 'Human' | 'Agent' | 'Simultaneous';

@Component({
  selector: 'app-versus-human',
  imports: [Board],
  templateUrl: './versus-human.html',
  styleUrl: './versus-human.css',
})
export class VersusHuman implements OnDestroy {
  @ViewChild('human') human!: Board;   
  @ViewChild('agent') agent!: Board; 

  private store = inject(GameConfigService);
  private cfg = this.store.config() as GameConfig | null;

  first: First = (this.cfg?.first as First) ?? 'Simultaneous';
  agentName: string = (this.cfg as any)?.algoA?.label ?? 'Agent';

  phase: Phase = 'setup';
  turn: 'human' | 'agent' | 'both' | null = null;
  winner = '';
  humanMoves = 0;
  agentMoves = 0;
  agentTotal: number | null = null;

  private run = 0;                     
  private lastKey = '';
  private snap: BoardSnapshot | null = null;

  get status(): string {
    switch (this.phase) {
      case 'setup':   return 'Set up the board, then press Start race';
      case 'solving': return 'Agent is searching for a solution…';
      case 'racing':
        if (this.turn === 'human') return 'Your turn: slide a tile';
        if (this.turn === 'agent') return 'Agent is moving…';
        return 'Go! Both sides move at once';
      default: return '';
    }
  }

  ngOnDestroy() { this.run++; }

  onMasterChange(s: BoardSnapshot) {
    this.snap = s;
    this.agent?.sync(s);

    const key = s.start.join(' ') + '|' + s.goalText;
    if (this.phase !== 'setup' || key === this.lastKey) return;
    this.lastKey = key;
    this.winner = '';
    this.humanMoves = 0;
    this.agentMoves = 0;
    this.agentTotal = null;
  }

  startRace() {
    if (this.phase !== 'setup' || !this.human.validate()) return;
    if (!this.human.isValidState(this.human.goalArray)) {
      alert('Goal state must contain each number from 0 to 8 exactly once.');
      return;
    }

    this.winner = '';
    this.humanMoves = 0;
    this.agentMoves = 0;
    this.agentTotal = null;
    this.phase = 'solving';
    this.agent.solvePuzzle();          
  }

  onAgentSolved(info: SolveInfo) {
    this.agentTotal = info.steps;
    if (this.phase === 'solving') this.beginRace();
  }

  onAgentFinished() {
    if (this.phase !== 'solving') return;
    this.phase = 'setup';
    if (this.snap) this.agent.sync(this.snap);  
  }

  private beginRace() {
    const run = ++this.run;
    this.human.beginHumanPlay();
    this.agent.beginManual();
    this.phase = 'racing';

    if (this.first === 'Human') {
      this.turn = 'human';
    } else if (this.first === 'Agent') {
      this.agentTurn(run);
    } else {
      this.turn = 'both';
      this.agentLoop(run);
    }
  }

  onHumanMoved(m: MoveInfo) {
    this.humanMoves = m.moves;
    if (this.phase !== 'racing') return;
    if (m.solved) { this.finish('human'); return; }
    if (this.first !== 'Simultaneous') this.agentTurn(this.run);
  }

  private async agentTurn(run: number) {
    this.turn = 'agent';
    this.human.humanLocked = true;
    await this.delay(this.agent.stepMs);
    if (run !== this.run) return;
    if (this.agentStep()) return;
    this.turn = 'human';
    this.human.humanLocked = false;
  }

  private async agentLoop(run: number) {
    while (run === this.run) {
      await this.delay(this.agent.stepMs);
      if (run !== this.run) return;
      if (this.agentStep()) return;
    }
  }

  private agentStep(): boolean {
    const done = this.agent.stepForward();
    this.agentMoves = this.agent.stats.steps;
    if (done) this.finish('agent');
    return done;
  }

  private finish(who: 'human' | 'agent') {
    this.run++;
    this.phase = 'done';
    this.turn = null;
    this.human.humanLocked = true;
    this.winner = who === 'human'
      ? `You win! ${this.humanMoves} moves vs the agent's ${this.agentTotal}-move solution`
      : `${this.agent.algorithmLabel} wins in ${this.agentTotal} moves (you made ${this.humanMoves})`;
  }

  reset() {
    this.run++;
    this.agent.stop();
    this.human.endHumanPlay();

    this.phase = 'setup';
    this.turn = null;
    this.winner = '';
    this.humanMoves = 0;
    this.agentMoves = 0;
    this.agentTotal = null;

    this.agent.resetToStart();
    this.human.resetToStart();
  }

  private delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }
}