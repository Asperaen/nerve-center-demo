import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChartBarIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
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
  ReferenceArea,
} from 'recharts';
import {
  getAllBusinessGroupData,
  getSubBusinessGroupsWithOverall,
  getMainBusinessGroupOptions,
  getSubBusinessGroups,
  type BusinessGroupMetricWithTrend,
  type BusinessGroupData,
} from '../data/mockBusinessGroupPerformance';
import {
  mockNPDeviationStages,
  mockNPDeviationKeyCallOut,
} from '../data/mockForecast';
import {
  ProductAnalysisLayer,
  CostImpactBreakdownLayer,
  MVABreakdownLayer,
} from '../components/layers';
import type {
  NavigationLayer,
  BreadcrumbItem,
  NPDeviationStageType,
} from '../types';

type TimeframeOption =
  | 'full-year'
  | 'rest-of-year'
  | 'ytm'
  | 'in-quarter'
  | 'in-month';

export default function BusinessGroupPerformancePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial BU from query param
  const initialBu = searchParams.get('bu') || 'all';

  // Filter states
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeframeOption>('full-year');
  const [selectedBu, setSelectedBu] = useState<string>(initialBu);

  // Expanded rows state (for "All BUs" view)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Comparison details toggle
  const [showComparisonDetails, setShowComparisonDetails] =
    useState<boolean>(true);

  // Layer navigation state
  const [currentLayer, setCurrentLayer] = useState<NavigationLayer>(1);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [selectedCOGSTab, setSelectedCOGSTab] = useState<'sites' | 'products'>(
    'sites'
  );

  // Get main BU options
  const mainBuOptions = getMainBusinessGroupOptions();

  // Navigation handlers
  const navigateToLayer = (
    layer: NavigationLayer,
    breadcrumbLabel?: string
  ) => {
    if (breadcrumbLabel) {
      setBreadcrumbs((prev) => [
        ...prev,
        {
          label: breadcrumbLabel,
          layer,
          onClick: () => navigateToBreadcrumb(layer),
        },
      ]);
    }
    setCurrentLayer(layer);
  };

  const navigateToBreadcrumb = (targetLayer: NavigationLayer) => {
    setBreadcrumbs((prevBreadcrumbs) => {
      const breadcrumbIndex = prevBreadcrumbs.findIndex(
        (crumb) => crumb.layer === targetLayer
      );

      if (breadcrumbIndex !== -1) {
        return prevBreadcrumbs.slice(0, breadcrumbIndex + 1);
      }
      return prevBreadcrumbs;
    });
    setCurrentLayer(targetLayer);
  };

  const navigateBack = () => {
    setBreadcrumbs((prevBreadcrumbs) => {
      if (prevBreadcrumbs.length > 0) {
        const newBreadcrumbs = [...prevBreadcrumbs];
        newBreadcrumbs.pop();
        setCurrentLayer((prevLayer) => {
          const previousLayer = (prevLayer - 1) as NavigationLayer;
          return previousLayer >= 1 ? previousLayer : 1;
        });
        return newBreadcrumbs;
      } else {
        setCurrentLayer(1);
        return [];
      }
    });
  };

  const handleStageClick = (stageType: NPDeviationStageType) => {
    const stageLabels: Partial<Record<NPDeviationStageType, string>> = {
      'budget-np': 'Budget NP',
      'vol-impact': 'COSG analysis',
      'price-impact': 'COSG analysis',
      'cost-impact': 'COSG analysis',
      'mva-deviation': 'COSG analysis',
    };

    // Set the tab based on clicked stage
    if (stageType === 'cost-impact') {
      setSelectedCOGSTab('products');
    } else if (stageType === 'mva-deviation') {
      setSelectedCOGSTab('sites');
    } else {
      setSelectedCOGSTab('sites');
    }

    navigateToLayer(2, stageLabels[stageType] || 'COSG analysis');
  };

  const handleLaborMOHClick = () => {
    navigateToLayer(4, 'MVA Breakdown');
  };

  // Update URL when BU changes
  const handleBuChange = (buId: string) => {
    setSelectedBu(buId);
    setSearchParams({ bu: buId });
    // Reset expanded rows when changing filter
    setExpandedRows(new Set());
  };

  // Toggle row expansion
  const toggleRowExpansion = (bgId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(bgId)) {
        next.delete(bgId);
      } else {
        next.add(bgId);
      }
      return next;
    });
  };

  // Get data based on selected BU
  const tableData = useMemo(() => {
    if (selectedBu === 'all') {
      return getAllBusinessGroupData();
    }
    return getSubBusinessGroupsWithOverall(selectedBu);
  }, [selectedBu]);

  // Prepare chart data for Layer 1 (NP Deviation)
  const npDeviationChartData = useMemo(() => {
    return mockNPDeviationStages.map((stage, index) => {
      const prevValue = index > 0 ? mockNPDeviationStages[index - 1].value : 0;
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
        isClickable: stage.isClickable,
      };
    });
  }, []);

  // Get sub-groups for expanded rows
  const getExpandedSubGroups = (bgId: string) => {
    return getSubBusinessGroups(bgId);
  };

  // Get section title
  const getSectionTitle = () => {
    if (selectedBu === 'all') {
      return 'All BUs';
    }
    const bg = mainBuOptions.find((b) => b.id === selectedBu);
    return bg?.name || selectedBu.toUpperCase();
  };

  const timeframeOptions: { value: TimeframeOption; label: string }[] = [
    { value: 'full-year', label: 'Full-year forecast' },
    { value: 'ytm', label: 'Year to Month actuals' },
    { value: 'rest-of-year', label: 'Rest of Year forecast' },
    { value: 'in-quarter', label: 'In-quarter actuals' },
    { value: 'in-month', label: 'In-month actuals' },
  ];

  const renderMetricCell = (
    metric: BusinessGroupMetricWithTrend,
    groupName: string,
    metricName: string,
    isLast: boolean = false
  ) => {
    const percentColor =
      metric.percent > 0
        ? 'bg-green-100 text-green-700'
        : metric.percent < 0
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-600';
    const percentSign = metric.percent > 0 ? '+' : '';

    // Calculate trend line for sparkline
    const trendValues = metric.trend.map((t) => t.value);
    const minVal = Math.min(...trendValues);
    const maxVal = Math.max(...trendValues);
    const range = maxVal - minVal || 1;

    // Generate SVG path for trend line
    const pathPoints = metric.trend
      .map((t, i) => {
        const x = (i / (metric.trend.length - 1)) * 180;
        const y = 40 - ((t.value - minVal) / range) * 35;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const trendColor =
      metric.percent > 0
        ? '#22c55e'
        : metric.percent < 0
        ? '#ef4444'
        : '#6b7280';

    if (!showComparisonDetails) {
      return (
        <td
          key={metricName}
          className={`px-4 py-3 border-b border-gray-200 ${
            !isLast ? 'border-r' : ''
          } relative group`}>
          <div className='text-left'>
            <div className='text-base font-bold text-gray-900'>
              ${metric.value.toFixed(1)}B
            </div>
          </div>
        </td>
      );
    }

    return (
      <td
        key={metricName}
        className={`px-4 py-3 border-b border-gray-200 ${
          !isLast ? 'border-r' : ''
        } relative group`}>
        <div className='flex items-center justify-center gap-4'>
          <div className='text-left'>
            <div className='text-base font-bold text-gray-900'>
              ${metric.value.toFixed(1)}M
            </div>
          </div>
          <div className='text-center'>
            <div className='text-xs text-gray-500 mb-0.5'>
              vs budget ${metric.baseline.toFixed(1)}M
            </div>
            <div className='text-xs text-gray-500'>
              vs Last Year ${metric.baseline.toFixed(1)}M
            </div>
          </div>
          <div className='flex flex-col gap-0.5'>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${percentColor}`}>
              {percentSign}
              {metric.percent.toFixed(1)}%
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${percentColor}`}>
              {percentSign}
              {metric.percent.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Hover Tooltip */}
        <div className='absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto'>
          <div className='bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72'>
            {/* Header */}
            <div className='flex items-center justify-between mb-3 pb-2 border-b border-gray-100'>
              <span className='text-sm font-bold text-gray-900'>
                {groupName} - {metricName}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${percentColor}`}>
                {percentSign}
                {metric.percent.toFixed(1)}%
              </span>
            </div>

            {/* 12-Month Trend Chart */}
            <div className='mb-3'>
              <div className='text-xs font-semibold text-gray-600 mb-2'>
                12-Month Trend
              </div>
              <div className='bg-gray-50 rounded-lg p-2'>
                <svg
                  viewBox='0 0 180 50'
                  className='w-full h-12'>
                  {/* Grid lines */}
                  <line
                    x1='0'
                    y1='25'
                    x2='180'
                    y2='25'
                    stroke='#e5e7eb'
                    strokeWidth='1'
                    strokeDasharray='4'
                  />
                  {/* Trend line */}
                  <path
                    d={pathPoints}
                    fill='none'
                    stroke={trendColor}
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  {/* End point */}
                  <circle
                    cx='180'
                    cy={
                      40 -
                      ((trendValues[trendValues.length - 1] - minVal) / range) *
                        35
                    }
                    r='3'
                    fill={trendColor}
                  />
                </svg>
                <div className='flex justify-between text-xs text-gray-400 mt-1'>
                  <span>{metric.trend[0].month}</span>
                  <span>{metric.trend[metric.trend.length - 1].month}</span>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div>
              <div className='flex items-center gap-1.5 mb-2'>
                <SparklesIcon className='w-4 h-4 text-primary-500' />
                <span className='text-xs font-semibold text-gray-600'>
                  AI Insight
                </span>
              </div>
              <p className='text-xs text-gray-600 leading-relaxed'>
                {metric.aiInsight}
              </p>
            </div>
          </div>
          {/* Arrow */}
          <div className='absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45'></div>
        </div>
      </td>
    );
  };

  const renderTableRow = (
    group: BusinessGroupData,
    isExpandable: boolean = false,
    isSubGroup: boolean = false,
    isOverallRow: boolean = false
  ) => {
    const isExpanded = expandedRows.has(group.id);

    return (
      <tr
        key={group.id}
        className={`${
          isOverallRow
            ? 'bg-primary-50/50'
            : isSubGroup
            ? 'bg-gray-50'
            : 'hover:bg-gray-50 transition-colors'
        } ${isExpandable ? 'cursor-pointer' : ''}`}
        onClick={isExpandable ? () => toggleRowExpansion(group.id) : undefined}>
        <td className='px-6 py-3 border-b border-r border-gray-200'>
          <div className='flex items-center gap-2'>
            {isExpandable && (
              <span className='text-gray-400'>
                {isExpanded ? (
                  <ChevronDownIcon className='w-4 h-4' />
                ) : (
                  <ChevronRightIcon className='w-4 h-4' />
                )}
              </span>
            )}
            {isSubGroup && <span className='w-4' />}
            <span
              className={`text-sm font-semibold ${
                isOverallRow ? 'text-primary-700' : 'text-gray-900'
              }`}>
              {group.name}
            </span>
          </div>
        </td>
        {renderMetricCell(group.rev, group.name, 'Revenue')}
        {renderMetricCell(group.gp, group.name, 'Gross Profit')}
        {renderMetricCell(group.op, group.name, 'Operating Profit')}
        {renderMetricCell(group.np, group.name, 'Net Profit', true)}
      </tr>
    );
  };

  // Render Layer 1: Financial Overview + Waterfall
  const renderLayer1 = () => (
    <>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-[1920px] mx-auto px-8 py-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Business groups performance
          </h1>
        </div>
      </div>

      {/* Filters Section */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-[1920px] mx-auto px-8 py-6'>
          {/* Timeframe Filter */}
          <div className='flex items-center gap-4 mb-4'>
            <span className='text-sm font-medium text-gray-600 w-32'>
              Timeframe
            </span>
            <div className='flex bg-gray-100 rounded-lg p-1'>
              {timeframeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimeframe(option.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedTimeframe === option.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Select BU Filter */}
          <div className='flex items-center gap-4'>
            <span className='text-sm font-medium text-gray-600 w-32'>
              Select BU
            </span>
            <div className='flex bg-gray-100 rounded-lg p-1'>
              <button
                onClick={() => handleBuChange('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedBu === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                All BUs
              </button>
              {mainBuOptions.map((bu) => (
                <button
                  key={bu.id}
                  onClick={() => handleBuChange(bu.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedBu === bu.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}>
                  {bu.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-[1920px] mx-auto px-8 py-8'>
        {/* Financial Overview Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2'>
              <ChartBarIcon className='w-5 h-5 text-primary-600' />
              <h2 className='text-lg font-semibold text-gray-700 italic'>
                Financial overview – {getSectionTitle()}
              </h2>
            </div>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-600'>Show Details</span>
                <button
                  onClick={() =>
                    setShowComparisonDetails(!showComparisonDetails)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    showComparisonDetails ? 'bg-primary-600' : 'bg-gray-200'
                  }`}>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showComparisonDetails ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
          {/* Key Call Out Section */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300 mb-4'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-bold text-gray-900'>Key Call Out</h2>
              <span className='px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border-2 border-purple-400 shadow-md shadow-purple-200/50 flex items-center gap-1.5'>
                <span className='text-sm'>✨</span>
                <span>AI</span>
              </span>
            </div>
            <div className='space-y-3'>
              <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
                {mockNPDeviationKeyCallOut.bulletPoints.map((point, index) => (
                  <li
                    key={index}
                    className='text-sm'>
                    {point}
                  </li>
                ))}
              </ul>
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <p className='text-sm text-gray-700 leading-relaxed'>
                  {mockNPDeviationKeyCallOut.rootCauseAnalysis}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-visible'>
            <p className='text-sm text-gray-600 mt-1'>
              Quarterly Actual, USD
            </p>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-50'>
                  <th className='text-left px-6 py-3 border-b border-r border-gray-200'>
                    <span className='text-sm font-semibold text-gray-700'>
                      Business Group
                    </span>
                  </th>
                  <th className='text-center px-4 py-3 border-b border-r border-gray-200'>
                    <span className='text-sm font-bold text-gray-900'>
                      Revenue
                    </span>
                  </th>
                  <th className='text-center px-4 py-3 border-b border-r border-gray-200'>
                    <span className='text-sm font-bold text-gray-900'>
                      Gross Profit
                    </span>
                  </th>
                  <th className='text-center px-4 py-3 border-b border-r border-gray-200'>
                    <span className='text-sm font-bold text-gray-900'>
                      Operating Profit
                    </span>
                  </th>
                  <th className='text-center px-4 py-3 border-b border-gray-200'>
                    <span className='text-sm font-bold text-gray-900'>
                      Net Profit
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((group) => {
                  const isOverallRow =
                    group.id === 'overall' || group.id.endsWith('-overall');
                  const isExpandable =
                    selectedBu === 'all' && group.id !== 'overall';
                  const isExpanded = expandedRows.has(group.id);

                  return (
                    <>
                      {renderTableRow(group, isExpandable, false, isOverallRow)}
                      {isExpanded &&
                        getExpandedSubGroups(group.id).map((subGroup) =>
                          renderTableRow(subGroup, false, true, false)
                        )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Waterfall Section */}
        <div className='space-y-6'>
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-8 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  NP Deviation Breakdown (Quarterly Actual)
                </h2>
                <p className='text-sm text-gray-500 mt-1 flex items-center gap-1'>
                  <ArrowRightIcon className='w-4 h-4 text-blue-500' />
                  <span>
                    Click on Budget NP, Vol. impact, Price impact, Material &
                    Outsource, or MVA Deviation to drill down
                  </span>
                </p>
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

            <div className='h-96'>
              <ResponsiveContainer
                width='100%'
                height='100%'>
                <ComposedChart data={npDeviationChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='label'
                    angle={-15}
                    textAnchor='end'
                    height={120}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      const isHighlighted = [
                        'Vol. impact',
                        'Price impact',
                        'Material & Outsource',
                        'MVA Deviation',
                        'Mix impact',
                      ].includes(payload.value);
                      return (
                        <text
                          x={x}
                          y={y}
                          textAnchor='end'
                          transform={`rotate(-15, ${x}, ${y})`}
                          style={{
                            fontSize: '11px',
                            fill: isHighlighted ? '#1e3a8a' : '#374151',
                            fontWeight: isHighlighted ? 'bold' : 'normal',
                          }}>
                          {payload.value}
                        </text>
                      );
                    }}
                  />
                  <YAxis
                    style={{ fontSize: '12px' }}
                    label={{
                      value: 'Net Profit (Mn USD)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: '12px' },
                    }}
                  />
                  <ReferenceArea
                    x1='Vol. impact'
                    x2='Mix impact'
                    fill='#3b82f6'
                    fillOpacity={0.2}
                    stroke='#1e40af'
                    strokeDasharray='5 5'
                    style={{ pointerEvents: 'none' }}
                  />
                  <Tooltip
                    formatter={(
                      value: number,
                      _name: string,
                      props: {
                        payload?: {
                          [key: string]: string | number | boolean | undefined;
                          cumulativeValue?: number;
                          delta?: number;
                          label?: string;
                          isClickable?: boolean;
                        };
                      }
                    ) => {
                      const payload = props.payload;
                      const cumulative = payload?.cumulativeValue ?? value;
                      const delta = payload?.delta;
                      const isClickable = payload?.isClickable;

                      const tooltipLines: string[] = [];

                      if (delta !== undefined && delta !== cumulative) {
                        tooltipLines.push(
                          `${delta > 0 ? '+' : ''}$${delta.toFixed(1)}M`
                        );
                      }

                      if (isClickable) {
                        tooltipLines.push('Deep dive →');
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
                    name='NP Deviation'>
                    <LabelList
                      dataKey='delta'
                      position='middle'
                      formatter={(value: any) =>
                        `${value >= 0 ? '' : ''}$${Number(value).toFixed(1)}M`
                      }
                      style={{
                        fontSize: '11px',
                        fill: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                    {mockNPDeviationStages.map((stage, index) => {
                      const isBaseline = stage.type === 'baseline';
                      const isPositive = stage.type === 'positive';

                      let fillColor = '#6b7280';
                      if (!isBaseline) {
                        fillColor = isPositive ? '#10b981' : '#ef4444';
                      }

                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={fillColor}
                          style={{
                            cursor: stage.isClickable ? 'pointer' : 'default',
                            stroke: stage.isClickable ? '#3b82f6' : 'none',
                            strokeWidth: stage.isClickable ? 2 : 0,
                            opacity: stage.isClickable ? 1 : 0.9,
                          }}
                          onClick={() => {
                            if (stage.isClickable) {
                              handleStageClick(stage.stage);
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (stage.isClickable) {
                              e.currentTarget.style.opacity = '0.8';
                              e.currentTarget.style.strokeWidth = '3';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (stage.isClickable) {
                              e.currentTarget.style.opacity = '1';
                              e.currentTarget.style.strokeWidth = '2';
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
        </div>
      </div>
    </>
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50'>
      {currentLayer === 1 && renderLayer1()}
      {currentLayer !== 1 && (
        <div className='p-8 max-w-[1920px] mx-auto'>
          {currentLayer === 2 && (
            <ProductAnalysisLayer
              breadcrumbs={breadcrumbs}
              onBack={navigateBack}
              initialTab={selectedCOGSTab}
            />
          )}
          {currentLayer === 3 && (
            <CostImpactBreakdownLayer
              breadcrumbs={breadcrumbs}
              onBack={navigateBack}
              onLaborMOHClick={handleLaborMOHClick}
            />
          )}
          {currentLayer === 4 && (
            <MVABreakdownLayer
              breadcrumbs={breadcrumbs}
              onBack={navigateBack}
            />
          )}
        </div>
      )}
    </div>
  );
}
