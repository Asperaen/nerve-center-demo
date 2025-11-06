import type { ValueDriverScenario } from '../types';

/**
 * Get the best scenario (highest total OP impact)
 */
export function getBestScenario(
  scenarios: ValueDriverScenario[]
): ValueDriverScenario | null {
  if (scenarios.length === 0) return null;

  const scenariosWithImpact = scenarios.filter(
    (s) => s.totalOPImpact !== undefined
  );
  if (scenariosWithImpact.length === 0) return null;

  return scenariosWithImpact.reduce((best, current) => {
    const bestImpact = best.totalOPImpact ?? -Infinity;
    const currentImpact = current.totalOPImpact ?? -Infinity;
    return currentImpact > bestImpact ? current : best;
  });
}

/**
 * Get the worst scenario (lowest total OP impact)
 */
export function getWorstScenario(
  scenarios: ValueDriverScenario[]
): ValueDriverScenario | null {
  if (scenarios.length === 0) return null;

  const scenariosWithImpact = scenarios.filter(
    (s) => s.totalOPImpact !== undefined
  );
  if (scenariosWithImpact.length === 0) return null;

  return scenariosWithImpact.reduce((worst, current) => {
    const worstImpact = worst.totalOPImpact ?? Infinity;
    const currentImpact = current.totalOPImpact ?? Infinity;
    return currentImpact < worstImpact ? current : worst;
  });
}

/**
 * Sort scenarios by impact (best to worst)
 */
export function sortScenariosByImpact(
  scenarios: ValueDriverScenario[],
  ascending: boolean = false
): ValueDriverScenario[] {
  return [...scenarios].sort((a, b) => {
    const aImpact = a.totalOPImpact ?? 0;
    const bImpact = b.totalOPImpact ?? 0;
    return ascending ? aImpact - bImpact : bImpact - aImpact;
  });
}

/**
 * Get scenario rank (1-based, 1 = best)
 */
export function getScenarioRank(
  scenario: ValueDriverScenario,
  allScenarios: ValueDriverScenario[]
): number {
  const sorted = sortScenariosByImpact(allScenarios);
  const index = sorted.findIndex((s) => s.id === scenario.id);
  return index >= 0 ? index + 1 : allScenarios.length + 1;
}

/**
 * Compare scenarios and return comparison stats
 */
export function compareScenarios(scenarios: ValueDriverScenario[]): {
  best: ValueDriverScenario | null;
  worst: ValueDriverScenario | null;
  average: number;
  median: number;
  range: number;
  count: number;
} {
  const scenariosWithImpact = scenarios.filter(
    (s) => s.totalOPImpact !== undefined
  );

  if (scenariosWithImpact.length === 0) {
    return {
      best: null,
      worst: null,
      average: 0,
      median: 0,
      range: 0,
      count: 0,
    };
  }

  const impacts = scenariosWithImpact
    .map((s) => s.totalOPImpact ?? 0)
    .sort((a, b) => b - a);

  const best = getBestScenario(scenariosWithImpact);
  const worst = getWorstScenario(scenariosWithImpact);
  const average =
    impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length;
  const median =
    impacts.length % 2 === 0
      ? (impacts[impacts.length / 2 - 1] + impacts[impacts.length / 2]) / 2
      : impacts[Math.floor(impacts.length / 2)];
  const range = impacts[0] - impacts[impacts.length - 1];

  return {
    best,
    worst,
    average,
    median,
    range,
    count: scenariosWithImpact.length,
  };
}
