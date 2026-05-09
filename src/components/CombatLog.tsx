import type { CombatLogTurn } from '../game/engine/CombatLog';

function actionLabel(a: string): string {
  const map: Record<string, string> = {
    attack: '⚔️ 攻擊', block: '🛡️ 格擋',
    skill1: '🔥 招式', skill2: '🔥 招式', skill3: '🔥 招式',
    recover: '🌀 回氣',
  };
  return map[a] ?? a;
}

export function CombatLogView({ log }: { log: CombatLogTurn[] }) {
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

          {/* Actions reveal */}
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div className="bg-slate-900/60 rounded-lg p-2">
              <span className="text-cyan-300">你</span> 選擇了 {actionLabel(turn.playerAction)}
            </div>
            <div className="bg-slate-900/60 rounded-lg p-2">
              <span className="text-red-300">敵人</span> 選擇了 {actionLabel(turn.enemyAction)}
            </div>
          </div>

          {/* Resolutions */}
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

          {/* HP + 氣力 bars */}
          <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
            <MiniStatus label="你" hp={turn.playerHpAfter} hpMax={turn.playerHpMax}
              sp={turn.playerSpAfter} spMax={10} color="cyan" />
            <MiniStatus label={turn.enemyHpAfter === 0 ? '💀' : ''} hp={turn.enemyHpAfter} hpMax={turn.enemyHpMax}
              sp={turn.enemySpAfter} spMax={10} color="red" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniStatus({ label, hp, hpMax, sp, spMax, color }: {
  label: string; hp: number; hpMax: number; sp: number; spMax: number; color: string;
}) {
  const hpPct = Math.max(0, Math.min(100, (hp / hpMax) * 100));
  const spPct = Math.max(0, Math.min(100, (sp / spMax) * 100));
  const barColor = color === 'cyan' ? 'bg-cyan-500' : 'bg-red-500';
  return (
    <div>
      <div className="text-gray-400 mb-0.5">{label} HP {hp}/{hpMax}</div>
      <div className="h-2 bg-slate-900 rounded-full mb-1 overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${hpPct}%` }} />
      </div>
      <div className="text-yellow-300 mb-0.5">✦ 氣力 {sp}/{spMax}</div>
      <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-yellow-600/20">
        <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${spPct}%` }} />
      </div>
    </div>
  );
}
