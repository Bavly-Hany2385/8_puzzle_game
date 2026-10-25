import { Component, ViewChild } from '@angular/core';
import { Board, BoardSnapshot, SolveInfo } from '../board/board';

@Component({
  selector: 'app-agent-battle',
  imports: [Board],
  templateUrl: './agent-battle.html',
  styleUrl: './agent-battle.css',
})
export class AgentBattle {
  @ViewChild('board1') board1!: Board;
  @ViewChild('board2') board2!: Board;

  battling = false;
  winner = '';

  private pending = 0;
  private failed = false;
  private lastKey = '';
  private results: (SolveInfo | null)[] = [null, null];

  onMasterChange(snapshot: BoardSnapshot) {
    this.board2?.sync(snapshot); 
    const key = snapshot.start.join(' ') + '|' + snapshot.goalText;
    if (this.battling || key === this.lastKey) return;
    this.lastKey = key;
    this.winner = '';
    this.results = [null, null];
  }

  startBattle() {
    if (this.battling || !this.board1.validate()) return;

    this.winner = '';
    this.results = [null, null];
    this.pending = 2;
    this.failed = false;
    this.battling = true;

    this.board1.solvePuzzle();
    this.board2.solvePuzzle();
  }

  reset() {
    this.board1.stop();
    this.board2.stop();

    this.battling = false;
    this.pending = 0;
    this.failed = false;
    this.results = [null, null];
    this.winner = '';

    this.board1.resetToStart();
    this.board2.resetToStart();
  }

  onSolved(index: 0 | 1, info: SolveInfo) {
    this.results[index] = info;

    if (this.failed) {
      (index === 0 ? this.board1 : this.board2).cancelWait();
      return;
    }

    if (this.results[0] && this.results[1]) {
      this.board1.play();
      this.board2.play();
    }
  }

  onFinished() {
    this.pending--;
    const bothSolved = !!(this.results[0] && this.results[1]);

    if (!bothSolved) {
      this.failed = true;
      this.board1.cancelWait();
      this.board2.cancelWait();
    }

    if (bothSolved && !this.winner) this.winner = this.decideWinner();

    if (this.pending <= 0) this.battling = false;
  }

  private decideWinner(): string {
    const [a, b] = this.results as SolveInfo[];
    if (a.steps !== b.steps) {
      return `${a.steps < b.steps ? this.board1.algorithmLabel : this.board2.algorithmLabel} wins with fewer moves`;
    }
    if (a.time !== null && b.time !== null && a.time !== b.time) {
      return `Same number of moves. ${a.time < b.time ? this.board1.algorithmLabel : this.board2.algorithmLabel} solved it faster`;
    }
    return 'Draw';
  }
}