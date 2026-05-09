/* ═══════════════════════════════════════
   神器戰爭 — 戰鬥記錄（全透明計算顯示）
   ═══════════════════════════════════════ */

import type { Action } from '../entities/Stats';
import type { ContestResult } from '../data/formulas/combat';

export interface CombatLogTurn {
  turnNumber: number;
  playerAction: Action;
  enemyAction: Action;
  /** 所有判定結果 */
  resolutions: CombatLogResolution[];
  /** 結算後狀態 */
  playerHpAfter: number;
  playerHpMax: number;
  enemyHpAfter: number;
  enemyHpMax: number;
  playerSpAfter: number;
  enemySpAfter: number;
  /** 文字描述 */
  flavorText: string;
}

export interface CombatLogResolution {
  type: 'block' | 'damage' | 'recover' | 'status' | 'crit' | 'special';
  target: 'player' | 'enemy';
  value: number;
  contestResult?: ContestResult;  // 如果有 roll 就顯示計算過程
  description: string;
}

export type CombatLog = CombatLogTurn[];
