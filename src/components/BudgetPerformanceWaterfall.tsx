import type { ReactNode } from 'react';
import type { BudgetForecastStage } from '../types';
import type { BrokenAxisConfig } from '../utils/brokenAxisUtils';
import BudgetForecastActualWaterfall from './BudgetForecastActualWaterfall';

interface BudgetPerformanceWaterfallProps {
  stages: BudgetForecastStage[];
  title?: string;
  subtitle?: ReactNode;
  onStageClick?: (stage: BudgetForecastStage) => void;
  highlightedStage?: string;
  brokenAxis?: BrokenAxisConfig | 'auto';
  tooltipContent?: (stage: BudgetForecastStage) => ReactNode | null;
}

export default function BudgetPerformanceWaterfall({
  stages,
  title = 'Budget deviation waterfall of BU performance by value driver',
  subtitle,
  onStageClick,
  highlightedStage,
  brokenAxis = 'auto',
  tooltipContent,
}: BudgetPerformanceWaterfallProps) {
  const labelDefinitions: Record<string, string> = {
    'confirmed-volume-mix':
      'OP impact from confirmed RFQ wins or losses in current year, reflected as locked changes in volume or mix.',
    'market-performance':
      'Known structural impacts in current year from FX, labor rates, or business strategic initiatives, positive or negative.',
    'one-off-adjustments':
      'Non-recurring costs or benefits gap between last year and current year (e.g., one-time investments or claims).',
    'carry-over-improvements':
      'OP impact contributed by last year L4 initiatives ramp up and L3 initiatives to be implemented.',
    ideation:
      'Current year OP impact from new ideation - planned improvements to be delivered.',
    'planned-leakages':
      'Current year OP leakage during implementation or natural efficiency loss based on historical fact.',
  };
  return (
    <BudgetForecastActualWaterfall
      stages={stages}
      title={title}
      subtitle={subtitle}
      onStageClick={onStageClick}
      highlightedStage={highlightedStage}
      colorByDelta
      tooltipContent={tooltipContent}
      brokenAxis={brokenAxis}
      showPreliminaryLegend={false}
      labelDefinitions={labelDefinitions}
    />
  );
}
