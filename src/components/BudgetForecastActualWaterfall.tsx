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
  highlightedStageColor?: string; // Custom color for highlighted stage bar
  colorByDelta?: boolean;
  hideLegend?: boolean;
  tooltipContent?: (stage: BudgetForecastStage) => ReactNode | null;
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
  tooltipContent,
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
    if (onStageClick) {
      onStageClick(stage);
      return;
    }
    if (stage.isClickable && stage.navigationTarget) {
      navigate(stage.navigationTarget);
    }
  };

  // Get fill color based on stage type
  const getFillColor = (stage: BudgetForecastStage): string => {
    // Use custom color for highlighted stage if provided
    if (highlightedStageColor && highlightedStage === stage.stage) {
      return highlightedStageColor;
    }
    // Always use green/red/gray based on stage type, even for highlighted
    if (stage.type === 'baseline') {
      return '#6b7280'; // gray-500 for baseline/absolute bars
    }
    if (stage.type === 'preliminary') {
      return '#ffffff'; // white fill for preliminary bars
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
        {!hideLegend && (
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-opportunity-500'></div>
              <span className='text-sm text-gray-700'>Favourable</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-risk-500'></div>
              <span className='text-sm text-gray-700'>Adverse</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded border border-gray-900 bg-white'></div>
              <span className='text-sm text-gray-700'>Preliminary</span>
            </div>
          </div>
        )}
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
              height={140}
              tick={(props) => {
                const { x, y, payload } = props;
                const stage = stages.find((s) => s.label === payload.value);
                const isClickable = stage?.isClickable ?? false;
                const isHighlightedLabel =
                  highlightedStage && stage?.stage === highlightedStage;
                const groupLabel =
                  stage?.stage === 'l3-vs-target' ||
                  stage?.stage === 'l4-vs-planned'
                    ? 'Initiative performance'
                    : undefined;
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor='end'
                    transform={`rotate(-15, ${x}, ${y})`}
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
                    </tspan>
                    {groupLabel && (
                      <tspan x={x} dy={12} fontSize={10} fill='#6b7280'>
                        {groupLabel}
                      </tspan>
                    )}
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
                };
                if (!payload) {
                  return null;
                }
                const stage =
                  stages.find((item) => item.stage === payload.stage) ?? payload;
                const cumulative = payload.cumulativeValue ?? stage.value;
                const delta = payload.delta ?? stage.delta ?? stage.value;
                const isClickable = payload.isClickable ?? stage.isClickable;
                const customContent = tooltipContent?.(stage);

                return (
                  <div className='rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg'>
                    <p className='font-semibold text-gray-900'>{stage.label}</p>
                    {customContent ? (
                      <div className='mt-2'>{customContent}</div>
                    ) : (
                      <>
                        <p className='mt-1'>Value: ${cumulative.toFixed(1)}M</p>
                        {delta !== cumulative && (
                          <p>
                            Change: {delta > 0 ? '+' : ''}
                            ${delta.toFixed(1)}M
                          </p>
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
            {/* Actual value bars */}
            <Bar
              dataKey='barValue'
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
                  const barHeight = height ?? 0;
                  const barY = y ?? 0;
                  
                  // Minimum bar height to fit text inside (in pixels)
                  const minHeightForInside = 12;
                  const canFitInside = barHeight >= minHeightForInside;
                  
                  // Baseline bars: show label inside if it fits, otherwise above
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
                    // Dynamic offset for baseline labels above bar
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
                  
                  // Calculate label position - always center it in the bar
                  const insideLabelY = barY + barHeight / 2 + 4;
                  
                  // Calculate outside position (above bar for all delta bars)
                  // Dynamic offset: base offset (14px for text) + extra clearance for short bars
                  const baseOffset = 14;
                  const extraClearance = Math.max(0, 10 - barHeight); // Add more offset for very short bars
                  const outsideLabelY = barY - baseOffset - extraClearance;
                  
                  // Determine if label should be inside or outside
                  // If bar is tall enough, put label inside with white text
                  // Otherwise, put label outside with colored text
                  if (canFitInside) {
                    const insideColor =
                      stage?.type === 'preliminary' ? '#111827' : 'white';
                    // Label inside bar - default to white text for contrast
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
                  
                  // Label outside bar - use colored text matching bar type
                  const labelColor =
                    stage?.type === 'preliminary'
                      ? '#111827'
                      : stage?.type === 'positive'
                      ? '#059669'
                      : '#dc2626';
                  return (
                    <text
                      x={x + (width ?? 0) / 2}
                      y={outsideLabelY}
                      textAnchor='middle'
                      fill={labelColor}
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
                // Use a darker shade of the fill color for stroke instead of blue
                const getDarkerColor = () => {
                  if (stage.type === 'baseline') return '#4b5563'; // darker gray
                  if (stage.type === 'preliminary') return '#111827'; // gray-900
                  return stage.type === 'positive' ? '#059669' : '#dc2626'; // darker green or red
                };
                const strokeColor =
                  stage.type === 'preliminary'
                    ? '#111827'
                    : stage.isClickable || onStageClick
                    ? getDarkerColor()
                    : 'none';
                // Shadow color matches the bar type
                const shadowColor = stage.type === 'positive' 
                  ? 'rgba(16, 185, 129, 0.5)' // green shadow
                  : stage.type === 'negative'
                    ? 'rgba(239, 68, 68, 0.5)' // red shadow
                    : 'rgba(107, 114, 128, 0.5)'; // gray shadow

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={
                      highlighted
                        ? 4
                        : stage.type === 'preliminary'
                        ? 2
                        : stage.isClickable
                        ? 2
                        : 0
                    }
                    strokeDasharray={stage.type === 'preliminary' ? '4 2' : undefined}
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
