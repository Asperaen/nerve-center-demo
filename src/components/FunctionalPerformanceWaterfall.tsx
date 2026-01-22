import { useMemo } from 'react';
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
import { calculateBrokenAxis, type BrokenAxisConfig } from '../utils/brokenAxisUtils';

export interface FunctionalPerformanceStage {
  id: string;
  label: string;
  value: number;
  delta?: number;
  type: 'baseline' | 'positive' | 'negative';
  isClickable?: boolean;
}

export type { BrokenAxisConfig };

interface FunctionalPerformanceWaterfallProps {
  stages: FunctionalPerformanceStage[];
  title: string;
  onStageClick?: (stage: FunctionalPerformanceStage) => void;
  emphasisStageId?: string;
  barSize?: number;
  description?: string;
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

  // Convert display value back to actual value
  const actualValue = value > skipRangeStart ? value + skipAmount : value;

  // Check if this is the first tick above the break (to render break indicator)
  const isFirstTickAboveBreak = value > skipRangeStart && index !== undefined && index > 0;
  const shouldShowBreak = isFirstTickAboveBreak && value <= skipRangeStart + 300;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor='end'
        fill='#666'
        fontSize={12}
      >
        {actualValue.toFixed(0)}
      </text>
      {shouldShowBreak && (
        <g transform='translate(8, 12)'>
          {/* White background */}
          <rect x={-10} y={-2} width={18} height={14} fill='white' />
          {/* Two parallel horizontal bold lines */}
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
  payload?: {
    type?: string;
    originalValue?: number;
    id?: string;
  };
  brokenAxis: BrokenAxisConfig;
}) => {
  const { x = 0, y = 0, width = 0, height = 0, fill, payload } = props;

  const isBaseline = payload?.type === 'baseline';
  const breakIndicatorHeight = 10;

  if (!isBaseline) {
    // Regular bar without break
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        rx={2}
        ry={2}
      />
    );
  }

  // Baseline bar with break indicator - parallel horizontal bold lines at edges
  const breakY = y + height - breakIndicatorHeight - 4;
  const gapHeight = breakIndicatorHeight + 4;

  return (
    <g>
      {/* Top portion of the bar */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height - breakIndicatorHeight - 6}
        fill={fill}
        rx={2}
        ry={2}
      />
      {/* White gap for break */}
      <rect
        x={x - 1}
        y={breakY - 2}
        width={width + 2}
        height={gapHeight}
        fill='white'
      />
      {/* Top line - at the top edge of the white area */}
      <line
        x1={x}
        y1={breakY - 1}
        x2={x + width}
        y2={breakY - 1}
        stroke='#4b5563'
        strokeWidth={3}
      />
      {/* Bottom line - at the bottom edge of the white area */}
      <line
        x1={x}
        y1={breakY + gapHeight - 3}
        x2={x + width}
        y2={breakY + gapHeight - 3}
        stroke='#4b5563'
        strokeWidth={3}
      />
      {/* Bottom portion of the bar */}
      <rect
        x={x}
        y={breakY + breakIndicatorHeight}
        width={width}
        height={4}
        fill={fill}
        rx={2}
        ry={2}
      />
    </g>
  );
};


