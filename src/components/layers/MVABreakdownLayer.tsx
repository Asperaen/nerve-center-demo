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
} from 'recharts';
import {
  mockMVABreakdownStages,
  mockMVABreakdownKeyCallOut,
} from '../../data/mockForecast';
import type { BreadcrumbItem } from '../../types';

interface MVABreakdownLayerProps {
  breadcrumbs: BreadcrumbItem[];
  onBack: () => void;
}

export default function MVABreakdownLayer({
  breadcrumbs,
  onBack,
}: MVABreakdownLayerProps) {
  // Prepare chart data for MVA Breakdown
  const mvaChartData = useMemo(() => {
    return mockMVABreakdownStages.map((stage, index) => {
      const prevValue = index > 0 ? mockMVABreakdownStages[index - 1].value : 0;
      const currentValue = stage.value;
      const delta =
        stage.delta ?? (index === 0 ? currentValue : currentValue - prevValue);

      const isBaseline = stage.type === 'baseline';
      const barValue = isBaseline ? currentValue : delta;
      const baselineValue = isBaseline ? 0 : prevValue;

      return {
        ...stage,
        name: stage.label,
        label: stage.label,
        cumulativeValue: currentValue,
        delta,
        baselineValue,
        barValue,
        isPositive: delta >= 0,
      };
    });
  }, []);

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
            <span className='text-sm text-gray-700'>Favourable</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-red-500'></div>
            <span className='text-sm text-gray-700'>Adverse</span>
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
                style={{ fontSize: '11px' }}
              />
              <YAxis
                style={{ fontSize: '12px' }}
                label={{
                  value: 'MVA Cost',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: '12px' },
                }}
              />
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
                name='MVA Breakdown'>
                {mockMVABreakdownStages.map((stage, index) => {
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
