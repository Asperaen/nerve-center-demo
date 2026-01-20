import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BudgetForecastStage } from '../types';

interface BudgetForecastActualWaterfallProps {
  stages: BudgetForecastStage[];
  title?: string;
  subtitle?: ReactNode;
  onStageClick?: (stage: BudgetForecastStage) => void;
  highlightedStage?: string; // Stage ID to highlight (e.g., 'market-performance')
}

export default function BudgetForecastActualWaterfall({
  stages,
  title = 'Budget Forecast Actual Waterfall',
  subtitle,
  onStageClick,
  highlightedStage,
}: BudgetForecastActualWaterfallProps) {
  const navigate = useNavigate();

  // Prepare chart data for waterfall visualization
  const chartData = useMemo(() => {
    return stages.map((stage, index) => {
      const isAbsolute = stage.type === 'baseline';
      const prevValue = index > 0 ? stages[index - 1].value : 0;

      // For absolute bars (baseline), show from 0
      // For deviation bars, show the delta stacked on previous value
      const baselineValue = isAbsolute ? 0 : prevValue;
      const barValue = isAbsolute ? stage.value : stage.delta ?? 0;

      return {
        ...stage,
        name: stage.label,
        cumulativeValue: stage.value,
        delta: stage.delta ?? stage.value,
        baselineValue,
        barValue,
        isPositive: (stage.delta ?? stage.value) >= 0,
      };
    });
  }, [stages]);

  const handleBarClick = (stage: BudgetForecastStage) => {
    if (stage.isClickable) {
      if (onStageClick) {
        onStageClick(stage);
      } else if (stage.navigationTarget) {
        navigate(stage.navigationTarget);
      }
    }
  };

  // Get fill color based on stage type
  const getFillColor = (stage: BudgetForecastStage): string => {
    // Use a special highlight color for the highlighted stage
    if (highlightedStage && stage.stage === highlightedStage) {
      return '#3b82f6'; // blue-500 for highlighted stage
    }
    if (stage.type === 'baseline') {
      return '#6b7280'; // gray-500 for baseline/absolute bars
    }
    return stage.type === 'positive' ? '#10b981' : '#ef4444'; // opportunity green / risk red
  };

  // Check if a stage is highlighted
  const isHighlighted = (stage: BudgetForecastStage): boolean => {
    return highlightedStage === stage.stage;
  };

  return (
    <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-8 hover:shadow-xl transition-shadow duration-300'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>{title}</h2>
          {subtitle && (
            <p className='text-sm text-gray-500 mt-1'>{subtitle}</p>
          )}
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-opportunity-500'></div>
            <span className='text-sm text-gray-700'>Favourable</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-risk-500'></div>
            <span className='text-sm text-gray-700'>Adverse</span>
          </div>
        </div>
      </div>

      <div className='h-96'>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='label'
              angle={-15}
              textAnchor='end'
              height={120}
              tick={(props) => {
                const { x, y, payload } = props;
                const stage = stages.find((s) => s.label === payload.value);
                const isClickable = stage?.isClickable ?? false;
                const isHighlightedLabel = highlightedStage && stage?.stage === highlightedStage;
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor='end'
                    transform={`rotate(-15, ${x}, ${y})`}
                    style={{
                      fontSize: isHighlightedLabel ? '13px' : '11px',
                      fill: isHighlightedLabel ? '#1d4ed8' : isClickable ? '#1e3a8a' : '#374151',
                      fontWeight: isHighlightedLabel ? '800' : isClickable ? 'bold' : 'normal',
                      cursor: isClickable ? 'pointer' : 'default',
                    }}
                  >
                    {payload.value}
                    {isHighlightedLabel && ' ★'}
                  </text>
                );
              }}
            />
            <YAxis
              style={{ fontSize: '12px' }}
              label={{
                value: 'Value (M USD)',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: '12px' },
              }}
            />
            <Tooltip
              formatter={(
                value: number | string | undefined,
                _name: string | undefined,
                props: {
                  payload?: {
                    [key: string]: string | number | boolean | undefined;
                    cumulativeValue?: number;
                    delta?: number;
                    label?: string;
                    isClickable?: boolean;
                    description?: string;
                  };
                }
              ) => {
                const payload = props.payload;
                const numericValue =
                  typeof value === 'number' ? value : Number(value ?? 0);
                const cumulative = payload?.cumulativeValue ?? numericValue;
                const delta = payload?.delta;
                const isClickable = payload?.isClickable;

                const tooltipLines: string[] = [
                  `Value: $${cumulative.toFixed(1)}M`,
                ];

                if (delta !== undefined && delta !== cumulative) {
                  tooltipLines.push(
                    `Change: ${delta > 0 ? '+' : ''}$${delta.toFixed(1)}M`
                  );
                }

                if (isClickable) {
                  tooltipLines.push('Click to navigate →');
                }

                return tooltipLines.join('\n');
              }}
            />
            {/* Baseline transparent spacer bar */}
            <Bar dataKey='baselineValue' stackId='a' fill='transparent' />
            {/* Actual value bars */}
            <Bar dataKey='barValue' stackId='a' name='Budget Forecast Actual'>
              <LabelList
                dataKey='delta'
                position='middle'
                formatter={(value) => {
                  const numericValue =
                    typeof value === 'number' ? value : Number(value ?? 0);
                  return `${numericValue >= 0 ? '' : ''}${numericValue.toFixed(
                    0
                  )}`;
                }}
                style={{
                  fontSize: '11px',
                  fill: 'white',
                  fontWeight: 'bold',
                }}
              />
              {stages.map((stage, index) => {
                const fillColor = getFillColor(stage);
                const highlighted = isHighlighted(stage);

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fillColor}
                    style={{
                      cursor: stage.isClickable ? 'pointer' : 'default',
                      stroke: highlighted ? '#1d4ed8' : stage.isClickable ? '#3b82f6' : 'none',
                      strokeWidth: highlighted ? 4 : stage.isClickable ? 2 : 0,
                      opacity: highlighted ? 1 : stage.isClickable ? 1 : 0.9,
                      filter: highlighted ? 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.5))' : 'none',
                    }}
                    onClick={() => handleBarClick(stage)}
                    onMouseEnter={(e) => {
                      if (stage.isClickable && !highlighted) {
                        (e.currentTarget as SVGElement).style.opacity = '0.8';
                        (e.currentTarget as SVGElement).style.strokeWidth = '3';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (stage.isClickable && !highlighted) {
                        (e.currentTarget as SVGElement).style.opacity = '1';
                        (e.currentTarget as SVGElement).style.strokeWidth = '2';
                      }
                    }}
                  />
                );
              })}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

