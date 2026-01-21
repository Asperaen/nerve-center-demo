import type { ReactNode } from 'react';
import type { BudgetForecastStage } from '../types';
import BudgetForecastActualWaterfall from './BudgetForecastActualWaterfall';

interface BudgetPerformanceWaterfallProps {
  stages: BudgetForecastStage[];
  title?: string;
  subtitle?: ReactNode;
  onStageClick?: (stage: BudgetForecastStage) => void;
  highlightedStage?: string;
}

export default function BudgetPerformanceWaterfall({
  stages,
  title = 'Budget deviation waterfall of BU performance by value driver',
  subtitle,
  onStageClick,
  highlightedStage,
}: BudgetPerformanceWaterfallProps) {
  return (
    <BudgetForecastActualWaterfall
      stages={stages}
      title={title}
      subtitle={subtitle}
      onStageClick={onStageClick}
      highlightedStage={highlightedStage}
      colorByDelta
    />
  );
}
