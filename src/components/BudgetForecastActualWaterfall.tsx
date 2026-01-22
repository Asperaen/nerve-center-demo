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
import { calculateBrokenAxis, type BrokenAxisConfig } from '../utils/brokenAxisUtils';

interface BudgetForecastActualWaterfallProps {
  stages: BudgetForecastStage[];
  title?: string;
  subtitle?: ReactNode;
  onStageClick?: (stage: BudgetForecastStage) => void;
  highlightedStage?: string; // Stage ID to highlight (e.g., 'market-performance')
  colorByDelta?: boolean;
  /** Explicit broken axis config, or 'auto' to calculate dynamically, or undefined to disable */
  brokenAxis?: BrokenAxisConfig | 'auto';
}

// Custom Y-axis tick component with break indicator
const BrokenAxisTick = ({
  x,
  y,
  payload,
  brokenAxis,
  index,
}: {
  x?: number;
  y?: number;
  payload?: { value: number };
  brokenAxis: BrokenAxisConfig;
  index?: number;
}) => {
  if (x === undefined || y === undefined || !payload) return null;
  const { value } = payload;
  const { skipRangeStart, skipRangeEnd } = brokenAxis;
  const skipAmount = skipRangeEnd - skipRangeStart;

  const actualValue = value > skipRangeStart ? value + skipAmount : value;
  const isFirstTickAboveBreak = value > skipRangeStart && index !== undefined && index > 0;
  const shouldShowBreak = isFirstTickAboveBreak && value <= skipRangeStart + 300;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor='end' fill='#666' fontSize={12}>
        {actualValue.toFixed(0)}
      </text>
      {shouldShowBreak && (
        <g transform='translate(8, 12)'>
          <rect x={-10} y={-2} width={18} height={14} fill='white' />
          <line x1={-8} y1={0} x2={6} y2={0} stroke='#4b5563' strokeWidth={3} />
          <line x1={-8} y1={8} x2={6} y2={8} stroke='#4b5563' strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

// Custom bar shape with break indicator for baseline bars
const BrokenBarShape = (props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: { type?: string };
  brokenAxis: BrokenAxisConfig;
}) => {
  const { x = 0, y = 0, width = 0, height = 0, fill, payload } = props;
  const isBaseline = payload?.type === 'baseline';
  const breakIndicatorHeight = 10;

  if (!isBaseline) {
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={2} ry={2} />;
  }

  const breakY = y + height - breakIndicatorHeight - 4;
  const gapHeight = breakIndicatorHeight + 4;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height - breakIndicatorHeight - 6} fill={fill} rx={2} ry={2} />
      <rect x={x - 1} y={breakY - 2} width={width + 2} height={gapHeight} fill='white' />
      <line x1={x} y1={breakY - 1} x2={x + width} y2={breakY - 1} stroke='#4b5563' strokeWidth={3} />
      <line x1={x} y1={breakY + gapHeight - 3} x2={x + width} y2={breakY + gapHeight - 3} stroke='#4b5563' strokeWidth={3} />
      <rect x={x} y={breakY + breakIndicatorHeight} width={width} height={4} fill={fill} rx={2} ry={2} />
    </g>
  );
};

