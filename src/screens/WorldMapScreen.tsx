import { useState } from 'react';
import type { GeneratedLocation } from '../game/data/world/regions';
import { LOCATION_TYPES } from '../game/data/world/regions';
import type { Character } from '../game/entities/Stats';

interface Props {
  worldData: ReturnType<typeof import('../game/systems/WorldGenerator').generateWorld>;
  character: Character;
  onEnterLocation: (location: GeneratedLocation) => void;
}

export function WorldMapScreen({ worldData, character, onEnterLocation }: Props) {
  const [expandedRegion, setExpandedRegion] = useState<string>(worldData.regions[0]?.region.id ?? '');

  return (
    <div className="h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-3 max-w-2xl mx-auto flex flex-col overflow-hidden">
      {/* Header */}
      <div className="text-center shrink-0 mb-2">
        <h1 className="text-lg font-bold text-amber-400">🗺️ 世界地圖</h1>
        <div className="text-xs text-gray-400">
          {character.name} Lv.{character.runData?.level ?? 1}
        </div>
      </div>

      {/* Player stats mini bar */}
      <div className="shrink-0 bg-slate-800/60 rounded-xl px-3 py-1.5 border border-slate-700/50 mb-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-cyan-300 font-bold">{character.name}</span>
          <span>HP {character.runData?.currentHp}/{character.runData?.maxHp}</span>
          <span className="text-yellow-300">✦ {character.runData?.currentSp}/{character.runData?.maxSp}</span>
        </div>
      </div>

      {/* Regions */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
        {worldData.regions.map(({ region, locations }) => (
          <div key={region.id} className="bg-slate-800/40 rounded-xl border border-slate-700/40 overflow-hidden">
            {/* Region header */}
            <button
              onClick={() => setExpandedRegion(expandedRegion === region.id ? '' : region.id)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700/40 transition"
            >
              <div className="text-left">
                <div className="font-bold text-sm">{region.name}</div>
                <div className="text-[10px] text-gray-500">{region.description}</div>
              </div>
              <div className="text-xs text-gray-500 shrink-0">
                Lv.{region.levelRange.min}-{region.levelRange.max}
                <span className="ml-2">{expandedRegion === region.id ? '▲' : '▼'}</span>
              </div>
            </button>

            {/* Locations */}
            {expandedRegion === region.id && (
              <div className="px-3 pb-2 space-y-1.5">
                {locations.map((loc) => {
                  const typeDef = LOCATION_TYPES[loc.typeId];
                  const cleared = loc.cleared;
                  const hasEnemy = !!loc.enemy;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => !cleared && onEnterLocation(loc)}
                      disabled={cleared}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition
                        ${cleared
                          ? 'bg-slate-900/30 text-gray-600 cursor-default'
                          : 'bg-slate-900/50 hover:bg-slate-700/50 cursor-pointer'
                        }`}
                    >
                      <span className="text-lg shrink-0">{typeDef.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {loc.name}
                          {loc.isTown && <span className="text-emerald-400 text-[10px] ml-1">🏘️</span>}
                        </div>
                        <div className="text-[10px] text-gray-500">{typeDef.name}</div>
                      </div>
                      {cleared && <span className="text-xs text-gray-600">✅</span>}
                      {hasEnemy && !cleared && <span className="text-xs text-red-400">⚔️</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom hint */}
      <div className="shrink-0 text-center text-[10px] text-gray-600 mt-2">
        點擊地點前往探索 · 城鎮可以休息補給
      </div>
    </div>
  );
}
