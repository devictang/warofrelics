import { useState } from 'react';
import type { GeneratedLocation, FacilityId, RegionId } from '../game/data/world/regions';
import { LOCATION_TYPES, FACILITIES, REGIONS } from '../game/data/world/regions';
import type { WorldData } from '../game/systems/WorldGenerator';
import { MAIN_QUESTS } from '../game/data/world/quests';
import type { Character } from '../game/entities/Stats';

interface Props {
  location: GeneratedLocation;
  character: Character;
  world: WorldData;
  currentRegion: RegionId;
  questCompleted: boolean;
  onUpdateCharacter: (char: Character) => void;
  onStartCombat: (enemyId: string) => void;
  onLeave: () => void;
}

export function LocationScreen({ location, character, currentRegion, questCompleted, onUpdateCharacter, onStartCombat, onLeave }: Props) {
  const typeDef = LOCATION_TYPES[location.typeId];
  const [message, setMessage] = useState('');
  const isQuestLoc = !!location.questId;
  const quest = isQuestLoc && location.questId ? MAIN_QUESTS[location.questId as keyof typeof MAIN_QUESTS] : null;

  function handleFacility(facilityId: FacilityId) {
    if (!character.runData) return;
    const newChar = { ...character, runData: { ...character.runData } };
    switch (facilityId) {
      case 'rest':
        newChar.runData.currentHp = newChar.runData.maxHp;
        newChar.runData.currentSp = newChar.runData.maxSp;
        setMessage('🛌 你喺旅館休息了一晚，HP 同氣力完全回復！');
        onUpdateCharacter(newChar);
        break;
      default:
        setMessage(`${FACILITIES[facilityId].icon} ${FACILITIES[facilityId].name}暫未開放`);
    }
  }

  function handleExplore() {
    if (location.enemy && !location.cleared) {
      onStartCombat(location.enemy.id);
    } else {
      setMessage('呢度冇咩特別發現...');
    }
  }

  return (
    <div className="h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-3 max-w-2xl mx-auto flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 mb-2">
        <button onClick={onLeave} className="text-xs text-gray-500 hover:text-gray-300 mb-1">← {REGIONS[currentRegion].name}</button>
        <h1 className="text-lg font-bold">{typeDef.icon} {location.name}</h1>
        <div className="text-xs text-gray-400">{typeDef.name}</div>
      </div>

      {/* Quest info */}
      {quest && (
        <div className={`shrink-0 rounded-xl p-3 border mb-2 ${
          questCompleted
            ? 'bg-emerald-900/30 border-emerald-600/30'
            : 'bg-amber-900/30 border-amber-600/30'
        }`}>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-400">📜</span>
            <span className="font-bold">{quest.title}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {questCompleted ? '✅ 主線任務完成！' : quest.description}
          </div>
          {questCompleted && quest.unlocks && (
            <div className="text-xs text-emerald-400 mt-1">
              🗝️ 新主線解鎖！{quest.unlocksRegion?.map(r => REGIONS[r as RegionId]?.name).join('、')}
            </div>
          )}
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="shrink-0 bg-slate-800/80 rounded-xl p-3 border border-amber-500/30 mb-2 text-sm">
          {message}
        </div>
      )}

      {/* Facilities */}
      {location.facilities.length > 0 && (
        <div className="shrink-0 space-y-1.5 mb-2">
          <div className="text-[10px] text-gray-600">— 設施 —</div>
          {location.facilities.map(fid => {
            const fac = FACILITIES[fid];
            return (
              <button key={fid} onClick={() => handleFacility(fid)}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-800/60 rounded-xl
                  hover:bg-slate-700/60 border border-slate-700/50 transition text-left">
                <span className="text-xl">{fac.icon}</span>
                <div>
                  <div className="text-sm font-medium">{fac.name}</div>
                  <div className="text-[10px] text-gray-500">{fac.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Enemy */}
      {location.enemy && !location.cleared && (
        <div className="shrink-0 mb-2">
          <div className="text-[10px] text-gray-600 mb-1">— 魔物 —</div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-red-700/30">
            <div className="text-sm text-red-300 font-bold">⚠️ {location.enemy.name} Lv.{location.enemy.level}</div>
            <div className="text-xs text-gray-400 mt-1">HP {location.enemy.maxHp} · {location.enemy.damageType === 'physical' ? '⚔️物理' : '🔮魔法'}</div>
          </div>
        </div>
      )}

      <div className="flex-1" />

      <div className="shrink-0 flex gap-2">
        {location.enemy && !location.cleared && (
          <button onClick={handleExplore}
            className="flex-1 py-3 bg-red-700 hover:bg-red-600 rounded-xl font-bold transition text-sm">
            ⚔️ 進入戰鬥
          </button>
        )}
        <button onClick={onLeave}
          className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition text-sm">
          ← 返回地圖
        </button>
      </div>
    </div>
  );
}
