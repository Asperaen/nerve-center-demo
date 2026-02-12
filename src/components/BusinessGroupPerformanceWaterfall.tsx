import type { ReactNode } from 'react';
import type { BudgetForecastStage } from '../types';
import type { BrokenAxisConfig } from '../utils/brokenAxisUtils';
import BudgetForecastActualWaterfall from './BudgetForecastActualWaterfall';

interface BusinessGroupPerformanceWaterfallProps {
  stages: BudgetForecastStage[];
  title?: string;
  subtitle?: ReactNode;
  onStageClick?: (stage: BudgetForecastStage) => void;
  highlightedStage?: string;
  brokenAxis?: BrokenAxisConfig | 'auto';
}

export default function BusinessGroupPerformanceWaterfall({
  stages,
  title = 'Deviation waterfall of BU performance by value driver',
  subtitle,
  onStageClick,
  highlightedStage,
  brokenAxis = 'auto',
}: BusinessGroupPerformanceWaterfallProps) {
  return (
    <BudgetForecastActualWaterfall
      stages={stages}
      title={title}
      subtitle={subtitle}
      onStageClick={onStageClick}
      highlightedStage={highlightedStage}
      brokenAxis={brokenAxis}
      showClickDetailsForAll={true}
    />
  );
}
