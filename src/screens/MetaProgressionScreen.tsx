import { useState } from 'react';
import type { RaceId, ClassId, Character } from '../game/entities/Stats';
import { DEFAULT_STATS } from '../game/entities/Stats';
import { RACE_LIST, getRace } from '../game/data/races/races';
import { CLASS_LIST, getClass } from '../game/data/classes/classes';
import { calcMaxHp } from '../game/systems/CombatSystem';

interface Props {
  onCharacterReady: (char: Character) => void;
}

export function MetaProgressionScreen({ onCharacterReady }: Props) {
  const [step, setStep] = useState<'race' | 'class' | 'confirm'>('race');
  const [selectedRace, setSelectedRace] = useState<RaceId | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassId | null>(null);

  function createCharacter(): Character {
    const id = `char_${Date.now()}`;
    const cls = getClass(selectedClass!);
    const stats = { ...DEFAULT_STATS };
    const maxHp = calcMaxHp(stats, cls);
    return {
      id,
      name: `冒險者`,
      race: selectedRace!,
      classId: selectedClass!,
      baseStats: stats,
      reincarnationPoints: 0,
      talentTreeProgress: [],
      runData: {
        level: 1,
        xp: 0,
        currentHp: maxHp,
        maxHp,
        currentSp: 0,
        maxSp: 10,
        stats,
        relicId: null,
        skills: [],
        feats: [],
        gold: 0,
      },
    };
  }

  function handleStart() {
    if (!selectedRace || !selectedClass) return;
    const char = createCharacter();
    onCharacterReady(char);
  }

  if (step === 'race') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-amber-400">🏺 神器戰爭</h1>
          <p className="text-gray-400 mt-1">選擇你的種族</p>
        </div>
        <div className="grid gap-3">
          {RACE_LIST.map(id => {
            const race = getRace(id);
            const isSelected = selectedRace === id;
            return (
              <button key={id} onClick={() => { setSelectedRace(id); setStep('class'); }}
                className={`text-left p-4 rounded-xl border transition-all duration-150
                  ${isSelected
                    ? 'bg-slate-700/80 border-amber-500 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-500'
                  }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{race.icon}</span>
                  <div>
                    <div className="font-bold">{race.name}</div>
                    <div className="text-sm text-gray-400">{race.description}</div>
                    <div className="text-xs text-amber-400/70 mt-1">{race.theme}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (step === 'class') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-amber-400">
            {getRace(selectedRace!).icon} {getRace(selectedRace!).name}
          </h1>
          <p className="text-gray-400 mt-1">選擇職業</p>
        </div>
        <div className="grid gap-3">
          {CLASS_LIST.map(id => {
            const cls = getClass(id);
            const isSelected = selectedClass === id;
            return (
              <button key={id} onClick={() => setSelectedClass(id)}
                className={`text-left p-4 rounded-xl border transition-all duration-150
                  ${isSelected
                    ? 'bg-slate-700/80 border-amber-500 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-500'
                  }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cls.icon}</span>
                  <div>
                    <div className="font-bold">{cls.name}</div>
                    <div className="text-sm text-gray-400">{cls.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      普攻: {cls.attackBonus} | 格擋: {cls.blockBonus}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setStep('race')}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition">
            ← 返回
          </button>
          <button onClick={() => { if (selectedClass) setStep('confirm'); }}
            disabled={!selectedClass}
            className={`flex-1 py-3 rounded-xl transition
              ${selectedClass
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-slate-700 text-gray-500 cursor-not-allowed'
              }`}>
            下一步 →
          </button>
        </div>
      </div>
    );
  }

  // Confirm step
  const race = getRace(selectedRace!);
  const cls = getClass(selectedClass!);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-amber-400">確認角色</h1>
      </div>
      <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50 space-y-4">
        <div className="flex items-center gap-3 text-lg">
          <span className="text-3xl">{race.icon}</span>
          <span className="font-bold">{race.name}</span>
          <span className="text-gray-400">|</span>
          <span className="text-3xl">{cls.icon}</span>
          <span className="font-bold">{cls.name}</span>
        </div>
        <div className="text-sm text-gray-400">
          {race.name} — {race.description}
        </div>
        <div className="text-sm text-gray-400">
          {cls.name} — {cls.description}
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <div>初始屬性：全屬性 5（種族天賦解鎖後可提升）</div>
          <div>普攻：{cls.attackBonus}</div>
          <div>格擋：{cls.blockBonus}</div>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button onClick={() => setStep('class')}
          className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition">
          ← 返回
        </button>
        <button onClick={handleStart}
          className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl transition font-bold">
          ⚔️ 開始冒險！
        </button>
      </div>
    </div>
  );
}
