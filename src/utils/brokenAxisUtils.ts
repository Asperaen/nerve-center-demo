/**
 * Utility functions for dynamically determining if a waterfall chart
 * should use a broken axis and calculating the optimal skip range.
 */

export interface BrokenAxisConfig {
  skipRangeStart: number;
  skipRangeEnd: number;
}

export interface BrokenAxisResult {
  shouldUseBrokenAxis: boolean;
  brokenAxis: BrokenAxisConfig | undefined;
}

interface WaterfallStage {
  value: number;
  delta?: number;
  type: 'baseline' | 'positive' | 'negative';
}

/**
 * Determines if a waterfall chart should use a broken axis and calculates the skip range.
 * 
 * A broken axis is recommended when:
 * 1. The baseline values are significantly larger than the delta values
 * 2. The delta bars would be too small to see (< threshold % of baseline)
 * 
 * @param stages - Array of waterfall stages with value, delta, and type
 * @param options - Configuration options
 * @returns Object with shouldUseBrokenAxis flag and brokenAxis config if applicable
 */
export function calculateBrokenAxis(
  stages: WaterfallStage[],
  options: {
    /** Minimum ratio of baseline to max delta to trigger broken axis (default: 8) */
    minRatioThreshold?: number;
    /** Minimum absolute delta value to consider (to avoid noise) */
    minDeltaThreshold?: number;
  } = {}
): BrokenAxisResult {
  const {
    minRatioThreshold = 8,
    minDeltaThreshold = 1,
  } = options;

  // Separate baseline and delta stages
  const baselineStages = stages.filter((s) => s.type === 'baseline');
  const deltaStages = stages.filter((s) => s.type !== 'baseline');

  // If no baseline or delta stages, no need for broken axis
  if (baselineStages.length === 0 || deltaStages.length === 0) {
    return { shouldUseBrokenAxis: false, brokenAxis: undefined };
  }

  // Get baseline values (typically first and last bars)
  const baselineValues = baselineStages.map((s) => Math.abs(s.value));
  const minBaseline = Math.min(...baselineValues);

  // Get absolute delta values
  const deltaValues = deltaStages
    .map((s) => Math.abs(s.delta ?? 0))
    .filter((d) => d >= minDeltaThreshold);

  if (deltaValues.length === 0) {
    return { shouldUseBrokenAxis: false, brokenAxis: undefined };
  }

  const maxDelta = Math.max(...deltaValues);
  const totalDeltaRange = deltaValues.reduce((sum, d) => sum + d, 0);

  // Calculate the ratio of baseline to max delta
  const baselineToDeltaRatio = minBaseline / maxDelta;

  // If the ratio is below threshold, deltas are visible enough without broken axis
  if (baselineToDeltaRatio < minRatioThreshold) {
    return { shouldUseBrokenAxis: false, brokenAxis: undefined };
  }

  // Calculate the skip range
  // We want to skip from 0 to a point that leaves enough space for deltas to be visible
  
  // Find the minimum cumulative value (lowest point the waterfall reaches)
  const allValues = stages.map((s) => s.value);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  
  // Calculate the visible range needed after the break
  // We want deltas to be clearly visible, so we need enough vertical space
  const visibleRangeNeeded = Math.max(
    totalDeltaRange * 3, // At least 3x the total delta range
    maxDelta * 8,        // At least 8x the max delta for visibility
    (maxValue - minValue) * 2.5 // At least 2.5x the actual range
  );
  
  // Skip from 0 up to just below the minimum value, leaving room for deltas
  let skipEnd = minValue - visibleRangeNeeded;
  
  // Ensure skipEnd is positive and rounded nicely
  skipEnd = Math.max(0, Math.floor(skipEnd / 100) * 100);
  
  // If skipEnd is still too small to be worthwhile (less than 70% of minValue), apply anyway
  // because the ratio check already confirmed we need a broken axis
  if (skipEnd <= 0) {
    // Calculate a reasonable skip that leaves visible space
    skipEnd = Math.floor((minValue * 0.9) / 100) * 100;
  }

  return {
    shouldUseBrokenAxis: true,
    brokenAxis: {
      skipRangeStart: 0,
      skipRangeEnd: skipEnd,
    },
  };
}

/**
 * Helper function to format the broken axis for display purposes
 */
export function formatBrokenAxisInfo(brokenAxis: BrokenAxisConfig): string {
  return `Skipping Y-axis range: ${brokenAxis.skipRangeStart} - ${brokenAxis.skipRangeEnd}`;
}

