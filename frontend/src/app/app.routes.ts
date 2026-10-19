import { Routes } from '@angular/router';
import { Board } from './components/board/board';
import { Menu } from './components/menu/menu';

export const routes: Routes = [
  { path: '',               component: Menu },
  { path: 'solver',         component: Board },
  // { path: 'versus-human',  component: VersusHuman },
  // { path: 'versus-agents', component: VersusAgents },
  { path: '**', redirectTo: '' },
];