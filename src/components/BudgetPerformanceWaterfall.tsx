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
}

export default function BudgetPerformanceWaterfall({
  stages,
  title = 'Budget deviation waterfall of BU performance by value driver',
  subtitle,
  onStageClick,
  highlightedStage,
  brokenAxis = 'auto',
}: BudgetPerformanceWaterfallProps) {
  return (
    <BudgetForecastActualWaterfall
      stages={stages}
      title={title}
      subtitle={subtitle}
      onStageClick={onStageClick}
      highlightedStage={highlightedStage}
      colorByDelta
      brokenAxis={brokenAxis}
    />
  );
}
