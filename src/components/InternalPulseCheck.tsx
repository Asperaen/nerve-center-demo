import { useState, useEffect } from 'react';
import { internalPulseColumns } from '../data/mockInternalPulse';
import type { PulseColumn, PulseMetric, FinancialMetric } from '../types';
import {
  CircleStackIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface InternalPulseCheckProps {
  onSelectionChange?: (items: FinancialMetric[]) => void;
  selectedItems?: FinancialMetric[];
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

type TimePeriod =
  | 'full-year'
  | 'rest-of-year'
  | 'year-to-month'
  | 'in-quarter'
  | 'in-month';

export default function InternalPulseCheck({
  onSelectionChange,
  selectedItems = [],
}: InternalPulseCheckProps = {}) {
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(
    selectedItems.map((item) => item.id)
  );
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState<TimePeriod>('full-year');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Sync with parent selection
  useEffect(() => {
    setSelectedMetricIds(selectedItems.map((item) => item.id));
  }, [selectedItems]);

  // Set last refreshed time when component mounts
  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);

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

  const formatLastRefreshed = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `Today ${displayHours}:${displayMinutes}${ampm}`;
  };

  const timePeriods: { value: TimePeriod; label: string }[] = [
    { value: 'full-year', label: 'Full-year' },
    { value: 'rest-of-year', label: 'Rest of Year' },
    { value: 'year-to-month', label: 'Year to Month' },
    { value: 'in-quarter', label: 'In-quarter' },
    { value: 'in-month', label: 'In-month' },
  ];

  return (
    <div className='bg-white rounded-2xl border border-gray-200/80 shadow-xl shadow-gray-200/40 hover:shadow-2xl transition-all duration-300 overflow-hidden'>
      {/* Controls Section */}
      <div className='p-8 border-b border-gray-200/60 bg-gradient-to-br from-white via-emerald-50/40 to-blue-50/30'>
        {/* Top Row: Last refreshed, Time period tabs, Legend, Settings */}
        <div className='flex items-center justify-between mb-4'>
          {/* Last refreshed timestamp */}
          <div className='flex items-center gap-2 text-sm text-gray-500 italic bg-white/60 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-gray-200/50'>
            <span className='text-gray-400'>Last refreshed:</span>
            <span className='font-medium text-gray-700'>
              {formatLastRefreshed(lastRefreshed)}
            </span>
          </div>

          {/* Right side: Tabs, Legend, Settings */}
          <div className='flex items-center gap-5'>
            {/* Time Period Tabs */}
            <div className='flex items-center gap-1 bg-gray-100/80 backdrop-blur-sm rounded-xl p-1.5 border border-gray-200/50 shadow-sm'>
              {timePeriods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedTimePeriod(period.value)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    selectedTimePeriod === period.value
                      ? 'bg-white text-gray-900 shadow-md shadow-gray-200/50 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}>
                  {period.label}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className='flex items-center gap-4 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50 shadow-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-3.5 h-3.5 rounded-full bg-green-500 shadow-sm ring-2 ring-green-200'></div>
                <span className='text-sm font-medium text-gray-700'>
                  Favorable
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm ring-2 ring-red-200'></div>
                <span className='text-sm font-medium text-gray-700'>
                  Unfavorable
                </span>
              </div>
            </div>

            {/* Settings Icon */}
            <button className='p-2.5 hover:bg-white/80 rounded-xl transition-all duration-200 border border-gray-200/50 hover:border-gray-300 hover:shadow-md group'>
              <CogIcon className='w-5 h-5 text-gray-600 group-hover:text-gray-900 group-hover:rotate-90 transition-all duration-300' />
            </button>
          </div>
        </div>
      </div>

      {/* Three Column Layout - Operations takes 50%, Finance and Topline each take 25% */}
      <div className='grid grid-cols-4 divide-x divide-gray-200/60'>
        {internalPulseColumns.map((column) => (
          <PulseColumnComponent
            key={column.type}
            column={column}
            selectedMetricIds={selectedMetricIds}
            onToggleSelection={toggleMetricSelection}
            className={
              column.type === 'operation' ? 'col-span-2' : 'col-span-1'
            }
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
  className?: string;
}

function PulseColumnComponent({
  column,
  selectedMetricIds,
  onToggleSelection,
  className = '',
}: PulseColumnComponentProps) {
  return (
    <div
      className={`border-r border-gray-200/60 last:border-r-0 bg-gradient-to-b from-white to-gray-50/30 transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-gray-50/50 ${className}`}>
      {/* Column Header */}
      <div className='px-8 py-6 bg-white border-b border-gray-200'>
        <div className='flex items-center gap-2'>
          {column.type === 'financial' && (
            <CircleStackIcon className='w-6 h-6 text-primary-600' />
          )}
          {column.type === 'topline' && (
            <ArrowTrendingUpIcon className='w-6 h-6 text-primary-600' />
          )}
          {column.type === 'operation' && (
            <CogIcon className='w-6 h-6 text-primary-600' />
          )}
          <h3 className='text-2xl font-bold text-gray-900'>{column.title}</h3>
        </div>
      </div>

      {/* Column Content */}
      <div className='bg-white/50 p-6 space-y-6'>
        {column.type === 'operation'
          ? // Special handling for Operation column: Quality and Procurement side-by-side
            (() => {
              const qualitySection = column.sections.find(
                (s) => s.title === 'Quality'
              );
              const procurementSection = column.sections.find(
                (s) => s.title === 'Procurement'
              );
              const otherSections = column.sections.filter(
                (s) => s.title !== 'Quality' && s.title !== 'Procurement'
              );

              return (
                <>
                  {/* Quality and Procurement in 2 columns */}
                  {(qualitySection || procurementSection) && (
                    <div className='grid grid-cols-2 gap-6'>
                      {/* Quality Column */}
                      {qualitySection && (
                        <div className='pr-6 border-r border-gray-200/60'>
                          <h4 className='text-primary-700 font-bold text-sm mb-5 uppercase tracking-wider flex items-center gap-2'>
                            <span className='w-1 h-4 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full'></span>
                            {qualitySection.title}
                          </h4>
                          <div className='grid grid-cols-1 gap-4'>
                            {qualitySection.metrics.map((metric) => (
                              <MetricDisplay
                                key={metric.id}
                                metric={metric}
                                isSelected={selectedMetricIds.includes(
                                  metric.id
                                )}
                                onToggleSelection={() =>
                                  onToggleSelection(metric)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Procurement Column */}
                      {procurementSection && (
                        <div className='pl-6'>
                          <h4 className='text-primary-700 font-bold text-sm mb-5 uppercase tracking-wider flex items-center gap-2'>
                            <span className='w-1 h-4 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full'></span>
                            {procurementSection.title}
                          </h4>
                          <div className='grid grid-cols-1 gap-4'>
                            {procurementSection.metrics.map((metric) => (
                              <MetricDisplay
                                key={metric.id}
                                metric={metric}
                                isSelected={selectedMetricIds.includes(
                                  metric.id
                                )}
                                onToggleSelection={() =>
                                  onToggleSelection(metric)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other sections (MFG, R&D, Supply Chain) */}
                  {otherSections.map((section, sectionIndex) => (
                    <div
                      key={sectionIndex}
                      className={
                        sectionIndex > 0 || qualitySection || procurementSection
                          ? 'pt-6 border-t border-gray-200/60'
                          : ''
                      }>
                      {/* Section Title */}
                      <h4 className='text-primary-700 font-bold text-sm mb-5 uppercase tracking-wider flex items-center gap-2'>
                        <span className='w-1 h-4 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full'></span>
                        {section.title}
                      </h4>

                      {/* Section Metrics */}
                      <div className='grid grid-cols-1 gap-4'>
                        {section.metrics.map((metric) => (
                          <MetricDisplay
                            key={metric.id}
                            metric={metric}
                            isSelected={selectedMetricIds.includes(metric.id)}
                            onToggleSelection={() => onToggleSelection(metric)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              );
            })()
          : // Regular rendering for other columns
            column.sections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className={
                  sectionIndex > 0 ? 'pt-6 border-t border-gray-200/60' : ''
                }>
                {/* Section Title */}
                <h4 className='text-primary-700 font-bold text-sm mb-5 uppercase tracking-wider flex items-center gap-2'>
                  <span className='w-1 h-4 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full'></span>
                  {section.title}
                </h4>

                {/* Section Metrics */}
                <div className='grid grid-cols-1 gap-4'>
                  {section.metrics.map((metric) => (
                    <MetricDisplay
                      key={metric.id}
                      metric={metric}
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

// Helper functions for metric display (matching ExecutiveSummaryPage style)
const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'concern':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <ArrowTrendingUpIcon className='w-5 h-5 text-green-600' />;
    case 'down':
      return <ArrowTrendingDownIcon className='w-5 h-5 text-red-600' />;
    default:
      return null;
  }
};

const getMetricStatus = (
  metric: PulseMetric
): 'good' | 'warning' | 'concern' => {
  // Gold price should show warning as it impacts overall performance
  if (metric.id === 'gold-material') return 'warning';

  if (!metric.comparisons) return 'good';

  // Check if any comparison shows negative trend
  const hasNegative = Object.values(metric.comparisons).some(
    (comp) => comp.percent < 0
  );

  if (hasNegative) {
    // Check severity
    const worstComparison = Math.min(
      ...Object.values(metric.comparisons).map((c) => c.percent)
    );
    if (worstComparison < -5) return 'concern';
    return 'warning';
  }

  return 'good';
};

const getMetricTrend = (metric: PulseMetric): 'up' | 'down' | 'flat' => {
  if (metric.comparisons?.vsLastRefresh) {
    return metric.comparisons.vsLastRefresh.percent >= 0 ? 'up' : 'down';
  }
  if (metric.comparisons?.vsLastYear) {
    return metric.comparisons.vsLastYear.percent >= 0 ? 'up' : 'down';
  }
  return 'flat';
};

const getComparisonText = (metric: PulseMetric): string => {
  if (metric.comparisons?.vsLastYear) {
    const percent = metric.comparisons.vsLastYear.percent;
    return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}% vs last year`;
  }
  if (metric.comparisons?.vsLastRefresh) {
    const percent = metric.comparisons.vsLastRefresh.percent;
    return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}% vs last refresh`;
  }
  return '';
};

const formatMetricValue = (metric: PulseMetric): string => {
  // For Gold price, show market price as the main value
  if (metric.id === 'gold-material' && metric.subMetrics) {
    const marketPrice = metric.subMetrics.find((m) =>
      m.name.includes('Market price')
    )?.value;
    if (marketPrice !== undefined) {
      return `${marketPrice.toLocaleString('en-US')} ${metric.unit || ''}`;
    }
  }

  // For Inventory Turnover, use valuePercent as the actual rate value
  if (metric.id === 'inventory-turnover' && metric.valuePercent !== undefined) {
    return `${metric.valuePercent.toFixed(1)} times/year`;
  }

  if (metric.value !== undefined) {
    if (metric.valuePercent !== undefined) {
      return `$${metric.value.toFixed(1)}M (${metric.valuePercent}%)`;
    }
    // Format with comma for thousands
    return `${metric.value.toLocaleString('en-US')} ${metric.unit || ''}`;
  }
  if (metric.valuePercent !== undefined) {
    return `${metric.valuePercent}%`;
  }
  // For metrics without value, show comparison if available
  if (metric.comparisons?.vsLastYear) {
    const percent = metric.comparisons.vsLastYear.percent;
    return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}% vs last year`;
  }
  return 'N/A';
};

interface MetricDisplayProps {
  metric: PulseMetric;
  isSelected: boolean;
  onToggleSelection: () => void;
}

function MetricDisplay({
  metric,
  isSelected,
  onToggleSelection,
}: MetricDisplayProps) {
  const handleDragStart = (e: React.DragEvent) => {
    // Don't start drag if clicking on checkbox
    const target = e.target as HTMLElement;
    if (target.closest('input[type="checkbox"]')) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData('materialType', 'internal-pulse');
    e.dataTransfer.setData('itemId', metric.id);
    e.dataTransfer.effectAllowed = 'move';
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Restore visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const status = getMetricStatus(metric);
  const trend = getMetricTrend(metric);
  const valueText = formatMetricValue(metric);
  const comparisonText = getComparisonText(metric);
  const hasSubMetrics = metric.subMetrics && metric.subMetrics.length > 0;
  const isCriticalMaterialHeader = metric.name === 'Critical material price';

  // Special rendering for "Critical material price" header
  if (isCriticalMaterialHeader) {
    return (
      <div className='py-3 px-3'>
        <h5 className='text-gray-900 font-bold text-base'>{metric.name}</h5>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border-2 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 cursor-move ${
        isSelected ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200'
      }`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onToggleSelection}>
      <div className='flex items-start justify-between mb-3 gap-2'>
        <div className='flex items-start gap-2 flex-1 min-w-0'>
          <input
            type='checkbox'
            checked={isSelected}
            onChange={onToggleSelection}
            onClick={(e) => e.stopPropagation()}
            className='mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer'
          />
          <h3 className='text-sm font-medium text-gray-600 flex-1 min-w-0'>
            {metric.name}
          </h3>
        </div>
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium border whitespace-nowrap flex-shrink-0 ${getStatusColor(
            status
          )}`}>
          {status.toUpperCase()}
        </span>
      </div>
      <div className='mb-4 min-w-0'>
        <div className='break-words'>
          <span className='text-3xl font-bold text-gray-900 leading-tight'>
            {valueText}
          </span>
        </div>
        {metric.valuePercent !== undefined &&
          metric.id !== 'working-capital' && (
            <div className='mt-1 text-xs text-gray-500'>
              {metric.valuePercent.toFixed(1)}% of revenue
            </div>
          )}
        {/* Sub-metrics - show in compact format */}
        {hasSubMetrics && (
          <div className='mt-3 space-y-1 pt-3 border-t border-gray-200'>
            {metric.subMetrics!.slice(0, 3).map((subMetric, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between text-xs'>
                <span className='text-gray-600'>{subMetric.name}:</span>
                <span className='text-gray-900 font-semibold'>
                  {subMetric.value > 0
                    ? subMetric.unit === 'M USD'
                      ? `$${subMetric.value.toFixed(1)}M`
                      : `${subMetric.value.toLocaleString('en-US')} ${
                          subMetric.unit || ''
                        }`
                    : 'N/A'}
                </span>
              </div>
            ))}
            {metric.subMetrics!.length > 3 && (
              <div className='text-xs text-gray-500 italic'>
                +{metric.subMetrics!.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>
      <div className='flex items-center gap-1.5 min-w-0'>
        {getTrendIcon(trend)}
        <span
          className={`text-xs font-semibold truncate ${
            metric.comparisons?.vsLastYear?.percent !== undefined
              ? metric.comparisons.vsLastYear.percent >= 0
                ? 'text-green-600'
                : 'text-red-600'
              : metric.comparisons?.vsLastRefresh?.percent !== undefined
              ? metric.comparisons.vsLastRefresh.percent >= 0
                ? 'text-green-600'
                : 'text-red-600'
              : 'text-gray-600'
          }`}
          title={comparisonText}>
          {comparisonText}
        </span>
      </div>
    </div>
  );
}
