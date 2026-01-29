import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { calculateBrokenAxis, type BrokenAxisConfig } from '../utils/brokenAxisUtils';
import { useCurrency } from '../contexts/CurrencyContext';

export interface FunctionalPerformanceStage {
  id: string;
  label: string;
  value: number;
  delta?: number;
  type: 'baseline' | 'positive' | 'negative';
  isClickable?: boolean;
  isReference?: boolean;
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
  footerContent?: ReactNode;
}

// Custom Y-axis tick component to emphasize zero
const YAxisTick = ({
  x,
  y,
  payload,
  formatValue,
}: {
  x?: number;
  y?: number;
  payload?: { value: number };
  formatValue?: (value: number) => string;
}) => {
  if (x === undefined || y === undefined || !payload) return null;
  const { value } = payload;
  const isZero = value === 0;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor='end'
        fill={isZero ? '#374151' : '#666'}
        fontSize={12}
        fontWeight={isZero ? 'bold' : 'normal'}
      >
        {formatValue ? formatValue(value) : value.toFixed(0)}
      </text>
    </g>
  );
};

// Custom Y-axis tick component with break indicator
const BrokenAxisTick = ({
  x,
  y,
  payload,
  brokenAxis,
  index,
  formatValue,
}: {
  x?: number;
  y?: number;
  payload?: { value: number };
  brokenAxis: BrokenAxisConfig;
  index?: number;
  formatValue?: (value: number) => string;
}) => {
  if (x === undefined || y === undefined || !payload) return null;
  const { value } = payload;
  const { skipRangeStart, skipRangeEnd } = brokenAxis;
  const skipAmount = skipRangeEnd - skipRangeStart;

  // Convert display value back to actual value
  const actualValue = value > skipRangeStart ? value + skipAmount : value;
  const isZero = actualValue === 0;

  // Check if this is the first tick above the break (to render break indicator)
  const isFirstTickAboveBreak = value > skipRangeStart && index !== undefined && index > 0;
  const shouldShowBreak = isFirstTickAboveBreak && value <= skipRangeStart + 300;

  const displayValue = formatValue
    ? formatValue(actualValue)
    : actualValue.toFixed(0);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor='end'
        fill={isZero ? '#374151' : '#666'}
        fontSize={12}
        fontWeight={isZero ? 'bold' : 'normal'}
      >
        {displayValue}
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
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string | number;
  payload?: {
    type?: string;
    originalValue?: number;
    id?: string;
    isReference?: boolean;
  };
  brokenAxis: BrokenAxisConfig;
}) => {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    fill,
    stroke,
    strokeWidth,
    strokeDasharray,
    payload,
  } = props;

  const isBaseline = payload?.type === 'baseline';
  const isReference = payload?.isReference;
  const breakIndicatorHeight = 10;
  const minHeightForBreakIndicator = 40; // Minimum bar height to show break indicator

  if (isReference) {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill='transparent'
        stroke={stroke ?? '#9ca3af'}
        strokeWidth={strokeWidth ?? 2}
        strokeDasharray={strokeDasharray ?? '4 4'}
        rx={2}
        ry={2}
      />
    );
  }
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

  // If bar is too short, render simple bar without break indicator
  if (height < minHeightForBreakIndicator) {
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
  brokenAxis: brokenAxisProp = 'auto',
  footerContent,
}: FunctionalPerformanceWaterfallProps) {
  const { formatAmount, currencyLabel } = useCurrency();
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [initiativeTooltip, setInitiativeTooltip] = useState<{
    text: string;
    left: number;
    top: number;
  } | null>(null);
  const formatAmountM = (value: number) =>
    `${formatAmount(value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}M`;
  const formatAxisValue = (value: number) =>
    formatAmount(value, { maximumFractionDigits: 0 });
  const initiativeStageIds = useMemo(
    () =>
      new Set([
        'l3-deviation',
        'l4-deviation',
        'l5-deviation',
        'dl-efficiency',
        'idl-hc-gap',
        'ga-variable-gap',
        'ga-fixed-gap',
        'rnd-fte',
        'rnd-non-fte',
      ]),
    []
  );
  const initiativeTotal = useMemo(
    () =>
      stages
        .filter((stage) => initiativeStageIds.has(stage.id))
        .reduce((sum, stage) => sum + (stage.delta ?? 0), 0),
    [initiativeStageIds, stages]
  );
  const showInitiativeTooltip = (
    event: React.MouseEvent<SVGGElement>,
    text: string
  ) => {
    const container = chartContainerRef.current;
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const tooltipWidth = 220;
    const tooltipHeight = 80;
    const left = Math.min(
      Math.max(x + 12, 8),
      Math.max(8, rect.width - tooltipWidth - 8)
    );
    const top = Math.min(
      Math.max(y - 12, 8),
      Math.max(8, rect.height - tooltipHeight - 8)
    );
    setInitiativeTooltip({ text, left, top });
  };

  const hideInitiativeTooltip = () => {
    setInitiativeTooltip(null);
  };
  // Calculate effective broken axis config (auto-detect or use provided)
  const brokenAxis = useMemo(() => {
    if (brokenAxisProp === 'auto') {
      const result = calculateBrokenAxis(stages);
      return result.brokenAxis;
    }
    return brokenAxisProp;
  }, [brokenAxisProp, stages]);

  const chartData = useMemo(() => {
    let lastNonReferenceValue = 0;
    return stages.map((stage) => {
      const isAbsolute = stage.type === 'baseline';
      const prevValue = lastNonReferenceValue;
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

      const chartPoint = {
        ...stage,
        cumulativeValue: stage.value,
        originalValue: stage.value,
        baselineValue,
        barValue,
      };
      if (!stage.isReference) {
        lastNonReferenceValue = stage.value;
      }
      return chartPoint;
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

  // Check if the chart extends into negative y territory
  const hasNegativeYValues = useMemo(() => {
    return chartData.some((d) => d.baselineValue < 0 || d.value < 0);
  }, [chartData]);

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
      <div className='h-80 relative' ref={chartContainerRef}>
        {initiativeTooltip && (
          <div
            className='absolute z-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-lg'
            style={{
              left: initiativeTooltip.left,
              top: initiativeTooltip.top,
              width: 220,
            }}>
            {initiativeTooltip.text}
          </div>
        )}
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart data={chartData} margin={{ top: 25, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray='3 3' />
            {hasNegativeYValues && (
              <ReferenceLine y={0} stroke='#374151' strokeWidth={2} strokeDasharray='4 4' />
            )}
            <XAxis
              dataKey='label'
              angle={-25}
              textAnchor='end'
              interval={0}
              height={110}
              tick={(props) => {
                const { x, y, payload, index } = props as {
                  x?: number;
                  y?: number;
                  payload?: { value?: string };
                  index?: number;
                };
                if (x === undefined || y === undefined || !payload) return null;
                const stage = index !== undefined ? stages[index] : undefined;
                const showGroupLabel =
                  stage && initiativeStageIds.has(stage.id);
                const groupLabel = showGroupLabel ? 'Initiative performance' : undefined;
                return (
                  <g
                    transform={`rotate(-25, ${x}, ${y})`}
                    onMouseEnter={(event) => {
                      if (showGroupLabel && groupLabel) {
                        showInitiativeTooltip(
                          event,
                          `Initiative total: ${formatAmountM(initiativeTotal)} ${currencyLabel}`
                        );
                      }
                    }}
                    onMouseLeave={hideInitiativeTooltip}
                    style={{ cursor: showGroupLabel ? 'help' : 'default' }}
                  >
                    <text
                      x={x}
                      y={y}
                      textAnchor='end'
                      fill='#374151'
                      fontSize={12}
                    >
                      <tspan x={x} dy={0}>
                        {payload.value}
                      </tspan>
                      {groupLabel && (
                        <tspan x={x} dy={12} fontSize={10} fill='#6b7280'>
                          {groupLabel}
                        </tspan>
                      )}
                    </text>
                  </g>
                );
              }}
            />
            {brokenAxis ? (
              <YAxis
                tick={(props) => (
                  <BrokenAxisTick
                    {...props}
                    brokenAxis={brokenAxis}
                    formatValue={formatAxisValue}
                  />
                )}
                domain={yAxisDomain}
                ticks={yAxisTicks}
                label={{
                  value: `${currencyLabel} Mn`,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: '12px' },
                }}
              />
            ) : (
              <YAxis
                tick={(props) => (
                  <YAxisTick {...props} formatValue={formatAxisValue} />
                )}
                label={{
                  value: `${currencyLabel} Mn`,
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
                const lines = [
                  `Value: ${formatAmountM(cumulative)} ${currencyLabel}`,
                ];
                if (delta !== undefined && delta !== cumulative) {
                  lines.push(
                    `Change: ${delta > 0 ? '+' : ''}${formatAmountM(
                      delta
                    )} ${currencyLabel}`
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
              onClick={(_data, index) => {
                const stage = stages[index];
                if (stage?.isClickable && onStageClick) {
                  onStageClick(stage);
                }
              }}
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
                  const displayValue = formatAxisValue(numericValue);
                  
                  if (brokenAxis && isBaseline) {
                    // For baseline bars with broken axis: show label directly above the bar
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
                const isReference = stage.isReference;
                return (
                  <Cell
                    key={`${stage.id}-${index}`}
                    fill={isReference ? 'transparent' : getFillColor(stage)}
                    style={{
                      cursor: stage.isClickable ? 'pointer' : 'default',
                      stroke: isReference
                        ? '#9ca3af'
                        : isEmphasized
                        ? '#1d4ed8'
                        : 'none',
                      strokeWidth: isReference ? 2 : isEmphasized ? 3 : 0,
                      strokeDasharray: isReference ? '4 4' : undefined,
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
      {footerContent && <div className='mt-3'>{footerContent}</div>}
    </div>
  );
}
