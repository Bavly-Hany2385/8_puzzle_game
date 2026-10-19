import { Component, inject, OnInit } from '@angular/core';
import { States, Tile } from '../../models/tile';
import { CommonModule } from '@angular/common';
import { SolveService } from '../../services/solveService';
import { SolveRequest  , Heuristic } from '../../models/tile';
import { FormsModule } from '@angular/forms';
import { GameConfigService } from '../../services/gameConfigService';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-board',
  imports: [CommonModule , FormsModule , RouterLink],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board implements OnInit {
  path: Array<States> = [];
  currentTiles: Tile[] = [];
  test_path: Array<Array<number>> = [];
  isRunning = false;

  startText = '0 0 0 0 0 0 0 0 0';
  goalText = '0 1 2 3 4 5 6 7 8';
  algorithm: SolveRequest['algorithm'] = 'a_star';
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
  }}

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
      await this.delay(1000);
    }
    this.currentTiles = this.currentTiles.filter(tile => tile.value !== 0);
    this.isRunning = false;
  }

  trackByTile(index: number, tile: Tile): number {
    return tile.value;

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
      next: (response) => {
        if (response.path) {
          this.path = this.map_(response.path);
          console.log("Mapped path:", this.path);

          this.start();
        } else {
          alert("This puzzle configuration is unsolvable! Try a different arrangement.");
          this.currentTiles = [];
          this.availableTiles = [
            { value: 1 }, { value: 2 }, { value: 3 },
            { value: 4 }, { value: 5 }, { value: 6 },
            { value: 7 }, { value: 8 }
          ];
          this.updateStartText();
        }
      },
      error: (error: any) => {
        console.error("Error occurred while solving the puzzle:", error);
        this.currentTiles = [];
        this.availableTiles = [
          { value: 1 }, { value: 2 }, { value: 3 },
          { value: 4 }, { value: 5 }, { value: 6 },
          { value: 7 }, { value: 8 }
        ];
        this.updateStartText();
      }
    });
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

}