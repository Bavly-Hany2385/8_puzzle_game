import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { States, Tile } from '../../models/tile';
import { CommonModule } from '@angular/common';
import { SolveService } from '../../services/solveService';
import { SolveRequest  , Heuristic } from '../../models/tile';
import { FormsModule } from '@angular/forms';
import { GameConfigService } from '../../services/gameConfigService';
import { RouterLink } from '@angular/router';
import { SearchTree } from '../search-tree/search-tree'
import { SearchNode } from '../../models/tile';

export interface BoardSnapshot {
  start: number[];
  goalText: string;
  speed: number;
}

export interface SolveInfo {
  steps: number;
  time: number | null;
}

export interface MoveInfo {
  moves: number;     
  solved: boolean;  
}

export interface SolveStats {
  steps: number;        
  total: number;          
  time: number | null;
  expanded: number | null;
  depth: number | null;
}

const emptyStats = (): SolveStats =>
  ({ steps: 0, total: 0, time: null, expanded: null,depth: null });

@Component({
  selector: 'app-board',
  imports: [CommonModule , FormsModule , RouterLink, SearchTree],
  templateUrl: './board.html',
  styleUrl: './board.css',
})

export class Board implements OnInit {
  path: Array<States> = [];
  // currentTiles: Tile[] = [
  //   { row: 0, col: 0, value: 1 }, { row: 0, col: 1, value: 2 }, { row: 0, col: 2, value: 5 },
  //           { row: 1, col: 0, value: 3 }, { row: 1, col: 1, value: 4 }, { row: 1, col: 2, value: 0 },
  //           { row: 2, col: 0, value: 6 }, { row: 2, col: 1, value: 7 }, { row: 2, col: 2, value: 8 }
  // ];
  currentTiles: Tile[] = [];
  test_path: Array<Array<number>> = [];
  isRunning = false;
  searchTree: SearchNode[] = [];
  showTree = false;
  speed = 6;
  paused = false;
  private wasPaused = false;


  @Input() isReadOnly: boolean = false; 
  @Input() title: string = ''; 
  // @Input() stats: any = { steps: 0, time: null };

  @Input() locked = false;             
  humanPlay = false;                  
  humanLocked = false;                 
  humanMoves = 0;
  @Output() moved = new EventEmitter<MoveInfo>();

  @Input() showHeader = true;         
  @Input() showSolve = true;           
  @Input() holdAnimation = false;       
  private waiting = false;
  @Input() agentKey: 'algoA' | 'algoB' = 'algoA'; 

  @Output() stateChange = new EventEmitter<BoardSnapshot>();
  @Output() solved = new EventEmitter<SolveInfo>();        
  @Output() finished = new EventEmitter<void>();           

@Input() stats: SolveStats = emptyStats();
moves: string[] = [];

  get algorithmLabel(): string {
    const name = String(this.algorithm).toUpperCase();
    const usesHeuristic = ['ASTAR', 'A_STAR', 'A*', 'GREEDY'].includes(name);
    return usesHeuristic ? `${name} (${this.heuristic})` : name;
  }
  
  private computeMoves(path: number[][]): string[] {
  const names: Record<number, string> = { [-3]: 'Up', [3]: 'Down', [-1]: 'Left', [1]: 'Right' };
  return path.slice(1).map((s, i) => names[s.indexOf(0) - path[i].indexOf(0)]);
}

  get stepMs(): number {
    if (this.speed <= 10) return 2200 - this.speed * 200;
    return Math.round(200 / Math.pow(2, this.speed - 10));
  }

  get transitionMs(): number {
    return Math.round(this.stepMs * 0.3);
  }

  get goalArray(): number[]{
    return this.parse(this.goalText);
  }

  get goalPreview(): number[] {
    const g = this.goalArray;
    return this.isValidState(g) ? g : [];
  }

