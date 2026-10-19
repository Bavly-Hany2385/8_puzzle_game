import { Injectable, signal } from '@angular/core';
import { GameConfig } from '../models/gameConfig';

@Injectable({ providedIn: 'root' })
export class GameConfigService {
  config = signal<GameConfig | null>(null);
}