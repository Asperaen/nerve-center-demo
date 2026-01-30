import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import { useCurrency } from '../contexts/CurrencyContext';
import type { BudgetForecastStage } from '../types';
import { calculateBrokenAxis, type BrokenAxisConfig } from '../utils/brokenAxisUtils';

interface BudgetForecastActualWaterfallProps {
  stages: BudgetForecastStage[];
  title?: string;
  subtitle?: ReactNode;
  onStageClick?: (stage: BudgetForecastStage) => void;
  highlightedStage?: string; // Stage ID to highlight (e.g., 'market-performance')
  highlightedStageColor?: string; // Custom color for highlighted stage bar
  colorByDelta?: boolean;
  hideLegend?: boolean;
  showPreliminaryLegend?: boolean;
  tooltipContent?: (stage: BudgetForecastStage) => ReactNode | null;
  /** Explicit broken axis config, or 'auto' to calculate dynamically, or undefined to disable */
  brokenAxis?: BrokenAxisConfig | 'auto';
  labelDefinitions?: Record<string, string>;
  splitNonPrimaryBars?: boolean;
}

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

  const actualValue = value > skipRangeStart ? value + skipAmount : value;
  const isFirstTickAboveBreak = value > skipRangeStart && index !== undefined && index > 0;
  const shouldShowBreak = isFirstTickAboveBreak && value <= skipRangeStart + 300;

  const displayValue = formatValue
    ? formatValue(actualValue)
    : actualValue.toFixed(0);

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor='end' fill='#666' fontSize={12}>
        {displayValue}
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
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  payload?: { type?: string };
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
  const breakIndicatorHeight = 10;

  if (!isBaseline) {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        rx={2}
        ry={2}
      />
    );
  }

  const breakY = y + height - breakIndicatorHeight - 4;
  const gapHeight = breakIndicatorHeight + 4;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height - breakIndicatorHeight - 6}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        rx={2}
        ry={2}
      />
      <rect x={x - 1} y={breakY - 2} width={width + 2} height={gapHeight} fill='white' />
      <line x1={x} y1={breakY - 1} x2={x + width} y2={breakY - 1} stroke='#4b5563' strokeWidth={3} />
      <line x1={x} y1={breakY + gapHeight - 3} x2={x + width} y2={breakY + gapHeight - 3} stroke='#4b5563' strokeWidth={3} />
      <rect
        x={x}
        y={breakY + breakIndicatorHeight}
        width={width}
        height={4}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        rx={2}
        ry={2}
      />
    </g>
  );
};

