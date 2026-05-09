/* ═══════════════════════════════════════
   職業定義 — 普攻/格擋差異
   ═══════════════════════════════════════ */

import type { ClassId } from '../../entities/Stats';

export interface ClassDef {
  id: ClassId;
  name: string;
  icon: string;
  description: string;
  /** 普攻類型 */
  attackType: 'physical' | 'magical';
  /** 普攻特殊效果 */
  attackBonus: string;
  /** 格擋特殊效果 */
  blockBonus: string;
  /** 初始 HP 倍率 */
  hpMult: number;
  /** 初始 SP 倍率 */
  spMult: number;
}

export const CLASSES: Record<ClassId, ClassDef> = {
  warrior: {
    id: 'warrior',
    name: '戰士',
    icon: '⚔️',
    description: '正面對決嘅專家，攻守兼備',
    attackType: 'physical',
    attackBonus: '標準 STR 傷害，無特殊效果',
    blockBonus: '格擋成功後，下回攻擊+20%',
    hpMult: 1.3,
    spMult: 0.8,
  },
  rogue: {
    id: 'rogue',
    name: '盜賊',
    icon: '🗡️',
    description: '高速爆發嘅刺客，擅長隱匿戰術',
    attackType: 'physical',
    attackBonus: '處於隱匿狀態時必定暴擊',
    blockBonus: '格擋成功後進入隱匿狀態（下次攻擊必定暴擊）',
    hpMult: 0.9,
    spMult: 1.1,
  },
  mage: {
    id: 'mage',
    name: '法師',
    icon: '🔮',
    description: '元素魔法嘅掌控者，強大但脆弱',
    attackType: 'magical',
    attackBonus: '標準 INT 魔法傷害，無視 10% 魔法抗性',
    blockBonus: '魔法格擋成功時有 30% 機率反制（對方受傷害）',
    hpMult: 0.7,
    spMult: 1.5,
  },
  priest: {
    id: 'priest',
    name: '牧師',
    icon: '✨',
    description: '光明嘅使者，以治癒之光守護自己',
    attackType: 'magical',
    attackBonus: '造成傷害的 25% 轉化為自身 HP 回復',
    blockBonus: '格擋成功時回復 HP（10% 生命上限）',
    hpMult: 1.1,
    spMult: 1.2,
  },
  ranger: {
    id: 'ranger',
    name: '遊俠',
    icon: '🏹',
    description: '精準嘅遠程獵手，擅長控制戰局',
    attackType: 'physical',
    attackBonus: '命中補正 +10%（若有命中機制時生效）',
    blockBonus: '格擋成功時附加緩速效果（敵方下回 DEX-3）',
    hpMult: 1.0,
    spMult: 1.0,
  },
};

export function getClass(classId: ClassId): ClassDef {
  return CLASSES[classId];
}

export const CLASS_LIST: ClassId[] = ['warrior', 'rogue', 'mage', 'priest', 'ranger'];
