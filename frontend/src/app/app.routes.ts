import { Routes } from '@angular/router';
import { Board } from './components/board/board';
import { Menu } from './components/menu/menu';
import { AgentBattle } from './components/agent-battle/agent-battle';
export const routes: Routes = [
  { path: '',               component: Menu },
  { path: 'solver',         component: Board },
  // { path: 'versus-human',  component: VersusHuman },
  { path: 'versus-agents', component: AgentBattle },
  { path: '**', redirectTo: '' },
];