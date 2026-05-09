/* ═══════════════════════════════════════
   世界地圖 — 地區、地點種類、設施
   ═══════════════════════════════════════ */

import type { Enemy } from '../../entities/Stats';

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
  enemyLevel?: { min: number; max: number };
}

export const LOCATION_TYPES: Record<LocationTypeId, LocationTypeDef> = {
  town:    { id: 'town',    name: '城鎮', icon: '🏘️', color: 'emerald', facilities: ['rest', 'shop', 'blacksmith', 'altar'] },
  battlefield: { id: 'battlefield', name: '戰場遺址', icon: '⚔️', color: 'red', facilities: [], enemyLevel: { min: 1, max: 2 } },
  shrine:  { id: 'shrine',  name: '祭壇', icon: '🏛️', color: 'purple', facilities: ['altar'] },
  forest:  { id: 'forest',  name: '森林小徑', icon: '🌲', color: 'green', facilities: [], enemyLevel: { min: 1, max: 2 } },
  cave:    { id: 'cave',    name: '山洞', icon: '⛰️', color: 'gray', facilities: [], enemyLevel: { min: 1, max: 2 } },
  ruins:   { id: 'ruins',   name: '廢墟', icon: '🏚️', color: 'amber', facilities: [], enemyLevel: { min: 1, max: 3 } },
};

/** 設施定義 */
export interface FacilityDef {
  id: FacilityId;
  name: string;
  icon: string;
  description: string;
}

export const FACILITIES: Record<FacilityId, FacilityDef> = {
  rest:    { id: 'rest',    name: '旅館休息', icon: '🛌', description: '回復全部 HP 同氣力' },
  shop:    { id: 'shop',    name: '商店',     icon: '🏪', description: '購買消耗品（暫未開放）' },
  blacksmith: { id: 'blacksmith', name: '鐵匠舖', icon: '🔨', description: '升級武器（暫未開放）' },
  altar:   { id: 'altar',   name: '祭壇',     icon: '🏛️', description: '傳奇化裝備（暫未開放）' },
  rune_workshop: { id: 'rune_workshop', name: '符文工坊', icon: '🔮', description: '符文操作（暫未開放）' },
};

/** 地區定義 */
export interface RegionDef {
  id: string;
  name: string;
  description: string;
  levelRange: { min: number; max: number };
  boss?: { enemyId: string; name: string };
}

export const REGIONS: RegionDef[] = [
  { id: 'whisper_forest', name: '翡翠森林', description: '新手地區，魔物較弱', levelRange: { min: 1, max: 3 } },
  { id: 'ash_plains',     name: '灰燼平原', description: '火災後重生嘅平原', levelRange: { min: 2, max: 4 } },
  { id: 'crystal_lake',   name: '水晶湖',   description: '湖底蘊藏豐富礦物', levelRange: { min: 3, max: 5 } },
  { id: 'dragon_peak',    name: '龍脊山脈', description: '最終關卡，BOSS盤踞', levelRange: { min: 5, max: 7 }, boss: { enemyId: 'ogre', name: '食人魔領主' } },
];

/** 生成嘅地點（per run） */
export interface GeneratedLocation {
  id: string;
  regionId: string;
  typeId: LocationTypeId;
  name: string;
  isTown: boolean;      // 城鎮固定出現
  cleared: boolean;
  facilities: FacilityId[];
  enemy?: Enemy;         // 有敵人嘅話（戰鬥地點）
}
