import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ALGOS, GameConfig, GameMode } from '../../models/gameConfig';
import { GameConfigService } from '../../services/gameConfigService';

interface Opt { key: string; label: string; values: string[]; def: number; }
interface ModeDef {
  id: GameMode; title: string; sub: string; desc: string;
  tags: string[]; route: string; opts: Opt[];
}

const ALGO_LABELS = ALGOS.map(a => a.label);

const MODES: ModeDef[] = [
  {
    id: 'agent', title: 'AGENT', sub: 'Solo run', route: '/solver',
    desc: 'Pick a search algorithm and watch the agent solve the board.',
    tags: ['1 agent', 'Solve & analyse'],
    opts: [{ key: 'algoA', label: 'Algorithm', values: ALGO_LABELS, def: 3 }],
  },
  {
    id: 'human', title: 'AGENT VS HUMAN', sub: 'Race the machine', route: '/versus-human',
    desc: 'Same board, same moves. You slide tiles by hand while the agent searches.',
    tags: ['You vs agent', 'Move counter'],
    opts: [
      { key: 'algoA', label: 'Agent algorithm', values: ALGO_LABELS, def: 3 },
      { key: 'first', label: 'First move', values: ['Human', 'Agent', 'Simultaneous'], def: 2 },
    ],
  },
  {
    id: 'agents', title: 'AGENT VS AGENT', sub: 'Algorithm showdown', route: '/versus-agents',
    desc: 'Two agents, two algorithms, one board. Compare nodes, depth and time.',
    tags: ['2 agents', 'Benchmark'],
    opts: [
      { key: 'algoA', label: 'Agent A', values: ALGO_LABELS, def: 0 },
      { key: 'algoB', label: 'Agent B', values: ALGO_LABELS, def: 3 },
    ],
  },
];

@Component({
  selector: 'app-menu',
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  private router = inject(Router);
  private store = inject(GameConfigService);

  modes = MODES;
  startTiles = [1, 2, 3, 4, 0, 6, 7, 5, 8];
  goalTiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  screen = signal<'main' | 'config'>('main');
  idx = signal(0);
  mode = signal<ModeDef>(MODES[0]);
  cfg = signal<Record<string, number>>({});

  current = computed(() => (this.screen() === 'main' ? MODES[this.idx()] : this.mode()));
  labels = computed(() => {
    const id = this.current().id;
    if (id === 'human') return { left: 'YOU', right: 'AGENT' };
    if (id === 'agents') return { left: 'AGENT A', right: 'AGENT B' };
    return { left: 'AGENT', right: null };
  });

  valueOf(o: Opt): string { return o.values[this.cfg()[o.key]]; }

  openMode(i: number) {
    const m = MODES[i];
    this.mode.set(m);
    this.cfg.set(Object.fromEntries(m.opts.map(o => [o.key, o.def])));
    this.screen.set('config');
    this.idx.set(0);
  }

  back() {
    if (this.screen() === 'config') {
      this.idx.set(MODES.indexOf(this.mode()));
      this.screen.set('main');
    }
  }

  move(d: number) {
    const n = this.screen() === 'main' ? MODES.length : this.mode().opts.length + 1;
    this.idx.set((this.idx() + d + n) % n);
  }

  change(d: number) {
    if (this.screen() !== 'config') return;
    const opts = this.mode().opts;
    if (this.idx() >= opts.length) return;
    const o = opts[this.idx()];
    const n = o.values.length;
    this.cfg.update(c => ({ ...c, [o.key]: (c[o.key] + d + n) % n }));
  }

  hover(i: number) { if (this.screen() === 'main') this.idx.set(i); }

  onRow(i: number) { this.idx.set(i); this.activate(); }
  onArrow(i: number, d: number, e: Event) { e.stopPropagation(); this.idx.set(i); this.change(d); }

  activate() {
    if (this.screen() === 'main') this.openMode(this.idx());
    else if (this.idx() === this.mode().opts.length) this.start();
    else this.change(1);
  }

  start() {
    const m = this.mode(), c = this.cfg();
    const config: GameConfig = { mode: m.id, algoA: ALGOS[c['algoA']] };
    if (m.id === 'agents') config.algoB = ALGOS[c['algoB']];
    if (m.id === 'human') config.first = ['Human', 'Agent', 'Simultaneous'][c['first']] as GameConfig['first'];
    this.store.config.set(config);
    this.router.navigate([m.route]);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    const map: Record<string, () => void> = {
      ArrowDown: () => this.move(1), s: () => this.move(1),
      ArrowUp: () => this.move(-1), w: () => this.move(-1),
      ArrowRight: () => this.change(1), d: () => this.change(1),
      ArrowLeft: () => this.change(-1), a: () => this.change(-1),
      Enter: () => this.activate(), ' ': () => this.activate(),
      Escape: () => this.back(), Backspace: () => this.back(),
    };
    const fn = map[e.key];
    if (fn) { e.preventDefault(); fn(); }
  }
}