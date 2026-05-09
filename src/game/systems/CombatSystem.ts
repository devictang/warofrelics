/* ═══════════════════════════════════════
   神器戰爭 — 同時出招 Combat Resolver
   氣力 system: 0起步，每回合+1，上限10
   ═══════════════════════════════════════ */

import type { Action, Character, Enemy, Stats } from '../entities/Stats';
import type { CombatLog, CombatLogTurn, CombatLogResolution } from '../engine/CombatLog';
import { resolvePhysicalBlock, resolveCrit } from '../data/formulas/combat';
import { getClass } from '../data/classes/classes';
import type { ClassDef } from '../data/classes/classes';

export const MAX_SP = 10;
export const AUTO_SP_PER_TURN = 0;  // 唔會自動回氣
export const RECOVER_BONUS_SP = 1;  // 只有直接 end turn 先回 1 氣

/** 基礎 HP 計算 */
export function calcMaxHp(stats: Stats, classDef: ClassDef): number {
  return Math.floor((50 + stats.con * 8) * classDef.hpMult);
}

/** 物理傷害 */
function calcPhysicalDamage(attackerStr: number, mult: number = 1.0): number {
  return Math.max(1, Math.floor(attackerStr * 3 * mult));
}

/** 魔法傷害 */
function calcMagicalDamage(attackerInt: number, mult: number = 1.0): number {
  return Math.max(1, Math.floor(attackerInt * 3 * mult));
}

/** AI 決定行動 */
export function decideEnemyAction(enemy: Enemy): Action {
  const tend = enemy.ai.tendencies;
  if (enemy.ai.hpLowThreshold && enemy.currentHp < enemy.maxHp * enemy.ai.hpLowThreshold) {
    const lowTend = enemy.ai.hpLowBehavior!;
    const merged = {
      attack: lowTend.attack ?? tend.attack,
      block: lowTend.block ?? tend.block,
      skill: lowTend.skill ?? tend.skill,
      recover: lowTend.recover ?? tend.recover,
    };
    return pickFromTendencies(merged);
  }
  return pickFromTendencies(tend);
}

function pickFromTendencies(tend: { attack: number; block: number; skill: number; recover: number }): Action {
  const total = tend.attack + tend.block + tend.skill + tend.recover;
  const roll = Math.random() * total;
  let cum = 0;
  cum += tend.attack; if (roll < cum) return 'attack';
  cum += tend.block; if (roll < cum) return 'block';
  cum += tend.skill; if (roll < cum) return 'skill1';
  return 'recover';
}

export interface CombatState {
  player: { currentHp: number; maxHp: number; currentSp: number; maxSp: number; stats: Stats };
  enemy: Enemy;
  turnNumber: number;
  log: CombatLog;
  battleOver: boolean;
  playerWon: boolean;
}

/** 初始化戰鬥 — 0 氣力起步 */
export function initCombat(playerChar: Character, enemy: Enemy): CombatState {
  const classDef = getClass(playerChar.classId);
  const maxHp = calcMaxHp(playerChar.runData!.stats, classDef);

  return {
    player: {
      currentHp: maxHp,
      maxHp,
      currentSp: 0,
      maxSp: MAX_SP,
      stats: playerChar.runData!.stats,
    },
    enemy: { ...enemy, currentSp: 0 },
    turnNumber: 0,
    log: [],
    battleOver: false,
    playerWon: false,
  };
}

