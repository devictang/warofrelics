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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-3 max-w-2xl mx-auto flex flex-col gap-2">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-base font-bold text-amber-400">⚔️ 戰鬥</h1>
      </div>

      {/* ── Enemy bar (long-press for details) ── */}
      <div
        className="cursor-pointer select-none"
        onMouseDown={() => {
          const timer = setTimeout(() => setShowEnemyInfo(true), 500);
          const cancel = () => { clearTimeout(timer); setShowEnemyInfo(false); };
          window.addEventListener('mouseup', cancel, { once: true });
          window.addEventListener('mouseleave', cancel, { once: true });
        }}
      >
        <StatusBar
          label={`${enemy.name} Lv.${enemy.level}`}
          hp={s.enemy.currentHp} maxHp={s.enemy.maxHp}
          sp={s.enemy.currentSp} maxSp={s.enemy.maxSp}
          color="red"
        />
      </div>

      {/* Enemy info popup */}
      {showEnemyInfo && (
        <div className="bg-slate-800 rounded-xl p-3 border border-amber-500/50 text-xs space-y-1"
          onMouseEnter={() => setShowEnemyInfo(true)}
          onMouseLeave={() => setShowEnemyInfo(false)}>
          <div className="text-amber-400 font-bold mb-1">👹 {enemy.name}</div>
          <div className="text-gray-300">
            普攻: {enemy.damageType === 'physical' ? '⚔️物理' : '🔮魔法'} (消耗 1 氣)
          </div>
          {enemy.skills.length > 0 && (
            <div className="text-gray-300">技能: {enemy.skills.join(', ')}</div>
          )}
          <div className="text-gray-500 mt-1">
            STR{enemy.stats.str} CON{enemy.stats.con} DEX{enemy.stats.dex}{' '}
            INT{enemy.stats.int} PER{enemy.stats.per} WIL{enemy.stats.wil}
          </div>
        </div>
      )}

      {/* ── Player bar ── */}
      <StatusBar
        label={character.name}
        hp={s.player.currentHp} maxHp={s.player.maxHp}
        sp={s.player.currentSp} maxSp={s.player.maxSp}
        color="cyan"
      />

      {/* ── Combat log ── */}
      <div className="flex-1 max-h-40 overflow-y-auto scrollbar-thin bg-slate-900/40 rounded-xl p-2">
        <CombatLogView log={s.log} />
      </div>

      {/* ═══ 行動按鈕 ═══ */}
      {!s.battleOver && (
        <div className="flex flex-col gap-2 mt-auto">
          {/* Row 1: 攻擊 | 格擋 | 物品 */}
          <div className="grid grid-cols-3 gap-3 justify-items-center">
            <CircleBtn
              label="攻擊" icon="⚔️" sub="1氣"
              active={canAttack}
              disabled={animating || !canAttack}
              onClick={() => handleAction('attack')}
            />
            <CircleBtn
              label="格擋" icon="🛡️" sub="免費"
              active={true}
              disabled={animating}
              onClick={() => handleAction('block')}
            />
            <CircleBtn
              label="物品" icon="🧪" sub="無"
              active={false} locked
            />
          </div>

          {/* Row 2: 招式1 | 招式2 | 招式3 */}
          <div className="grid grid-cols-3 gap-3 justify-items-center">
            <CircleBtn label="招式" icon="🔒" sub="未解鎖" active={false} locked />
            <CircleBtn label="招式" icon="🔒" sub="未解鎖" active={false} locked />
            <CircleBtn label="招式" icon="🔒" sub="未解鎖" active={false} locked />
          </div>

          {/* End Turn — highlighted rectangle */}
          <button
            onClick={() => handleAction('recover')}
            disabled={animating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500
              hover:from-amber-500 hover:to-amber-400 active:scale-[0.98]
              font-bold text-sm tracking-wider shadow-lg shadow-amber-500/20
              transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
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
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-[66px] h-[66px] rounded-full flex flex-col items-center justify-center
        transition-all duration-150 select-none
        ${locked
          ? 'bg-slate-800/20 text-gray-600 cursor-default border-2 border-slate-700/20'
          : active
            ? 'bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-amber-500/50 active:scale-90 cursor-pointer shadow-lg shadow-black/30'
            : 'bg-slate-800/30 text-gray-500 cursor-not-allowed border-2 border-slate-700/30'
        }
      `}
    >
      <span className="text-xl leading-none mb-0.5">{icon}</span>
      <span className="text-[10px] font-bold leading-tight">{label}</span>
      <span className={`text-[8px] leading-tight ${locked ? 'text-gray-600' : 'text-gray-400'}`}>
        {locked ? '🔒' : sub}
      </span>
    </button>
  );
}

/* ── 狀態欄 ── */
function StatusBar({ label, hp, maxHp, sp, maxSp, color }: {
  label: string; hp: number; maxHp: number; sp: number; maxSp: number; color: string;
}) {
  const hpPct = Math.max(0, (hp / maxHp) * 100);
  const spPct = Math.max(0, (sp / maxSp) * 100);
  const barColor = color === 'cyan' ? 'bg-cyan-500' : 'bg-red-500';
  return (
    <div className="bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/50">
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-sm">{label}</span>
        <span className="text-xs text-gray-400">HP {hp}/{maxHp}</span>
      </div>
      <div className="h-2 bg-slate-900 rounded-full mb-2 overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-300 rounded-full`}
          style={{ width: `${hpPct}%` }} />
      </div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-yellow-300 text-xs font-bold">✦ 氣力</span>
        <span className="text-yellow-300 text-xs font-mono font-bold">{sp}/{maxSp}</span>
      </div>
      <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-yellow-600/20">
        <div className="h-full bg-yellow-400 transition-all duration-300 rounded-full"
          style={{ width: `${spPct}%` }} />
      </div>
    </div>
  );
}
