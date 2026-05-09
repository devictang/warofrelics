/* ═══════════════════════════════════════
   世界生成 — 每次 run 生成地圖
   ═══════════════════════════════════════ */

import { REGIONS, LOCATION_TYPES, type GeneratedLocation, type LocationTypeId } from '../data/world/regions';
import { getRandomEnemy } from '../data/enemies/enemies';

/** 可隨機生成嘅地點類型（排除城鎮） */
const RANDOM_TYPES: LocationTypeId[] = ['battlefield', 'forest', 'cave', 'ruins', 'shrine'];

const TOWN_NAMES = [
  '翡翠鎮', '鐵砧堡', '微風村', '石哨堡',
  '晨光鎮', '霧谷村', '紅石堡',
];

const BATTLEFIELD_NAMES = ['古戰場', '染血之地', '斷劍谷'];
const FOREST_NAMES = ['幽暗密林', '翠光林', '迷霧森林'];
const CAVE_NAMES = ['黑暗洞穴', '水晶洞', '礦坑遺址'];
const RUINS_NAMES = ['遠古遺跡', '荒廢神殿', '墜星塔'];
const SHRINE_NAMES = ['靜謐祭壇', '元素祭壇', '龍之聖地'];

const NAME_POOLS: Record<LocationTypeId, string[]> = {
  town: TOWN_NAMES,
  battlefield: BATTLEFIELD_NAMES,
  forest: FOREST_NAMES,
  cave: CAVE_NAMES,
  ruins: RUINS_NAMES,
  shrine: SHRINE_NAMES,
};

let locationCounter = 0;

function pickName(typeId: LocationTypeId, usedNames: Set<string>): string {
  const pool = NAME_POOLS[typeId];
  const available = pool.filter(n => !usedNames.has(n));
  const name = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : `${LOCATION_TYPES[typeId].name} #${++locationCounter}`;
  usedNames.add(name);
  return name;
}

/** 為一個地區生成地點列表 */
function generateRegionLocations(regionIdx: number, usedNames: Set<string>): GeneratedLocation[] {
  const region = REGIONS[regionIdx];
  const locations: GeneratedLocation[] = [];

  // 1. 固定城鎮
  locations.push({
    id: `${region.id}_town`,
    regionId: region.id,
    typeId: 'town',
    name: pickName('town', usedNames),
    isTown: true,
    cleared: false,
    facilities: LOCATION_TYPES.town.facilities,
  });

  // 2. 隨機地點（2-4 個）
  const numRandom = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numRandom; i++) {
    const typeId = RANDOM_TYPES[Math.floor(Math.random() * RANDOM_TYPES.length)];
    const typeDef = LOCATION_TYPES[typeId];
    const loc: GeneratedLocation = {
      id: `${region.id}_rand_${i}`,
      regionId: region.id,
      typeId,
      name: pickName(typeId, usedNames),
      isTown: false,
      cleared: false,
      facilities: [...(typeDef.facilities || [])],
    };

    // 如果有敵人等級範圍，生成敵人
    if (typeDef.enemyLevel) {
      const level = typeDef.enemyLevel.min +
        Math.floor(Math.random() * (typeDef.enemyLevel.max - typeDef.enemyLevel.min + 1));
      loc.enemy = { ...getRandomEnemy(level) };
    }

    locations.push(loc);
  }

  // 最後一個地區加 BOSS
  if (region.boss) {
    const bossEnemy = getRandomEnemy(region.levelRange.max);
    bossEnemy.name = region.boss.name;
    bossEnemy.level = region.levelRange.max + 1;
    locations.push({
      id: `${region.id}_boss`,
      regionId: region.id,
      typeId: 'battlefield',
      name: `🔥 ${region.boss.name}`,
      isTown: false,
      cleared: false,
      facilities: [],
      enemy: bossEnemy,
    });
  }

  return locations;
}

/** 生成完整世界地圖 */
export function generateWorld(): {
  regions: { region: typeof REGIONS[0]; locations: GeneratedLocation[] }[];
} {
  locationCounter = 0;
  const usedNames = new Set<string>();

  const regions = REGIONS.map((region, idx) => ({
    region,
    locations: generateRegionLocations(idx, usedNames),
  }));

  return { regions };
}
