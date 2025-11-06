import { useState, useEffect } from 'react';
import { internalPulseColumns } from '../data/mockInternalPulse';
import type { PulseColumn, PulseMetric, FinancialMetric } from '../types';
import {
  CircleStackIcon,
  ArrowTrendingUpIcon,
  CogIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface InternalPulseCheckProps {
  onSelectionChange?: (items: FinancialMetric[]) => void;
  selectedItems?: FinancialMetric[];
  onGenerateInsights?: () => void;
}

// Helper function to get all metrics from all columns
function getAllMetrics(): PulseMetric[] {
  const allMetrics: PulseMetric[] = [];
  internalPulseColumns.forEach((column) => {
    column.sections.forEach((section) => {
      allMetrics.push(...section.metrics);
    });
  });
  return allMetrics;
}

// Adapter function to convert PulseMetric to FinancialMetric
function convertPulseMetricToFinancialMetric(
  pulseMetric: PulseMetric
): FinancialMetric {
  const value = pulseMetric.value ?? 0;
  const budget = value; // Default budget same as value
  const variance = 0; // Default variance
  const variancePercent = 0; // Default variance percent

  // Determine status based on comparisons
  let status: 'good' | 'warning' | 'concern' = 'good';
  if (pulseMetric.comparisons) {
    const hasNegative = Object.values(pulseMetric.comparisons).some(
      (comp) => comp.percent < 0
    );
    if (hasNegative) {
      status = 'warning';
    }
  }

  // Determine trend based on comparisons
  let trend: 'up' | 'down' | 'flat' = 'flat';
  if (pulseMetric.comparisons?.vsLastRefresh) {
    trend = pulseMetric.comparisons.vsLastRefresh.percent >= 0 ? 'up' : 'down';
  }

  return {
    id: pulseMetric.id,
    name: pulseMetric.name,
    value,
    unit: pulseMetric.unit || '',
    budget,
    variance,
    variancePercent,
    status,
    trend,
    lastUpdated: new Date(),
    valueDrivers: [],
    history: [],
  };
}

export default function InternalPulseCheck({
  onSelectionChange,
  selectedItems = [],
  onGenerateInsights,
}: InternalPulseCheckProps = {}) {
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(
    selectedItems.map((item) => item.id)
  );

  // Sync with parent selection
  useEffect(() => {
    setSelectedMetricIds(selectedItems.map((item) => item.id));
  }, [selectedItems]);

  const toggleMetricSelection = (metric: PulseMetric) => {
    setSelectedMetricIds((prev) => {
      const newSelection = prev.includes(metric.id)
        ? prev.filter((id) => id !== metric.id)
        : [...prev, metric.id];

      // Notify parent of selection change
      if (onSelectionChange) {
        const allMetrics = getAllMetrics();
        const selectedMetrics = allMetrics
          .filter((m) => newSelection.includes(m.id))
          .map(convertPulseMetricToFinancialMetric);
        onSelectionChange(selectedMetrics);
      }

      return newSelection;
    });
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200'>
      {/* Header Section */}
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
              <ChartBarIcon className='w-6 h-6 mr-2 text-primary-600' />
              Internal Pulse
            </h2>
            <p className='mt-1 text-sm text-gray-500'>
              Key performance indicators and financial metrics
            </p>
          </div>

          {/* Insights Button - Show when items are selected */}
          {selectedMetricIds.length > 0 && (
            <div className='flex items-center space-x-4'>
              <div className='text-sm text-gray-600'>
                {selectedMetricIds.length} item
                {selectedMetricIds.length > 1 ? 's' : ''} selected
              </div>
              <button
                onClick={onGenerateInsights}
                className='group relative flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden'>
                {/* Animated gradient overlay */}
                <div className='absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse'></div>

                {/* Shimmer effect */}
                <div className='absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>

                {/* Content */}
                <span className='relative flex items-center z-10'>
                  <SparklesIcon className='w-5 h-5 mr-2 group-hover:animate-spin transition-transform duration-300' />
                  <span className='text-base'>Generate AI Insights</span>
                </span>

                {/* Glow effect */}
                <div className='absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10'></div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Three Column Layout */}
      <div className='grid grid-cols-3'>
        {internalPulseColumns.map((column) => (
          <PulseColumnComponent
            key={column.type}
            column={column}
            selectedMetricIds={selectedMetricIds}
            onToggleSelection={toggleMetricSelection}
          />
        ))}
      </div>
    </div>
  );
}

interface PulseColumnComponentProps {
  column: PulseColumn;
  selectedMetricIds: string[];
  onToggleSelection: (metric: PulseMetric) => void;
}

function PulseColumnComponent({
  column,
  selectedMetricIds,
  onToggleSelection,
}: PulseColumnComponentProps) {
  const getColumnIcon = () => {
    switch (column.type) {
      case 'financial':
        return <CircleStackIcon className='w-5 h-5 text-primary-600' />;
      case 'topline':
        return <ArrowTrendingUpIcon className='w-5 h-5 text-primary-600' />;
      case 'operation':
        return <CogIcon className='w-5 h-5 text-primary-600' />;
      default:
        return null;
    }
  };

  return (
    <div className='border-r border-gray-200 last:border-r-0'>
      {/* Column Header */}
      <div className='px-6 py-4 bg-gray-50 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <h3 className='text-base font-semibold text-gray-900'>
            {column.title}
          </h3>
          <div>{getColumnIcon()}</div>
        </div>
      </div>

      {/* Column Content */}
      <div className='bg-white p-6 space-y-5'>
        {column.sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={sectionIndex > 0 ? 'pt-2' : ''}>
            {/* Section Title */}
            <h4 className='text-blue-600 font-bold text-sm mb-3'>
              {section.title}
            </h4>

            {/* Section Metrics */}
            <div className='space-y-0'>
              {section.metrics.map((metric, metricIndex) => (
                <MetricDisplay
                  key={metric.id}
                  metric={metric}
                  isLast={metricIndex === section.metrics.length - 1}
                  isSelected={selectedMetricIds.includes(metric.id)}
                  onToggleSelection={() => onToggleSelection(metric)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MetricDisplayProps {
  metric: PulseMetric;
  isLast?: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
}

function MetricDisplay({
  metric,
  isLast = false,
  isSelected,
  onToggleSelection,
}: MetricDisplayProps) {
  const formatValue = () => {
    if (metric.value !== undefined) {
      if (metric.valuePercent !== undefined) {
        return `$${formatNumber(metric.value)}M (${metric.valuePercent}%)`;
      }
      return `$${formatNumber(metric.value)}M`;
    }
    if (metric.valuePercent !== undefined) {
      return `${metric.valuePercent}%`;
    }
    return null;
  };

  const formatNumber = (num: number) => {
    // Format with one decimal place if needed
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  };

  const formatComparison = (
    label: string,
    comparison: { percent: number; percentagePoints?: number }
  ) => {
    const isPositive = comparison.percent >= 0;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

    let valueStr = `${comparison.percent > 0 ? '+' : ''}${comparison.percent}%`;
    if (comparison.percentagePoints !== undefined) {
      const ppValue = comparison.percentagePoints;
      valueStr += ` (${ppValue > 0 ? '+' : ''}${ppValue} p.p.)`;
    }

    return (
      <div className='pl-4 py-0.5'>
        <span className='text-gray-400 text-xs'>{label}: </span>
        <span className={`text-xs font-medium ${colorClass}`}>{valueStr}</span>
      </div>
    );
  };

  const hasMainValue = formatValue() !== null;
  const hasComparisons =
    metric.comparisons && Object.keys(metric.comparisons).length > 0;
  const hasSubMetrics = metric.subMetrics && metric.subMetrics.length > 0;

  return (
    <div
      className={`flex items-start space-x-3 py-3 hover:bg-gray-50 transition-colors ${
        !isLast ? 'border-b border-gray-200' : ''
      }`}>
      {/* Checkbox */}
      <div className='flex-shrink-0 pt-0.5'>
        <input
          type='checkbox'
          checked={isSelected}
          onChange={onToggleSelection}
          className='w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2'
        />
      </div>

      {/* Metric Content */}
      <div className='flex-1 min-w-0'>
        {/* Metric Name */}
        <div className='mb-1.5'>
          <h5
            className={`text-gray-900 font-bold text-sm ${
              metric.hasWarning
                ? 'underline decoration-red-500 decoration-wavy'
                : ''
            }`}>
            {metric.name}
          </h5>
        </div>

        {/* Main Metric Value */}
        {hasMainValue && (
          <div className='mb-1.5'>
            <span className='text-gray-900 font-semibold text-sm'>
              {formatValue()}
            </span>
          </div>
        )}

        {/* Sub-metrics */}
        {hasSubMetrics && (
          <div className='pl-4 mb-1.5 space-y-0.5'>
            {metric.subMetrics!.map((subMetric, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between'>
                <span className='text-gray-900 text-xs font-medium'>
                  {subMetric.name}:{' '}
                </span>
                <span className='text-gray-900 text-xs font-medium'>
                  {subMetric.unit === 'M USD'
                    ? `$${formatNumber(subMetric.value)}M`
                    : subMetric.value}{' '}
                  {subMetric.percentOfTotal !== undefined &&
                    `(${subMetric.percentOfTotal}% Total)`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Comparison Values */}
        {hasComparisons && (
          <div className='mt-1.5'>
            {metric.comparisons!.vsHHtarget &&
              formatComparison('Vs. HH target', metric.comparisons!.vsHHtarget)}
            {metric.comparisons!.vsInternalTarget &&
              formatComparison(
                'Vs. Internal target',
                metric.comparisons!.vsInternalTarget
              )}
            {metric.comparisons!.vsTarget &&
              formatComparison('Vs. target', metric.comparisons!.vsTarget)}
            {metric.comparisons!.vsLastRefresh &&
              formatComparison(
                'Vs. last refresh',
                metric.comparisons!.vsLastRefresh
              )}
            {metric.comparisons!.vsLastYear &&
              formatComparison('Vs. last year', metric.comparisons!.vsLastYear)}
            {metric.comparisons!.vsCurrentYearAverage &&
              formatComparison(
                'Vs. current year average',
                metric.comparisons!.vsCurrentYearAverage
              )}
          </div>
        )}
      </div>
    </div>
  );
}
