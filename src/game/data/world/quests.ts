/* ═══════════════════════════════════════
   主線任務系統
   ═══════════════════════════════════════ */

import type { RegionId, LocationTypeId } from './regions';

export type QuestId = 'q1_forest' | 'q2_plains' | 'q3_lake' | 'q4_swamp' | 'q5_peak';

export interface QuestDef {
  id: QuestId;
  title: string;
  icon: string;
  description: string;
  /** 目標地區 */
  targetRegion: RegionId;
  /** 需要生成嘅地點類型 */
  targetLocationType: LocationTypeId;
  /** 自訂地點名（可選） */
  customLocationName?: string;
  /** 完成後解鎖邊個 quest */
  unlocks?: QuestId;
  /** 解鎖邊個新地區 */
  unlocksRegion?: RegionId[];
  /** 完成獎勵描述 */
  reward: string;
}

export const MAIN_QUESTS: Record<QuestId, QuestDef> = {
  q1_forest: {
    id: 'q1_forest',
    title: '森林的異樣',
    icon: '🌲',
    description: '翡翠鎮村長話森林深處有異常聲音，去調查一下',
    targetRegion: 'whisper_forest',
    targetLocationType: 'forest',
    customLocationName: '🌲 低語密林（主線）',
    unlocks: 'q2_plains',
    unlocksRegion: ['ash_plains'],
    reward: '解鎖灰燼平原通道',
  },
  q2_plains: {
    id: 'q2_plains',
    title: '灰燼中的訊息',
    icon: '🌫️',
    description: '灰燼平原嘅倖存者話有一塊 ancient tablet 藏喺廢墟深處，入面記載咗 corruption 嘅源頭',
    targetRegion: 'ash_plains',
    targetLocationType: 'ruins',
    customLocationName: '🏚️ 遠古遺碑（主線）',
    unlocks: 'q3_lake',
    unlocksRegion: ['crystal_lake'],
    reward: '解鎖水晶湖通道',
  },
  q3_lake: {
    id: 'q3_lake',
    title: '湖底之謎',
    icon: '💎',
    description: '水晶湖湖底有一座遠古祭壇，取出 artifact 就能揭示真相',
    targetRegion: 'crystal_lake',
    targetLocationType: 'shrine',
    customLocationName: '🏛️ 湖底祭壇（主線）',
    unlocks: 'q4_swamp',
    unlocksRegion: ['forgotten_swamp', 'dragon_peak'],
    reward: '解鎖遺忘沼澤同龍脊山脈',
  },
  q4_swamp: {
    id: 'q4_swamp',
    title: '沼澤的考驗',
    icon: '🌿',
    description: '遺忘沼澤深處藏有對抗腐化之源嘅遠古符文，攞到佢會令最終戰更容易',
    targetRegion: 'forgotten_swamp',
    targetLocationType: 'ruins',
    customLocationName: '🏚️ 符文遺跡（主線）',
    unlocks: 'q5_peak',
    reward: '獲得強化符文，最終戰難度降低',
  },
  q5_peak: {
    id: 'q5_peak',
    title: '龍脊之巔',
    icon: '🐉',
    description: '山頂上嘅遠古之龍就係腐化之源！擊敗佢，拯救世界！',
    targetRegion: 'dragon_peak',
    targetLocationType: 'battlefield',
    customLocationName: '🔥 龍之巔（最終BOSS）',
    reward: '通關！獲得大量輪迴點',
  },
};

export function getQuest(questId: QuestId): QuestDef {
  return MAIN_QUESTS[questId];
}

/** 主線順序 */
export const QUEST_ORDER: QuestId[] = ['q1_forest', 'q2_plains', 'q3_lake', 'q4_swamp', 'q5_peak'];