export default function BudgetForecastActualWaterfall({
  stages,
  title = 'Budget Forecast Actual Waterfall',
  subtitle,
  onStageClick,
  highlightedStage,
  colorByDelta = false,
  brokenAxis: brokenAxisProp = 'auto',
}: BudgetForecastActualWaterfallProps) {
  const navigate = useNavigate();

  // Calculate effective broken axis config (auto-detect or use provided)
  const brokenAxis = useMemo(() => {
    if (brokenAxisProp === 'auto') {
      const result = calculateBrokenAxis(stages);
      return result.brokenAxis;
    }
    return brokenAxisProp;
  }, [brokenAxisProp, stages]);

  // Prepare chart data for waterfall visualization
  const chartData = useMemo(() => {
    return stages.map((stage, index) => {
      const isAbsolute = stage.type === 'baseline';
      const prevValue = index > 0 ? stages[index - 1].value : 0;
      const delta = stage.delta ?? 0;

      let baselineValue: number;
      let barValue: number;

      if (brokenAxis) {
        const { skipRangeStart, skipRangeEnd } = brokenAxis;
        const skipAmount = skipRangeEnd - skipRangeStart;
        const transformValue = (v: number) =>
          v > skipRangeEnd ? v - skipAmount : v > skipRangeStart ? skipRangeStart : v;

        if (isAbsolute) {
          baselineValue = 0;
          barValue = transformValue(stage.value);
        } else {
          const transformedPrev = transformValue(prevValue);
          const transformedCurrent = transformValue(stage.value);
          if (delta < 0) {
            baselineValue = transformedCurrent;
            barValue = Math.abs(delta);
          } else {
            baselineValue = transformedPrev;
            barValue = delta;
          }
        }
      } else {
        baselineValue = isAbsolute ? 0 : prevValue;
        barValue = isAbsolute ? stage.value : delta;
      }

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
  }, [stages, brokenAxis]);

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
    if (colorByDelta) {
      return (stage.delta ?? stage.value) >= 0 ? '#10b981' : '#ef4444';
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
          {subtitle && <p className='text-sm text-gray-500 mt-1'>{subtitle}</p>}
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
        <ResponsiveContainer
          width='100%'
          height='100%'>
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
                const isHighlightedLabel =
                  highlightedStage && stage?.stage === highlightedStage;
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor='end'
                    transform={`rotate(-15, ${x}, ${y})`}
                    style={{
                      fontSize: isHighlightedLabel ? '13px' : '11px',
                      fill: isHighlightedLabel
                        ? '#1d4ed8'
                        : isClickable
                        ? '#1e3a8a'
                        : '#374151',
                      fontWeight: isHighlightedLabel
                        ? '800'
                        : isClickable
                        ? 'bold'
                        : 'normal',
                      cursor: isClickable ? 'pointer' : 'default',
                    }}>
                    {payload.value}
                    {isHighlightedLabel && ' ★'}
                  </text>
                );
              }}
            />
            {brokenAxis ? (
              <YAxis
                tick={(props) => <BrokenAxisTick {...props} brokenAxis={brokenAxis} />}
                domain={[
                  0,
                  Math.max(...stages.map((s) => s.value)) - brokenAxis.skipRangeEnd + 50,
                ]}
                label={{
                  value: 'Value (M USD)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: '12px' },
                }}
              />
            ) : (
              <YAxis
                style={{ fontSize: '12px' }}
                label={{
                  value: 'Value (M USD)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: '12px' },
                }}
              />
            )}
            <Tooltip
              formatter={(value, _name, props) => {
                const payload = props.payload as
                  | {
                      cumulativeValue?: number;
                      delta?: number;
                      label?: string;
                      isClickable?: boolean;
                      description?: string;
                    }
                  | undefined;
                const numericValue =
                  typeof value === 'number'
                    ? value
                    : Number(Array.isArray(value) ? value[0] : value ?? 0);
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
                  tooltipLines.push(
                    onStageClick ? 'Click for details →' : 'Click to navigate →'
                  );
                }

                return tooltipLines.join('\n');
              }}
            />
            {/* Baseline transparent spacer bar */}
            <Bar
              dataKey='baselineValue'
              stackId='a'
              fill='transparent'
            />
            {/* Actual value bars */}
            <Bar
              dataKey='barValue'
              stackId='a'
              name='Budget Forecast Actual'
              shape={
                brokenAxis
                  ? (props: unknown) => <BrokenBarShape {...(props as Record<string, unknown>)} brokenAxis={brokenAxis} />
                  : undefined
              }
            >
              <LabelList
                dataKey='delta'
                position='middle'
                content={(props) => {
                  const { x, y, width, height, value, index } = props as {
                    x?: number;
                    y?: number;
                    width?: number;
                    height?: number;
                    value?: number;
                    index?: number;
                  };
                  if (x === undefined || y === undefined || width === undefined || index === undefined) return null;
                  
                  const stage = stages[index];
                  const isBaseline = stage?.type === 'baseline';
                  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                  const displayValue = numericValue.toFixed(0);
                  
                  if (brokenAxis && isBaseline) {
                    return (
                      <text
                        x={x + (width ?? 0) / 2}
                        y={(y ?? 0) - 8}
                        textAnchor='middle'
                        fill='#4b5563'
                        fontSize={11}
                        fontWeight='bold'
                      >
                        {displayValue}
                      </text>
                    );
                  }
                  
                  return (
                    <text
                      x={x + (width ?? 0) / 2}
                      y={(y ?? 0) + (height ?? 0) / 2 + 4}
                      textAnchor='middle'
                      fill='white'
                      fontSize={11}
                      fontWeight='bold'
                    >
                      {displayValue}
                    </text>
                  );
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
                      stroke: highlighted
                        ? '#1d4ed8'
                        : stage.isClickable
                        ? '#3b82f6'
                        : 'none',
                      strokeWidth: highlighted ? 4 : stage.isClickable ? 2 : 0,
                      opacity: highlighted ? 1 : stage.isClickable ? 1 : 0.9,
                      filter: highlighted
                        ? 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.5))'
                        : 'none',
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
