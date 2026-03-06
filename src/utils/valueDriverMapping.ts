import { mockInternalPulseData } from '../data/mockInternalPulse';
import type {
  ValueDriverAssumption,
  ForecastDriver,
  OPWaterfallStage,
  SimulatedWaterfallStage,
} from '../types';

/**
 * Maps value drivers to forecast drivers based on naming and category matching
 */
export function getValueDriverToForecastDriverMapping(): Map<string, string[]> {
  const mapping = new Map<string, string[]>();

  // UPPH mapping
  mapping.set('dl-upph', ['driver-3']); // UPPH -> UPPH Manufacturing Productivity

  // Labor Rate mapping
  mapping.set('dl-labor-rate', ['driver-6']); // DL Labor Rate -> Vietnam Labor Rate
  mapping.set('idl-labor-rate', ['driver-6']); // IDL Labor Rate -> Vietnam Labor Rate

  // Material Cost mapping
  mapping.set('mat-index-price', ['driver-4', 'driver-5']); // Index-Based Material Price -> Raw Materials, Components
  mapping.set('mat-non-index-price', ['driver-4']); // Non-Index Material -> Raw Materials

  // Volume mapping
  mapping.set('revenue-volume', ['driver-1', 'driver-2', 'driver-7']); // Revenue Volume -> EV, Data Center, 5G volumes
  mapping.set('dl-production-volume', ['driver-1', 'driver-2', 'driver-7']); // Production Volume -> same as revenue volume

  return mapping;
}

/**
 * Get all available value drivers from Internal Pulse Check data
 */
export function getAvailableValueDrivers(): Array<{
  valueDriverId: string;
  valueDriverName: string;
  metricId: string;
  metricName: string;
  category: string;
  unit: string;
  baseValue: number;
}> {
  const valueDrivers: Array<{
    valueDriverId: string;
    valueDriverName: string;
    metricId: string;
    metricName: string;
    category: string;
    unit: string;
    baseValue: number;
  }> = [];

  mockInternalPulseData.forEach((categoryData) => {
    categoryData.metrics.forEach((metric) => {
      metric.valueDrivers.forEach((driver) => {
        // Skip derived drivers
        if (driver.affectingFactors.some((f) => f.tag === 'derived')) {
          return;
        }

        valueDrivers.push({
          valueDriverId: driver.id,
          valueDriverName: driver.name,
          metricId: metric.id,
          metricName: metric.name,
          category: categoryData.category,
          unit: metric.unit,
          baseValue: metric.value,
        });
      });
    });
  });

  return valueDrivers;
}

/**
 * Calculate impact of value driver assumption on forecast drivers
 */
export function calculateForecastDriverImpact(
  assumption: ValueDriverAssumption,
  originalDrivers: ForecastDriver[]
): ForecastDriver[] {
  const mapping = getValueDriverToForecastDriverMapping();
  const affectedDriverIds = mapping.get(assumption.valueDriverId) || [];

  return originalDrivers.map((driver) => {
    if (!affectedDriverIds.includes(driver.id)) {
      return driver;
    }

    // Calculate impact based on assumption
    const assumptionMultiplier = 1 + assumption.assumptionPercent / 100;
    let impactMultiplier = 1;

    // Different impact calculation based on value driver type
    if (assumption.valueDriverId.includes('labor-rate')) {
      // Labor rate affects cost drivers directly
      if (driver.category === 'cost' && driver.name.includes('Labor')) {
        impactMultiplier = assumptionMultiplier;
      }
    } else if (
      assumption.valueDriverId.includes('material') ||
      assumption.valueDriverId.includes('price')
    ) {
      // Material price affects material cost drivers
      if (
        driver.category === 'cost' &&
        (driver.name.includes('Material') ||
          driver.name.includes('Cost') ||
          driver.name.includes('Price'))
      ) {
        impactMultiplier = assumptionMultiplier;
      }
    } else if (
      assumption.valueDriverId.includes('upph') ||
      assumption.valueDriverId.includes('productivity')
    ) {
      // Productivity affects productivity drivers
      if (driver.category === 'productivity') {
        impactMultiplier = assumptionMultiplier;
      }
    } else if (assumption.valueDriverId.includes('volume')) {
      // Volume affects volume drivers proportionally
      if (driver.category === 'volume') {
        impactMultiplier = assumptionMultiplier;
      }
    }

    const newForecastValue = driver.latestActual * impactMultiplier;
    const changePercent =
      ((newForecastValue - driver.latestActual) / driver.latestActual) * 100;

    // Estimate P&L impact (simplified calculation)
    const baseImpact = driver.impactOnPL;
    const impactOnPL = baseImpact * impactMultiplier;

    return {
      ...driver,
      forecastValue: newForecastValue,
      changePercent,
      impactOnPL,
    };
  });
}

