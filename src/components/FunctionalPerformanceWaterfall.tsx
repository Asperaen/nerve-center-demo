import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import { useCurrency } from '../contexts/CurrencyContext';
import { calculateBrokenAxis, type BrokenAxisConfig } from '../utils/brokenAxisUtils';

export interface FunctionalPerformanceStage {
  id: string;
  label: string;
  value: number;
  delta?: number;
  type: 'baseline' | 'positive' | 'negative' | 'neutral';
  isClickable?: boolean;
  isReference?: boolean;
  referenceValue?: number;
}

export type FunctionalPerformanceGrouping = {
  label: string;
  stageIds: string[];
};

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
  groupings?: FunctionalPerformanceGrouping[];
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
    barValue?: number;
    referenceBarValue?: number;
    value?: number;
    referenceValue?: number;
    targetDisplayValue?: number;
  };
  brokenAxis?: BrokenAxisConfig;
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

  const safeHeight = Math.max(0, height);
  const safeWidth = Math.max(0, width);
  const isBaseline = payload?.type === 'baseline';
  const isReference = payload?.isReference;
  const breakIndicatorHeight = 10;
  const minHeightForBreakIndicator = 40; // Minimum bar height to show break indicator
  const referenceBarValue = payload?.referenceBarValue;
  const barValue = payload?.barValue;
  const shouldDrawReference =
    typeof referenceBarValue === 'number' &&
    typeof barValue === 'number' &&
    Math.abs(barValue) > 0;
  const referenceRatio = shouldDrawReference
    ? Math.abs(referenceBarValue) / Math.abs(barValue)
    : 1;
  const referenceHeight = shouldDrawReference
    ? Math.max(0, Math.min(safeHeight, safeHeight * referenceRatio))
    : 0;
  const referenceY = shouldDrawReference
    ? y + (safeHeight - referenceHeight)
    : y;

  if (isReference) {
    return (
      <rect
        x={x}
        y={y}
        width={safeWidth}
        height={safeHeight}
        fill='transparent'
        stroke={stroke ?? '#9ca3af'}
        strokeWidth={strokeWidth ?? 2}
        strokeDasharray={strokeDasharray ?? '4 4'}
        rx={2}
        ry={2}
      />
    );
  }
  // Procurement first bucket: baseline as full bar height, target as bottom segment (light), baseline above target as top (darker)
  if (isBaseline && shouldDrawReference && (payload?.id === 'target-spend' || payload?.id === 'target-mva')) {
    const targetSegmentHeight = Math.max(
      0,
      Math.min(
        safeHeight,
        safeHeight * (Math.abs(referenceBarValue!) / Math.abs(barValue!))
      )
    );
    const baselineAboveHeight = Math.max(0, safeHeight - targetSegmentHeight);
    const bottomY = y + baselineAboveHeight;
    const targetValue =
      typeof payload.targetDisplayValue === 'number'
        ? payload.targetDisplayValue
        : typeof payload.referenceValue === 'number'
        ? payload.referenceValue
        : typeof payload.referenceBarValue === 'number'
        ? payload.referenceBarValue
        : undefined;
    const targetLabel =
      targetValue !== undefined
        ? Number(targetValue).toLocaleString('en-US', { maximumFractionDigits: 0 })
        : '';
    return (
      <g>
        {/* Bottom: target spend (0 to target) — light grey */}
        <rect
          x={x}
          y={bottomY}
          width={safeWidth}
          height={targetSegmentHeight}
          fill='#9ca3af'
          rx={2}
          ry={2}
        />
        {/* Target value (e.g. 185) in middle of light grey segment — black font */}
        {targetLabel && targetSegmentHeight >= 8 && (
          <text
            x={(x ?? 0) + (width ?? 0) / 2}
            y={bottomY + targetSegmentHeight / 2}
            textAnchor='middle'
            dominantBaseline='middle'
            fill='#000000'
            fontSize={12}
            fontWeight='bold'
          >
            {targetLabel}
          </text>
        )}
        {/* Top: baseline above target — darker */}
        <rect
          x={x}
          y={y}
          width={safeWidth}
          height={baselineAboveHeight}
          fill='#6b7280'
          rx={2}
          ry={2}
        />
      </g>
    );
  }
  if (!isBaseline) {
    // Regular bar without break
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={safeWidth}
          height={safeHeight}
          fill={fill}
          rx={2}
          ry={2}
        />
        {shouldDrawReference && (
          <rect
            x={x}
            y={referenceY}
            width={safeWidth}
            height={referenceHeight}
            fill='transparent'
            stroke='#111827'
            strokeWidth={2}
            strokeDasharray='4 4'
            rx={2}
            ry={2}
          />
        )}
      </g>
    );
  }

  // If bar is too short, render simple bar without break indicator
  if (safeHeight < minHeightForBreakIndicator) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={safeWidth}
          height={safeHeight}
          fill={fill}
          rx={2}
          ry={2}
        />
        {shouldDrawReference && (
          <rect
            x={x}
            y={referenceY}
            width={safeWidth}
            height={referenceHeight}
            fill='transparent'
            stroke='#111827'
            strokeWidth={2}
            strokeDasharray='4 4'
            rx={2}
            ry={2}
          />
        )}
      </g>
    );
  }

  // Baseline bar with break indicator - parallel horizontal bold lines at edges
  const topHeight = Math.max(0, safeHeight - breakIndicatorHeight - 6);
  const breakY = y + safeHeight - breakIndicatorHeight - 4;
  const gapHeight = breakIndicatorHeight + 4;

  return (
    <g>
      {/* Top portion of the bar */}
      <rect
        x={x}
        y={y}
        width={safeWidth}
        height={topHeight}
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
        width={safeWidth}
        height={4}
        fill={fill}
        rx={2}
        ry={2}
      />
      {shouldDrawReference && (
        <rect
          x={x}
          y={referenceY}
          width={safeWidth}
          height={referenceHeight}
          fill='transparent'
          stroke='#111827'
          strokeWidth={2}
          strokeDasharray='4 4'
          rx={2}
          ry={2}
        />
      )}
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
  groupings,
}: FunctionalPerformanceWaterfallProps) {
  const { formatAmount, currencyLabel } = useCurrency();
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
  const [axisLabelBottom, setAxisLabelBottom] = useState(0);
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

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }
    const updateSize = () => {
      const rect = chartContainerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      setChartSize({ width: rect.width, height: rect.height });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }
    let frameId = 0;
    const updateAxisBottom = () => {
      const container = chartContainerRef.current;
      if (!container) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const ticks = container.querySelectorAll(
        '.recharts-cartesian-axis .recharts-cartesian-axis-tick text, text.recharts-cartesian-axis-tick-value'
      );
      let maxBottom = 0;
      ticks.forEach((tick) => {
        const rect = tick.getBoundingClientRect();
        const bottom = rect.bottom - containerRect.top;
        if (bottom > maxBottom) {
          maxBottom = bottom;
        }
      });
      if (maxBottom > 0) {
        setAxisLabelBottom(maxBottom);
        return;
      }
      if (chartSize.height > 0) {
        setAxisLabelBottom(Math.max(0, chartSize.height - 140));
      }
    };
    frameId = window.requestAnimationFrame(updateAxisBottom);
    return () => window.cancelAnimationFrame(frameId);
  }, [chartSize.height, chartSize.width]);
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
    const referenceSpend = stages.find((stage) => stage.id === 'baseline-spend');
    return stages.map((stage) => {
      const isAbsolute = stage.type === 'baseline';
      const prevValue = lastNonReferenceValue;
      const delta = stage.delta ?? 0;

      let baselineValue: number;
      let barValue: number;
      let referenceBarValue: number | undefined;
      const referenceValue =
        stage.referenceValue ??
        (stage.id === 'target-spend' ? referenceSpend?.value : undefined);

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
        if (typeof referenceValue === 'number') {
          referenceBarValue = transformValue(referenceValue);
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
        if (typeof referenceValue === 'number') {
          referenceBarValue = referenceValue;
        }
      }

      const chartPoint = {
        ...stage,
        cumulativeValue: stage.value,
        originalValue: stage.value,
        baselineValue,
        barValue,
        referenceBarValue,
        ...((stage.id === 'target-spend' || stage.id === 'target-mva') &&
        typeof referenceValue === 'number'
          ? { targetDisplayValue: referenceValue }
          : {}),
      };
      if (!stage.isReference) {
        lastNonReferenceValue =
          (stage.id === 'target-spend' || stage.id === 'target-mva') &&
          typeof referenceValue === 'number'
            ? referenceValue
            : stage.value;
      }
      return chartPoint;
    });
  }, [stages, brokenAxis]);

  const initiativeGrouping = useMemo(() => {
    if (
      !chartData.length ||
      chartSize.width === 0 ||
      chartSize.height === 0 ||
      axisLabelBottom === 0
    ) {
      return null;
    }
    if (groupings && groupings.length > 0) {
      return null;
    }
    const initiativeIndices = chartData
      .map((stage, index) => (initiativeStageIds.has(stage.id) ? index : null))
      .filter((value): value is number => value !== null);
    if (initiativeIndices.length === 0) {
      return null;
    }
    const minIndex = Math.min(...initiativeIndices);
    const maxIndex = Math.max(...initiativeIndices);
    const margin = { left: 16, right: 16, bottom: 24 };
    const availableWidth = Math.max(1, chartSize.width - margin.left - margin.right);
    const step = availableWidth / chartData.length;
    const left = margin.left + (minIndex + 0.5) * step;
    const right = margin.left + (maxIndex + 0.5) * step;
    const verticalOffset = 55;
    const groupY = Math.min(
      chartSize.height - 20,
      Math.max(8, axisLabelBottom + 40 + verticalOffset)
    );
    const labelY = Math.min(chartSize.height - 6, groupY + 14);
    return { left, right, groupY, labelY };
  }, [
    axisLabelBottom,
    chartData,
    chartSize.height,
    chartSize.width,
    groupings,
    initiativeStageIds,
  ]);

  const customGroupings = useMemo(() => {
    if (
      !groupings ||
      groupings.length === 0 ||
      !chartData.length ||
      chartSize.width === 0 ||
      chartSize.height === 0 ||
      axisLabelBottom === 0
    ) {
      return [];
    }
    const margin = { left: 16, right: 16, bottom: 24 };
    const availableWidth = Math.max(1, chartSize.width - margin.left - margin.right);
    const step = availableWidth / chartData.length;
    const baseGroupY = Math.min(
      chartSize.height - 20,
      Math.max(8, axisLabelBottom + 110)
    );
    // All section brackets on the same row (same groupY); do not stack by index.
    return groupings
      .map((group) => {
        const stageIds = new Set(group.stageIds);
        const indices = chartData
          .map((stage, stageIndex) => (stageIds.has(stage.id) ? stageIndex : null))
          .filter((value): value is number => value !== null);
        if (indices.length === 0) {
          return null;
        }
        const minIndex = Math.min(...indices);
        const maxIndex = Math.max(...indices);
        const left = margin.left + (minIndex + 0.5) * step;
        const right = margin.left + (maxIndex + 0.5) * step;
        const groupY = baseGroupY;
        const labelY = Math.min(chartSize.height - 6, groupY + 14);
        return { left, right, groupY, labelY, label: group.label };
      })
      .filter((group): group is NonNullable<typeof group> => Boolean(group));
  }, [axisLabelBottom, chartData, chartSize.height, chartSize.width, groupings]);

  const getFillColor = (stage: FunctionalPerformanceStage) => {
    if (stage.type === 'baseline') return '#9ca3af';
    if (stage.type === 'neutral') return '#9ca3af'; // same grey as actual spend bar for Volume change etc.
    return stage.type === 'positive' ? '#22c55e' : '#ef4444';
  };

  // Calculate domain for broken axis
  const yAxisDomain = useMemo(() => {
    if (!brokenAxis) return undefined;

    const { skipRangeStart, skipRangeEnd } = brokenAxis;
    const skipAmount = skipRangeEnd - skipRangeStart;

    // Find max value after transformation
    const maxOriginalValue = Math.max(
      ...stages.map((s) => s.value),
      ...stages
        .map((s) => s.referenceValue)
        .filter((value): value is number => typeof value === 'number')
    );
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
            <span className='text-sm text-gray-600'>Positive Impact</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='w-3 h-3 rounded-full bg-[#ef4444]' />
            <span className='text-sm text-gray-600'>Negative Impact</span>
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
                if (x === undefined || y === undefined || !payload) {
                  return <text />;
                }
                const stage = index !== undefined ? stages[index] : undefined;
                const showGroupLabel =
                  stage && initiativeStageIds.has(stage.id);
                return (
                  <g
                    transform={`rotate(-25, ${x}, ${y})`}
                    onMouseEnter={(event) => {
                      if (showGroupLabel) {
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
              wrapperStyle={{ pointerEvents: 'none' }}
              content={(props) => {
                if (!props.active || !props.payload || props.payload.length === 0) {
                  return null;
                }
                const payload = props.payload[0]?.payload as
                  | (FunctionalPerformanceStage & {
                      cumulativeValue?: number;
                      delta?: number;
                      referenceValue?: number;
                    })
                  | undefined;
                if (!payload) {
                  return null;
                }
                const stage = stages.find((item) => item.id === payload.id) ?? payload;
                const delta = payload.delta ?? stage.delta ?? stage.value;
                const isBaseline = stage.type === 'baseline';
                const referenceValue =
                  typeof stage.referenceValue === 'number'
                    ? stage.referenceValue
                    : (payload as { referenceValue?: number }).referenceValue;
                const isTargetBucket =
                  (stage.id === 'target-spend' || stage.id === 'target-mva') &&
                  typeof referenceValue === 'number';
                // For first bucket: baseline = 204, target = 185 — show clearly in tooltip
                const baselineValue = isTargetBucket
                  ? stage.value
                  : stage.id === 'target-spend' && typeof referenceValue === 'number'
                    ? referenceValue
                    : isBaseline
                      ? stage.value
                      : referenceValue;
                const targetValue = isTargetBucket ? referenceValue : undefined;

                return (
                  <div className='rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg'>
                    <p className='font-semibold text-gray-900'>{stage.label}</p>
                    {isTargetBucket && typeof baselineValue === 'number' && typeof targetValue === 'number' ? (
                      <>
                        <p className='mt-1'>
                          Target: {formatAmountM(targetValue)} {currencyLabel}
                        </p>
                        <p className='mt-1 text-[11px] text-gray-600'>
                          Baseline: {formatAmountM(baselineValue)} {currencyLabel}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className='mt-1'>
                          Value: {delta > 0 ? '+' : ''}
                          {formatAmountM(isBaseline ? stage.value : delta)} {currencyLabel}
                        </p>
                        {typeof baselineValue === 'number' && !isTargetBucket && (
                          <p className='mt-1 text-[11px] text-gray-600'>
                            Baseline spend: {formatAmountM(baselineValue)} {currencyLabel}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
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
              shape={(props: unknown) => (
                <BrokenBarShape
                  {...(props as Record<string, unknown>)}
                  brokenAxis={brokenAxis ?? undefined}
                />
              )}
            >
              <LabelList
                dataKey='delta'
                position='top'
                content={(props) => {
                  const { x, y, width, value, index } = props as {
                    x?: number;
                    y?: number;
                    width?: number;
                    value?: number;
                    index?: number;
                  };
                  if (x === undefined || y === undefined || width === undefined || index === undefined) return null;

                  const stage = stages[index];
                  const refVal =
                    typeof stage.referenceValue === 'number'
                      ? stage.referenceValue
                      : undefined;
                  const isTargetFirstBar =
                    (stage.id === 'target-spend' || stage.id === 'target-mva') &&
                    refVal !== undefined;
                  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                  const displayValue = isTargetFirstBar
                    ? formatAxisValue(stage.value)
                    : formatAxisValue(numericValue);

                  // Baseline value (e.g. 204) in grey on top of bucket; target (185) is black in light grey area
                  const labelColor =
                    isTargetFirstBar
                      ? '#9ca3af'
                      : stage.type === 'baseline' || stage.type === 'neutral'
                      ? '#9ca3af'
                      : stage.type === 'positive'
                      ? '#22c55e'
                      : '#ef4444';

                  return (
                    <text
                      x={x + (width ?? 0) / 2}
                      y={(y ?? 0) - 8}
                      textAnchor='middle'
                      fill={labelColor}
                      fontSize={isTargetFirstBar ? 10 : 11}
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
        {customGroupings.length > 0 && (
          <svg
            className='absolute inset-0 pointer-events-none'
            viewBox={`0 0 ${chartSize.width} ${chartSize.height}`}
            preserveAspectRatio='none'>
            {customGroupings.map((group) => (
              <g key={group.label}>
                <line
                  x1={group.left}
                  y1={group.groupY}
                  x2={group.right}
                  y2={group.groupY}
                  stroke='#4b5563'
                  strokeWidth={2}
                />
                <line
                  x1={group.left}
                  y1={group.groupY}
                  x2={group.left}
                  y2={group.groupY - 8}
                  stroke='#4b5563'
                  strokeWidth={2}
                />
                <line
                  x1={group.right}
                  y1={group.groupY}
                  x2={group.right}
                  y2={group.groupY - 8}
                  stroke='#4b5563'
                  strokeWidth={2}
                />
                <text
                  x={(group.left + group.right) / 2}
                  y={group.labelY}
                  textAnchor='middle'
                  fontSize={12}
                  fontWeight={700}
                  fill='#374151'>
                  {group.label}
                </text>
              </g>
            ))}
          </svg>
        )}
        {customGroupings.length === 0 && initiativeGrouping && (
          <svg
            className='absolute inset-0 pointer-events-none'
            viewBox={`0 0 ${chartSize.width} ${chartSize.height}`}
            preserveAspectRatio='none'>
            <line
              x1={initiativeGrouping.left}
              y1={initiativeGrouping.groupY}
              x2={initiativeGrouping.right}
              y2={initiativeGrouping.groupY}
              stroke='#4b5563'
              strokeWidth={2}
            />
            <line
              x1={initiativeGrouping.left}
              y1={initiativeGrouping.groupY}
              x2={initiativeGrouping.left}
              y2={initiativeGrouping.groupY - 8}
              stroke='#4b5563'
              strokeWidth={2}
            />
            <line
              x1={initiativeGrouping.right}
              y1={initiativeGrouping.groupY}
              x2={initiativeGrouping.right}
              y2={initiativeGrouping.groupY - 8}
              stroke='#4b5563'
              strokeWidth={2}
            />
            <text
              x={(initiativeGrouping.left + initiativeGrouping.right) / 2}
              y={initiativeGrouping.labelY}
              textAnchor='middle'
              fontSize={12}
              fontWeight={700}
              fill='#374151'>
              Controllable (initiative performance)
            </text>
          </svg>
        )}
      </div>
      {footerContent && <div className='mt-3'>{footerContent}</div>}
    </div>
  );
}
