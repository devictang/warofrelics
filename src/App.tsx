import { useState } from 'react';
import type { Character, Enemy } from './game/entities/Stats';
import { MetaProgressionScreen } from './screens/MetaProgressionScreen';
import { CombatScreen } from './screens/CombatScreen';
import { getRandomEnemy } from './game/data/enemies/enemies';

type GamePhase = 'meta' | 'combat' | 'run_end';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('meta');
  const [character, setCharacter] = useState<Character | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [battleResult, setBattleResult] = useState<boolean | null>(null);

  function handleCharacterReady(char: Character) {
    setCharacter(char);
    setCurrentEnemy(getRandomEnemy(1));
    setPhase('combat');
  }

  function handleCombatEnd(won: boolean) {
    setBattleResult(won);
    setPhase('run_end');
  }

  function handleNewRun() {
    if (!character) return;
    const resetChar: Character = {
      ...character,
      runData: {
        ...character.runData!,
        level: 1,
        xp: 0,
        currentHp: character.runData!.maxHp,
        currentSp: character.runData!.maxSp,
        skills: [],
        feats: [],
        gold: 0,
      },
    };
    setCharacter(resetChar);
    setCurrentEnemy(getRandomEnemy(1));
    setBattleResult(null);
    setPhase('combat');
  }

  if (phase === 'meta') {
    return <MetaProgressionScreen onCharacterReady={handleCharacterReady} />;
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 max-w-2xl mx-auto flex flex-col items-center justify-center">
      <div className={`text-4xl mb-4 ${battleResult ? 'text-amber-400' : 'text-red-400'}`}>
        {battleResult ? '🏆' : '💀'}
      </div>
      <h1 className={`text-2xl font-bold mb-2 ${battleResult ? 'text-amber-400' : 'text-red-400'}`}>
        {battleResult ? '勝利！' : '敗北...'}
      </h1>
      <p className="text-gray-400 mb-6">
        {battleResult
          ? '你擊敗了敵人！獲得了輪迴點 ✨'
          : '你倒下了...獲得了少許輪迴點'}
      </p>
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 mb-6 text-sm text-gray-400">
        ⚡ 獲得 5 輪迴點（種族天賦可用）
      </div>
      <div className="flex gap-3">
        <button onClick={handleNewRun}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold transition">
          🔄 再次挑戰
        </button>
        <button onClick={() => {
          setCharacter(null);
          setCurrentEnemy(null);
          setBattleResult(null);
          setPhase('meta');
        }}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition">
          🏠 返回大廳
        </button>
      </div>
    </div>
  );
}
