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
  type: 'baseline' | 'positive' | 'negative' | 'preliminary';
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

  // If max delta is very small or zero, don't use broken axis
  if (maxDelta < 1) {
    return { shouldUseBrokenAxis: false, brokenAxis: undefined };
  }

  // Calculate the ratio of baseline to max delta
  const baselineToDeltaRatio = minBaseline / maxDelta;

  // If the ratio is below threshold, deltas are visible enough without broken axis
  if (baselineToDeltaRatio < minRatioThreshold) {
    return { shouldUseBrokenAxis: false, brokenAxis: undefined };
  }

  // Calculate the skip range
  // Skip from 0 to a value that ensures all bars are clearly visible
  
  // Find the minimum and maximum values across all stages
  const allStageValues = stages.map((s) => s.value);
  const minValue = Math.min(...allStageValues);
  const maxValue = Math.max(...allStageValues);
  
  // Ensure the smallest bar (minValue) has enough visible height
  // The smallest bar should be at least 1.5x the max delta height so it's clearly visible
  const minBarHeight = maxDelta * 1.5;
  
  // Calculate skipEnd such that: minValue - skipEnd >= minBarHeight
  // So: skipEnd <= minValue - minBarHeight
  let skipEnd = minValue - minBarHeight;
  
  // Ensure skipEnd is positive and rounded nicely
  skipEnd = Math.max(0, Math.floor(skipEnd / 100) * 100);
  
  // Also ensure the visible range (maxValue - skipEnd) is meaningful
  // The visible portion should be at least 3x the max delta so bars look proportional
  const minVisibleRange = maxDelta * 3;
  const currentVisibleRange = maxValue - skipEnd;
  
  if (currentVisibleRange < minVisibleRange) {
    skipEnd = Math.floor((maxValue - minVisibleRange) / 100) * 100;
    skipEnd = Math.max(0, skipEnd);
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