  startText = '0 0 0 0 0 0 0 0 0';
  goalText = '0 1 2 3 4 5 6 7 8';
  algorithm: SolveRequest['algorithm'] = 'dfs';
  heuristic: Heuristic = 'manhattan';
  availableTiles = [
    { value: 1 }, { value: 2 }, { value: 3 },
    { value: 4 }, { value: 5 }, { value: 6 },
    { value: 7 }, { value: 8 }
  ];
  gridCells = [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
    { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
    { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }
  ];
private gameConfig = inject(GameConfigService);
  
  selectedTile: any = null;

  constructor(private solveService: SolveService) { }

  private get storageKeys() {
    const sfx = this.agentKey === 'algoB' ? 'B' : '';
    return { algo: 'savedAlgo' + sfx, heuristic: 'savedHeuristic' + sfx };
  }

  ngOnInit() {
    const cfg: any = this.gameConfig.config();
    const keys = this.storageKeys;

    if (cfg) {
      const agent = cfg[this.agentKey] ?? cfg.algoA;
      this.algorithm = agent.algorithm;
      this.heuristic = agent.heuristic ?? 'manhattan';

      localStorage.setItem(keys.algo, this.algorithm);
      localStorage.setItem(keys.heuristic, this.heuristic);
    } else {
      const savedAlgo = localStorage.getItem(keys.algo);
      const savedHeuristic = localStorage.getItem(keys.heuristic);

      if (savedAlgo) {
        this.algorithm = savedAlgo as SolveRequest['algorithm'];
        this.heuristic = (savedHeuristic as Heuristic) ?? 'manhattan';
      }
    }
  }

  parse(text: string): number[] {
    return text.split(/[\s,]+/).filter(s => s !== '').map(Number);
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private runId = 0;

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    const run = this.runId;

    await this.delay(500);
    if (run !== this.runId) return;
    this.currentTiles = this.path[0].tiles;
    await this.delay(500);
    if (run !== this.runId) return;

for (let i = 1; i < this.path.length; i++) {
  await this.waitIfPaused();
  if (run !== this.runId) return;
  this.currentTiles = this.path[i].tiles;
  this.stats = { ...this.stats, steps: i };
  await this.delay(this.stepMs);
  if (run !== this.runId) return;
}
    this.currentTiles = this.currentTiles.filter(tile => tile.value !== 0);
    this.isRunning = false;
    this.finished.emit();
  }


  trackByTile(index: number, tile: Tile): number {
    return tile.value;
  }

  @HostListener('document:keydown.escape')
closeTree() {
  if (!this.showTree) return;
  this.showTree = false;
  this.paused = this.wasPaused;
  if (!this.paused) this.releasePause();
}

  // path is initially a list of states and each state is a tuple of numbers 
  // we need to convert it to a list of states where each state is an object of type States
  map_(path: Array<Array<number>>): Array<States> {
    let res: Array<States> = [];
    for (let i = 0; i < path.length; i++) {

      const state: States = {
        tiles: [],
        emptyTileRow: -1,
        emptyTileCol: -1
      };
      for (let j = 0; j < path[i].length; j++) {
        const value = path[i][j];
        const row = Math.floor(j / 3);
        const col = j % 3;
        state.tiles.push({ value, row, col });
      }
      state.tiles.sort((a, b) => a.value - b.value);
      res.push(state);
    }
    return res;
  }

  validate(): boolean {
    if (this.currentTiles.length > 0 && this.currentTiles.length < 8) {
      alert("Please place all 8 tiles on the board before solving.");
      return false;
    }
    if (this.startText === this.goalText) {
      alert("The start state is the same as the goal state. No moves needed.");
      return false;
    }
    if (this.startText == '0 0 0 0 0 0 0 0 0') {
      alert("Please place all 8 tiles on the board before solving.");
      return false;
    }
    return true;
  }

  async solvePuzzle() {
    if(this.isRunning) return;
    if (!this.validate()) return;

    console.log("Start Text:", this.startText);
    console.log("Goal Text:", this.goalText);
    console.log("Algorithm:", this.algorithm);
    console.log("Heuristic:", this.heuristic);
    
    const request: SolveRequest = {
      start_node: this.parse(this.startText),
      goal_node: this.parse(this.goalText),
      algorithm: this.algorithm,
      heuristic: this.heuristic,
    };

    if (this.isRunning) {
      return;
    }

    const token = this.runId;
    this.solveService.solve(request).subscribe({
      next: (response: any) => {
        if (token !== this.runId) return; 
        if (response.error) {
          this.searchTree = [];
          this.showTree = false;
          alert(response.error);
          this.resetBoard();
          this.finished.emit();
          return;
        }

        if (response.path) {
          this.searchTree = response.tree ?? [];
          this.showTree = false;
          this.path = this.map_(response.path);
          this.moves = this.computeMoves(response.path);
          console.log("Tree:", this.searchTree);
          console.log("Path:", this.path);
          const time: number | null = response.time ?? null;
          // this.stats = { steps: 0, time };
            const s = response.stats ?? {};
  this.stats = {
    steps: 0,
    total: response.path.length - 1,
    time,
    expanded: s.nodes_expanded ?? null,
    depth: s.search_depth ?? null,
  };
          if (this.holdAnimation) {
            this.waiting = true;
            this.isRunning = true;
          }
          this.solved.emit({ steps: response.path.length - 1, time });
          if (!this.holdAnimation) this.start();
        } else {
          alert("Could not find a solution for this configuration.");
          this.resetBoard();
          this.finished.emit();
        }
      },
      error: (error: any) => {
        if (token !== this.runId) return;
        console.error("Error occurred while solving the puzzle:", error);
        alert("Server error occurred. Please try again.");
        this.resetBoard();
        this.finished.emit();
      }
    });
  }

  resetBoard() {
    this.currentTiles = [];
    this.availableTiles = [
      { value: 1 }, { value: 2 }, { value: 3 },
      { value: 4 }, { value: 5 }, { value: 6 },
      { value: 7 }, { value: 8 }
    ];
    this.stats = emptyStats();
this.moves = [];
    this.updateStartText();
  }
  stopAnimation() {
  this.stop();        
  this.resetToStart(); 
}

  selectFromSidebar(tile: { value: number }) {
    if (this.isReadOnly || this.locked || this.humanPlay) return;
    this.selectedTile = tile;
  }

  placeOnBoard(row: number, col: number) {
    if (this.isReadOnly || this.locked || this.humanPlay) return;
    if (!this.selectedTile) return;
    const isOccupied = this.currentTiles.some(t => t.row === row && t.col === col);
    if (isOccupied) return;
    this.currentTiles.push({
      value: this.selectedTile.value,
      row: row,
      col: col
    });

    this.availableTiles = this.availableTiles.filter(t => t !== this.selectedTile);
    this.selectedTile = null;
    this.updateStartText();
  }

  returnToSidebar(tile: any) {
    if (this.isReadOnly || this.locked || this.humanPlay) return;
    if (tile.value === 0) return;
    this.currentTiles = this.currentTiles.filter(t => t !== tile);
    if (!this.availableTiles.some(t => t.value === tile.value)) {
      this.availableTiles.push({ value: tile.value });
      this.availableTiles.sort((a, b) => a.value - b.value);
    }
    this.updateStartText();
  }

  updateStartText() {
    const boardState = Array(9).fill(0);
    this.currentTiles.forEach(tile => {
      const index = tile.row * 3 + tile.col;
      boardState[index] = tile.value;
    });
    this.startText = boardState.join(' ');
    this.emitState();
  }

  isValidState(arr: number[]): boolean {
    return arr.length === 9 &&
      [...arr].sort((a, b) => a - b).every((v, i) => v === i);
  }

  private shuffled(): number[] {
    const a = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private setBoard(state: number[]) {
    this.currentTiles = state
      .map((value, i) => ({ value, row: Math.floor(i / 3), col: i % 3 }))
      .filter(t => t.value !== 0);
    const placed = new Set(state);
    this.availableTiles = [1, 2, 3, 4, 5, 6, 7, 8]
      .filter(v => !placed.has(v))
      .map(value => ({ value }));
    this.selectedTile = null;
    this.path = [];
    this.searchTree = [];
    this.showTree = false;
    // this.stats = { steps: 0, time: null };
    this.stats = emptyStats();
    this.moves = [];
    this.updateStartText();
  }

  generateRandomStart() {
    if (this.isRunning) return;

    const goal = this.goalArray;
    let start: number[];
    do {
      start = this.shuffled();
    } while (start.join(' ') === goal.join(' '));  

    this.setBoard(start);
  }

  generateRandomGoal() {
    if (this.isRunning) return;

    const start = this.parse(this.startText);
    let goal: number[];
    do {
      goal = this.shuffled();
    } while (goal.join(' ') === start.join(' '));   
    this.goalText = goal.join(' ');
    this.emitState();
    this.path = [];
    this.searchTree = [];
    this.showTree = false;
  }
  


  public play() {
    if (!this.waiting) return;
    this.waiting = false;
    this.isRunning = false;
    this.start();
  }

  public cancelWait() {
    if (!this.waiting) return;
    this.waiting = false;
    this.isRunning = false;
    this.finished.emit();
  }

  private emitState() {
    this.stateChange.emit({
      start: this.parse(this.startText),
      goalText: this.goalText,
      speed: this.speed,
    });
  }

  onGoalChange(value: string) {
    this.goalText = value;
    this.emitState();
  }

  onSpeedChange(value: number) {
    this.speed = Number(value);
    this.emitState();
  }

  public sync(s: BoardSnapshot) {
    this.goalText = s.goalText;
    this.speed = s.speed;
    if (this.isRunning) return;
    if (this.startText !== s.start.join(' ')) this.setBoard(s.start);
  }

  public resetToStart() {
    if (this.isRunning) return;
    this.setBoard(this.parse(this.startText));
  }

  openTree() {
  this.wasPaused = this.paused;
  this.paused = true;
  this.showTree = true;
}

private resumeFn: (() => void) | null = null;

private waitIfPaused(): Promise<void> {
  if (!this.paused) return Promise.resolve();
  return new Promise(res => (this.resumeFn = res));
}

private releasePause() {
  this.resumeFn?.();
  this.resumeFn = null;
}

togglePause() {
  this.paused = !this.paused;
  if (!this.paused) this.releasePause();
}



  get controlsLocked(): boolean {
    return this.locked || this.humanPlay;
  }

  private isGoalReached(): boolean {
    const goal = this.goalArray;
    const cur: number[] = Array(9).fill(-1);
    this.currentTiles.forEach(t => (cur[t.row * 3 + t.col] = t.value));
    return goal.length === 9 && cur.every((v, i) => v === goal[i]);
  }

  public beginHumanPlay() {
    this.currentTiles = this.parse(this.startText)
      .map((value, i) => ({ value, row: Math.floor(i / 3), col: i % 3 }))
      .sort((a, b) => a.value - b.value);
    this.selectedTile = null;
    this.humanPlay = true;
    this.humanLocked = false;
    this.humanMoves = 0;
  }

  public endHumanPlay() {
    this.humanPlay = false;
    this.humanLocked = false;
    this.humanMoves = 0;
  }

  onTileClick(tile: Tile) {
    if (this.humanPlay) this.slideTile(tile);
    else this.returnToSidebar(tile);
  }

  public slideTile(tile: Tile): boolean {
    if (!this.humanPlay || this.humanLocked || tile.value === 0) return false;
    const empty = this.currentTiles.find(t => t.value === 0);
    if (!empty) return false;
    if (Math.abs(tile.row - empty.row) + Math.abs(tile.col - empty.col) !== 1) return false;

    this.currentTiles = this.currentTiles.map(t =>
      t === tile ? { ...t, row: empty.row, col: empty.col }
      : t === empty ? { ...t, row: tile.row, col: tile.col }
      : t);

    this.humanMoves++;
    this.moved.emit({ moves: this.humanMoves, solved: this.isGoalReached() });
    return true;
  }

  public slideDir(dr: number, dc: number): boolean {
    const empty = this.currentTiles.find(t => t.value === 0);
    if (!empty) return false;
    const tile = this.currentTiles.find(t => t.row === empty.row - dr && t.col === empty.col - dc);
    return tile ? this.slideTile(tile) : false;
  }

  @HostListener('window:keydown', ['$event'])
  onHumanKey(e: KeyboardEvent) {
    if (!this.humanPlay || this.humanLocked) return;
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    const dirs: Record<string, [number, number]> = {
      ArrowUp: [-1, 0], w: [-1, 0], ArrowDown: [1, 0], s: [1, 0],
      ArrowLeft: [0, -1], a: [0, -1], ArrowRight: [0, 1], d: [0, 1],
    };
    const d = dirs[e.key];
    if (!d) return;
    e.preventDefault();
    this.slideDir(d[0], d[1]);
  }

  public beginManual(): boolean {
    if (!this.waiting) return false;
    this.waiting = false;               
    this.currentTiles = this.path[0].tiles;
    return true;
  }

  public stepForward(): boolean {
    const next = this.stats.steps + 1;
    if (next >= this.path.length) return true;
    this.currentTiles = this.path[next].tiles;
    this.stats = { ...this.stats, steps: next };
    if (next < this.path.length - 1) return false;
    this.currentTiles = this.currentTiles.filter(t => t.value !== 0);
    this.isRunning = false;
    return true;
  }

public stop() {
  this.runId++;
  this.paused = false;
  this.releasePause();    
  this.waiting = false;
  this.isRunning = false;
}
}