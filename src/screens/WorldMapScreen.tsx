import type { GeneratedLocation, RegionId } from '../game/data/world/regions';
import { REGIONS, LOCATION_TYPES } from '../game/data/world/regions';
import { MAIN_QUESTS } from '../game/data/world/quests';
import type { WorldData } from '../game/systems/WorldGenerator';
import type { Character } from '../game/entities/Stats';

interface Props {
  world: WorldData;
  character: Character;
  currentRegion: RegionId;
  onTravel: (targetRegion: RegionId) => void;
  onEnterLocation: (location: GeneratedLocation) => void;
}

export function WorldMapScreen({ world, character, currentRegion, onTravel, onEnterLocation }: Props) {
  const region = REGIONS[currentRegion];
  const locations = world.regions.find(r => r.regionId === currentRegion)?.locations ?? [];
  const adjRegions = region.connections.filter(r => world.unlockedRegions.includes(r));
  const activeQuest = world.activeQuest ? MAIN_QUESTS[world.activeQuest] : null;

  return (
    <div className="h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-3 max-w-2xl mx-auto flex flex-col overflow-hidden">
      {/* Header */}
      <div className="text-center shrink-0 mb-2">
        <h1 className="text-lg font-bold">{region.icon} {region.name}</h1>
        <div className="text-[10px] text-gray-500">{region.description}</div>
      </div>

      {/* Player status */}
      <div className="shrink-0 bg-slate-800/60 rounded-xl px-3 py-1.5 border border-slate-700/50 mb-2 text-xs flex items-center gap-3">
        <span className="text-cyan-300 font-bold">{character.name}</span>
        <span>HP {character.runData?.currentHp}/{character.runData?.maxHp}</span>
        <span className="text-yellow-300">✦ {character.runData?.currentSp}/{character.runData?.maxSp}</span>
        <span className="text-gray-500">| 進度 {world.clearedCount}</span>
      </div>

      {/* Active quest */}
      {activeQuest && (
        <div className="shrink-0 bg-amber-900/30 rounded-xl px-3 py-2 border border-amber-600/30 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">📜 主線</span>
            <span className="text-sm font-bold">{activeQuest.icon} {activeQuest.title}</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">{activeQuest.description}</div>
          {activeQuest.targetRegion !== currentRegion && (
            <div className="text-[10px] text-amber-400 mt-1">
              🧭 前往 {REGIONS[activeQuest.targetRegion].name}
            </div>
          )}
        </div>
      )}

      {/* Locations */}
      <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
        <div className="text-[10px] text-gray-600 mb-1">— 地點 —</div>
        {locations.map((loc) => {
          const td = LOCATION_TYPES[loc.typeId];
          const isQuest = !!loc.questId;
          return (
            <button key={loc.id} onClick={() => !loc.cleared && onEnterLocation(loc)}
              disabled={loc.cleared}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition
                ${loc.cleared
                  ? 'bg-slate-900/30 text-gray-600 cursor-default'
                  : isQuest
                    ? 'bg-amber-900/20 border border-amber-600/30 hover:bg-amber-900/40 cursor-pointer'
                    : 'bg-slate-800/50 border border-slate-700/40 hover:bg-slate-700/50 cursor-pointer'
                }`}
            >
              <span className="text-lg shrink-0">{td.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {loc.name}
                  {loc.isTown && <span className="text-emerald-400 text-[10px] ml-1">🏘️</span>}
                  {isQuest && <span className="text-amber-400 text-[10px] ml-1">📜</span>}
                </div>
                <div className="text-[10px] text-gray-500">{td.name}</div>
              </div>
              {loc.cleared ? <span className="text-xs text-gray-600">✅</span> :
               loc.enemy ? <span className="text-xs text-red-400">⚔️</span> : null}
            </button>
          );
        })}
      </div>

      {/* Travel to adjacent regions */}
      {adjRegions.length > 0 && (
        <div className="shrink-0 mt-2">
          <div className="text-[10px] text-gray-600 mb-1">— 前往 —</div>
          <div className="flex gap-2">
            {adjRegions.map(rid => {
              const adj = REGIONS[rid];
              const isCurrent = rid === currentRegion;
              return (
                <button key={rid} onClick={() => !isCurrent && onTravel(rid)}
                  disabled={isCurrent}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition
                    ${isCurrent
                      ? 'bg-slate-800/30 text-gray-600 cursor-default'
                      : 'bg-slate-700 hover:bg-slate-600 border border-slate-600/50'
                    }`}
                >
                  {adj.icon} {adj.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div className="shrink-0 text-center text-[10px] text-gray-600 mt-2">
        📜 跟著主線行 · 完成任務解鎖新地區
      </div>
    </div>
  );
}
