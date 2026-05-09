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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-4 max-w-2xl mx-auto flex flex-col">
      {/* Title */}
      <div className="text-center mb-3">
        <h1 className="text-lg font-bold text-amber-400">⚔️ 戰鬥</h1>
      </div>

      {/* Enemy bar — long press to see details */}
      <div
        className="mb-3 cursor-pointer select-none"
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
        <div className="text-[10px] text-gray-500 text-right mt-0.5">長按查看詳情</div>
      </div>

      {/* Enemy info popup */}
      {showEnemyInfo && (
        <div className="bg-slate-800 rounded-xl p-3 mb-3 border border-amber-500/50 text-xs space-y-1"
          onMouseEnter={() => setShowEnemyInfo(true)}
          onMouseLeave={() => setShowEnemyInfo(false)}>
          <div className="text-amber-400 font-bold mb-1">👹 {enemy.name} 技能</div>
          <div className="text-gray-300">
            普攻: {enemy.damageType === 'physical' ? '物理' : '魔法'} (消耗 1 氣)
          </div>
          {enemy.skills.length === 0 ? (
            <div className="text-gray-500">沒有特殊技能</div>
          ) : (
            enemy.skills.map(s => (
              <div key={s} className="text-gray-300">• {s}</div>
            ))
          )}
          <div className="text-gray-500 mt-1">
            STR {enemy.stats.str} CON {enemy.stats.con} DEX {enemy.stats.dex}
            <br />
            INT {enemy.stats.int} PER {enemy.stats.per} WIL {enemy.stats.wil}
          </div>
        </div>
      )}

      {/* Player bar */}
      <div className="mb-4">
        <StatusBar
          label={character.name}
          hp={s.player.currentHp} maxHp={s.player.maxHp}
          sp={s.player.currentSp} maxSp={s.player.maxSp}
          color="cyan"
        />
      </div>

      {/* 氣力提示 */}
      <div className="text-center text-[10px] text-gray-500 mb-3">
        ⚔️-1氣 &nbsp;|&nbsp; 🛡️免費 &nbsp;|&nbsp; 🌀+1氣 &nbsp;|&nbsp; 上限10
      </div>

      {/* Combat log with auto-scroll */}
      <div className="flex-1 max-h-48 overflow-y-auto mb-4 scrollbar-thin">
        <CombatLogView log={s.log} />
      </div>

      {/* ═══ 6 圓形行動按鈕 ═══ */}
      {!s.battleOver && (
        <div className="grid grid-cols-3 gap-4 justify-items-center">
          {/* Row 1: Attack | Block | End Turn */}
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
            label="結束回合" icon="🌀" sub="+1氣"
            active={true}
            disabled={animating}
            onClick={() => handleAction('recover')}
          />

          {/* Row 2: Skill 1 | Skill 2 | Skill 3 (locked) */}
          <CircleBtn label="招式" icon="🔒" sub="未解鎖" active={false} locked />
          <CircleBtn label="招式" icon="🔒" sub="未解鎖" active={false} locked />
          <CircleBtn label="招式" icon="🔒" sub="未解鎖" active={false} locked />
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
        w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center
        transition-all duration-150 select-none
        ${locked
          ? 'bg-slate-800/30 text-gray-600 cursor-default border-2 border-slate-700/30'
          : active
            ? 'bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-amber-500/50 active:scale-90 cursor-pointer shadow-lg shadow-black/30'
            : 'bg-slate-800/40 text-gray-600 cursor-not-allowed border-2 border-slate-700/40'
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

/* ── 狀態欄（HP + 氣力）── */
function StatusBar({ label, hp, maxHp, sp, maxSp, color }: {
  label: string; hp: number; maxHp: number; sp: number; maxSp: number; color: string;
}) {
  const hpPct = Math.max(0, (hp / maxHp) * 100);
  const spPct = Math.max(0, (sp / maxSp) * 100);
  const barColor = color === 'cyan' ? 'bg-cyan-500' : 'bg-red-500';
  const spColor = 'bg-yellow-400';
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
        <div className={`h-full ${spColor} transition-all duration-300 rounded-full`}
          style={{ width: `${spPct}%` }} />
      </div>
    </div>
  );
}
