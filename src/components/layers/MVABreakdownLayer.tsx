import { useMemo } from 'react';
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Legend,
  LabelList,
} from 'recharts';
import {
  mockMVABreakdownStages,
  mockMVABreakdownKeyCallOut,
} from '../../data/mockForecast';
import type { BreadcrumbItem } from '../../types';
import type { BrokenAxisConfig } from '../../utils/brokenAxisUtils';

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

interface MVABreakdownLayerProps {
  breadcrumbs: BreadcrumbItem[];
  onBack: () => void;
}

export default function MVABreakdownLayer({
  breadcrumbs,
  onBack,
}: MVABreakdownLayerProps) {
  const orderedStages = useMemo(() => {
    const order = [
      'budget-mva-cost',
      'vol-mix-variance',
      'dl-hourly-rate-impact',
      'dl-efficiency-gap',
      'idl-efficiency-gap',
      'variable-moh-efficiency-gap',
      'fixed-moh-efficiency-gap',
      'fix-impact',
      'actual-mva-cost',
    ];
    const orderIndex = new Map(order.map((id, index) => [id, index]));
    return [...mockMVABreakdownStages].sort(
      (a, b) =>
        (orderIndex.get(a.stage) ?? Number.MAX_SAFE_INTEGER) -
        (orderIndex.get(b.stage) ?? Number.MAX_SAFE_INTEGER)
    );
  }, []);

  // Disable broken axis for MVA waterfall to make variance bars visible
  const brokenAxis = useMemo<BrokenAxisConfig | undefined>(() => {
    return undefined;
  }, []);

  // Prepare chart data for MVA Breakdown
  const mvaChartData = useMemo(() => {
    return orderedStages.map((stage, index) => {
      const isBaseline = stage.type === 'baseline';
      const currentValue = stage.value;

      // Use the actual delta from the data
      const delta = stage.delta ?? 0;

      let barValue: number;
      let baselineValue: number;

      if (isBaseline) {
        // Baseline bars show from 0 to their full value
        baselineValue = 0;
        barValue = currentValue;
      } else {
        // Delta bars stack properly to show waterfall effect
        const prevValue = index > 0 ? orderedStages[index - 1].value : 0;

        if (delta < 0) {
          // Negative variances: bar goes down from current position
          baselineValue = currentValue;
          barValue = Math.abs(delta);
        } else {
          // Positive variances: bar goes up from previous position
          baselineValue = prevValue;
          barValue = Math.abs(delta);
        }
      }

      return {
        ...stage,
        name: stage.label,
        label: stage.label,
        cumulativeValue: currentValue,
        delta,
        baselineValue,
        barValue,
        isPositive: delta >= 0,
        originalValue: currentValue,
      };
    });
  }, [orderedStages]);

  return (
    <div className='space-y-6 animate-in slide-in-from-right duration-300'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onBack}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <ArrowLeftIcon className='w-6 h-6 text-gray-600' />
          </button>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>MVA Breakdown</h1>
            <p className='text-sm text-gray-600 mt-1'>
              Pilot Demo with SBU 1 YTM Financials
            </p>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-green-500'></div>
            <span className='text-sm text-gray-700'>Positive Impact</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-red-500'></div>
            <span className='text-sm text-gray-700'>Negative Impact</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <span>NP Deviation</span>
          {breadcrumbs.map((crumb, index) => (
            <div
              key={index}
              className='flex items-center gap-2'>
              <ChevronRightIcon className='w-4 h-4' />
              <button
                onClick={crumb.onClick}
                className='hover:text-gray-900 transition-colors'>
                {crumb.label}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Waterfall Chart */}
      <div className='lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-lg p-8'>
        <div className='h-96'>
          <ResponsiveContainer
            width='100%'
            height='100%'>
            <ComposedChart data={mvaChartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='label'
                angle={-15}
                textAnchor='end'
                height={120}
                style={{ fontSize: '12px' }}
              />
              {brokenAxis ? (
                <YAxis
                  tick={(props) => <BrokenAxisTick {...props} brokenAxis={brokenAxis} />}
                  domain={[
                    0,
                    Math.max(...orderedStages.map((s) => s.value)) - brokenAxis.skipRangeEnd + 50,
                  ]}
                  label={{
                    value: 'MVA Cost',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '13px' },
                  }}
                />
              ) : (
                <YAxis
                  domain={[
                    Math.min(...orderedStages.map((s) => s.value)) - 100,
                    Math.max(...orderedStages.map((s) => s.value)) + 100,
                  ]}
                  style={{ fontSize: '13px' }}
                  label={{
                    value: 'MVA Cost',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '13px' },
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
                      }
                    | undefined;
                  const numericValue =
                    typeof value === 'number'
                      ? value
                      : Number(Array.isArray(value) ? value[0] : value ?? 0);
                  const cumulative = payload?.cumulativeValue ?? numericValue;
                  const delta = payload?.delta;

                  const tooltipLines: string[] = [
                    `${payload?.label ?? 'Stage'}: ${cumulative.toFixed(1)}`,
                  ];

                  if (delta !== undefined && delta !== cumulative) {
                    tooltipLines.push(
                      `Change: ${delta > 0 ? '+' : ''}${delta.toFixed(1)}`
                    );
                  }

                  return tooltipLines.join('\n');
                }}
              />
              <Legend />
              <Bar
                dataKey='baselineValue'
                stackId='a'
                fill='transparent'
              />
              <Bar
                dataKey='barValue'
                stackId='a'
                name='MVA Breakdown'
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
                    
                    const stage = orderedStages[index];
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
                {orderedStages.map((stage, index) => {
                  const isBaseline = stage.type === 'baseline';
                  const isPositive = stage.type === 'positive';

                  let fillColor = '#3b82f6'; // blue for baseline
                  if (!isBaseline) {
                    fillColor = isPositive ? '#10b981' : '#ef4444'; // green for positive, red for negative
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fillColor}
                    />
                  );
                })}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Call Out Panel */}
      <div className='lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-lg p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-bold text-gray-900'>Key Call Out</h3>
          <span className='px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border-2 border-purple-400 shadow-md shadow-purple-200/50 flex items-center gap-1.5'>
            <span className='text-sm'>✨</span>
            <span>AI</span>
          </span>
        </div>
        <div className='space-y-3'>
          <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
            {mockMVABreakdownKeyCallOut.bulletPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <p className='text-sm text-gray-700 leading-relaxed'>
              {mockMVABreakdownKeyCallOut.rootCauseAnalysis}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
