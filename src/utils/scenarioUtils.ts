import type {
  FinancialCategoryGroup,
  ValueDriverItem,
  ValueDriverAssumption,
  ValueDriverScenario,
  ValueDriverScenarioValue,
  OPWaterfallStage,
  SimulatedWaterfallStage,
  FinancialCategory,
} from '../types';
import { calculateSimulatedWaterfall } from './valueDriverMapping';

// Scenario color palette for visualization
const SCENARIO_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
];

let colorIndex = 0;

/**
 * Extract all Value Drivers from hierarchy into a flat list with metadata
 */
export function extractValueDrivers(
  hierarchy: FinancialCategoryGroup[]
): Array<{
  valueDriverId: string;
  valueDriverName: string;
  metricId: string;
  metricName: string;
  categoryId: string;
  categoryName: string;
  baseValue: number;
  unit: string;
}> {
  const drivers: Array<{
    valueDriverId: string;
    valueDriverName: string;
    metricId: string;
    metricName: string;
    categoryId: string;
    categoryName: string;
    baseValue: number;
    unit: string;
  }> = [];

  hierarchy.forEach((category) => {
    category.metrics.forEach((metric) => {
      metric.valueDrivers.forEach((driver) => {
        if (driver.value !== undefined) {
          drivers.push({
            valueDriverId: driver.id,
            valueDriverName: driver.name,
            metricId: metric.id,
            metricName: metric.name,
            categoryId: category.id,
            categoryName: category.name,
            baseValue: driver.value,
            unit: driver.unit || '',
          });
        }
      });
    });
  });

  return drivers;
}

/**
 * Map category ID to FinancialCategory type
 */
function mapCategoryToFinancialCategory(categoryId: string): FinancialCategory {
  switch (categoryId) {
    case 'revenue':
      return 'revenue';
    case 'cogs':
      return 'cogs';
    case 'opex':
      return 'opex';
    case 'operating-profit':
      return 'operating-profit';
    default:
      return 'revenue';
  }
}

/**
 * Build ValueDriverAssumption[] from scenario's Value Driver values
 */
export function buildAssumptionsFromScenario(
  scenario: ValueDriverScenario,
  hierarchy: FinancialCategoryGroup[]
): ValueDriverAssumption[] {
  const allDrivers = extractValueDrivers(hierarchy);
  const assumptions: ValueDriverAssumption[] = [];

  // Create a map of scenario values for quick lookup
  const scenarioValueMap = new Map(
    scenario.valueDriverValues.map((v) => [v.valueDriverId, v.value])
  );

  allDrivers.forEach((driver) => {
    const scenarioValue = scenarioValueMap.get(driver.valueDriverId);
    if (scenarioValue !== undefined && scenarioValue !== driver.baseValue) {
      const changePercent =
        ((scenarioValue - driver.baseValue) / driver.baseValue) * 100;

      assumptions.push({
        valueDriverId: driver.valueDriverId,
        valueDriverName: driver.valueDriverName,
        metricId: driver.metricId,
        metricName: driver.metricName,
        category: mapCategoryToFinancialCategory(driver.categoryId),
        baseValue: driver.baseValue,
        assumptionValue: scenarioValue,
        assumptionPercent: changePercent,
        unit: driver.unit,
      });
    }
  });

  return assumptions;
}

/**
 * Calculate simulated waterfall for a scenario
 */
export function calculateScenarioWaterfall(
  scenario: ValueDriverScenario,
  baselineStages: OPWaterfallStage[],
  hierarchy: FinancialCategoryGroup[]
): SimulatedWaterfallStage[] {
  const assumptions = buildAssumptionsFromScenario(scenario, hierarchy);
  return calculateSimulatedWaterfall(assumptions, baselineStages);
}

/**
 * Create a new scenario with default values from hierarchy
 */
export function createScenario(
  name: string,
  createdBy: string,
  hierarchy: FinancialCategoryGroup[]
): ValueDriverScenario {
  const allDrivers = extractValueDrivers(hierarchy);
  const valueDriverValues: ValueDriverScenarioValue[] = allDrivers.map(
    (driver) => ({
      valueDriverId: driver.valueDriverId,
      value: driver.baseValue,
    })
  );

  const color = SCENARIO_COLORS[colorIndex % SCENARIO_COLORS.length];
  colorIndex++;

  return {
    id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    createdDate: new Date(),
    createdBy,
    valueDriverValues,
    color,
  };
}

/**
 * Update scenario with new Value Driver values
 */
export function updateScenarioValues(
  scenario: ValueDriverScenario,
  valueDriverValues: ValueDriverScenarioValue[]
): ValueDriverScenario {
  return {
    ...scenario,
    valueDriverValues,
  };
}

/**
 * Check if scenario name is unique
 */
export function isScenarioNameUnique(
  name: string,
  scenarios: ValueDriverScenario[],
  excludeId?: string
): boolean {
  return !scenarios.some(
    (s) => s.name.toLowerCase() === name.toLowerCase() && s.id !== excludeId
  );
}

/**
 * Get next available color for scenario
 */
export function getNextScenarioColor(): string {
  const color = SCENARIO_COLORS[colorIndex % SCENARIO_COLORS.length];
  colorIndex++;
  return color;
}
