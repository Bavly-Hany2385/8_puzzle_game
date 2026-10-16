import { Component, OnInit } from '@angular/core';
import { States, Tile } from '../../models/tile';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-board',
  imports: [CommonModule],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board implements OnInit {
path : Array<States> = [];
currentTiles: Tile[] = [];
ngOnInit() {
this.path = [
  {
    tiles: [
      { value: 1, row: 0, col: 0 },
      { value: 2, row: 0, col: 1 },
      { value: 5, row: 0, col: 2 },
      { value: 3, row: 1, col: 0 },
      { value: 4, row: 1, col: 1 },
      { value: 0, row: 1, col: 2 },
      { value: 6, row: 2, col: 0 },
      { value: 7, row: 2, col: 1 },
      { value: 8, row: 2, col: 2 }
    ],
    emptyTileRow: 1,
    emptyTileCol: 2
  },
  {
    tiles: [
      { value: 1, row: 0, col: 0 },
      { value: 2, row: 0, col: 1 },
      { value: 0, row: 0, col: 2 },
      { value: 3, row: 1, col: 0 },
      { value: 4, row: 1, col: 1 },
      { value: 5, row: 1, col: 2 },
      { value: 6, row: 2, col: 0 },
      { value: 7, row: 2, col: 1 },
      { value: 8, row: 2, col: 2 }
    ],
    emptyTileRow: 0,
    emptyTileCol: 2
  },
  {
    tiles: [
      { value: 1, row: 0, col: 0 },
      { value: 0, row: 0, col: 1 },
      { value: 2, row: 0, col: 2 },
      { value: 3, row: 1, col: 0 },
      { value: 4, row: 1, col: 1 },
      { value: 5, row: 1, col: 2 },
      { value: 6, row: 2, col: 0 },
      { value: 7, row: 2, col: 1 },
      { value: 8, row: 2, col: 2 }
    ],
    emptyTileRow: 0,
    emptyTileCol: 1
  },
  {
    tiles: [
      { value: 0, row: 0, col: 0 },
      { value: 1, row: 0, col: 1 },
      { value: 2, row: 0, col: 2 },
      { value: 3, row: 1, col: 0 },
      { value: 4, row: 1, col: 1 },
      { value: 5, row: 1, col: 2 },
      { value: 6, row: 2, col: 0 },
      { value: 7, row: 2, col: 1 },
      { value: 8, row: 2, col: 2 }
    ],
    emptyTileRow: 0,
    emptyTileCol: 0
  }
];
}
delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
async start() {
    for (let i = 0; i < this.path.length; i++) {
      this.currentTiles = this.path[i].tiles;
      await this.delay(1000); 
    }
  }
trackByTile(index: number, tile: Tile): number {
  return tile.value;

}
}