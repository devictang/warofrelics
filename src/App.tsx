import { useState } from 'react';
import type { Character, Enemy } from './game/entities/Stats';
import { generateWorld } from './game/systems/WorldGenerator';
import type { GeneratedLocation } from './game/data/world/regions';
import { MetaProgressionScreen } from './screens/MetaProgressionScreen';
import { WorldMapScreen } from './screens/WorldMapScreen';
import { LocationScreen } from './screens/LocationScreen';
import { CombatScreen } from './screens/CombatScreen';
import { getRandomEnemy } from './game/data/enemies/enemies';

type GamePhase = 'meta' | 'world_map' | 'location' | 'combat' | 'run_end';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('meta');
  const [character, setCharacter] = useState<Character | null>(null);
  const [worldData, setWorldData] = useState<ReturnType<typeof generateWorld> | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeneratedLocation | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);

  // ── Meta → Start Run ──
  function handleCharacterReady(char: Character) {
    setCharacter(char);
    const world = generateWorld();
    setWorldData(world);
    setPhase('world_map');
  }

  // ── World Map → Enter Location ──
  function handleEnterLocation(loc: GeneratedLocation) {
    setCurrentLocation(loc);
    setPhase('location');
  }

  // ── Location → Combat ──
  function handleStartCombat(_enemyId: string) {
    // Use the location's enemy if available, otherwise random
    const enemy = currentLocation?.enemy
      ? { ...currentLocation.enemy }
      : { ...getRandomEnemy(1) };
    setCurrentEnemy(enemy);
    setPhase('combat');
  }

  // ── Combat End → Back to Location/Map ──
  function handleCombatEnd(won: boolean) {
    if (!character || !currentLocation) return;

    if (won) {
      // Mark location as cleared
      const clearedLoc = { ...currentLocation, cleared: true };
      setCurrentLocation(clearedLoc);

      // Update world data (mark location cleared)
      if (worldData) {
        const newWorld = { ...worldData };
        for (const region of newWorld.regions) {
          const locIdx = region.locations.findIndex(l => l.id === currentLocation.id);
          if (locIdx >= 0) {
            region.locations[locIdx] = clearedLoc;
            break;
          }
        }
        setWorldData(newWorld);
      }

      // Add XP (simplified)
      if (character.runData) {
        const newChar = { ...character };
        newChar.runData = { ...character.runData, xp: character.runData.xp + 20 };
        setCharacter(newChar);
      }

      setPhase('location');
    } else {
      setPhase('run_end');
    }
  }

  // ── Leave Location → Map ──
  function handleLeaveLocation() {
    setCurrentLocation(null);
    setPhase('world_map');
  }

  // ── Run End → New Run or Meta ──
  function handleNewRun() {
    if (!character) return;
    const resetChar: Character = {
      ...character,
      runData: {
        ...character.runData!,
        level: 1,
        xp: 0,
        currentHp: character.runData!.maxHp,
        currentSp: 0,
        skills: [],
        feats: [],
        gold: 0,
      },
    };
    setCharacter(resetChar);
    const world = generateWorld();
    setWorldData(world);
    setCurrentLocation(null);
    setCurrentEnemy(null);
    setPhase('world_map');
  }

  if (phase === 'meta') {
    return <MetaProgressionScreen onCharacterReady={handleCharacterReady} />;
  }

  if (phase === 'world_map' && character && worldData) {
    return (
      <WorldMapScreen
        worldData={worldData}
        character={character}
        onEnterLocation={handleEnterLocation}
      />
    );
  }

  if (phase === 'location' && character && currentLocation) {
    return (
      <LocationScreen
        location={currentLocation}
        character={character}
        onUpdateCharacter={(c) => setCharacter(c)}
        onStartCombat={handleStartCombat}
        onLeave={handleLeaveLocation}
      />
    );
  }

  if (phase === 'combat' && character && currentEnemy) {
    return (
      <CombatScreen
        character={character}
        enemy={currentEnemy}
        onCombatEnd={handleCombatEnd}
      />
    );
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
        <button onClick={handleNewRun}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition text-sm">
          🔄 再次挑戰
        </button>
        <button onClick={() => {
          setCharacter(null);
          setWorldData(null);
          setCurrentLocation(null);
          setCurrentEnemy(null);
          setPhase('meta');
        }}
          className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition text-sm">
          🏠 返回大廳
        </button>
      </div>
    </div>
  );
}
