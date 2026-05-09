/* ═══════════════════════════════════════
   世界生成 — 主線地點必出 + 難度 scaling
   ═══════════════════════════════════════ */

import { REGIONS, LOCATION_TYPES, type RegionId, type LocationTypeId, type GeneratedLocation } from '../data/world/regions';
import { MAIN_QUESTS, type QuestId } from '../data/world/quests';
import { getRandomEnemy } from '../data/enemies/enemies';

const RANDOM_TYPES: LocationTypeId[] = ['battlefield', 'forest', 'cave', 'ruins', 'shrine'];

const NAME_POOLS: Partial<Record<LocationTypeId, string[]>> = {
  town: ['翡翠鎮', '鐵砧堡', '微風村', '晨光鎮'],
  battlefield: ['古戰場', '染血之地', '斷劍谷', '荒廢軍營'],
  forest: ['幽暗密林', '翠光林', '迷霧森林', '黑木林'],
  cave: ['黑暗洞穴', '水晶洞', '礦坑遺址', '深淵裂隙'],
  ruins: ['遠古遺跡', '荒廢神殿', '墜星塔', '失落之城'],
  shrine: ['靜謐祭壇', '元素祭壇', '龍之聖地', '月光祭壇'],
};

let nameCounter = 0;

function pickName(typeId: LocationTypeId, used: Set<string>, force?: string): string {
  if (force) { used.add(force); return force; }
  const pool = NAME_POOLS[typeId] ?? [];
  const avail = pool.filter(n => !used.has(n));
  if (avail.length > 0) { const n = avail[Math.floor(Math.random()*avail.length)]; used.add(n); return n; }
  return `${LOCATION_TYPES[typeId].name} #${++nameCounter}`;
}

function generateLocationsForRegion(
  regionId: RegionId,
  usedNames: Set<string>,
  activeQuest?: QuestId,
): GeneratedLocation[] {
  const region = REGIONS[regionId];
  const locs: GeneratedLocation[] = [];

  // 1. 城鎮（如果有嘅話）
  if ((region.locationWeights.town ?? 0) > 0) {
    locs.push({
      id: `${regionId}_town`,
      regionId,
      typeId: 'town',
      name: pickName('town', usedNames),
      isTown: true, cleared: false,
      facilities: LOCATION_TYPES.town.facilities,
    });
  }

  // 2. 主線任務地點（如果呢個地區係 active quest 目標）
  if (activeQuest) {
    const quest = MAIN_QUESTS[activeQuest];
    if (quest.targetRegion === regionId) {
      locs.push({
        id: `${regionId}_quest_${quest.id}`,
        regionId,
        typeId: quest.targetLocationType,
        name: quest.customLocationName ?? pickName(quest.targetLocationType, usedNames),
        isTown: false, cleared: false,
        facilities: LOCATION_TYPES[quest.targetLocationType].facilities,
        questId: quest.id,
        enemy: { id: `quest_${quest.id}`, name: `${quest.title}·守衛`, level: 3, damageType: 'physical', maxHp: 40 },
      });
    }
  }

  // 3. 隨機地點（2-4 個）
  const numRand = 2 + Math.floor(Math.random() * 3);
  const weights = region.locationWeights;
  const weightedTypes: LocationTypeId[] = RANDOM_TYPES.flatMap(t =>
    Array((weights[t] ?? 1)).fill(t)
  );

  for (let i = 0; i < numRand; i++) {
    const typeId = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
    const loc: GeneratedLocation = {
      id: `${regionId}_rand_${i}`,
      regionId,
      typeId,
      name: pickName(typeId, usedNames),
      isTown: false, cleared: false,
      facilities: LOCATION_TYPES[typeId].facilities,
    };
    if (LOCATION_TYPES[typeId].hasEnemy) {
      const e = getRandomEnemy(1);
      loc.enemy = { id: e.id, name: e.name, level: e.level, damageType: e.damageType, maxHp: e.maxHp };
    }
    locs.push(loc);
  }

  // 4. 最終 BOSS（龍脊山脈專屬）
  if (regionId === 'dragon_peak') {
    // 如果有 q5_peak 主線，已經有 quest 地點做 BOSS
    // 再加一個額外強敵
    const boss = getRandomEnemy(5);
    boss.name = '遠古之龍 · 維爾德拉';
    boss.level = 7;
    boss.maxHp = 120;
    locs.push({
      id: `${regionId}_boss`,
      regionId,
      typeId: 'battlefield',
      name: '🐉 龍之巔',
      isTown: false, cleared: false,
      facilities: [],
      enemy: { id: 'dragon_boss', name: boss.name, level: boss.level, damageType: 'physical', maxHp: boss.maxHp },
    });
  }

  return locs;
}

export interface WorldData {
  regions: { regionId: RegionId; locations: GeneratedLocation[] }[];
  questProgress: QuestId[];       // 已完成 quest
  activeQuest: QuestId | null;    // 當前 quest
  unlockedRegions: RegionId[];    // 已解鎖地區
  clearedCount: number;           // 已清地點數（用於難度 scaling）
}

/** 生成完整世界 */
export function generateWorld(): WorldData {
  nameCounter = 0;
  const usedNames = new Set<string>();

  // 初始：解鎖翡翠森林 + 第一主線
  const unlockedRegions: RegionId[] = ['whisper_forest'];
  const activeQuest: QuestId = 'q1_forest';

  // 為所有地區生成地點（即使未解鎖，都要 generate 定）
  const allRegionIds = Object.keys(REGIONS) as RegionId[];
  const regions = allRegionIds.map(rid => ({
    regionId: rid,
    locations: generateLocationsForRegion(rid, usedNames, rid === 'whisper_forest' ? activeQuest : undefined),
  }));

  return {
    regions,
    questProgress: [],
    activeQuest,
    unlockedRegions,
    clearedCount: 0,
  };
}

/** 完成主線任務 */
export function completeQuest(world: WorldData, questId: QuestId): WorldData {
  const quest = MAIN_QUESTS[questId];
  const newProgress = [...world.questProgress, questId];

  // 解鎖新地區
  const newRegions = [...world.unlockedRegions];
  if (quest.unlocksRegion) {
    for (const r of quest.unlocksRegion) {
      if (!newRegions.includes(r)) newRegions.push(r);
    }
  }

  // 下一個任務
  const nextQuest = quest.unlocks ? (quest.unlocks as QuestId) : null;

  return {
    ...world,
    questProgress: newProgress,
    activeQuest: nextQuest,
    unlockedRegions: newRegions,
  };
}

/** 獲取當前 quest 嘅目標地點 */
export function getQuestLocation(world: WorldData, questId: QuestId): GeneratedLocation | null {
  for (const region of world.regions) {
    for (const loc of region.locations) {
      if (loc.questId === questId) return loc;
    }
  }
  return null;
}