export default function BudgetForecastActualWaterfall({
  stages,
  title = 'Budget Forecast Actual Waterfall',
  subtitle,
  onStageClick,
  highlightedStage,
  highlightedStageColor,
  colorByDelta = false,
  hideLegend = false,
  showPreliminaryLegend = true,
  tooltipContent,
  brokenAxis: brokenAxisProp = 'auto',
  labelDefinitions,
  splitNonPrimaryBars = false,
}: BudgetForecastActualWaterfallProps) {
  const navigate = useNavigate();
  const { formatAmount, currencyLabel } = useCurrency();
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [definitionTooltip, setDefinitionTooltip] = useState<{
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
  const formatLabelValue = (value: number) =>
    formatAmount(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const showDefinitionTooltip = (
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
    const tooltipWidth = 280;
    const tooltipHeight = 120;
    const left = Math.min(
      Math.max(x + 12, 8),
      Math.max(8, rect.width - tooltipWidth - 8)
    );
    const top = Math.min(
      Math.max(y - 12, 8),
      Math.max(8, rect.height - tooltipHeight - 8)
    );
    setDefinitionTooltip({ text, left, top });
  };

  const hideDefinitionTooltip = () => {
    setDefinitionTooltip(null);
  };

  // Calculate effective broken axis config (auto-detect or use provided)
  const brokenAxis = useMemo(() => {
    if (brokenAxisProp === 'auto') {
      const result = calculateBrokenAxis(stages);
      return result.brokenAxis;
    }
    return brokenAxisProp;
  }, [brokenAxisProp, stages]);

  const isPrimaryStage = (stage: BudgetForecastStage) =>
    stage.stage === 'budget' ||
    stage.stage === 'forecast' ||
    stage.stage === 'forecast-with-early';

  // Prepare chart data for waterfall visualization
  const chartData = useMemo(() => {
    return stages.map((stage, index) => {
      const isAbsolute = stage.type === 'baseline';
      const prevValue = index > 0 ? stages[index - 1].value : 0;
      const delta = stage.delta ?? 0;
      const signedBarValue = isAbsolute ? stage.value : delta;

      let baselineValue: number;
      let barValueTotal: number;

      if (brokenAxis) {
        const { skipRangeStart, skipRangeEnd } = brokenAxis;
        const skipAmount = skipRangeEnd - skipRangeStart;
        const transformValue = (v: number) =>
          v > skipRangeEnd ? v - skipAmount : v > skipRangeStart ? skipRangeStart : v;

        if (isAbsolute) {
          baselineValue = 0;
          barValueTotal = transformValue(stage.value);
        } else {
          const transformedPrev = transformValue(prevValue);
          const transformedCurrent = transformValue(stage.value);
          if (delta < 0) {
            baselineValue = transformedCurrent;
            barValueTotal = Math.abs(delta);
          } else {
            baselineValue = transformedPrev;
            barValueTotal = delta;
          }
        }
      } else {
        baselineValue = isAbsolute ? 0 : prevValue;
        barValueTotal = signedBarValue;
      }

      const totalMagnitude = Math.abs(barValueTotal);
      const isEarlySignals = stage.stage === 'early-signals';
      const shouldSplit =
        splitNonPrimaryBars &&
        !isAbsolute &&
        !isPrimaryStage(stage) &&
        !isEarlySignals;
      const forecastRatio =
        typeof stage.forecastSplit === 'number' ? stage.forecastSplit : 0.5;
      const splitBase = brokenAxis ? totalMagnitude : barValueTotal;
      const splitSign = splitBase >= 0 ? 1 : -1;
      const splitMagnitude = Math.abs(splitBase);
      const minSegment = Math.min(0.1, splitMagnitude / 2);
      const baseForecast = splitMagnitude * forecastRatio;
      let forecastMagnitude = baseForecast;
      let realizedMagnitude = splitMagnitude - forecastMagnitude;
      if (shouldSplit && splitMagnitude > 0) {
        if (forecastMagnitude < minSegment) {
          forecastMagnitude = minSegment;
          realizedMagnitude = splitMagnitude - forecastMagnitude;
        }
        if (realizedMagnitude < minSegment) {
          realizedMagnitude = minSegment;
          forecastMagnitude = splitMagnitude - realizedMagnitude;
        }
      }
      const barValueForecast = shouldSplit
        ? Math.round(forecastMagnitude * splitSign * 100) / 100
        : 0;
      const barValueRealized = shouldSplit
        ? Math.round(realizedMagnitude * splitSign * 100) / 100
        : splitBase;
      const barValueForecastPos = barValueForecast >= 0 ? barValueForecast : 0;
      const barValueForecastNeg = barValueForecast < 0 ? barValueForecast : 0;
      const barValueRealizedPos = barValueRealized >= 0 ? barValueRealized : 0;
      const barValueRealizedNeg = barValueRealized < 0 ? barValueRealized : 0;

      return {
        ...stage,
        name: stage.label,
        cumulativeValue: stage.value,
        delta: stage.delta ?? stage.value,
        baselineValue,
        barValueTotal: splitBase,
        barValueForecast,
        barValueRealized,
        barValueForecastPos,
        barValueForecastNeg,
        barValueRealizedPos,
        barValueRealizedNeg,
        isPositive: (stage.delta ?? stage.value) >= 0,
      };
    });
  }, [stages, brokenAxis, splitNonPrimaryBars]);

  const handleBarClick = (stage: BudgetForecastStage) => {
    if (onStageClick) {
      onStageClick(stage);
      return;
    }
    if (stage.isClickable && stage.navigationTarget) {
      navigate(stage.navigationTarget);
    }
  };

  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
  const [axisLabelBottom, setAxisLabelBottom] = useState(0);

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
  }, [chartData.length, chartSize.height, chartSize.width]);

  const initiativeGrouping = useMemo(() => {
    if (
      !chartData.length ||
      chartSize.width === 0 ||
      chartSize.height === 0 ||
      axisLabelBottom === 0
    ) {
      return null;
    }
    const indexMap = new Map<string, number>();
    chartData.forEach((item, index) => {
      indexMap.set(item.stage, index);
    });
    const indices = [
      indexMap.get('l3-vs-target'),
      indexMap.get('l4-vs-planned'),
      indexMap.get('l4-to-l5-leakage'),
    ];
    if (indices.some((value) => value === undefined)) {
      return null;
    }
    const resolvedIndices = indices as number[];
    const minIndex = Math.min(...resolvedIndices);
    const maxIndex = Math.max(...resolvedIndices);
    const margin = { left: 16, right: 16, bottom: 24 };
    const availableWidth = Math.max(1, chartSize.width - margin.left - margin.right);
    const step = availableWidth / chartData.length;
    const left = margin.left + (minIndex + 0.5) * step;
    const right = margin.left + (maxIndex + 0.5) * step;
    const groupY = Math.min(
      chartSize.height - 20,
      Math.max(8, axisLabelBottom + 40)
    );
    const labelY = Math.min(chartSize.height - 6, groupY + 14);
    return { left, right, groupY, labelY };
  }, [axisLabelBottom, chartData, chartSize.height, chartSize.width]);

  const getSegmentFillColor = (
    stage: BudgetForecastStage,
    segment: 'forecast' | 'realized'
  ): string => {
    const isEarlySignals = stage.stage === 'early-signals';
    const isPrimary = isPrimaryStage(stage);
    // Use custom color for highlighted stage if provided
    if (highlightedStageColor && highlightedStage === stage.stage) {
      return highlightedStageColor;
    }
    if (isEarlySignals) {
      return 'transparent';
    }
    // Always use gray for primary/baseline bars
    if (stage.type === 'baseline' || isPrimary) {
      return '#6b7280'; // gray-500 for baseline/absolute bars
    }
    const isFavorable = colorByDelta
      ? (stage.delta ?? stage.value) >= 0
      : stage.type === 'positive';
    if (isFavorable) {
      return segment === 'forecast' ? '#bbf7d0' : '#16a34a';
    }
    return segment === 'forecast' ? '#fecaca' : '#dc2626';
  };

  const getLegacyFillColor = (stage: BudgetForecastStage): string => {
    if (highlightedStageColor && highlightedStage === stage.stage) {
      return highlightedStageColor;
    }
    if (stage.stage === 'early-signals') {
      return 'transparent';
    }
    if (stage.type === 'baseline' || isPrimaryStage(stage)) {
      return '#6b7280';
    }
    const isFavorable = colorByDelta
      ? (stage.delta ?? stage.value) >= 0
      : stage.type === 'positive';
    return isFavorable ? '#10b981' : '#ef4444';
  };

  const getSegmentStrokeColor = (stage: BudgetForecastStage): string => {
    const isEarlySignals = stage.stage === 'early-signals';
    const isPrimary = isPrimaryStage(stage);
    if (stage.type === 'baseline' || isPrimary) {
      return '#4b5563';
    }
    if (isEarlySignals) {
      return '#111827';
    }
    const isFavorable = colorByDelta
      ? (stage.delta ?? stage.value) >= 0
      : stage.type === 'positive';
    return isFavorable ? '#166534' : '#991b1b';
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
        {!hideLegend && (
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-opportunity-500'></div>
              <span className='text-sm text-gray-700'>Positive Impact</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-risk-500'></div>
              <span className='text-sm text-gray-700'>Negative Impact</span>
            </div>
            {showPreliminaryLegend && (
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded border border-gray-900 bg-white'></div>
                <span className='text-sm text-gray-700'>Preliminary</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className='h-96 relative' ref={chartContainerRef}>
        {definitionTooltip && (
          <div
            className='absolute z-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-lg'
            style={{
              left: definitionTooltip.left,
              top: definitionTooltip.top,
              width: 280,
            }}>
            {definitionTooltip.text}
          </div>
        )}
        <ResponsiveContainer
          width='100%'
          height='100%'>
          <ComposedChart
            data={chartData}
            margin={{ top: 32, right: 16, left: 16, bottom: 24 }}>
            <defs>
              <linearGradient id='favorableGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#bbf7d0' />
                <stop offset='100%' stopColor='#16a34a' />
              </linearGradient>
              <linearGradient id='adverseGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#fecaca' />
                <stop offset='100%' stopColor='#dc2626' />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' />
              <XAxis
              dataKey='label'
              angle={-15}
              textAnchor='end'
              height={140}
              tick={(props) => {
                const { x, y, payload } = props;
                const stage = stages.find((s) => s.label === payload.value);
                const isClickable = stage?.isClickable ?? false;
                const isHighlightedLabel =
                  highlightedStage && stage?.stage === highlightedStage;
                  const definition =
                    stage?.stage && labelDefinitions
                      ? labelDefinitions[stage.stage]
                      : undefined;
                return (
                    <g
                      transform={`rotate(-15, ${x}, ${y})`}
                      style={{
                        pointerEvents: 'all',
                        cursor: definition ? 'help' : 'default',
                      }}
                      onMouseEnter={(event) => {
                        if (definition) {
                          showDefinitionTooltip(event, definition);
                        }
                      }}
                      onMouseLeave={hideDefinitionTooltip}>
                      <text
                        x={x}
                        y={y}
                        textAnchor='end'
                        style={{
                          fontSize: isHighlightedLabel ? '13px' : '11px',
                          fill: isHighlightedLabel
                            ? '#111827'
                            : isClickable
                            ? '#1f2937'
                            : '#374151',
                          fontWeight: isHighlightedLabel
                            ? '800'
                            : isClickable
                            ? 'bold'
                            : 'normal',
                          cursor: isClickable ? 'pointer' : 'default',
                        }}>
                        <tspan x={x} dy={0}>
                          {payload.value}
                          {isHighlightedLabel && ' ★'}
                          {definition && <title>{definition}</title>}
                        </tspan>
                      </text>
                      {definition && (
                        <>
                          <circle
                            cx={(x ?? 0)}
                            cy={(y ?? 0) + 14}
                            r={6}
                            fill='#e5e7eb'
                            stroke='#6b7280'
                            strokeWidth={1}
                            style={{ cursor: 'help' }}>
                          </circle>
                          <text
                            x={(x ?? 0)}
                            y={(y ?? 0) + 17}
                            textAnchor='middle'
                            fontSize={9}
                            fontWeight={700}
                            fill='#374151'
                            style={{ cursor: 'help' }}>
                            i
                          </text>
                        </>
                      )}
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
                domain={[
                  0,
                  Math.max(...stages.map((s) => s.value)) -
                    brokenAxis.skipRangeEnd +
                    50,
                ]}
                label={{
                  value: `Value (M ${currencyLabel})`,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: '12px' },
                }}
              />
            ) : (
              <YAxis
                tickFormatter={formatAxisValue}
                style={{ fontSize: '12px' }}
                label={{
                  value: `Value (M ${currencyLabel})`,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: '12px' },
                }}
              />
            )}
            <Tooltip
              wrapperStyle={{ pointerEvents: 'none' }}
              content={(props) => {
                if (!props.active || !props.payload || props.payload.length === 0) {
                  return null;
                }
                const payload = props.payload[0]
                  ?.payload as BudgetForecastStage & {
                  cumulativeValue?: number;
                  delta?: number;
                  isClickable?: boolean;
                  barValueForecast?: number;
                  barValueRealized?: number;
                };
                if (!payload) {
                  return null;
                }
                const stage =
                  stages.find((item) => item.stage === payload.stage) ?? payload;
                const delta = payload.delta ?? stage.delta ?? stage.value;
                const bucketValue =
                  stage.type === 'baseline' ? stage.value : delta;
                const isClickable = payload.isClickable ?? stage.isClickable;
                const isPrimary =
                  stage.stage === 'budget' ||
                  stage.stage === 'forecast' ||
                  stage.stage === 'forecast-with-early';
                const isEarlySignals = stage.stage === 'early-signals';
                const shouldShowSplit =
                  splitNonPrimaryBars && !isPrimary && !isEarlySignals && stage.type !== 'baseline';
                const customContent = tooltipContent?.(stage);

                return (
                  <div className='rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg'>
                    <p className='font-semibold text-gray-900'>{stage.label}</p>
                    {customContent ? (
                      <div className='mt-2'>{customContent}</div>
                    ) : (
                      <>
                        <p className='mt-1'>
                          Value: {bucketValue > 0 ? '+' : ''}
                          {formatAmountM(bucketValue)} {currencyLabel}
                        </p>
                        {shouldShowSplit && (
                          <div className='mt-1 text-[11px] text-gray-600'>
                            <div>
                              Forecast: {formatAmountM(Math.abs(payload.barValueForecast ?? 0))}{' '}
                              {currencyLabel}
                            </div>
                            <div>
                              Realized: {formatAmountM(Math.abs(payload.barValueRealized ?? 0))}{' '}
                              {currencyLabel}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {isClickable && (
                      <p className='mt-2 text-[11px] text-gray-500'>
                        {onStageClick ? 'Click for details →' : 'Click to navigate →'}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            {/* Baseline transparent spacer bar */}
            <Bar
              dataKey='baselineValue'
              stackId='a'
              fill='transparent'
              fillOpacity={0}
              style={{ pointerEvents: 'none' }}
            />
            {splitNonPrimaryBars ? (
              <>
                {/* Forecast portion of delta (top) */}
                <Bar
                  dataKey='barValueForecast'
                  stackId='a'
                  name='Forecast portion'
                  onClick={(data) => {
                    const payload = (data as { payload?: BudgetForecastStage }).payload;
                    if (payload) {
                      handleBarClick(payload);
                    }
                  }}
                  shape={
                    brokenAxis
                      ? (props: unknown) => (
                          <BrokenBarShape
                            {...(props as Record<string, unknown>)}
                            brokenAxis={brokenAxis}
                          />
                        )
                      : undefined
                  }
                >
                  {stages.map((stage, index) => {
                    const highlighted = isHighlighted(stage);
                    const strokeColor =
                      stage.isClickable || onStageClick
                        ? getSegmentStrokeColor(stage)
                        : 'none';
                    const shadowColor =
                      stage.type === 'positive'
                        ? 'rgba(22, 163, 74, 0.4)'
                        : stage.type === 'negative'
                        ? 'rgba(220, 38, 38, 0.4)'
                        : 'rgba(107, 114, 128, 0.4)';
                    return (
                      <Cell
                        key={`cell-forecast-${index}`}
                        fill={getSegmentFillColor(stage, 'forecast')}
                        stroke={strokeColor}
                        strokeWidth={highlighted ? 3 : stage.isClickable ? 1 : 0}
                        strokeDasharray={
                          stage.stage === 'early-signals' ? '4 2' : undefined
                        }
                        style={{
                          cursor: stage.isClickable || onStageClick ? 'pointer' : 'default',
                          opacity: highlighted || stage.isClickable || onStageClick ? 1 : 0.95,
                          filter: highlighted
                            ? `drop-shadow(0 4px 6px ${shadowColor})`
                            : 'none',
                        }}
                        onClick={() => handleBarClick(stage)}
                      />
                    );
                  })}
                </Bar>
                {/* Realized portion of delta (bottom) */}
                <Bar
                  dataKey='barValueRealized'
                  stackId='a'
                  name='Realized portion'
                  onClick={(data) => {
                    const payload = (data as { payload?: BudgetForecastStage }).payload;
                    if (payload) {
                      handleBarClick(payload);
                    }
                  }}
                  shape={
                    brokenAxis
                      ? (props: unknown) => (
                          <BrokenBarShape
                            {...(props as Record<string, unknown>)}
                            brokenAxis={brokenAxis}
                          />
                        )
                      : undefined
                  }
                >
                  <LabelList
                    dataKey='barValueTotal'
                    position='middle'
                    content={(props) => {
                      const { x, y, width, height, index } = props as {
                        x?: number;
                        y?: number;
                        width?: number;
                        height?: number;
                        index?: number;
                      };
                      if (x === undefined || y === undefined || width === undefined || index === undefined) return null;
                      
                      const stage = stages[index];
                      const isBaseline = stage?.type === 'baseline';
                      const rawValue = isBaseline
                        ? stage?.value ?? 0
                        : stage?.delta ?? stage?.value ?? 0;
                      const displayValue = formatLabelValue(rawValue);
                      const barHeight = height ?? 0;
                      const barY = y ?? 0;
                      
                      const minHeightForInside = 12;
                      const canFitInside = barHeight >= minHeightForInside;
                      
                      if (isBaseline) {
                        if (canFitInside) {
                          return (
                            <text
                              x={x + (width ?? 0) / 2}
                              y={barY + barHeight / 2 + 4}
                              textAnchor='middle'
                              fill='white'
                              fontSize={11}
                              fontWeight='bold'
                            >
                              {displayValue}
                            </text>
                          );
                        }
                        const baselineOffset = 14 + Math.max(0, 10 - barHeight);
                        return (
                          <text
                            x={x + (width ?? 0) / 2}
                            y={barY - baselineOffset}
                            textAnchor='middle'
                            fill='#4b5563'
                            fontSize={11}
                            fontWeight='bold'
                          >
                            {displayValue}
                          </text>
                        );
                      }
                      
                      const insideLabelY = barY + barHeight / 2 + 4;
                      const baseOffset = 14;
                      const extraClearance = Math.max(0, 10 - barHeight);
                      const outsideLabelY = barY - baseOffset - extraClearance;
                      
                      if (canFitInside) {
                        const insideColor =
                          stage?.stage === 'early-signals' ? '#111827' : 'white';
                        return (
                          <text
                            x={x + (width ?? 0) / 2}
                            y={insideLabelY}
                            textAnchor='middle'
                            fill={insideColor}
                            fontSize={11}
                            fontWeight='bold'
                          >
                            {displayValue}
                          </text>
                        );
                      }
                      
                      const outsideColor =
                        stage?.stage === 'early-signals'
                          ? '#6b7280'
                          : stage?.type === 'positive'
                          ? '#166534'
                          : stage?.type === 'negative'
                          ? '#991b1b'
                          : '#4b5563';
                      return (
                        <text
                          x={x + (width ?? 0) / 2}
                          y={outsideLabelY}
                          textAnchor='middle'
                          fill={outsideColor}
                          fontSize={11}
                          fontWeight='bold'
                        >
                          {displayValue}
                        </text>
                      );
                    }}
                  />
                  {stages.map((stage, index) => {
                    const highlighted = isHighlighted(stage);
                    const strokeColor =
                      stage.isClickable || onStageClick
                        ? getSegmentStrokeColor(stage)
                        : 'none';
                    const shadowColor =
                      stage.type === 'positive'
                        ? 'rgba(22, 163, 74, 0.5)'
                        : stage.type === 'negative'
                        ? 'rgba(220, 38, 38, 0.5)'
                        : 'rgba(107, 114, 128, 0.5)';
                    return (
                      <Cell
                        key={`cell-realized-${index}`}
                        fill={getSegmentFillColor(stage, 'realized')}
                        stroke={strokeColor}
                        strokeWidth={highlighted ? 3 : stage.isClickable ? 1 : 0}
                        strokeDasharray={
                          stage.stage === 'early-signals' ? '4 2' : undefined
                        }
                        style={{
                          cursor: stage.isClickable || onStageClick ? 'pointer' : 'default',
                          opacity: highlighted || stage.isClickable || onStageClick ? 1 : 0.95,
                          filter: highlighted
                            ? `drop-shadow(0 4px 6px ${shadowColor})`
                            : 'none',
                        }}
                        onClick={() => handleBarClick(stage)}
                      />
                    );
                  })}
                </Bar>
              </>
            ) : (
              <Bar
                dataKey='barValueTotal'
                stackId='a'
                name='Budget Forecast Actual'
                onClick={(data) => {
                  const payload = (data as { payload?: BudgetForecastStage }).payload;
                  if (payload) {
                    handleBarClick(payload);
                  }
                }}
                shape={
                  brokenAxis
                    ? (props: unknown) => (
                        <BrokenBarShape
                          {...(props as Record<string, unknown>)}
                          brokenAxis={brokenAxis}
                        />
                      )
                    : undefined
                }
              >
                <LabelList
                  dataKey='barValueTotal'
                  position='middle'
                  content={(props) => {
                    const { x, y, width, height, index } = props as {
                      x?: number;
                      y?: number;
                      width?: number;
                      height?: number;
                      index?: number;
                    };
                    if (x === undefined || y === undefined || width === undefined || index === undefined) return null;
                    
                    const stage = stages[index];
                    const isBaseline = stage?.type === 'baseline';
                    const rawValue = isBaseline
                      ? stage?.value ?? 0
                      : stage?.delta ?? stage?.value ?? 0;
                    const displayValue = formatLabelValue(rawValue);
                    const barHeight = height ?? 0;
                    const barY = y ?? 0;
                    
                    const minHeightForInside = 12;
                    const canFitInside = barHeight >= minHeightForInside;
                    
                    if (isBaseline) {
                      if (canFitInside) {
                        return (
                          <text
                            x={x + (width ?? 0) / 2}
                            y={barY + barHeight / 2 + 4}
                            textAnchor='middle'
                            fill='white'
                            fontSize={11}
                            fontWeight='bold'
                          >
                            {displayValue}
                          </text>
                        );
                      }
                      const baselineOffset = 14 + Math.max(0, 10 - barHeight);
                      return (
                        <text
                          x={x + (width ?? 0) / 2}
                          y={barY - baselineOffset}
                          textAnchor='middle'
                          fill='#4b5563'
                          fontSize={11}
                          fontWeight='bold'
                        >
                          {displayValue}
                        </text>
                      );
                    }
                    
                    const insideLabelY = barY + barHeight / 2 + 4;
                    const baseOffset = 14;
                    const extraClearance = Math.max(0, 10 - barHeight);
                    const outsideLabelY = barY - baseOffset - extraClearance;
                    
                    if (canFitInside) {
                      const insideColor =
                        stage?.stage === 'early-signals' ? '#111827' : 'white';
                      return (
                        <text
                          x={x + (width ?? 0) / 2}
                          y={insideLabelY}
                          textAnchor='middle'
                          fill={insideColor}
                          fontSize={11}
                          fontWeight='bold'
                        >
                          {displayValue}
                        </text>
                      );
                    }
                    
                    const outsideColor =
                      stage?.stage === 'early-signals'
                        ? '#6b7280'
                        : stage?.type === 'positive'
                        ? '#059669'
                        : stage?.type === 'negative'
                        ? '#dc2626'
                        : '#4b5563';
                    return (
                      <text
                        x={x + (width ?? 0) / 2}
                        y={outsideLabelY}
                        textAnchor='middle'
                        fill={outsideColor}
                        fontSize={11}
                        fontWeight='bold'
                      >
                        {displayValue}
                      </text>
                    );
                  }}
                />
                {stages.map((stage, index) => {
                  const fillColor = getLegacyFillColor(stage);
                  const highlighted = isHighlighted(stage);
                  const getDarkerColor = () => {
                    if (stage.type === 'baseline') return '#4b5563';
                    if (stage.stage === 'early-signals') return '#111827';
                    return stage.type === 'positive' ? '#059669' : '#dc2626';
                  };
                  const strokeColor =
                    stage.stage === 'early-signals'
                      ? '#111827'
                      : stage.isClickable || onStageClick
                      ? getDarkerColor()
                      : 'none';
                  const shadowColor =
                    stage.type === 'positive'
                      ? 'rgba(16, 185, 129, 0.5)'
                      : stage.type === 'negative'
                      ? 'rgba(239, 68, 68, 0.5)'
                      : 'rgba(107, 114, 128, 0.5)';

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={
                        highlighted
                          ? 4
                          : stage.stage === 'early-signals'
                          ? 2
                          : stage.isClickable
                          ? 2
                          : 0
                      }
                      strokeDasharray={
                        stage.stage === 'early-signals' ? '4 2' : undefined
                      }
                      style={{
                        cursor: stage.isClickable || onStageClick ? 'pointer' : 'default',
                        opacity:
                          highlighted || stage.isClickable || onStageClick ? 1 : 0.9,
                        filter: highlighted
                          ? `drop-shadow(0 4px 6px ${shadowColor})`
                          : 'none',
                      }}
                      onClick={() => handleBarClick(stage)}
                      onMouseEnter={(e) => {
                        if (stage.isClickable && !highlighted) {
                          (e.currentTarget as SVGElement).style.opacity = '0.8';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (stage.isClickable && !highlighted) {
                          (e.currentTarget as SVGElement).style.opacity = '1';
                        }
                      }}
                    />
                  );
                })}
              </Bar>
            )}
          </ComposedChart>
        </ResponsiveContainer>
        {initiativeGrouping && (
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
              y2={initiativeGrouping.groupY + 8}
              stroke='#4b5563'
              strokeWidth={2}
            />
            <line
              x1={initiativeGrouping.right}
              y1={initiativeGrouping.groupY}
              x2={initiativeGrouping.right}
              y2={initiativeGrouping.groupY + 8}
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
              Initiative performance
            </text>
          </svg>
        )}
      </div>
    </div>
  );
}
