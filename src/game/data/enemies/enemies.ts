/* ═══════════════════════════════════════
   敵人定義 + AI 傾向
   ═══════════════════════════════════════ */

import type { Enemy, Stats } from '../../entities/Stats';

const BASE_STATS: Stats = { str: 5, con: 5, dex: 5, wil: 5, per: 5, int: 5, cha: 5, lck: 5 };

function makeStats(overrides: Partial<Stats>): Stats {
  return { ...BASE_STATS, ...overrides };
}

export const ENEMIES: Enemy[] = [
  // ── 初期雜魚 ──
  {
    id: 'goblin',
    name: '哥布林',
    race: '哥布林',
    stats: makeStats({ str: 6, dex: 7, con: 5 }),
    level: 1,
    maxHp: 20,
    currentHp: 20,
    maxSp: 10,
    currentSp: 10,
    skills: [],
    ai: { tendencies: { attack: 75, block: 5, skill: 10, recover: 10 } },
    damageType: 'physical',
    strMult: 1.0,
    xpReward: 10,
  },
  {
    id: 'slime',
    name: '史萊姆',
    race: '魔物',
    stats: makeStats({ con: 8, wil: 3 }),
    level: 1,
    maxHp: 30,
    currentHp: 30,
    maxSp: 8,
    currentSp: 8,
    skills: [],
    ai: { tendencies: { attack: 50, block: 20, skill: 10, recover: 20 } },
    damageType: 'physical',
    strMult: 0.5,
    xpReward: 8,
  },
  // ── 中期 ──
  {
    id: 'skeleton',
    name: '骷髏戰士',
    race: '不死族',
    stats: makeStats({ str: 8, con: 7, dex: 5, wil: 8 }),
    level: 3,
    maxHp: 35,
    currentHp: 35,
    maxSp: 15,
    currentSp: 15,
    skills: [],
    ai: {
      tendencies: { attack: 40, block: 30, skill: 10, recover: 20 },
      hpLowThreshold: 0.3,
      hpLowBehavior: { block: 10, recover: 50 },
    },
    damageType: 'physical',
    strMult: 1.2,
    xpReward: 20,
  },
  {
    id: 'shadow_mage',
    name: '暗影法師',
    race: '不死族',
    stats: makeStats({ int: 10, per: 7, con: 4, dex: 5 }),
    level: 3,
    maxHp: 22,
    currentHp: 22,
    maxSp: 30,
    currentSp: 30,
    skills: ['shadow_bolt'],
    ai: { tendencies: { attack: 20, block: 10, skill: 55, recover: 15 } },
    damageType: 'magical',
    intMult: 1.5,
    xpReward: 25,
  },
  // ── BOSS ──
  {
    id: 'ogre',
    name: '食人魔',
    race: '巨人',
    stats: makeStats({ str: 14, con: 14, dex: 3, wil: 6 }),
    level: 5,
    maxHp: 80,
    currentHp: 80,
    maxSp: 15,
    currentSp: 15,
    skills: ['slam'],
    ai: {
      tendencies: { attack: 60, block: 10, skill: 20, recover: 10 },
      hpLowThreshold: 0.5,
      hpLowBehavior: { attack: 80, skill: 10, recover: 5 },
    },
    damageType: 'physical',
    strMult: 1.5,
    xpReward: 60,
  },
];

export function getEnemyById(id: string): Enemy | undefined {
  return ENEMIES.find(e => e.id === id);
}

export function getRandomEnemy(level: number): Enemy {
  // Pick enemies around the level
  const candidates = ENEMIES.filter(e => e.level <= level + 2 && e.level >= level - 1);
  const pool = candidates.length > 0 ? candidates : ENEMIES.filter(e => e.level <= level + 3);
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}
