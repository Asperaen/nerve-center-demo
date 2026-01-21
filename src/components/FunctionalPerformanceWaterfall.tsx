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

export interface FunctionalPerformanceStage {
  id: string;
  label: string;
  value: number;
  delta?: number;
  type: 'baseline' | 'positive' | 'negative';
  isClickable?: boolean;
}

interface FunctionalPerformanceWaterfallProps {
  stages: FunctionalPerformanceStage[];
  title: string;
  onStageClick?: (stage: FunctionalPerformanceStage) => void;
  emphasisStageId?: string;
  barSize?: number;
  description?: string;
}

export default function FunctionalPerformanceWaterfall({
  stages,
  title,
  description,
  onStageClick,
  emphasisStageId,
  barSize = 26,
}: FunctionalPerformanceWaterfallProps) {
  const chartData = useMemo(() => {
    return stages.map((stage, index) => {
      const isAbsolute = stage.type === 'baseline';
      const prevValue = index > 0 ? stages[index - 1].value : 0;
      const baselineValue = isAbsolute ? 0 : prevValue;
      const barValue = isAbsolute ? stage.value : stage.delta ?? 0;

      return {
        ...stage,
        cumulativeValue: stage.value,
        baselineValue,
        barValue,
      };
    });
  }, [stages]);

  const getFillColor = (stage: FunctionalPerformanceStage) => {
    if (stage.type === 'baseline') return '#9ca3af';
    return stage.type === 'positive' ? '#22c55e' : '#ef4444';
  };

  return (
    <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
      <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
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
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: 'USD Mn',
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
            <Bar dataKey='barValue' stackId='a' barSize={barSize}>
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
                  fontSize: '10px',
                  fill: 'white',
                  fontWeight: 'bold',
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
