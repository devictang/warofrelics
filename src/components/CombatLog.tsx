import { useRef, useEffect } from 'react';
import type { CombatLogTurn } from '../game/engine/CombatLog';

function actionLabel(a: string): string {
  const map: Record<string, string> = {
    attack: '⚔️ 攻擊', block: '🛡️ 格擋',
    skill1: '🔥 招式', skill2: '🔥 招式', skill3: '🔥 招式',
    recover: '🌀 結束回合',
  };
  return map[a] ?? a;
}

export function CombatLogView({ log }: { log: CombatLogTurn[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest turn
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  if (log.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-8">
        選擇行動開始戰鬥...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {log.map((turn) => (
        <div key={turn.turnNumber} className="bg-slate-800/80 rounded-xl p-4 border border-slate-600/50">
          <div className="text-amber-400 text-sm font-bold mb-2">
            ── 回合 {turn.turnNumber} ──
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div className="bg-slate-900/60 rounded-lg p-2">
              <span className="text-cyan-300">你</span> 選擇了 {actionLabel(turn.playerAction)}
            </div>
            <div className="bg-slate-900/60 rounded-lg p-2">
              <span className="text-red-300">敵人</span> 選擇了 {actionLabel(turn.enemyAction)}
            </div>
          </div>

          <div className="space-y-2">
            {turn.resolutions.map((res, i) => (
              <div key={i} className="text-sm">
                {res.contestResult && (
                  <div className="bg-slate-900/40 rounded-lg p-3 mb-2 font-mono text-xs space-y-1">
                    <div className="text-gray-400">
                      {res.contestResult.attackerStat} vs {res.contestResult.defenderStat}
                    </div>
                    <div className="text-gray-400 whitespace-pre-line">
                      {res.contestResult.calcSteps}
                    </div>
                  </div>
                )}
                <div className={
                  `${res.target === 'player' && res.type === 'damage' ? 'text-red-300' : ''}
                  ${res.target === 'enemy' && res.type === 'damage' ? 'text-green-300' : ''}
                  ${res.type === 'block' ? 'text-amber-300' : ''}
                  ${res.type === 'recover' ? 'text-yellow-300' : ''}
                  ${res.type === 'crit' ? 'text-yellow-300' : ''}`
                }>
                  {res.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Invisible anchor for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
}
