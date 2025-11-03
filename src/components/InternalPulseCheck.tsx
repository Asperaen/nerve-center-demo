import { useState, useEffect } from 'react';
import { mockInternalPulseData } from '../data/mockInternalPulse';
import type {
  FinancialCategoryData,
  FinancialMetric,
  ValueDriver,
  AffectingFactor,
  AffectingFactorTag,
} from '../types';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ChartBarIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type FilterTag = 'all' | 'internal-kpi' | 'internal-information';

interface InternalPulseCheckProps {
  onSelectionChange?: (items: FinancialMetric[]) => void;
  selectedItems?: FinancialMetric[];
}

export default function InternalPulseCheck({
  onSelectionChange,
  selectedItems = [],
}: InternalPulseCheckProps = {}) {
  const [selectedMetric, setSelectedMetric] = useState<FinancialMetric | null>(
    null
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['revenue', 'cogs', 'opex', 'operating-profit'])
  );
  const [filterTag, setFilterTag] = useState<FilterTag>('all');
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(
    selectedItems.map((item) => item.id)
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getTagBadgeColor = (tag: AffectingFactorTag) => {
    switch (tag) {
      case 'internal-kpi':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'internal-information':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'external-information':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'derived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTagLabel = (tag: AffectingFactorTag) => {
    switch (tag) {
      case 'internal-kpi':
        return 'Internal KPI';
      case 'internal-information':
        return 'Internal Information';
      case 'external-information':
        return 'External Information';
      case 'derived':
        return 'Derived';
      default:
        return tag;
    }
  };

  const shouldShowFactor = (factor: AffectingFactor): boolean => {
    if (filterTag === 'all') return true;
    return factor.tag === filterTag;
  };

  // Sync with parent selection
  useEffect(() => {
    setSelectedMetricIds(selectedItems.map((item) => item.id));
  }, [selectedItems]);

  const toggleMetricSelection = (metric: FinancialMetric) => {
    setSelectedMetricIds((prev) => {
      const newSelection = prev.includes(metric.id)
        ? prev.filter((id) => id !== metric.id)
        : [...prev, metric.id];

      // Notify parent of selection change
      if (onSelectionChange) {
        const allMetrics = mockInternalPulseData.flatMap((cat) => cat.metrics);
        const selectedMetrics = allMetrics.filter((m) =>
          newSelection.includes(m.id)
        );
        onSelectionChange(selectedMetrics);
      }

      return newSelection;
    });
  };

  return (
    <>
      <div className='bg-white rounded-lg border border-gray-200'>
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex-1'>
              <h2 className='text-lg font-semibold text-gray-900 flex items-center'>
                <ChartBarIcon className='w-5 h-5 mr-2 text-primary-600' />
                Internal Pulse Check
              </h2>
              <p className='mt-0.5 text-xs text-gray-500'>
                Value drivers and affecting factors by financial category
              </p>
            </div>
            <div className='flex items-center gap-3'>
              {/* Filter */}
              <div className='flex items-center gap-1.5'>
                <FunnelIcon className='w-4 h-4 text-gray-400' />
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value as FilterTag)}
                  className='px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500'>
                  <option value='all'>All</option>
                  <option value='internal-kpi'>Internal KPI</option>
                  <option value='internal-information'>Internal Info</option>
                </select>
              </div>
              <div className='text-xs text-gray-500'>
                Updated: {format(new Date(), 'MMM d, HH:mm')}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Categories */}
        <div className='p-4 space-y-3'>
          {mockInternalPulseData.map((categoryData) => (
            <CategorySection
              key={categoryData.category}
              categoryData={categoryData}
              isExpanded={expandedCategories.has(categoryData.category)}
              onToggle={() => toggleCategory(categoryData.category)}
              onMetricClick={setSelectedMetric}
              onMetricSelect={toggleMetricSelection}
              selectedMetricIds={selectedMetricIds}
              filterTag={filterTag}
              shouldShowFactor={shouldShowFactor}
              getTagBadgeColor={getTagBadgeColor}
              getTagLabel={getTagLabel}
            />
          ))}
        </div>
      </div>

      {/* Metric Detail Modal */}
      {selectedMetric && (
        <MetricDetailModal
          metric={selectedMetric}
          onClose={() => setSelectedMetric(null)}
          getTagBadgeColor={getTagBadgeColor}
          getTagLabel={getTagLabel}
        />
      )}
    </>
  );
}

