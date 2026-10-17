import { Component, OnInit } from '@angular/core';
import { States, Tile } from '../../models/tile';
import { CommonModule } from '@angular/common';
import { SolveService } from '../../services/solveService';
import { SolveRequest  , Heuristic } from '../../models/tile';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-board',
  imports: [CommonModule , FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board implements OnInit {
  path: Array<States> = [];
  currentTiles: Tile[] = [];
  test_path: Array<Array<number>> = [];
  isRunning = false;

  startText = '1 2 5 3 4 0 6 7 8';
  goalText = '0 1 2 3 4 5 6 7 8';
  algorithm: SolveRequest['algorithm'] = 'a_star';
  heuristic: Heuristic = 'manhattan';
constructor(private solveService: SolveService) {}

  ngOnInit() {
    // this.test_path = [
    //   // [1, 2, 5, 3, 4, 0, 6, 7, 8],
    //   // [1, 2, 0, 3, 4, 5, 6, 7, 8],
    //   // [1, 0, 2, 3, 4, 5, 6, 7, 8],
    //   // [0, 1, 2, 3, 4, 5, 6, 7, 8]
    //   [
    //     1,
    //     2,
    //     5,
    //     3,
    //     4,
    //     0,
    //     6,
    //     7,
    //     8
    //   ],
    //   [
    //     1,
    //     2,
    //     0,
    //     3,
    //     4,
    //     5,
    //     6,
    //     7,
    //     8
    //   ],
    //   [
    //     1,
    //     0,
    //     2,
    //     3,
    //     4,
    //     5,
    //     6,
    //     7,
    //     8
    //   ],
    //   [
    //     1,
    //     4,
    //     2,
    //     3,
    //     0,
    //     5,
    //     6,
    //     7,
    //     8
    //   ],
    //   [
    //     1,
    //     4,
    //     2,
    //     3,
    //     7,
    //     5,
    //     6,
    //     0,
    //     8
    //   ],
    //   [
    //     1,
    //     4,
    //     2,
    //     3,
    //     7,
    //     5,
    //     0,
    //     6,
    //     8
    //   ],
    //   [
    //     1,
    //     4,
    //     2,
    //     0,
    //     7,
    //     5,
    //     3,
    //     6,
    //     8
    //   ],
    //   [
    //     0,
    //     4,
    //     2,
    //     1,
    //     7,
    //     5,
    //     3,
    //     6,
    //     8
    //   ],
    //   [
    //     4,
    //     0,
    //     2,
    //     1,
    //     7,
    //     5,
    //     3,
    //     6,
    //     8
    //   ],
    //   [
    //     4,
    //     7,
    //     2,
    //     1,
    //     0,
    //     5,
    //     3,
    //     6,
    //     8
    //   ],
    //   [
    //     4,
    //     7,
    //     2,
    //     1,
    //     6,
    //     5,
    //     3,
    //     0,
    //     8
    //   ],
    //   [
    //     4,
    //     7,
    //     2,
    //     1,
    //     6,
    //     5,
    //     0,
    //     3,
    //     8
    //   ],
    //   [
    //     4,
    //     7,
    //     2,
    //     0,
    //     6,
    //     5,
    //     1,
    //     3,
    //     8
    //   ],
    //   [
    //     0,
    //     7,
    //     2,
    //     4,
    //     6,
    //     5,
    //     1,
    //     3,
    //     8
    //   ],
    //   [
    //     7,
    //     0,
    //     2,
    //     4,
    //     6,
    //     5,
    //     1,
    //     3,
    //     8
    //   ],
    //   [
    //     7,
    //     6,
    //     2,
    //     4,
    //     0,
    //     5,
    //     1,
    //     3,
    //     8
    //   ],
    //   [
    //     7,
    //     6,
    //     2,
    //     4,
    //     3,
    //     5,
    //     1,
    //     0,
    //     8
    //   ],
    //   [
    //     7,
    //     6,
    //     2,
    //     4,
    //     3,
    //     5,
    //     0,
    //     1,
    //     8
    //   ],
    //   [
    //     7,
    //     6,
    //     2,
    //     0,
    //     3,
    //     5,
    //     4,
    //     1,
    //     8
    //   ],
    //   [
    //     0,
    //     6,
    //     2,
    //     7,
    //     3,
    //     5,
    //     4,
    //     1,
    //     8
    //   ],
    //   [
    //     6,
    //     0,
    //     2,
    //     7,
    //     3,
    //     5,
    //     4,
    //     1,
    //     8
    //   ],
    //   [
    //     6,
    //     3,
    //     2,
    //     7,
    //     0,
    //     5,
    //     4,
    //     1,
    //     8
    //   ],
    //   [
    //     6,
    //     3,
    //     2,
    //     7,
    //     1,
    //     5,
    //     4,
    //     0,
    //     8
    //   ],
    //   [
    //     6,
    //     3,
    //     2,
    //     7,
    //     1,
    //     5,
    //     0,
    //     4,
    //     8
    //   ],
    //   [
    //     6,
    //     3,
    //     2,
    //     0,
    //     1,
    //     5,
    //     7,
    //     4,
    //     8
    //   ],
    //   [
    //     0,
    //     3,
    //     2,
    //     6,
    //     1,
    //     5,
    //     7,
    //     4,
    //     8
    //   ],
    //   [
    //     3,
    //     0,
    //     2,
    //     6,
    //     1,
    //     5,
    //     7,
    //     4,
    //     8
    //   ],
    //   [
    //     3,
    //     1,
    //     2,
    //     6,
    //     0,
    //     5,
    //     7,
    //     4,
    //     8
    //   ],
    //   [
    //     3,
    //     1,
    //     2,
    //     6,
    //     4,
    //     5,
    //     7,
    //     0,
    //     8
    //   ],
    //   [
    //     3,
    //     1,
    //     2,
    //     6,
    //     4,
    //     5,
    //     0,
    //     7,
    //     8
    //   ],
    //   [
    //     3,
    //     1,
    //     2,
    //     0,
    //     4,
    //     5,
    //     6,
    //     7,
    //     8
    //   ],
    //   [
    //     0,
    //     1,
    //     2,
    //     3,
    //     4,
    //     5,
    //     6,
    //     7,
    //     8
    //   ]

    // ];
    // console.log("before mapping");
    // console.log(this.test_path);
    // console.log("after mapping");
    // console.log(this.map_(this.test_path));
    // this.path = [
    //   {
    //     tiles: [
    //       //1,2,5,3,4,0,6,7,8
    //       { value: 1, row: 0, col: 0 },
    //       { value: 2, row: 0, col: 1 },
    //       { value: 5, row: 0, col: 2 },
    //       { value: 3, row: 1, col: 0 },
    //       { value: 4, row: 1, col: 1 },
    //       { value: 0, row: 1, col: 2 },
    //       { value: 6, row: 2, col: 0 },
    //       { value: 7, row: 2, col: 1 },
    //       { value: 8, row: 2, col: 2 }
    //     ],
    //     emptyTileRow: 1,
    //     emptyTileCol: 2
    //   },
    //   {
    //     tiles: [
    //       { value: 1, row: 0, col: 0 },
    //       { value: 2, row: 0, col: 1 },
    //       { value: 0, row: 0, col: 2 },
    //       { value: 3, row: 1, col: 0 },
    //       { value: 4, row: 1, col: 1 },
    //       { value: 5, row: 1, col: 2 },
    //       { value: 6, row: 2, col: 0 },
    //       { value: 7, row: 2, col: 1 },
    //       { value: 8, row: 2, col: 2 }
    //     ],
    //     emptyTileRow: 0,
    //     emptyTileCol: 2
    //   },
    //   {
    //     tiles: [
    //       { value: 1, row: 0, col: 0 },
    //       { value: 0, row: 0, col: 1 },
    //       { value: 2, row: 0, col: 2 },
    //       { value: 3, row: 1, col: 0 },
    //       { value: 4, row: 1, col: 1 },
    //       { value: 5, row: 1, col: 2 },
    //       { value: 6, row: 2, col: 0 },
    //       { value: 7, row: 2, col: 1 },
    //       { value: 8, row: 2, col: 2 }
    //     ],
    //     emptyTileRow: 0,
    //     emptyTileCol: 1
    //   },
    //   {
    //     tiles: [
    //       { value: 0, row: 0, col: 0 },
    //       { value: 1, row: 0, col: 1 },
    //       { value: 2, row: 0, col: 2 },
    //       { value: 3, row: 1, col: 0 },
    //       { value: 4, row: 1, col: 1 },
    //       { value: 5, row: 1, col: 2 },
    //       { value: 6, row: 2, col: 0 },
    //       { value: 7, row: 2, col: 1 },
    //       { value: 8, row: 2, col: 2 }
    //     ],
    //     emptyTileRow: 0,
    //     emptyTileCol: 0
    //   }
    // ];
    // this.path = this.map_(this.test_path);

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
     this.currentTiles = [];         
  await this.delay(500);          

  this.currentTiles = this.path[0].tiles; 
  await this.delay(500);


    for (let i = 1; i < this.path.length; i++) {
      this.currentTiles = this.path[i].tiles;
      await this.delay(1000); 
    }
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
    const request: SolveRequest = {
      start_node: this.parse(this.startText),
      goal_node: this.parse(this.goalText),
      algorithm: this.algorithm,
      heuristic: this.heuristic,
    };
    if(this.isRunning) {
      return;
    }
    this.currentTiles = []; 


    this.solveService.solve(request).subscribe({
      next: (response) => {
        if (response.path) {
          this.path = this.map_(response.path);
          console.log("Mapped path:", this.path);
          
          this.start();
        } else {
          console.error("No solution found. Response:", response);
        }
      }
    });
  }
}