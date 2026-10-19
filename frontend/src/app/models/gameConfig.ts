import { Algorithm, Heuristic } from './tile';

export type GameMode = 'agent' | 'human' | 'agents';

export interface AlgoOption {
  label: string;
  algorithm: Algorithm;  
  heuristic?: Heuristic;
}

export const ALGOS: AlgoOption[] = [
  { label: 'BFS',                 algorithm: 'bfs' },
  { label: 'DFS',                 algorithm: 'dfs' },
  { label: 'Iterative Deepening', algorithm: 'iterative_deepening' },
  { label: 'A* (Manhattan)',      algorithm: 'a_star', heuristic: 'manhattan' },
  { label: 'A* (Euclidean)',      algorithm: 'a_star', heuristic: 'euclidean' },
];

export interface GameConfig {
  mode: GameMode;
  algoA: AlgoOption;
  algoB?: AlgoOption;               
  first?: 'Human' | 'Agent' | 'Simultaneous'; 
}