import type { PnlBreakdownRow } from '../data/mockBgData';

/**
 * Derives the "Revenue" row (child of "Net Revenue") as 97% of "Net Revenue" per unit.
 */
export function derivePnlPassthrough(rows: PnlBreakdownRow[]): PnlBreakdownRow[] {
  const byUnit = new Map<string, PnlBreakdownRow[]>();
  for (const row of rows) {
    if (!byUnit.has(row.unit)) {
      byUnit.set(row.unit, []);
    }
    byUnit.get(row.unit)!.push(row);
  }

  const numericKeys = [
    'fullYearBudget',
    'ytmBudget',
    'lastYearYtm',
    'ytmActual',
    'fullYearForecast',
    'lastYearFullYear',
  ] as const;

  return rows.map((row) => {
    if (row.lineItem !== 'Revenue') {
      return { ...row };
    }
    const unitRows = byUnit.get(row.unit) ?? [];
    const netRevenue = unitRows.find((r) => r.lineItem === 'Net Revenue');
    if (!netRevenue) {
      return { ...row };
    }
    const derived = { ...row };
    for (const key of numericKeys) {
      derived[key] = Math.round(netRevenue[key] * 0.97);
    }
    return derived;
  });
}
