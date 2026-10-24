import { Component, HostListener, inject, OnInit } from '@angular/core';
import { States, Tile } from '../../models/tile';
import { CommonModule } from '@angular/common';
import { SolveService } from '../../services/solveService';
import { SolveRequest  , Heuristic } from '../../models/tile';
import { FormsModule } from '@angular/forms';
import { GameConfigService } from '../../services/gameConfigService';
import { RouterLink } from '@angular/router';
import { SearchTree } from '../search-tree/search-tree'
import { SearchNode } from '../../models/tile';

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
  get stepMs(): number {
    return 2200 - this.speed * 200;
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

  ngOnInit() { const cfg = this.gameConfig.config();
    
    if (cfg) {
      this.algorithm = cfg.algoA.algorithm;
      this.heuristic = cfg.algoA.heuristic ?? 'manhattan';
      
      localStorage.setItem('savedAlgo', this.algorithm);
      localStorage.setItem('savedHeuristic', this.heuristic);
    } else {
      const savedAlgo = localStorage.getItem('savedAlgo');
      const savedHeuristic = localStorage.getItem('savedHeuristic');
      console.log('Saved Algorithm:', savedAlgo);
      
      if (savedAlgo) {
        this.algorithm = savedAlgo as SolveRequest['algorithm'];
        this.heuristic = savedHeuristic as Heuristic;
      }
    }
  }

  parse(text: string): number[] {
    return text.split(/[\s,]+/).filter(s => s !== '').map(Number);
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    await this.delay(500);
    this.currentTiles = this.path[0].tiles;
    await this.delay(500);

    for (let i = 1; i < this.path.length; i++) {
      this.currentTiles = this.path[i].tiles;
      await this.delay(this.stepMs);
    }
    this.currentTiles = this.currentTiles.filter(tile => tile.value !== 0);
    this.isRunning = false;
  }

  trackByTile(index: number, tile: Tile): number {
    return tile.value;
  }

  @HostListener('document:keydown.escape')
  closeTree() {
    this.showTree = false;
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

  async solvePuzzle() {
    if (this.currentTiles.length > 0 && this.currentTiles.length < 8) {
      alert("Please place all 8 tiles on the board before solving.");
      return;
    }
    if (this.startText === this.goalText) {
      alert("The start state is the same as the goal state. No moves needed.");
      return;
    }
    if (this.startText == '0 0 0 0 0 0 0 0 0') {
      alert("Please place all 8 tiles on the board before solving.");
      return;
    }
    
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

    this.solveService.solve(request).subscribe({
      next: (response: any) => {
        if (response.error) {
          this.searchTree = [];
          this.showTree = false;
          alert(response.error);
          this.resetBoard();
          return;
        }

        if (response.path) {
          this.searchTree = response.tree ?? [];
          this.showTree = false;
          this.path = this.map_(response.path);
          
          console.log("Mapped path:", this.path);
          console.log('tree size:', response.tree?.length);
          
          this.start();
        } else {
          alert("Could not find a solution for this configuration.");
          this.resetBoard();
        }
      },
      error: (error: any) => {
        console.error("Error occurred while solving the puzzle:", error);
        alert("Server error occurred. Please try again.");
        this.resetBoard();
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
    this.updateStartText();
  }

  selectFromSidebar(tile: { value: number }) {
    this.selectedTile = tile;
  }

  placeOnBoard(row: number, col: number) {
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
    this.availableTiles = [];
    this.selectedTile = null;
    this.path = [];
    this.searchTree = [];
    this.showTree = false;
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
    this.path = [];
    this.searchTree = [];
    this.showTree = false;
  }

}