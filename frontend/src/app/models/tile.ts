export interface Tile {
  value: number;
  row: number;
  col: number;
}
export interface States {
  tiles: Tile[];
  emptyTileRow: number;
  emptyTileCol: number;
}