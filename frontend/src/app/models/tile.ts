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

export type Algorithm = 'bfs' | 'dfs' | 'iterative_deepening' | 'a_star';
export type Heuristic = 'manhattan' |'euclidean' ;

export interface SolveRequest {
  start_node: number[];
  goal_node: number[];
  algorithm: Algorithm;
  heuristic?: Heuristic;
}

export interface SearchNode{
  id: number;
  parent: number | null;
  state: number[];
  move: string | null;
}