/** 執行一回合 */
export function resolveTurn(state: CombatState, playerAction: Action): CombatState {
  const enemyAction = decideEnemyAction(state.enemy);
  const resolutions: CombatLogResolution[] = [];
  const pStats = state.player.stats;
  const eStats = state.enemy.stats;

  let pHp = state.player.currentHp;
  let pSp = state.player.currentSp;
  let eHp = state.enemy.currentHp;
  let eSp = state.enemy.currentSp;

  // ── 1. 氣力：Recover +1, 攻擊/技能 -1, 格擋免費 ──
  if (playerAction === 'recover') {
    pSp = Math.min(MAX_SP, pSp + 1);
    resolutions.push({
      type: 'recover', target: 'player', value: 1,
      description: `你結束回合回氣！氣力 +1 🌀 (${pSp - 1} → ${pSp}/${MAX_SP})`,
    });
  } else if (playerAction === 'attack' || playerAction.startsWith('skill')) {
    const cost = 1;
    if (pSp >= cost) {
      pSp -= cost;
      resolutions.push({
        type: 'recover', target: 'player', value: -cost,
        description: `消耗 ${cost} 氣力 ⚡ (${pSp + cost} → ${pSp}/${MAX_SP})`,
      });
    } else {
      // Not enough 氣力 — attack still goes through but no cost
      // (UI should prevent this, but defensive coding)
    }
  }
  // Block: no cost

  if (enemyAction === 'recover') {
    eSp = Math.min(MAX_SP, eSp + 1);
    resolutions.push({
      type: 'recover', target: 'enemy', value: 1,
      description: `${state.enemy.name}結束回合回氣，氣力 +1 🌀`,
    });
  } else if (enemyAction === 'attack' || enemyAction.startsWith('skill')) {
    const cost = 1;
    if (eSp >= cost) {
      eSp -= cost;
    }
  }

  // ── 2. 格擋判定 ──
  const playerBlocked = playerAction === 'block';
  const enemyBlocked = enemyAction === 'block';

  // ── 3. 玩家攻擊/技能 ──
  if (!playerBlocked && playerAction !== 'recover') {
    const isPhysical = true; // default all attacks are physical for now
    const baseDmg = isPhysical
      ? calcPhysicalDamage(pStats.str, 1.0)
      : calcMagicalDamage(pStats.int, 1.0);

    if (enemyBlocked) {
      const blockResult = resolvePhysicalBlock(eStats.dex, pStats.str);
      resolutions.push({
        type: 'block', target: 'enemy', value: 0,
        contestResult: blockResult,
        description: `${state.enemy.name}嘗試格擋你的攻擊！`,
      });
      if (!blockResult.success) {
        eHp -= baseDmg;
        resolutions.push({
          type: 'damage', target: 'enemy', value: baseDmg,
          description: `格擋失敗！你造成了 ${baseDmg} 點傷害 ⚔️`,
        });
      } else {
        resolutions.push({
          type: 'block', target: 'enemy', value: 0,
          description: `${state.enemy.name}成功格擋了你的攻擊！`,
        });
      }
    } else {
      eHp -= baseDmg;
      resolutions.push({
        type: 'damage', target: 'enemy', value: baseDmg,
        description: `你造成了 ${baseDmg} 點傷害 ⚔️`,
      });
    }
  }

  // ── 4. 敵人攻擊/技能 ──
  if (!enemyBlocked && enemyAction !== 'recover') {
    const isEnemyPhysical = state.enemy.damageType === 'physical';
    const baseDmg = isEnemyPhysical
      ? calcPhysicalDamage(eStats.str, state.enemy.strMult ?? 1.0)
      : calcMagicalDamage(eStats.int, state.enemy.intMult ?? 1.0);

    if (playerBlocked) {
      const blockResult = resolvePhysicalBlock(pStats.dex, eStats.str);
      resolutions.push({
        type: 'block', target: 'player', value: 0,
        contestResult: blockResult,
        description: `你嘗試格擋${state.enemy.name}的攻擊！`,
      });
      if (!blockResult.success) {
        pHp -= baseDmg;
        resolutions.push({
          type: 'damage', target: 'player', value: baseDmg,
          description: `格擋失敗！你受到了 ${baseDmg} 點傷害 💥`,
        });
      } else {
        resolutions.push({
          type: 'block', target: 'player', value: 0,
          description: `你成功格擋了攻擊！完全抵消了傷害 🛡️`,
        });
      }
    } else {
      pHp -= baseDmg;
      resolutions.push({
        type: 'damage', target: 'player', value: baseDmg,
        description: `你受到了 ${baseDmg} 點傷害 💥`,
      });
    }
  }

  // ── 5. 暴擊判定 ──
  const lastPlayerDmg = resolutions.find(r => r.target === 'enemy' && r.type === 'damage');
  if (lastPlayerDmg && lastPlayerDmg.value > 0) {
    const critResult = resolveCrit(pStats.lck, eStats.lck);
    if (critResult.success) {
      const critBonus = Math.floor(lastPlayerDmg.value * 0.5);
      eHp -= critBonus;
      resolutions.push({
        type: 'crit', target: 'enemy', value: critBonus,
        contestResult: critResult,
        description: `暴擊！額外 ${critBonus} 傷害！💥`,
      });
    }
  }

  // Clamp
  pHp = Math.max(0, Math.min(state.player.maxHp, pHp));
  eHp = Math.max(0, Math.min(state.enemy.maxHp, eHp));
  pSp = Math.max(0, Math.min(MAX_SP, pSp));
  eSp = Math.max(0, Math.min(MAX_SP, eSp));

  const turnResult: CombatLogTurn = {
    turnNumber: state.turnNumber + 1,
    playerAction,
    enemyAction,
    resolutions,
    playerHpAfter: pHp,
    playerHpMax: state.player.maxHp,
    enemyHpAfter: eHp,
    enemyHpMax: state.enemy.maxHp,
    playerSpAfter: pSp,
    enemySpAfter: eSp,
    flavorText: '',
  };

  const battleOver = pHp <= 0 || eHp <= 0;
  const playerWon = eHp <= 0;

  return {
    player: {
      currentHp: pHp,
      maxHp: state.player.maxHp,
      currentSp: pSp,
      maxSp: MAX_SP,
      stats: pStats,
    },
    enemy: { ...state.enemy, currentHp: eHp, currentSp: eSp },
    turnNumber: state.turnNumber + 1,
    log: [...state.log, turnResult],
    battleOver,
    playerWon,
  };
}
