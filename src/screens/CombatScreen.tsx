import { useState } from 'react';
import type { Action } from '../game/entities/Stats';
import type { CombatState } from '../game/systems/CombatSystem';
import { resolveTurn, initCombat } from '../game/systems/CombatSystem';
import type { Character, Enemy } from '../game/entities/Stats';
import { CombatLogView } from '../components/CombatLog';

interface Props {
  character: Character;
  enemy: Enemy;
  onCombatEnd: (won: boolean) => void;
}

export function CombatScreen({ character, enemy, onCombatEnd }: Props) {
  const [state, setState] = useState<CombatState>(() => initCombat(character, enemy));
  const [animating, setAnimating] = useState(false);

  function handleAction(action: Action) {
    if (state.battleOver || animating) return;
    setAnimating(true);
    setTimeout(() => {
      const newState = resolveTurn(state, action);
      setState(newState);
      setAnimating(false);
      if (newState.battleOver) {
        setTimeout(() => onCombatEnd(newState.playerWon), 1500);
      }
    }, 400);
  }

  const s = state;
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 max-w-2xl mx-auto">
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-amber-400">⚔️ 戰鬥</h1>
        <div className="text-sm text-gray-400">{enemy.name} Lv.{enemy.level}</div>
      </div>

      {/* Status bars — 氣力顯示喺 HP 下面 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatusPanel
          label={character.name}
          hp={s.player.currentHp} maxHp={s.player.maxHp}
          sp={s.player.currentSp} maxSp={s.player.maxSp}
          color="cyan"
        />
        <StatusPanel
          label={enemy.name}
          hp={s.enemy.currentHp} maxHp={s.enemy.maxHp}
          sp={s.enemy.currentSp} maxSp={s.enemy.maxSp}
          color="red"
        />
      </div>

      {/* 氣力博弈提示 */}
      <div className="text-center text-xs text-gray-500 mb-3">
        攻擊/格擋/出招唔回氣 · 結束回合回 1 氣 · 上限 10
      </div>

      {/* Combat log */}
      <div className="max-h-72 overflow-y-auto mb-4 space-y-2 scrollbar-thin">
        <CombatLogView log={s.log} />
      </div>

      {/* Actions */}
      {!s.battleOver && (
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn label="⚔️ 攻擊" desc="STR 物理傷害" onClick={() => handleAction('attack')} disabled={animating} />
          <ActionBtn label="🛡️ 格擋" desc="DEX vs 敵STR" onClick={() => handleAction('block')} disabled={animating} />
          <ActionBtn label="🌀 結束回合" desc="氣力 +1" onClick={() => handleAction('recover')} disabled={animating} />
        </div>
      )}

      {/* Battle over */}
      {s.battleOver && (
        <div className="text-center mt-6">
          <div className={`text-2xl font-bold mb-2 ${s.playerWon ? 'text-amber-400' : 'text-red-400'}`}>
            {s.playerWon ? '🏆 勝利！' : '💀 敗北...'}
          </div>
          <button onClick={() => onCombatEnd(s.playerWon)}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl transition">
            繼續
          </button>
        </div>
      )}
    </div>
  );
}

function StatusPanel({ label, hp, maxHp, sp, maxSp, color }: {
  label: string; hp: number; maxHp: number; sp: number; maxSp: number; color: string;
}) {
  const hpPct = Math.max(0, (hp / maxHp) * 100);
  const spPct = Math.max(0, (sp / maxSp) * 100);
  const barColor = color === 'cyan' ? 'bg-cyan-500' : 'bg-red-500';
  const spBarColor = color === 'cyan' ? 'bg-yellow-400' : 'bg-orange-400';
  return (
    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
      <div className="font-bold text-sm mb-1">{label}</div>
      {/* HP */}
      <div className="text-xs text-gray-400 mb-0.5">HP {hp}/{maxHp}</div>
      <div className="h-2 bg-slate-900 rounded-full mb-2 overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${hpPct}%` }} />
      </div>
      {/* 氣力 — 更突出顯示 */}
      <div className="flex items-center justify-between text-xs mb-0.5">
        <span className="text-yellow-300 font-bold">✦ 氣力</span>
        <span className="text-yellow-300 font-mono font-bold">{sp}/{maxSp}</span>
      </div>
      <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-yellow-600/30">
        <div className={`h-full ${spBarColor} transition-all duration-300`} style={{ width: `${spPct}%` }} />
      </div>
      {/* 氣力格數指示 */}
      <div className="flex gap-0.5 mt-1">
        {Array.from({ length: maxSp }, (_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-sm ${i < sp ? spBarColor : 'bg-slate-700'}`} />
        ))}
      </div>
    </div>
  );
}

function ActionBtn({ label, desc, onClick, disabled }: {
  label: string; desc: string; onClick: () => void; disabled: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`p-3 rounded-xl text-center transition-all duration-150
        ${disabled
          ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
          : 'bg-slate-800 hover:bg-slate-700 hover:border-amber-500/50 border border-slate-600/50 active:scale-95'
        }`}>
      <div className="text-lg">{label}</div>
      <div className="text-xs text-gray-400 mt-1">{desc}</div>
    </button>
  );
}
