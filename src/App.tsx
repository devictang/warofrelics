import { useState, useCallback } from 'react';
import type { Character, Enemy } from './game/entities/Stats';
import { generateWorld, completeQuest } from './game/systems/WorldGenerator';
import type { WorldData } from './game/systems/WorldGenerator';
import type { GeneratedLocation, RegionId } from './game/data/world/regions';
import { MetaProgressionScreen } from './screens/MetaProgressionScreen';
import { WorldMapScreen } from './screens/WorldMapScreen';
import { LocationScreen } from './screens/LocationScreen';
import { CombatScreen } from './screens/CombatScreen';

type GamePhase = 'meta' | 'world_map' | 'location' | 'combat' | 'run_end';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('meta');
  const [character, setCharacter] = useState<Character | null>(null);
  const [world, setWorld] = useState<WorldData | null>(null);
  const [currentRegion, setCurrentRegion] = useState<RegionId>('whisper_forest');
  const [currentLocation, setCurrentLocation] = useState<GeneratedLocation | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);

  const startRun = useCallback((char: Character) => {
    setCharacter(char);
    setWorld(generateWorld());
    setCurrentRegion('whisper_forest');
    setPhase('world_map');
  }, []);

  const travelTo = useCallback((target: RegionId) => {
    setCurrentRegion(target);
    setCurrentLocation(null);
  }, []);

  const enterLocation = useCallback((loc: GeneratedLocation) => {
    setCurrentLocation(loc);
    setPhase('location');
  }, []);

  const startCombat = useCallback((_enemyId: string) => {
    if (!currentLocation?.enemy) return;
    const e = currentLocation.enemy;
    const enemy: Enemy = {
      id: e.id, name: e.name, level: e.level, race: '魔物',
      damageType: e.damageType as 'physical' | 'magical',
      stats: { str: 6, con: 6, dex: 5, wil: 5, per: 5, int: 5, cha: 5, lck: 5 },
      maxHp: e.maxHp, currentHp: e.maxHp,
      maxSp: 10, currentSp: 0,
      skills: [],
      ai: { tendencies: { attack: 60, block: 15, skill: 10, recover: 15 } },
      xpReward: 15,
    };
    setCurrentEnemy(enemy);
    setPhase('combat');
  }, [currentLocation]);

  const handleCombatEnd = useCallback((won: boolean) => {
    if (!character || !currentLocation || !world) { setPhase('run_end'); return; }
    if (!won) { setPhase('run_end'); return; }

    // Mark location cleared
    const clearedLoc = { ...currentLocation, cleared: true };
    setCurrentLocation(clearedLoc);

    let newWorld = { ...world, clearedCount: world.clearedCount + 1 };
    const regionIdx = newWorld.regions.findIndex(r => r.regionId === currentRegion);
    if (regionIdx >= 0) {
      const locIdx = newWorld.regions[regionIdx].locations.findIndex(l => l.id === currentLocation.id);
      if (locIdx >= 0) newWorld.regions[regionIdx].locations[locIdx] = clearedLoc;
    }

    // Add XP
    const newChar = { ...character };
    newChar.runData = { ...character.runData!, xp: character.runData!.xp + 15 };

    // Check quest completion
    if (clearedLoc.questId && newWorld.activeQuest === clearedLoc.questId) {
      newWorld = completeQuest(newWorld, clearedLoc.questId);
      newChar.runData.xp += 50; // bonus XP for quest
    }

    setCharacter(newChar);
    setWorld(newWorld);
    setPhase('location');
  }, [character, currentLocation, world, currentRegion]);

  const leaveLocation = useCallback(() => {
    setCurrentLocation(null);
    setPhase('world_map');
  }, []);

  const newRun = useCallback(() => {
    if (!character) return;
    const resetChar: Character = {
      ...character,
      runData: {
        ...character.runData!,
        level: 1, xp: 0,
        currentHp: character.runData!.maxHp,
        currentSp: 0, skills: [], feats: [], gold: 0,
      },
    };
    setCharacter(resetChar);
    setWorld(generateWorld());
    setCurrentRegion('whisper_forest');
    setCurrentLocation(null);
    setCurrentEnemy(null);
    setPhase('world_map');
  }, [character]);

  const goToMeta = useCallback(() => {
    setCharacter(null);
    setWorld(null);
    setCurrentLocation(null);
    setCurrentEnemy(null);
    setPhase('meta');
  }, []);

  // Render
  if (phase === 'meta') return <MetaProgressionScreen onCharacterReady={startRun} />;

  if (phase === 'world_map' && character && world) {
    return (
      <WorldMapScreen
        world={world}
        character={character}
        currentRegion={currentRegion}
        onTravel={travelTo}
        onEnterLocation={enterLocation}
      />
    );
  }

  if (phase === 'location' && character && currentLocation && world) {
    const questCompleted = currentLocation.questId && world.questProgress.includes(currentLocation.questId as any);
    return (
      <LocationScreen
        location={currentLocation}
        character={character}
        world={world}
        currentRegion={currentRegion}
        questCompleted={!!questCompleted}
        onUpdateCharacter={setCharacter}
        onStartCombat={startCombat}
        onLeave={leaveLocation}
      />
    );
  }

  if (phase === 'combat' && character && currentEnemy) {
    return <CombatScreen character={character} enemy={currentEnemy} onCombatEnd={handleCombatEnd} />;
  }

  // Run end
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-3 max-w-2xl mx-auto flex flex-col items-center justify-center">
      <div className="text-4xl mb-4 text-red-400">💀</div>
      <h1 className="text-2xl font-bold mb-2 text-red-400">敗北...</h1>
      <p className="text-gray-400 mb-4 text-sm">你倒下了...獲得了少許輪迴點</p>
      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 mb-4 text-xs text-gray-400">
        ⚡ 獲得 5 輪迴點（種族天賦可用）
      </div>
      <div className="flex gap-2">
        <button onClick={newRun} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition text-sm">
          🔄 再次挑戰
        </button>
        <button onClick={goToMeta} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition text-sm">
          🏠 返回大廳
        </button>
      </div>
    </div>
  );
}
