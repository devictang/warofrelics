/* ═══════════════════════════════════════
   神器戰爭 — d100 對抗系統
   Base rates per contest type
   ═══════════════════════════════════════ */

/** 對抗類型 */
export type ContestType =
  | 'physical_block'   // DEX vs STR — 物理格擋
  | 'magical_block'    // PER vs INT — 魔法格擋
  | 'status_effect'    // 技能 vs WIL — 異常狀態
  | 'critical_hit';    // LCK vs LCK — 暴擊

/** 每種對抗的基礎成功率 */
export const CONTEST_BASE_RATES: Record<ContestType, number> = {
  physical_block: 75,
  magical_block: 75,
  status_effect: 50,
  critical_hit: 5,
};

/** 每種對抗的 stat 倍率（每點 stat = x% difference） */
export const CONTEST_FACTORS: Record<ContestType, number> = {
  physical_block: 2,
  magical_block: 2,
  status_effect: 2,
  critical_hit: 2,
};

/** TN cap */
export const MIN_TN = 5;
export const MAX_TN = 95;

/** d100 roll 結果 */
export interface ContestResult {
  contestType: ContestType;
  tn: number;
  roll: number;
  success: boolean;
  attackerStat: string;
  attackerValue: number;
  defenderStat: string;
  defenderValue: number;
  baseRate: number;
  factor: number;
  calcSteps: string;
}

/**
 * 執行 d100 對抗判定
 */
export function resolveContest(
  type: ContestType,
  attackValue: number,
  defenseValue: number,
  attackLabel: string,
  defenseLabel: string,
): ContestResult {
  const baseRate = CONTEST_BASE_RATES[type];
  const factor = CONTEST_FACTORS[type];
  const diff = attackValue - defenseValue;

  let tn = baseRate + diff * factor;
  tn = Math.max(MIN_TN, Math.min(MAX_TN, tn));

  const roll = Math.floor(Math.random() * 100) + 1;
  const success = roll <= tn;

  const calcSteps =
    `TN = ${baseRate} + (${attackValue} - ${defenseValue})×${factor}` +
    `\n  = ${baseRate} + ${diff}×${factor}` +
    `\n  = ${tn} (cap ${MIN_TN}-${MAX_TN})` +
    `\nd100 = 🎲 ${roll} ${success ? '≤' : '>'} ${tn} → ${success ? '✅ 成功' : '❌ 失敗'}`;

  return {
    contestType: type,
    tn,
    roll,
    success,
    attackerStat: attackLabel,
    attackerValue: attackValue,
    defenderStat: defenseLabel,
    defenderValue: defenseValue,
    baseRate,
    factor,
    calcSteps,
  };
}

export function resolveCrit(attackerLck: number, defenderLck: number): ContestResult {
  return resolveContest('critical_hit', attackerLck, defenderLck, `LCK(${attackerLck})`, `LCK(${defenderLck})`);
}

export function resolvePhysicalBlock(defenderDex: number, attackerStr: number): ContestResult {
  return resolveContest('physical_block', defenderDex, attackerStr, `DEX(${defenderDex})`, `STR(${attackerStr})`);
}

export function resolveMagicalBlock(defenderPer: number, attackerInt: number): ContestResult {
  return resolveContest('magical_block', defenderPer, attackerInt, `PER(${defenderPer})`, `INT(${attackerInt})`);
}
