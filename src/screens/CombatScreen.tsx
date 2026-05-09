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
  const [showEnemyInfo, setShowEnemyInfo] = useState(false);

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
  const canAttack = s.player.currentSp >= 1;

  return (
    <div className="h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-3 max-w-2xl mx-auto flex flex-col gap-2 overflow-hidden">
      {/* Title */}
      <div className="text-center shrink-0">
        <h1 className="text-base font-bold text-amber-400">⚔️ 戰鬥</h1>
      </div>

      {/* ═══ 敵我 stat — 固定頂部，唔會被推走 ═══ */}
      <div className="shrink-0 grid grid-cols-2 gap-3">
        {/* 玩家 */}
        <div className="bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/50">
          <div className="font-bold text-xs text-cyan-300">{character.name}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(0, (s.player.currentHp / s.player.maxHp) * 100)}%` }} />
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">{s.player.currentHp}/{s.player.maxHp}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-yellow-300 text-[10px] shrink-0">✦</span>
            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(0, (s.player.currentSp / s.player.maxSp) * 100)}%` }} />
            </div>
            <span className="text-[10px] text-yellow-300 font-mono shrink-0">{s.player.currentSp}/{s.player.maxSp}</span>
          </div>
        </div>

        {/* 敵人 — click toggle info */}
        <div
          className="bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/50 cursor-pointer select-none"
          onClick={() => setShowEnemyInfo(!showEnemyInfo)}
        >
          <div className="font-bold text-xs text-red-300">{enemy.name} Lv.{enemy.level}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(0, (s.enemy.currentHp / s.enemy.maxHp) * 100)}%` }} />
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">{s.enemy.currentHp}/{s.enemy.maxHp}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-yellow-300 text-[10px] shrink-0">✦</span>
            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(0, (s.enemy.currentSp / s.enemy.maxSp) * 100)}%` }} />
            </div>
            <span className="text-[10px] text-yellow-300 font-mono shrink-0">{s.enemy.currentSp}/{s.enemy.maxSp}</span>
          </div>
        </div>
      </div>

      {/* Enemy info popup on click */}
      {showEnemyInfo && (
        <div className="shrink-0 bg-slate-800 rounded-xl p-3 border border-amber-500/50 text-xs">
          <div className="text-amber-400 font-bold mb-1">👹 {enemy.name}</div>
          <div className="text-gray-300">
            普攻: {enemy.damageType === 'physical' ? '⚔️物理' : '🔮魔法'} (消耗1氣)
          </div>
          {enemy.skills.length > 0 ? (
            <div className="text-gray-400 mt-1">
              技能: {enemy.skills.map(s => `• ${s}`).join(' ')}
            </div>
          ) : (
            <div className="text-gray-500 mt-1">沒有特殊技能</div>
          )}
          <div className="text-gray-600 text-[10px] mt-1">點擊關閉</div>
        </div>
      )}

      {/* ═══ Combat log — 用更多空間 ═══ */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin bg-slate-900/40 rounded-xl p-3">
        <CombatLogView log={s.log} />
      </div>

      {/* ═══ 行動按鈕 ═══ */}
      {!s.battleOver && (
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex justify-center gap-4">
            <CircleBtn label="攻擊" icon="⚔️" sub={canAttack ? '1氣' : '❌'}
              active={canAttack} disabled={animating || !canAttack}
              onClick={() => handleAction('attack')} />
            <CircleBtn label="格擋" icon="🛡️" sub="免費"
              active={true} disabled={animating}
              onClick={() => handleAction('block')} />
            <CircleBtn label="物品" icon="🧪" sub="無"
              active={false} locked
            />
          </div>
          <div className="flex justify-center gap-4">
            <CircleBtn label="招式" icon="🔒" sub="未解鎖" active={false} locked />
            <CircleBtn label="招式" icon="🔒" sub="未解鎖" active={false} locked />
            <CircleBtn label="招式" icon="🔒" sub="未解鎖" active={false} locked />
          </div>
          <button onClick={() => handleAction('recover')} disabled={animating}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500
              hover:from-amber-500 hover:to-amber-400 active:scale-[0.98]
              font-bold text-sm tracking-wider shadow-lg shadow-amber-500/20
              transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
            🌀 結束回合  ·  氣力 +1
          </button>
        </div>
      )}

      {/* Battle over */}
      {s.battleOver && (
        <div className="text-center mt-4">
          <div className={`text-2xl font-bold mb-2 ${s.playerWon ? 'text-amber-400' : 'text-red-400'}`}>
            {s.playerWon ? '🏆 勝利！' : '💀 敗北...'}
          </div>
          <button onClick={() => onCombatEnd(s.playerWon)}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-full transition text-sm">
            繼續
          </button>
        </div>
      )}
    </div>
  );
}

/* ── 圓形按鈕 ── */
function CircleBtn({ label, icon, sub, active, disabled, locked, onClick }: {
  label: string; icon: string; sub: string;
  active: boolean; disabled?: boolean; locked?: boolean;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`
        w-[64px] h-[64px] rounded-full flex flex-col items-center justify-center
        transition-all duration-150 select-none shrink-0
        ${locked
          ? 'bg-slate-800/20 text-gray-600 cursor-default border-2 border-slate-700/20'
          : active
            ? 'bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-amber-500/50 active:scale-90 cursor-pointer shadow-lg shadow-black/30'
            : 'bg-slate-800/30 text-gray-500 cursor-not-allowed border-2 border-slate-700/30'
        }`}>
      <span className="text-xl leading-none mb-0.5">{icon}</span>
      <span className="text-[10px] font-bold leading-tight">{label}</span>
      <span className={`text-[8px] leading-tight ${locked ? 'text-gray-600' : 'text-gray-400'}`}>
        {locked ? '🔒' : sub}
      </span>
    </button>
  );
}