export default function FunctionalPerformanceWaterfall({
  stages,
  title,
  description,
  onStageClick,
  emphasisStageId,
  barSize = 26,
  brokenAxis: brokenAxisProp,
}: FunctionalPerformanceWaterfallProps) {
  // Calculate effective broken axis config (auto-detect or use provided)
  const brokenAxis = useMemo(() => {
    if (brokenAxisProp === 'auto') {
      const result = calculateBrokenAxis(stages);
      return result.brokenAxis;
    }
    return brokenAxisProp;
  }, [brokenAxisProp, stages]);

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

        // Transform values for broken axis
        const transformValue = (v: number) =>
          v > skipRangeEnd ? v - skipAmount : v > skipRangeStart ? skipRangeStart : v;

        if (isAbsolute) {
          baselineValue = 0;
          barValue = transformValue(stage.value);
        } else {
          // For waterfall: position bar correctly for positive and negative deltas
          const transformedPrev = transformValue(prevValue);
          const transformedCurrent = transformValue(stage.value);
          
          if (delta < 0) {
            // Negative delta: bar goes DOWN from previous value
            // Base at the new (lower) value, bar extends UP to previous value
            baselineValue = transformedCurrent;
            barValue = Math.abs(delta);
          } else {
            // Positive delta: bar goes UP from previous value
            baselineValue = transformedPrev;
            barValue = delta;
          }
        }
      } else {
        if (isAbsolute) {
          baselineValue = 0;
          barValue = stage.value;
        } else {
          if (delta < 0) {
            // Negative delta: bar goes from current value UP to previous value
            baselineValue = stage.value;
            barValue = Math.abs(delta);
          } else {
            // Positive delta: bar goes from previous value UP
            baselineValue = prevValue;
            barValue = delta;
          }
        }
      }

      return {
        ...stage,
        cumulativeValue: stage.value,
        originalValue: stage.value,
        baselineValue,
        barValue,
      };
    });
  }, [stages, brokenAxis]);

  const getFillColor = (stage: FunctionalPerformanceStage) => {
    if (stage.type === 'baseline') return '#9ca3af';
    return stage.type === 'positive' ? '#22c55e' : '#ef4444';
  };

  // Calculate domain for broken axis
  const yAxisDomain = useMemo(() => {
    if (!brokenAxis) return undefined;

    const { skipRangeStart, skipRangeEnd } = brokenAxis;
    const skipAmount = skipRangeEnd - skipRangeStart;

    // Find max value after transformation
    const maxOriginalValue = Math.max(...stages.map((s) => s.value));
    const maxTransformed = maxOriginalValue > skipRangeEnd
      ? maxOriginalValue - skipAmount
      : maxOriginalValue;

    // Find min value (including negative deltas)
    const allValues = chartData.flatMap((d) => [
      d.baselineValue,
      d.baselineValue + d.barValue,
    ]);
    const minValue = Math.min(...allValues, 0);

    return [minValue, maxTransformed + 50];
  }, [stages, chartData, brokenAxis]);

  // Generate custom ticks for broken axis
  const yAxisTicks = useMemo(() => {
    if (!brokenAxis || !yAxisDomain) return undefined;

    const { skipRangeStart, skipRangeEnd } = brokenAxis;
    const skipAmount = skipRangeEnd - skipRangeStart;

    const ticks: number[] = [];
    const [minVal, maxVal] = yAxisDomain;

    // Add ticks below the break
    for (let v = 0; v <= skipRangeStart; v += 50) {
      if (v >= minVal) ticks.push(v);
    }

    // Add ticks above the break (in transformed space)
    const maxOriginal = maxVal + skipAmount;
    for (let v = skipRangeEnd; v <= maxOriginal; v += 100) {
      const transformed = v - skipAmount;
      if (transformed <= maxVal && !ticks.includes(transformed)) {
        ticks.push(transformed);
      }
    }

    return ticks.sort((a, b) => a - b);
  }, [brokenAxis, yAxisDomain]);

  return (
    <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
      <div className='flex items-center justify-between mb-1'>
        <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1.5'>
            <span className='w-3 h-3 rounded-full bg-[#22c55e]' />
            <span className='text-sm text-gray-600'>Favourable</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='w-3 h-3 rounded-full bg-[#ef4444]' />
            <span className='text-sm text-gray-600'>Adverse</span>
          </div>
        </div>
      </div>
      <p className='text-sm text-gray-500 mb-4'>{description}</p>
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='label'
              tick={{ fontSize: 12 }}
              angle={-25}
              textAnchor='end'
              interval={0}
              height={110}
            />
            {brokenAxis ? (
              <YAxis
                tick={(props) => (
                  <BrokenAxisTick {...props} brokenAxis={brokenAxis} />
                )}
                domain={yAxisDomain}
                ticks={yAxisTicks}
                label={{
                  value: 'USD Mn',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: '12px' },
                }}
              />
            ) : (
              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: 'USD Mn',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: '12px' },
                }}
              />
            )}
            {/* Y-axis break indicator is rendered via the custom tick component */}
            <Tooltip
              formatter={(value, _name, props) => {
                const payload = props.payload as
                  | {
                      cumulativeValue?: number;
                      delta?: number;
                    }
                  | undefined;
                const numericValue =
                  typeof value === 'number'
                    ? value
                    : Number(Array.isArray(value) ? value[0] : value ?? 0);
                const cumulative = payload?.cumulativeValue ?? numericValue;
                const delta = payload?.delta;
                const lines = [`Value: ${cumulative.toFixed(1)}M`];
                if (delta !== undefined && delta !== cumulative) {
                  lines.push(
                    `Change: ${delta > 0 ? '+' : ''}${delta.toFixed(1)}M`
                  );
                }
                return lines.join('\n');
              }}
            />
            <Bar dataKey='baselineValue' stackId='a' fill='transparent' />
            <Bar
              dataKey='barValue'
              stackId='a'
              barSize={barSize}
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
                    // For baseline bars with broken axis: show label above bar in darker color
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
                  
                  // For delta bars: show label in middle with white text
                  return (
                    <text
                      x={x + (width ?? 0) / 2}
                      y={(y ?? 0) + (height ?? 0) / 2 + 4}
                      textAnchor='middle'
                      fill='white'
                      fontSize={10}
                      fontWeight='bold'
                    >
                      {displayValue}
                    </text>
                  );
                }}
              />
              {stages.map((stage, index) => {
                const isEmphasized = emphasisStageId === stage.id;
                return (
                  <Cell
                    key={`${stage.id}-${index}`}
                    fill={getFillColor(stage)}
                    style={{
                      cursor: stage.isClickable ? 'pointer' : 'default',
                      stroke: isEmphasized ? '#1d4ed8' : 'none',
                      strokeWidth: isEmphasized ? 3 : 0,
                      filter: isEmphasized
                        ? 'drop-shadow(0 4px 6px rgba(29, 78, 216, 0.35))'
                        : 'none',
                    }}
                    onClick={() => {
                      if (stage.isClickable && onStageClick) {
                        onStageClick(stage);
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
