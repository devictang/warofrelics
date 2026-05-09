/* ═══════════════════════════════════════
   種族定義 — 種族本身唔 +/- 屬性
   天賦解鎖先提供加成（meta progression）
   ═══════════════════════════════════════ */

import type { RaceId } from '../../entities/Stats';

export interface RaceDef {
  id: RaceId;
  name: string;
  icon: string;
  description: string;
  theme: string;
  /** 種族天賦樹：每個 tier [名稱, 效果描述, 輪迴點需求] */
  talentTree: TalentTierDef[];
  /** 頂階特殊能力 */
  ultimateName: string;
  ultimateDesc: string;
}

export interface TalentTierDef {
  name: string;
  choices: {
    label: string;
    description: string;
    /** 每級效果（array index = level-1） */
    perLevel: string[];
    maxLevel: number;
    costPerLevel: number;
    statBonus?: Partial<Record<string, number>>; // e.g. { str: 1, lck: 1 }
  }[];
}

export const RACES: Record<RaceId, RaceDef> = {
  human: {
    id: 'human',
    name: '人類',
    icon: '💪',
    description: '適應力極強嘅種族，各方面均衡發展',
    theme: '全能均衡',
    talentTree: [
      {
        name: '均衡鍛鍊',
        choices: [
          { label: '力量訓練', description: '力量+1', perLevel: ['STR+1', 'STR+2', 'STR+3'], maxLevel: 3, costPerLevel: 2, statBonus: { str: 1 } },
          { label: '體能訓練', description: '體質+1', perLevel: ['CON+1', 'CON+2', 'CON+3'], maxLevel: 3, costPerLevel: 2, statBonus: { con: 1 } },
        ],
      },
      {
        name: '技巧磨練',
        choices: [
          { label: '敏捷訓練', description: '敏捷+1', perLevel: ['DEX+1', 'DEX+2'], maxLevel: 2, costPerLevel: 3, statBonus: { dex: 1 } },
          { label: '意志訓練', description: '意志+1', perLevel: ['WIL+1', 'WIL+2'], maxLevel: 2, costPerLevel: 3, statBonus: { wil: 1 } },
        ],
      },
      {
        name: '知識追求',
        choices: [
          { label: '智力訓練', description: '智力+1', perLevel: ['INT+1', 'INT+2'], maxLevel: 2, costPerLevel: 3, statBonus: { int: 1 } },
          { label: '感知訓練', description: '感知+1', perLevel: ['PER+1', 'PER+2'], maxLevel: 2, costPerLevel: 3, statBonus: { per: 1 } },
        ],
      },
      {
        name: '社交天賦',
        choices: [
          { label: '魅力訓練', description: '魅力+1', perLevel: ['CHA+1', 'CHA+2'], maxLevel: 2, costPerLevel: 3, statBonus: { cha: 1 } },
          { label: '運氣訓練', description: '幸運+1', perLevel: ['LCK+1', 'LCK+2'], maxLevel: 2, costPerLevel: 3, statBonus: { lck: 1 } },
        ],
      },
      {
        name: '人類潛能',
        choices: [
          { label: '全屬性強化', description: '全屬性+1', perLevel: ['全屬性+1'], maxLevel: 1, costPerLevel: 8, statBonus: { str: 1, con: 1, dex: 1, wil: 1, per: 1, int: 1, cha: 1, lck: 1 } },
          { label: '經驗加成', description: '經驗獲得+20%', perLevel: ['經驗+20%', '經驗+40%'], maxLevel: 2, costPerLevel: 5 },
        ],
      },
    ],
    ultimateName: '覺醒',
    ultimateDesc: '每場戰鬥1次，全能力+30%持續3回合',
  },

  elf: {
    id: 'elf',
    name: '精靈',
    icon: '🏹',
    description: '優雅而敏捷嘅長生種，精通魔法與箭術',
    theme: '敏捷魔法',
    talentTree: [
      {
        name: '風之步',
        choices: [
          { label: '敏捷訓練', description: '敏捷+1', perLevel: ['DEX+1', 'DEX+2', 'DEX+3'], maxLevel: 3, costPerLevel: 2, statBonus: { dex: 1 } },
          { label: '迴避本能', description: '格擋率+2%', perLevel: ['+2%', '+4%', '+6%'], maxLevel: 3, costPerLevel: 2 },
        ],
      },
      {
        name: '魔力流動',
        choices: [
          { label: '智力訓練', description: '智力+1', perLevel: ['INT+1', 'INT+2', 'INT+3'], maxLevel: 3, costPerLevel: 2, statBonus: { int: 1 } },
          { label: '感知訓練', description: '感知+1', perLevel: ['PER+1', 'PER+2'], maxLevel: 2, costPerLevel: 3, statBonus: { per: 1 } },
        ],
      },
      {
        name: '月之祝福',
        choices: [
          { label: '魔法傷害+5%', description: '魔法傷害+5%', perLevel: ['+5%', '+10%', '+15%'], maxLevel: 3, costPerLevel: 3 },
          { label: 'SP恢復+2', description: '每回合SP恢復+2', perLevel: ['+2', '+4', '+6'], maxLevel: 3, costPerLevel: 3 },
        ],
      },
    ],
    ultimateName: '月影步',
    ultimateDesc: '必定閃避下一次攻擊（無視格擋判定）',
  },

  dwarf: {
    id: 'dwarf',
    name: '矮人',
    icon: '⛏️',
    description: '堅韌不屈嘅山地民族，體魄強健、意志堅定',
    theme: '體魄意志',
    talentTree: [
      {
        name: '鋼鐵之軀',
        choices: [
          { label: '體質訓練', description: '體質+1', perLevel: ['CON+1', 'CON+2', 'CON+3'], maxLevel: 3, costPerLevel: 2, statBonus: { con: 1 } },
          { label: '生命強化', description: '生命上限+10', perLevel: ['+10', '+20', '+30'], maxLevel: 3, costPerLevel: 2 },
        ],
      },
      {
        name: '不屈意志',
        choices: [
          { label: '意志訓練', description: '意志+1', perLevel: ['WIL+1', 'WIL+2', 'WIL+3'], maxLevel: 3, costPerLevel: 2, statBonus: { wil: 1 } },
          { label: '異常抗性+5%', description: '異常狀態抗性+5%', perLevel: ['+5%', '+10%', '+15%'], maxLevel: 3, costPerLevel: 2 },
        ],
      },
      {
        name: '山之心',
        choices: [
          { label: '力量訓練', description: '力量+1', perLevel: ['STR+1', 'STR+2'], maxLevel: 2, costPerLevel: 3, statBonus: { str: 1 } },
          { label: '生命恢復', description: '每回合恢復HP+3', perLevel: ['+3', '+6', '+9'], maxLevel: 3, costPerLevel: 3 },
        ],
      },
    ],
    ultimateName: '鋼鐵意志',
    ultimateDesc: '免疫所有異常狀態2回合',
  },

  orc: {
    id: 'orc',
    name: '獸人',
    icon: '🗡️',
    description: '天生戰鬥民族，以壓倒性力量粉碎敵人',
    theme: '狂暴力量',
    talentTree: [
      {
        name: '蠻力',
        choices: [
          { label: '力量訓練', description: '力量+1', perLevel: ['STR+1', 'STR+2', 'STR+3', 'STR+4'], maxLevel: 4, costPerLevel: 2, statBonus: { str: 1 } },
          { label: '體質訓練', description: '體質+1', perLevel: ['CON+1', 'CON+2'], maxLevel: 2, costPerLevel: 3, statBonus: { con: 1 } },
        ],
      },
      {
        name: '嗜血',
        choices: [
          { label: '暴擊傷害+10%', description: '暴擊傷害+10%', perLevel: ['+10%', '+20%', '+30%'], maxLevel: 3, costPerLevel: 3 },
          { label: '吸血+3%', description: '造成傷害3%回復HP', perLevel: ['+3%', '+6%', '+9%'], maxLevel: 3, costPerLevel: 3 },
        ],
      },
      {
        name: '戰吼',
        choices: [
          { label: '意志訓練', description: '意志+1', perLevel: ['WIL+1', 'WIL+2'], maxLevel: 2, costPerLevel: 3, statBonus: { wil: 1 } },
          { label: '開場ATK+10%', description: '戰鬥首回ATK+10%', perLevel: ['+10%', '+20%'], maxLevel: 2, costPerLevel: 4 },
        ],
      },
    ],
    ultimateName: '血怒',
    ultimateDesc: 'HP低於30%時，攻擊力x2',
  },

  halfling: {
    id: 'halfling',
    name: '半身人',
    icon: '🍀',
    description: '小巧靈活嘅幸運兒，總係有意想不到嘅好運',
    theme: '幸運魅力',
    talentTree: [
      {
        name: '好運連連',
        choices: [
          { label: '幸運訓練', description: '幸運+1', perLevel: ['LCK+1', 'LCK+2', 'LCK+3'], maxLevel: 3, costPerLevel: 2, statBonus: { lck: 1 } },
          { label: '暴擊率+2%', description: '暴擊率+2%', perLevel: ['+2%', '+4%', '+6%'], maxLevel: 3, costPerLevel: 2 },
        ],
      },
      {
        name: '人見人愛',
        choices: [
          { label: '魅力訓練', description: '魅力+1', perLevel: ['CHA+1', 'CHA+2', 'CHA+3'], maxLevel: 3, costPerLevel: 2, statBonus: { cha: 1 } },
          { label: '商店折扣+5%', description: '商店價格-5%', perLevel: ['-5%', '-10%', '-15%'], maxLevel: 3, costPerLevel: 2 },
        ],
      },
      {
        name: '輕盈步伐',
        choices: [
          { label: '敏捷訓練', description: '敏捷+1', perLevel: ['DEX+1', 'DEX+2'], maxLevel: 2, costPerLevel: 3, statBonus: { dex: 1 } },
          { label: '掉落率+5%', description: '物品掉落率+5%', perLevel: ['+5%', '+10%'], maxLevel: 2, costPerLevel: 4 },
        ],
      },
    ],
    ultimateName: '命運逆轉',
    ultimateDesc: '每場戰鬥1次，重新roll一個失敗嘅判定',
  },

  dragonborn: {
    id: 'dragonborn',
    name: '龍裔',
    icon: '🐉',
    description: '擁有龍族血脈嘅戰士，掌握元素之力',
    theme: '元素之力',
    talentTree: [
      {
        name: '龍之力',
        choices: [
          { label: '力量訓練', description: '力量+1', perLevel: ['STR+1', 'STR+2', 'STR+3'], maxLevel: 3, costPerLevel: 2, statBonus: { str: 1 } },
          { label: '智力訓練', description: '智力+1', perLevel: ['INT+1', 'INT+2', 'INT+3'], maxLevel: 3, costPerLevel: 2, statBonus: { int: 1 } },
        ],
      },
      {
        name: '龍鱗',
        choices: [
          { label: '體質訓練', description: '體質+1', perLevel: ['CON+1', 'CON+2'], maxLevel: 2, costPerLevel: 3, statBonus: { con: 1 } },
          { label: '元素抗性+10%', description: '元素傷害抗性+10%', perLevel: ['+10%', '+20%'], maxLevel: 2, costPerLevel: 3 },
        ],
      },
      {
        name: '龍威',
        choices: [
          { label: '魅力訓練', description: '魅力+1', perLevel: ['CHA+1', 'CHA+2'], maxLevel: 2, costPerLevel: 3, statBonus: { cha: 1 } },
          { label: '意志訓練', description: '意志+1', perLevel: ['WIL+1', 'WIL+2'], maxLevel: 2, costPerLevel: 3, statBonus: { wil: 1 } },
        ],
      },
    ],
    ultimateName: '龍之吐息',
    ultimateDesc: '全體元素攻擊（3回合CD），造成INT×3傷害',
  },
};

export function getRace(raceId: RaceId): RaceDef {
  return RACES[raceId];
}

export const RACE_LIST: RaceId[] = ['human', 'elf', 'dwarf', 'orc', 'halfling', 'dragonborn'];
