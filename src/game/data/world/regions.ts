/* ═══════════════════════════════════════
   世界地圖 — 相連地區 + 主題
   ═══════════════════════════════════════ */

/** 地區 ID */
export type RegionId = 'whisper_forest' | 'ash_plains' | 'forgotten_swamp' | 'crystal_lake' | 'dragon_peak';

/** 地點類型 */
export type LocationTypeId = 'town' | 'battlefield' | 'shrine' | 'forest' | 'cave' | 'ruins';

/** 設施類型 */
export type FacilityId = 'rest' | 'shop' | 'blacksmith' | 'altar' | 'rune_workshop';

/** 地點種類定義 */
export interface LocationTypeDef {
  id: LocationTypeId;
  name: string;
  icon: string;
  color: string;
  facilities: FacilityId[];
  hasEnemy: boolean;
}

export const LOCATION_TYPES: Record<LocationTypeId, LocationTypeDef> = {
  town:        { id: 'town',        name: '城鎮',       icon: '🏘️', color: 'emerald', facilities: ['rest', 'shop', 'blacksmith', 'altar'], hasEnemy: false },
  battlefield: { id: 'battlefield', name: '戰場遺址',   icon: '⚔️',  color: 'red',    facilities: [], hasEnemy: true },
  forest:      { id: 'forest',      name: '森林小徑',   icon: '🌲',  color: 'green',  facilities: [], hasEnemy: true },
  cave:        { id: 'cave',        name: '山洞',       icon: '⛰️',  color: 'gray',   facilities: [], hasEnemy: true },
  ruins:       { id: 'ruins',       name: '廢墟',       icon: '🏚️', color: 'amber',  facilities: [], hasEnemy: true },
  shrine:      { id: 'shrine',      name: '祭壇',       icon: '🏛️', color: 'purple', facilities: ['altar'], hasEnemy: false },
};

export const FACILITIES: Record<FacilityId, { name: string; icon: string; description: string }> = {
  rest:    { name: '旅館休息', icon: '🛌', description: '回復全部 HP 同氣力' },
  shop:    { name: '商店',     icon: '🏪', description: '購買消耗品（暫未開放）' },
  blacksmith: { name: '鐵匠舖', icon: '🔨', description: '升級武器（暫未開放）' },
  altar:   { name: '祭壇',     icon: '🏛️', description: '傳奇化裝備（暫未開放）' },
  rune_workshop: { name: '符文工坊', icon: '🔮', description: '符文操作（暫未開放）' },
};

/** 地區主題特色 */
export interface RegionTheme {
  id: RegionId;
  name: string;
  icon: string;
  description: string;
  /** 相鄰地區 */
  connections: RegionId[];
  /** 特色效果（純描述） */
  flavor: string;
  /** 地點種類權重（用嚟 generate 時決定邊類地點多 d） */
  locationWeights: Partial<Record<LocationTypeId, number>>;
  /** 該地區獨有事件描述 */
  specialEvent?: string;
}

export const REGIONS: Record<RegionId, RegionTheme> = {
  whisper_forest: {
    id: 'whisper_forest',
    name: '翡翠森林',
    icon: '🌲',
    description: '翠綠嘅起始之地，生機勃勃',
    connections: ['ash_plains'],
    flavor: '森林中精靈低語，草藥豐富，旅館休息效果加倍',
    locationWeights: { town: 1, battlefield: 2, forest: 3, cave: 1, ruins: 1, shrine: 1 },
  },
  ash_plains: {
    id: 'ash_plains',
    name: '灰燼平原',
    icon: '🌫️',
    description: '曾經繁榮，而家只剩灰燼',
    connections: ['whisper_forest', 'crystal_lake', 'forgotten_swamp'],
    flavor: '魔物肆虐，戰鬥頻繁，戰利品掉落率提升',
    locationWeights: { town: 1, battlefield: 3, cave: 2, ruins: 2, shrine: 0 },
  },
  forgotten_swamp: {
    id: 'forgotten_swamp',
    name: '遺忘沼澤',
    icon: '🌿',
    description: '毒霧籠罩嘅沼澤，危機四伏',
    connections: ['ash_plains'],
    flavor: '狀態異常頻發，但藏有遠古符文寶藏',
    locationWeights: { town: 0, battlefield: 2, forest: 3, cave: 2, ruins: 2, shrine: 1 },
    specialEvent: '沼澤深處有隱藏嘅符文工坊',
  },
  crystal_lake: {
    id: 'crystal_lake',
    name: '水晶湖',
    icon: '💎',
    description: '湖水清澈見底，湖底晶石閃爍',
    connections: ['ash_plains', 'dragon_peak'],
    flavor: '祭壇較多，符文相關事件豐富',
    locationWeights: { town: 1, battlefield: 1, cave: 2, ruins: 2, shrine: 3 },
  },
  dragon_peak: {
    id: 'dragon_peak',
    name: '龍脊山脈',
    icon: '🐉',
    description: '最終之地，山巔盤踞著遠古之龍',
    connections: ['crystal_lake'],
    flavor: '最強嘅敵人等待著你',
    locationWeights: { town: 1, battlefield: 3, cave: 1, ruins: 1, shrine: 1 },
    specialEvent: '山頂就係最終 BOSS 所在地',
  },
};

/** 生成嘅地點（per run） */
export interface GeneratedLocation {
  id: string;
  regionId: RegionId;
  typeId: LocationTypeId;
  name: string;
  isTown: boolean;
  cleared: boolean;
  facilities: FacilityId[];
  /** 主線任務相關 */
  questId?: string;
  enemy?: { id: string; name: string; level: number; damageType: string; maxHp: number };
}
