import type { ReactNode } from 'react';
import type { BudgetForecastStage } from '../types';
import BudgetForecastActualWaterfall from './BudgetForecastActualWaterfall';

interface BusinessGroupPerformanceWaterfallProps {
  stages: BudgetForecastStage[];
  title?: string;
  subtitle?: ReactNode;
  onStageClick?: (stage: BudgetForecastStage) => void;
  highlightedStage?: string;
}

export default function BusinessGroupPerformanceWaterfall({
  stages,
  title = 'Deviation waterfall of BU performance by value driver',
  subtitle,
  onStageClick,
  highlightedStage,
}: BusinessGroupPerformanceWaterfallProps) {
  return (
    <BudgetForecastActualWaterfall
      stages={stages}
      title={title}
      subtitle={subtitle}
      onStageClick={onStageClick}
      highlightedStage={highlightedStage}
    />
  );
}