/**
 * Calculate simulated waterfall stages based on value driver assumptions
 */
export function calculateSimulatedWaterfall(
  assumptions: ValueDriverAssumption[],
  baselineStages: OPWaterfallStage[]
): SimulatedWaterfallStage[] {
  if (assumptions.length === 0) {
    return baselineStages.map((stage) => ({
      ...stage,
      simulatedValue: stage.value,
      simulatedDelta: stage.delta,
      baselineValue: stage.value,
      baselineDelta: stage.delta,
      impact: 0,
    }));
  }

  // Calculate total impact from assumptions
  let totalImpact = 0;

  assumptions.forEach((assumption) => {
    // Impact on OP depends on category
    let impactOnOP = 0;

    if (assumption.category === 'cogs') {
      // Cost increases reduce OP
      impactOnOP =
        -Math.abs(assumption.baseValue * (assumption.assumptionPercent / 100)) *
        0.1; // Simplified: 10% of cost change impacts OP
    } else if (assumption.category === 'revenue') {
      // Revenue increases boost OP
      impactOnOP =
        Math.abs(assumption.baseValue * (assumption.assumptionPercent / 100)) *
        0.15; // Simplified: 15% of revenue change impacts OP
    } else if (assumption.category === 'opex') {
      // OPEX increases reduce OP
      impactOnOP =
        -Math.abs(assumption.baseValue * (assumption.assumptionPercent / 100)) *
        0.12; // Simplified: 12% of OPEX change impacts OP
    }

    totalImpact += impactOnOP;
  });

  // Distribute impact across waterfall stages
  // YTM Actuals (baseline) - no change
  // Momentum - small impact (5%)
  // Pipeline - medium impact (20%)
  // Headwinds/Tailwinds - larger impact (30%)
  // Additional Risk - larger impact (25%)
  // Assumed Leakage - small impact (10%)
  // Leakage Recovery - small impact (10%)
  // Full Year FCST - all remaining impact

  const stageImpacts = [
    0, // ytm-actual - no change
    totalImpact * 0.05, // momentum - 5%
    totalImpact * 0.2, // pipeline - 20%
    totalImpact * 0.3, // headwinds-tailwinds - 30%
    totalImpact * 0.25, // additional-risk - 25%
    totalImpact * 0.1, // assumed-leakage - 10%
    totalImpact * 0.1, // leakage-recovery - 10%
    totalImpact, // full-year-fcst - sum of all
  ];

  let cumulativeSimulated = baselineStages[0].value; // Start from YTM Actuals

  return baselineStages.map((stage, index) => {
    if (index === 0) {
      // YTM Actuals - no change
      return {
        ...stage,
        simulatedValue: stage.value,
        simulatedDelta: undefined,
        baselineValue: stage.value,
        baselineDelta: stage.delta,
        impact: 0,
      };
    }

    const prevBaselineValue = baselineStages[index - 1].value;
    const baselineDelta = stage.delta ?? stage.value - prevBaselineValue;

    const stageImpact = stageImpacts[index];
    const simulatedDelta = baselineDelta + stageImpact;
    const simulatedValue = cumulativeSimulated + simulatedDelta;

    cumulativeSimulated = simulatedValue;

    return {
      ...stage,
      simulatedValue,
      simulatedDelta,
      baselineValue: stage.value,
      baselineDelta: stage.delta,
      impact: stageImpact,
    };
  });
}
