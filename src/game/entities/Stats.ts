/* ═══════════════════════════════════════
   神器戰爭 (War of Relics)
   核心類型定義
   ═══════════════════════════════════════ */

/** 8 大屬性 */
export interface Stats {
  str: number; // 力量 — 物理傷害
  con: number; // 體質 — 生命上限、生命恢復
  dex: number; // 敏捷 — 物理格擋
  wil: number; // 意志 — 異常抗性、SP
  per: number; // 感知 — 魔法格擋
  int: number; // 智力 — 魔法傷害
  cha: number; // 魅力 — 商店、事件
  lck: number; // 幸運 — 暴擊、掉落
}

export const DEFAULT_STATS: Stats = {
  str: 5, con: 5, dex: 5, wil: 5,
  per: 5, int: 5, cha: 5, lck: 5,
};

export const MAX_STAT = 20;
export const MIN_STAT = 5;

/** 種族 */
export type RaceId = 'human' | 'elf' | 'dwarf' | 'orc' | 'halfling' | 'dragonborn';

/** 職業 */
export type ClassId = 'warrior' | 'rogue' | 'mage' | 'priest' | 'ranger';

/** 戰鬥行動 */
export type Action = 'attack' | 'block' | 'skill1' | 'skill2' | 'skill3' | 'recover';

/** 傷害類型 */
export type DamageType = 'physical' | 'magical';

/** 戰鬥階段 */
export type GamePhase = 'meta_progression' | 'world_map' | 'location' | 'combat' | 'run_end';

/** 角色 */
export interface Character {
  id: string;
  name: string;
  race: RaceId;
  classId: ClassId;
  baseStats: Stats;            // Always starts at DEFAULT_STATS

  // Meta progression
  reincarnationPoints: number;
  talentTreeProgress: number[];

  // Per-run data
  runData?: RunData;
}

export interface RunData {
  level: number;
  xp: number;
  currentHp: number;
  maxHp: number;
  currentSp: number;
  maxSp: number;
  stats: Stats;                // Final stats (after talents + equipment)
  relicId: string | null;
  skills: string[];            // 3 equipped skills
  feats: string[];
  gold: number;
}

/** 敵人 */
export interface Enemy {
  id: string;
  name: string;
  race: string;
  stats: Stats;
  level: number;
  maxHp: number;
  currentHp: number;
  maxSp: number;
  currentSp: number;
  skills: string[];
  ai: EnemyAI;
  damageType: DamageType;
  strMult?: number;    // Physical damage multiplier
  intMult?: number;    // Magical damage multiplier
  xpReward: number;
}

export interface EnemyAI {
  tendencies: {
    attack: number;
    block: number;
    skill: number;
    recover: number;
  };
  // Dynamic adjustments
  hpLowThreshold?: number;
  hpLowBehavior?: Partial<EnemyAI['tendencies']>;
}

/** 神器 */
export interface RelicData {
  id: string;
  templateId: string;
  level: number;
  runes: (Rune | null)[];
}

export interface Rune {
  id: string;
  templateId: string;
  rarity: RuneRarity;
  statBonus: Partial<Stats>;
}

export type RuneRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/** 技能/招式 */
export interface SkillDef {
  id: string;
  name: string;
  description: string;
  type: 'physical' | 'magical' | 'support';
  spCost: number;
  cooldown: number;
  multiplier: number;
  effects: SkillEffect[];
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'status' | 'sp_drain' | 'stat_buff' | 'stat_debuff';
  value: number;
  duration?: number;
  stat?: keyof Stats;
}
