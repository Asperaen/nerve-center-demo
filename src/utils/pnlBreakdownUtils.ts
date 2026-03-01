import type { PnlBreakdownRow } from '../data/mockBgData';

/**
 * Derives Revenue Passthrough from Buy-Sell + AVAP per unit.
 * For each unit, the row with lineItem === 'Passthrough' gets its numeric fields
 * set to the sum of that unit's Buy-Sell and AVAP rows (under BOM).
 */
export function derivePnlPassthrough(rows: PnlBreakdownRow[]): PnlBreakdownRow[] {
  const byUnit = new Map<string, PnlBreakdownRow[]>();
  for (const row of rows) {
    if (!byUnit.has(row.unit)) {
      byUnit.set(row.unit, []);
    }
    byUnit.get(row.unit)!.push(row);
  }

  const result = rows.map((row) => {
    if (row.lineItem !== 'Passthrough') {
      return { ...row };
    }
    const unitRows = byUnit.get(row.unit) ?? [];
    const buySell = unitRows.find((r) => r.lineItem === 'Buy-Sell');
    const avap = unitRows.find((r) => r.lineItem === 'AVAP');
    if (buySell == null || avap == null) {
      return { ...row };
    }
    return {
      ...row,
      fullYearBudget: buySell.fullYearBudget + avap.fullYearBudget,
      ytmBudget: buySell.ytmBudget + avap.ytmBudget,
      lastYearFullYear: buySell.lastYearFullYear + avap.lastYearFullYear,
      lastYearYtm: buySell.lastYearYtm + avap.lastYearYtm,
    };
  });

  return result;
}
