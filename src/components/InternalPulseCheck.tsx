import { useState, useEffect } from 'react';
import { internalPulseColumns } from '../data/mockInternalPulse';
import type { PulseColumn, PulseMetric, FinancialMetric } from '../types';
import {
  CircleStackIcon,
  ArrowTrendingUpIcon,
  CogIcon,
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

type TimePeriod =
  | 'full-year'
  | 'rest-of-year'
  | 'year-to-month'
  | 'in-quarter'
  | 'in-month';

export default function InternalPulseCheck({
  onSelectionChange,
  selectedItems = [],
  onGenerateInsights,
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

        {/* Generate AI Insights Button */}
        {selectedMetricIds.length > 0 && (
          <div className='flex items-center justify-end'>
            <div className='flex items-center space-x-4'>
              <div className='text-sm font-medium text-gray-700 bg-gray-100/80 px-4 py-2 rounded-lg border border-gray-200/50'>
                {selectedMetricIds.length} item
                {selectedMetricIds.length > 1 ? 's' : ''} selected
              </div>
              <button
                onClick={onGenerateInsights}
                className='group relative flex items-center px-7 py-3.5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden border border-purple-500/20'>
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
          </div>
        )}
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
      <div className='px-8 py-6 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 border-b border-blue-700/50 shadow-inner'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-bold text-white tracking-wide'>
            {column.title}
          </h3>
          <div className='p-2.5 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg transition-transform duration-200 hover:scale-110'>
            {column.type === 'financial' && (
              <CircleStackIcon className='w-5 h-5 text-white drop-shadow-sm' />
            )}
            {column.type === 'topline' && (
              <ArrowTrendingUpIcon className='w-5 h-5 text-white drop-shadow-sm' />
            )}
            {column.type === 'operation' && (
              <CogIcon className='w-5 h-5 text-white drop-shadow-sm' />
            )}
          </div>
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
                          <div className='space-y-0'>
                            {qualitySection.metrics.map(
                              (metric, metricIndex) => (
                                <MetricDisplay
                                  key={metric.id}
                                  metric={metric}
                                  isLast={
                                    metricIndex ===
                                    qualitySection.metrics.length - 1
                                  }
                                  isSelected={selectedMetricIds.includes(
                                    metric.id
                                  )}
                                  onToggleSelection={() =>
                                    onToggleSelection(metric)
                                  }
                                />
                              )
                            )}
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
                          <div className='space-y-0'>
                            {procurementSection.metrics.map(
                              (metric, metricIndex) => (
                                <MetricDisplay
                                  key={metric.id}
                                  metric={metric}
                                  isLast={
                                    metricIndex ===
                                    procurementSection.metrics.length - 1
                                  }
                                  isSelected={selectedMetricIds.includes(
                                    metric.id
                                  )}
                                  onToggleSelection={() =>
                                    onToggleSelection(metric)
                                  }
                                />
                              )
                            )}
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
  const handleDragStart = (e: React.DragEvent) => {
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

  const formatValue = () => {
    if (metric.value !== undefined) {
      if (metric.valuePercent !== undefined) {
        return `$${formatNumber(metric.value)}M (${metric.valuePercent}%)`;
      }
      // Format with comma for thousands
      return `${formatNumberWithComma(metric.value)} ${metric.unit || ''}`;
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

  const formatNumberWithComma = (num: number) => {
    // Format with comma for thousands
    return num.toLocaleString('en-US');
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
      <div className='pl-4 py-1 flex items-center gap-1.5 hover:bg-gray-50/50 rounded transition-colors duration-150'>
        <span className='text-gray-500 text-xs font-medium'>{label}:</span>
        <span
          className={`text-xs font-semibold ${colorClass} flex items-center gap-1.5`}>
          {isPositive && <span className='text-green-500 font-bold'>↑</span>}
          {!isPositive && <span className='text-red-500 font-bold'>↓</span>}
          {valueStr}
        </span>
      </div>
    );
  };

  const hasMainValue = formatValue() !== null;
  const hasComparisons =
    metric.comparisons && Object.keys(metric.comparisons).length > 0;
  const hasSubMetrics = metric.subMetrics && metric.subMetrics.length > 0;
  const isCriticalMaterialHeader = metric.name === 'Critical material price';
  const isMaterialMetric =
    hasSubMetrics &&
    metric.subMetrics!.some(
      (sm) =>
        sm.name.includes('PO price') ||
        sm.name.includes('GR price') ||
        sm.name.includes('Market price')
    );

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
      className={`flex items-start space-x-3 py-4 px-3 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-emerald-50/50 transition-all duration-200 cursor-move rounded-lg group ${
        !isLast ? 'border-b border-gray-100/60' : ''
      } ${isSelected ? 'bg-blue-50/50 border-l-2 border-l-primary-500' : ''}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      {/* Checkbox */}
      <div className='flex-shrink-0 pt-0.5'>
        <input
          type='checkbox'
          checked={isSelected}
          onChange={onToggleSelection}
          className='w-4 h-4 text-primary-600 bg-white border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 cursor-pointer transition-all duration-200 hover:border-primary-400 checked:bg-primary-600 checked:border-primary-600'
        />
      </div>

      {/* Metric Content */}
      <div className='flex-1 min-w-0'>
        {/* Metric Name */}
        <div className='mb-2'>
          <h5
            className={`text-gray-900 font-bold text-sm group-hover:text-primary-700 transition-colors duration-200 ${
              metric.hasWarning
                ? 'underline decoration-red-500 decoration-wavy decoration-2'
                : ''
            }`}>
            {metric.name}
          </h5>
        </div>

        {/* Main Metric Value */}
        {(hasMainValue || (isMaterialMetric && metric.value === undefined)) && (
          <div className='mb-2.5'>
            {isMaterialMetric ? (
              <div className='flex items-center gap-2'>
                <span className='text-gray-700 text-xs font-medium'>
                  Inv. moving avg. price:
                </span>
                <span className='text-gray-900 font-bold text-base tracking-tight inline-flex items-baseline gap-1'>
                  {hasMainValue ? formatValue() : `xxx ${metric.unit || ''}`}
                </span>
              </div>
            ) : (
              <span className='text-gray-900 font-bold text-base tracking-tight inline-flex items-baseline gap-1'>
                {formatValue()}
              </span>
            )}
          </div>
        )}

        {/* Sub-metrics - Special handling for Procurement materials */}
        {hasSubMetrics && (
          <div className='pl-4 mb-2 space-y-1 border-l-2 border-gray-200/50'>
            {metric.subMetrics!.map((subMetric, idx) => {
              // For Procurement materials, show price comparisons with color indicators
              if (isMaterialMetric) {
                const isFavorable =
                  subMetric.percentOfTotal !== undefined &&
                  subMetric.percentOfTotal < 0;
                const isUnfavorable =
                  subMetric.percentOfTotal !== undefined &&
                  subMetric.percentOfTotal > 0;
                const percentValue = subMetric.percentOfTotal || 0;
                const absPercent = Math.abs(percentValue);

                return (
                  <div
                    key={idx}
                    className='flex items-center justify-between py-0.5'>
                    <span className='text-gray-700 text-xs font-medium'>
                      {subMetric.name}:
                    </span>
                    <span className='text-gray-900 text-xs font-semibold flex items-center gap-1.5'>
                      {subMetric.value > 0
                        ? formatNumberWithComma(subMetric.value)
                        : 'xxx'}{' '}
                      {subMetric.value > 0 && (
                        <span
                          className={`text-xs font-semibold ${
                            isFavorable
                              ? 'text-green-600'
                              : isUnfavorable
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}>
                          {subMetric.value > 0 && (
                            <span>
                              {isFavorable ? '-' : '+'}
                              {absPercent.toFixed(1)}%
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                  </div>
                );
              }

              // Regular sub-metric display
              return (
                <div
                  key={idx}
                  className='flex items-center justify-between py-0.5'>
                  <span className='text-gray-700 text-xs font-medium'>
                    {subMetric.name}:
                  </span>
                  <span className='text-gray-900 text-xs font-semibold'>
                    {subMetric.unit === 'M USD'
                      ? `$${formatNumber(subMetric.value)}M`
                      : subMetric.value > 0
                      ? `${formatNumberWithComma(subMetric.value)} ${
                          subMetric.unit || ''
                        }`
                      : 'xxx'}{' '}
                    {subMetric.percentOfTotal !== undefined &&
                      subMetric.percentOfTotal !== 0 &&
                      !isMaterialMetric && (
                        <span className='text-gray-500 font-normal'>
                          ({subMetric.percentOfTotal}% Total)
                        </span>
                      )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Comparison Values */}
        {hasComparisons && (
          <div className='mt-2 space-y-0.5'>
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