interface CategorySectionProps {
  categoryData: FinancialCategoryData;
  isExpanded: boolean;
  onToggle: () => void;
  onMetricClick: (metric: FinancialMetric) => void;
  onMetricSelect: (metric: FinancialMetric) => void;
  selectedMetricIds: string[];
  filterTag: FilterTag;
  shouldShowFactor: (factor: AffectingFactor) => boolean;
  getTagBadgeColor: (tag: AffectingFactorTag) => string;
  getTagLabel: (tag: AffectingFactorTag) => string;
}

function CategorySection({
  categoryData,
  isExpanded,
  onToggle,
  onMetricClick,
  onMetricSelect,
  selectedMetricIds,
  filterTag,
  shouldShowFactor,
  getTagBadgeColor,
  getTagLabel,
}: CategorySectionProps) {
  return (
    <div className='border border-gray-200 rounded-lg overflow-hidden'>
      <button
        onClick={onToggle}
        className='w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left'>
        <div className='flex items-center gap-2'>
          {isExpanded ? (
            <ChevronDownIcon className='w-4 h-4 text-gray-600' />
          ) : (
            <ChevronRightIcon className='w-4 h-4 text-gray-600' />
          )}
          <h3 className='text-base font-semibold text-gray-900'>
            {categoryData.categoryName}
          </h3>
          <span className='text-xs text-gray-500'>
            ({categoryData.metrics.length})
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className='p-3'>
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3'>
            {categoryData.metrics.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                onClick={() => onMetricClick(metric)}
                onSelect={() => onMetricSelect(metric)}
                isSelected={selectedMetricIds.includes(metric.id)}
                filterTag={filterTag}
                shouldShowFactor={shouldShowFactor}
                getTagBadgeColor={getTagBadgeColor}
                getTagLabel={getTagLabel}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  metric: FinancialMetric;
  onClick: () => void;
  onSelect: () => void;
  isSelected: boolean;
  filterTag: FilterTag;
  shouldShowFactor: (factor: AffectingFactor) => boolean;
  getTagBadgeColor: (tag: AffectingFactorTag) => string;
  getTagLabel: (tag: AffectingFactorTag) => string;
}

function MetricCard({
  metric,
  onClick,
  onSelect,
  isSelected,
  filterTag,
  shouldShowFactor,
  getTagBadgeColor,
  getTagLabel,
}: MetricCardProps) {
  const getStatusColor = () => {
    switch (metric.status) {
      case 'good':
        return 'bg-opportunity-50 border-opportunity-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'concern':
        return 'bg-risk-50 border-risk-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = () => {
    if (metric.trend === 'up') {
      return <ArrowTrendingUpIcon className='w-4 h-4' />;
    } else if (metric.trend === 'down') {
      return <ArrowTrendingDownIcon className='w-4 h-4' />;
    } else {
      return <MinusIcon className='w-4 h-4' />;
    }
  };

  const getTrendColor = () => {
    if (metric.status === 'good') {
      return 'text-opportunity-600';
    } else if (metric.variancePercent < 0) {
      return 'text-risk-600';
    } else {
      return 'text-gray-600';
    }
  };

  // Count visible factors after filtering
  const visibleValueDrivers = metric.valueDrivers.filter((driver) =>
    driver.affectingFactors.some(shouldShowFactor)
  );

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all relative ${getStatusColor()}`}>
      {/* Checkbox */}
      <div
        className='absolute top-2 right-2 z-10'
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}>
        <input
          type='checkbox'
          checked={isSelected}
          onChange={() => {}}
          onClick={(e) => e.stopPropagation()}
          className='w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2'
        />
      </div>

      <div onClick={onClick}>
        {/* Metric Header */}
        <div className='flex items-start justify-between mb-2'>
          <div className='flex-1 min-w-0'>
            <p className='text-xs font-medium text-gray-600 truncate'>
              {metric.name}
            </p>
            <div className='mt-1 flex items-baseline gap-1'>
              <p className='text-lg font-bold text-gray-900'>
                {metric.value.toLocaleString()}
              </p>
              <span className='text-xs text-gray-500'>{metric.unit}</span>
            </div>
          </div>
          <div
            className={`p-1.5 rounded-full flex-shrink-0 ${getTrendColor()}`}>
            {getTrendIcon()}
          </div>
        </div>

        {/* Variance and Sparkline in one row */}
        <div className='flex items-center justify-between mb-2 gap-2'>
          <div className='flex items-center gap-1.5'>
            <span className='text-xs text-gray-500'>vs Budget:</span>
            <span className={`text-xs font-semibold ${getTrendColor()}`}>
              {metric.variancePercent > 0 ? '+' : ''}
              {metric.variancePercent.toFixed(1)}%
            </span>
          </div>
          <div className='h-6 w-20 flex-shrink-0'>
            <ResponsiveContainer
              width='100%'
              height='100%'>
              <LineChart data={metric.history.slice(-6)}>
                <Line
                  type='monotone'
                  dataKey='value'
                  stroke={
                    metric.status === 'good'
                      ? '#16a34a'
                      : metric.status === 'warning'
                      ? '#ca8a04'
                      : '#dc2626'
                  }
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Value Drivers Summary - Compact */}
        <div className='mt-2 pt-2 border-t border-gray-200'>
          <p className='text-xs font-medium text-gray-700 mb-1.5'>
            Drivers ({visibleValueDrivers.length})
          </p>
          <div className='space-y-1.5'>
            {visibleValueDrivers.slice(0, 2).map((driver) => (
              <div
                key={driver.id}
                className='bg-white rounded p-1.5 border border-gray-200'>
                <p className='text-xs font-medium text-gray-900 truncate'>
                  {driver.name}
                </p>
                <div className='mt-0.5 flex flex-wrap gap-0.5'>
                  {driver.affectingFactors
                    .filter(shouldShowFactor)
                    .slice(0, 2)
                    .map((factor) => (
                      <span
                        key={factor.id}
                        className={`px-1.5 py-0.5 text-[10px] rounded border ${getTagBadgeColor(
                          factor.tag
                        )}`}>
                        {getTagLabel(factor.tag)}
                      </span>
                    ))}
                  {driver.affectingFactors.filter(shouldShowFactor).length >
                    2 && (
                    <span className='px-1.5 py-0.5 text-[10px] text-gray-500'>
                      +
                      {driver.affectingFactors.filter(shouldShowFactor).length -
                        2}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {visibleValueDrivers.length > 2 && (
              <p className='text-xs text-gray-500 text-center py-1'>
                +{visibleValueDrivers.length - 2} more drivers
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricDetailModalProps {
  metric: FinancialMetric;
  onClose: () => void;
  getTagBadgeColor: (tag: AffectingFactorTag) => string;
  getTagLabel: (tag: AffectingFactorTag) => string;
}

function MetricDetailModal({
  metric,
  onClose,
  getTagBadgeColor,
  getTagLabel,
}: MetricDetailModalProps) {
  const chartData = metric.history.map((h) => ({
    date: format(h.date, 'MMM yy'),
    Actual: h.value,
    Budget: h.budget,
  }));

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
        <div
          className='fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75'
          onClick={onClose}></div>

        <div className='inline-block w-full max-w-5xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg'>
          {/* Header */}
          <div className='px-4 py-3 border-b border-gray-200 flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                {metric.name}
              </h3>
              <p className='mt-0.5 text-xs text-gray-500'>
                Value drivers and affecting factors
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-1.5 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100'>
              <XMarkIcon className='w-5 h-5' />
            </button>
          </div>

          {/* Content */}
          <div className='px-4 py-3 max-h-[calc(100vh-200px)] overflow-y-auto'>
            {/* Current Value & Variance */}
            <div className='grid grid-cols-4 gap-3 mb-4'>
              <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='text-xs text-gray-500'>Current Value</p>
                <p className='mt-0.5 text-lg font-bold text-gray-900'>
                  {metric.value.toLocaleString()}{' '}
                  <span className='text-xs text-gray-500'>{metric.unit}</span>
                </p>
              </div>
              <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='text-xs text-gray-500'>Budget</p>
                <p className='mt-0.5 text-lg font-bold text-gray-900'>
                  {metric.budget.toLocaleString()}{' '}
                  <span className='text-xs text-gray-500'>{metric.unit}</span>
                </p>
              </div>
              <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='text-xs text-gray-500'>Variance</p>
                <p
                  className={`mt-0.5 text-lg font-bold ${
                    metric.variance >= 0
                      ? 'text-opportunity-600'
                      : 'text-risk-600'
                  }`}>
                  {metric.variance > 0 ? '+' : ''}
                  {metric.variance.toLocaleString()}{' '}
                  <span className='text-xs'>{metric.unit}</span>
                </p>
              </div>
              <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='text-xs text-gray-500'>Variance %</p>
                <p
                  className={`mt-0.5 text-lg font-bold ${
                    metric.variancePercent >= 0 && metric.status === 'good'
                      ? 'text-opportunity-600'
                      : 'text-risk-600'
                  }`}>
                  {metric.variancePercent > 0 ? '+' : ''}
                  {metric.variancePercent.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Value Drivers */}
            <div className='mb-4'>
              <h4 className='text-xs font-medium text-gray-900 mb-2'>
                Value Drivers
              </h4>
              <div className='space-y-2'>
                {metric.valueDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                    <p className='text-xs font-semibold text-gray-900 mb-1.5'>
                      {driver.name}
                    </p>
                    {driver.description && (
                      <p className='text-xs text-gray-600 mb-2'>
                        {driver.description}
                      </p>
                    )}
                    <div className='mt-1.5'>
                      <p className='text-xs font-medium text-gray-700 mb-1.5'>
                        Affecting Factors:
                      </p>
                      <div className='space-y-1.5'>
                        {driver.affectingFactors.map((factor) => (
                          <div
                            key={factor.id}
                            className='flex items-start gap-2 p-1.5 bg-white rounded border border-gray-200'>
                            <span
                              className={`px-1.5 py-0.5 text-[10px] rounded border flex-shrink-0 ${getTagBadgeColor(
                                factor.tag
                              )}`}>
                              {getTagLabel(factor.tag)}
                            </span>
                            <div className='flex-1 min-w-0'>
                              <p className='text-xs font-medium text-gray-900'>
                                {factor.name}
                              </p>
                              {factor.description && (
                                <p className='text-xs text-gray-500 mt-0.5'>
                                  {factor.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trend Chart */}
            <div className='mb-4'>
              <h4 className='text-xs font-medium text-gray-900 mb-2'>
                12-Month Trend
              </h4>
              <div className='h-48'>
                <ResponsiveContainer
                  width='100%'
                  height='100%'>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='date'
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='Actual'
                      stroke='#2563eb'
                      strokeWidth={2}
                    />
                    <Line
                      type='monotone'
                      dataKey='Budget'
                      stroke='#94a3b8'
                      strokeWidth={2}
                      strokeDasharray='5 5'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Info */}
            <div className='grid grid-cols-2 gap-3'>
              <div className='p-3 bg-blue-50 rounded-lg border border-blue-100'>
                <p className='text-xs font-medium text-blue-900'>Status</p>
                <p className='mt-0.5 text-sm capitalize text-blue-700'>
                  {metric.status}
                </p>
              </div>
              <div className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                <p className='text-xs font-medium text-gray-900'>
                  Last Updated
                </p>
                <p className='mt-0.5 text-sm text-gray-700'>
                  {format(metric.lastUpdated, 'MMM d, HH:mm')}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end'>
            <button
              onClick={onClose}
              className='px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700'>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
