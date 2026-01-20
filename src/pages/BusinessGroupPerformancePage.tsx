import {
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BudgetForecastActualWaterfall from '../components/BudgetForecastActualWaterfall';
import {
  CostImpactBreakdownLayer,
  MVABreakdownLayer,
  ProductAnalysisLayer,
} from '../components/layers';
import TimeframePicker, {
  type TimeframeOption,
} from '../components/TimeframePicker';
import {
  getAllBusinessGroupData,
  getMainBusinessGroupOptions,
  getSubBusinessGroups,
  getSubBusinessGroupsWithOverall,
  type BusinessGroupData,
  type BusinessGroupMetricWithTrend,
} from '../data/mockBusinessGroupPerformance';
import {
  mockBudgetForecastStages,
  mockFunctionDeviationRows,
  type FunctionDeviationRow,
} from '../data/mockForecast';
import type { BreadcrumbItem, NavigationLayer } from '../types';
import {
  getStoredTimeframe,
  setStoredTimeframe,
} from '../utils/timeframeStorage';

export default function BusinessGroupPerformancePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial BU from query param
  const initialBu = searchParams.get('bu') || 'all';

  // Filter states
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeframeOption>(() => getStoredTimeframe());
  const [selectedBu, setSelectedBu] = useState<string>(initialBu);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );

  // Expanded rows state (for "All BUs" view)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Comparison details toggle
  const [showComparisonDetails, setShowComparisonDetails] =
    useState<boolean>(true);

  // Layer navigation state
  const [currentLayer, setCurrentLayer] = useState<NavigationLayer>(1);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [selectedCOGSTab] = useState<'sites' | 'products'>('sites');

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

  useEffect(() => {
    setStoredTimeframe(selectedTimeframe);
  }, [selectedTimeframe]);

  const isOverallRowId = (id: string) =>
    id === 'overall' || id.endsWith('-overall');

  // Get data based on selected BU
  const tableData = useMemo(() => {
    const dataTimeframe = selectedTimeframe === 'ytm' ? 'ytm' : 'full-year';
    if (selectedBu === 'all') {
      return getAllBusinessGroupData(dataTimeframe);
    }
    return getSubBusinessGroupsWithOverall(selectedBu, dataTimeframe);
  }, [selectedBu, selectedTimeframe]);

  const toggleGroupSelection = (bgId: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      const overallRow = tableData.find((row) => isOverallRowId(row.id));
      const overallId = overallRow?.id;
      const isOverall = isOverallRowId(bgId);

      if (isOverall) {
        if (next.has(bgId)) {
          next.delete(bgId);
        } else {
          next.clear();
          next.add(bgId);
        }
        return next;
      }

      if (overallId && next.has(overallId)) {
        next.delete(overallId);
      }

      if (next.has(bgId)) {
        next.delete(bgId);
      } else {
        next.add(bgId);
      }

      if (next.size === 0 && overallId) {
        next.add(overallId);
      }

      return next;
    });
  };

  const orderedTableData = useMemo(() => {
    const overallRow = tableData.find((row) => isOverallRowId(row.id));
    const remainingRows = tableData.filter((row) => !isOverallRowId(row.id));
    return overallRow ? [overallRow, ...remainingRows] : tableData;
  }, [tableData]);

  useEffect(() => {
    const overallRow = tableData.find((row) => isOverallRowId(row.id));
    if (overallRow) {
      setSelectedGroupIds(new Set([overallRow.id]));
    } else if (tableData.length === 0) {
      setSelectedGroupIds(new Set());
    }
  }, [tableData]);

  useEffect(() => {
    if (selectedGroupIds.size === 0) {
      const overallRow = tableData.find((row) => isOverallRowId(row.id));
      if (overallRow) {
        setSelectedGroupIds(new Set([overallRow.id]));
      }
    }
  }, [selectedGroupIds, tableData]);

  // Get sub-groups for expanded rows
  const getExpandedSubGroups = (bgId: string) => {
    const dataTimeframe = selectedTimeframe === 'ytm' ? 'ytm' : 'full-year';
    return getSubBusinessGroups(bgId, dataTimeframe);
  };

  const sectionTitle = useMemo(() => {
    if (selectedBu === 'all') {
      return 'All BUs';
    }
    const bg = mainBuOptions.find((b) => b.id === selectedBu);
    return bg?.name || selectedBu.toUpperCase();
  }, [mainBuOptions, selectedBu]);

  const selectionMetrics = useMemo(() => {
    const overallRow = tableData.find((row) => isOverallRowId(row.id));
    const baseRows = tableData.filter((row) => !isOverallRowId(row.id));
    const totalNpValue =
      overallRow?.np.value ??
      baseRows.reduce((sum, row) => sum + row.np.value, 0);
    const totalNpBaseline =
      overallRow?.np.baseline ??
      baseRows.reduce((sum, row) => sum + row.np.baseline, 0);

    const selectedRows =
      selectedGroupIds.size === 0
        ? overallRow
          ? [overallRow]
          : baseRows
        : tableData.filter((row) => selectedGroupIds.has(row.id));
    const hasOverallSelected = selectedRows.some((row) =>
      isOverallRowId(row.id)
    );
    const selectedNpValue = hasOverallSelected
      ? overallRow?.np.value ?? totalNpValue
      : selectedRows.reduce((sum, row) => sum + row.np.value, 0);
    const selectedNpBaseline = hasOverallSelected
      ? overallRow?.np.baseline ?? totalNpBaseline
      : selectedRows.reduce((sum, row) => sum + row.np.baseline, 0);

    const scaleFactor =
      totalNpBaseline === 0 ? 1 : selectedNpBaseline / totalNpBaseline;

    return {
      totalNpBaseline,
      totalNpValue,
      selectedNpBaseline,
      selectedNpValue,
      scaleFactor,
    };
  }, [selectedGroupIds, tableData]);

  const formatMn = (value: number) =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

  const keyCallOut = useMemo(() => {
    const overallRow =
      tableData.find((row) => isOverallRowId(row.id)) ?? tableData[0];
    const actual = overallRow?.np.value ?? selectionMetrics.selectedNpValue;
    const budget = overallRow?.np.baseline ?? selectionMetrics.selectedNpBaseline;
    const delta = actual - budget;
    const deltaSign = delta >= 0 ? '+' : '-';
    const percent =
      budget === 0 ? 0 : (delta / Math.abs(budget)) * 100;
    const percentSign = percent >= 0 ? '+' : '-';
    const performance =
      delta >= 0 ? 'outperformance' : 'underperformance';
    const magnitude = Math.abs(percent);
    const intensity =
      magnitude >= 7.5 ? 'material' : magnitude >= 3 ? 'moderate' : 'slight';
    const directionText = delta >= 0 ? 'above' : 'below';

    return {
      bulletPoints: [
        `Actual NP is ${formatMn(actual)} Mn USD versus Budget NP of ${formatMn(
          budget
        )} Mn USD.`,
        `This is a ${intensity} ${performance}: ${deltaSign}${formatMn(
          Math.abs(delta)
        )} Mn USD (${percentSign}${magnitude.toFixed(1)}%).`,
        `${sectionTitle} overall performance sits ${directionText} plan, implying execution and mix effects are the primary drivers.`,
      ],
      rootCauseAnalysis: `Root cause analysis indicates ${sectionTitle} is tracking ${directionText} plan with a ${intensity} variance. The ${performance} vs budget suggests execution and mix levers are the dominant contributors, with variance of ${deltaSign}${formatMn(
        Math.abs(delta)
      )} Mn USD (${percentSign}${magnitude.toFixed(1)}%) between Actual and Budget NP.`,
    };
  }, [tableData, selectionMetrics, sectionTitle]);

  const scaledBudgetForecastStages = useMemo(() => {
    const {
      totalNpBaseline,
      selectedNpBaseline,
      selectedNpValue,
      scaleFactor,
    } = selectionMetrics;

    if (totalNpBaseline === 0) {
      return mockBudgetForecastStages;
    }

    const roundToOne = (value: number) => Math.round(value * 10) / 10;
    let runningValue = roundToOne(selectedNpBaseline);

    return mockBudgetForecastStages.map((stage) => {
      if (stage.stage === 'budget') {
        runningValue = roundToOne(selectedNpBaseline);
        return {
          ...stage,
          value: runningValue,
          delta: runningValue,
        };
      }

      if (stage.stage === 'actuals') {
        runningValue = roundToOne(selectedNpValue);
        return {
          ...stage,
          value: runningValue,
          delta: runningValue,
        };
      }

      if (stage.type === 'baseline') {
        return {
          ...stage,
          value: runningValue,
          delta: runningValue,
        };
      }

      const scaledDelta =
        stage.delta === undefined
          ? undefined
          : roundToOne(stage.delta * scaleFactor);
      if (scaledDelta !== undefined) {
        runningValue = roundToOne(runningValue + scaledDelta);
      }

      return {
        ...stage,
        value: runningValue,
        delta: scaledDelta,
      };
    });
  }, [selectionMetrics]);

  const selectedGroupLabel = useMemo(() => {
    if (selectedGroupIds.size === 0) {
      return `${sectionTitle} OP`;
    }
    const selectedRows = tableData.filter((row) =>
      selectedGroupIds.has(row.id)
    );
    if (selectedRows.length === 0) {
      return `${sectionTitle} OP`;
    }
    if (selectedRows.some((row) => isOverallRowId(row.id))) {
      return `${sectionTitle} OP`;
    }
    return `${selectedRows.map((row) => row.name).join(', ')} OP`;
  }, [selectedGroupIds, tableData, sectionTitle]);

  const scaledFunctionDeviationRows = useMemo(() => {
    const roundToOne = (value: number) => Math.round(value * 10) / 10;
    const topRowId = 'conn-op';
    const revenueRowId = 'revenue';
    const costRowId = 'cost';
    const revenueChildIds = ['topline'];
    const costChildIds = ['procurement', 'mva', 'rd', 'opex', 'shared-expenses'];

    const rowsById = new Map(
      mockFunctionDeviationRows.map((row) => [row.id, row])
    );
    const baseRevenue = rowsById.get(revenueRowId)?.ytmBudget ?? 0;
    const baseCost = rowsById.get(costRowId)?.ytmBudget ?? 0;
    const baseRevenueActuals = rowsById.get(revenueRowId)?.ytmActuals ?? 0;
    const baseCostActuals = rowsById.get(costRowId)?.ytmActuals ?? 0;

    const topBudget = selectionMetrics.selectedNpBaseline;
    const topActuals = selectionMetrics.selectedNpValue;

    const topBudgetScale =
      baseRevenue + baseCost === 0 ? 1 : topBudget / (baseRevenue + baseCost);
    const topActualsScale =
      baseRevenueActuals + baseCostActuals === 0
        ? 1
        : topActuals / (baseRevenueActuals + baseCostActuals);

    const revenueBudget = baseRevenue * topBudgetScale;
    const costBudget = baseCost * topBudgetScale;
    const revenueActuals = baseRevenueActuals * topActualsScale;
    const costActuals = baseCostActuals * topActualsScale;

    const baseRevenueChildrenBudget = revenueChildIds.reduce(
      (sum, id) => sum + (rowsById.get(id)?.ytmBudget ?? 0),
      0
    );
    const baseRevenueChildrenActuals = revenueChildIds.reduce(
      (sum, id) => sum + (rowsById.get(id)?.ytmActuals ?? 0),
      0
    );
    const baseCostChildrenBudget = costChildIds.reduce(
      (sum, id) => sum + (rowsById.get(id)?.ytmBudget ?? 0),
      0
    );
    const baseCostChildrenActuals = costChildIds.reduce(
      (sum, id) => sum + (rowsById.get(id)?.ytmActuals ?? 0),
      0
    );

    const scaleChildren = (
      ids: string[],
      baseTotal: number,
      targetTotal: number,
      key: 'ytmBudget' | 'ytmActuals'
    ) => {
      if (ids.length === 0) return new Map<string, number>();
      const scale = baseTotal === 0 ? 0 : targetTotal / baseTotal;
      const values = ids.map((id) => ({
        id,
        value: (rowsById.get(id)?.[key] ?? 0) * scale,
      }));
      const rounded = values.map((entry) => ({
        ...entry,
        value: roundToOne(entry.value),
      }));
      const sumRounded = rounded.reduce((sum, entry) => sum + entry.value, 0);
      const diff = roundToOne(targetTotal - sumRounded);
      if (rounded.length > 0) {
        rounded[rounded.length - 1].value = roundToOne(
          rounded[rounded.length - 1].value + diff
        );
      }
      return new Map(rounded.map((entry) => [entry.id, entry.value]));
    };

    const revenueBudgetChildren = scaleChildren(
      revenueChildIds,
      baseRevenueChildrenBudget,
      revenueBudget,
      'ytmBudget'
    );
    const revenueActualsChildren = scaleChildren(
      revenueChildIds,
      baseRevenueChildrenActuals,
      revenueActuals,
      'ytmActuals'
    );
    const costBudgetChildren = scaleChildren(
      costChildIds,
      baseCostChildrenBudget,
      costBudget,
      'ytmBudget'
    );
    const costActualsChildren = scaleChildren(
      costChildIds,
      baseCostChildrenActuals,
      costActuals,
      'ytmActuals'
    );

    return mockFunctionDeviationRows.map((row) => {
      const isTopRow = row.id === topRowId;
      if (isTopRow) {
        return {
          ...row,
          label: selectedGroupLabel,
          ytmBudget: roundToOne(topBudget),
          ytmActuals: roundToOne(topActuals),
        };
      }
      if (row.id === revenueRowId) {
        return {
          ...row,
          ytmBudget: roundToOne(revenueBudget),
          ytmActuals: roundToOne(revenueActuals),
        };
      }
      if (row.id === costRowId) {
        return {
          ...row,
          ytmBudget: roundToOne(costBudget),
          ytmActuals: roundToOne(costActuals),
        };
      }
      if (revenueBudgetChildren.has(row.id)) {
        return {
          ...row,
          ytmBudget: revenueBudgetChildren.get(row.id) ?? row.ytmBudget,
          ytmActuals: revenueActualsChildren.get(row.id) ?? row.ytmActuals,
        };
      }
      if (costBudgetChildren.has(row.id)) {
        return {
          ...row,
          ytmBudget: costBudgetChildren.get(row.id) ?? row.ytmBudget,
          ytmActuals: costActualsChildren.get(row.id) ?? row.ytmActuals,
        };
      }
      return row;
    });
  }, [
    selectionMetrics.selectedNpBaseline,
    selectionMetrics.selectedNpValue,
    selectedGroupLabel,
  ]);

  const getFunctionInsight = (row: FunctionDeviationRow) => {
    if (row.ytmBudget === 0) {
      return {
        text: row.aiInsight,
        severity: 'low' as const,
        needsAttention: false,
      };
    }
    const variance = row.ytmActuals - row.ytmBudget;
    const percent = (variance / Math.abs(row.ytmBudget)) * 100;
    const percentValue = Math.abs(percent).toFixed(1);
    const percentSign = percent >= 0 ? '+' : '-';
    const varianceSign = variance >= 0 ? '+' : '-';
    const varianceLabel = `${varianceSign}${formatMn(
      Math.abs(variance)
    )} Mn USD`;
    const status = variance < 0 ? 'adverse' : 'favourable';
    const severity = Math.abs(percent) >= 7.5 ? 'high' : 'low';
    const needsAttention = variance < 0 && Math.abs(percent) >= 5;
    return {
      text: `${row.label} deviates ${percentSign}${percentValue}% vs budget (${varianceLabel}, ${status}).`,
      severity,
      needsAttention,
    };
  };

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
              vs Last Year ${metric.stly.toFixed(1)}M
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

  const renderFunctionRow = (row: FunctionDeviationRow) => {
    const labelClasses = row.isEmphasis
      ? 'text-gray-900 font-semibold'
      : 'text-gray-700';
    const insight = getFunctionInsight(row);
    const handleRowDoubleClick = () => {
      navigateToLayer(2, 'Sites');
    };
    return (
      <tr
        key={row.id}
        className='border-b border-gray-200 last:border-b-0 hover:bg-gray-50'
        onDoubleClick={handleRowDoubleClick}>
        <td className='px-6 py-3'>
          <div
            className={`${labelClasses}`}
            style={{ paddingLeft: row.indentLevel ? row.indentLevel * 20 : 0 }}>
            {row.label}
          </div>
        </td>
        <td className='px-6 py-3 text-right text-gray-700'>
          {formatMn(row.ytmBudget)}
        </td>
        <td className='px-6 py-3 text-right text-gray-700'>
          {formatMn(row.ytmActuals)}
        </td>
        <td className='px-6 py-3'>
          <div className='flex flex-wrap items-center gap-2 text-sm'>
            <span className='text-gray-600'>{insight.text}</span>
            {insight.needsAttention && (
              <span className='inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-[11px] font-semibold'>
                Needs attention
              </span>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const renderTableRow = (
    group: BusinessGroupData,
    isExpandable: boolean = false,
    isSubGroup: boolean = false,
    isOverallRow: boolean = false
  ) => {
    const isExpanded = expandedRows.has(group.id);
    const isClickable = isExpandable || isSubGroup;

    const handleRowClick = () => {
      if (isExpandable) {
        toggleRowExpansion(group.id);
      } else if (isSubGroup) {
        navigateToLayer(2, group.name);
      }
    };

    return (
      <tr
        key={group.id}
        className={`${
          isOverallRow
            ? 'bg-primary-50/50'
            : isSubGroup
            ? 'bg-gray-50 hover:bg-gray-100 transition-colors'
            : 'hover:bg-gray-50 transition-colors'
        } ${isClickable ? 'cursor-pointer' : ''}`}
        onClick={isClickable ? handleRowClick : undefined}>
        <td className='px-6 py-3 border-b border-r border-gray-200'>
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={selectedGroupIds.has(group.id)}
              onChange={() => toggleGroupSelection(group.id)}
              onClick={(event) => event.stopPropagation()}
              className='h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500'
              aria-label={`Select ${group.name}`}
            />
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
          <TimeframePicker
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
            className='mb-4'
          />

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

      {/* Key Call Out Section */}
      <div className='max-w-[1920px] mx-auto px-8 pt-6'>
        <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-bold text-gray-900'>Key Call Out</h2>
            <span className='px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border-2 border-purple-400 shadow-md shadow-purple-200/50 flex items-center gap-1.5'>
              <span className='text-sm'>✨</span>
              <span>AI</span>
            </span>
          </div>
          <div className='space-y-3'>
            <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
              {keyCallOut.bulletPoints.map((point, index) => (
                <li
                  key={index}
                  className='text-sm'>
                  {point}
                </li>
              ))}
            </ul>
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <p className='text-sm text-gray-700 leading-relaxed'>
                {keyCallOut.rootCauseAnalysis}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-[1920px] mx-auto px-8 pt-6'>
        {/* Financial Overview Section */}
        <div className='mb-8'>
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-visible'>
            <div className='px-6 pt-6'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <ChartBarIcon className='w-5 h-5 text-primary-600' />
                  <h2 className='text-lg font-bold text-gray-900'>
                    Decomposition by BU - {sectionTitle}
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
              <p className='text-sm text-gray-600 mt-1'>Quarterly Actual, USD</p>
            </div>
            <div className='px-4 pb-4 pt-2'>
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
                {orderedTableData.map((group) => {
                  const isOverallRow =
                    group.id === 'overall' || group.id.endsWith('-overall');
                  const isExpandable =
                    selectedBu === 'all' && group.id !== 'overall';
                  // When a specific BU is selected, non-overall rows should be clickable
                  const isSubGroupRow = selectedBu !== 'all' && !isOverallRow;
                  const isExpanded = expandedRows.has(group.id);

                  return (
                    <>
                      {renderTableRow(
                        group,
                        isExpandable,
                        isSubGroupRow,
                        isOverallRow
                      )}
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
        </div>
      </div>

      {/* Budget Forecast Actual Waterfall Section */}
      <div className='max-w-[1920px] mx-auto px-8 pb-8'>
        <BudgetForecastActualWaterfall
          stages={scaledBudgetForecastStages}
          title='Deviation waterfall of BU performance by value driver'
          subtitle='Operating Profit, Mn USD'
        />
      </div>

      {/* Deviation by Functions Section */}
      <div className='max-w-[1920px] mx-auto px-8 pb-12'>
        <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300'>
          <div className='mb-4'>
            <h2 className='text-2xl font-bold text-gray-900'>
              Deviation of BU performance by functions
            </h2>
            <p className='text-sm text-gray-500 mt-1'>Mn, USD</p>
          </div>
          <div className='overflow-hidden rounded-lg border border-gray-200'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-6 py-3 text-left font-semibold text-gray-700'>
                    Functions
                  </th>
                  <th className='px-6 py-3 text-right font-semibold text-gray-700'>
                    YTM budget
                  </th>
                  <th className='px-6 py-3 text-right font-semibold text-gray-700'>
                    YTM actuals
                  </th>
                  <th className='px-6 py-3 text-left font-semibold text-gray-700'>
                    <div className='flex items-center gap-2'>
                      <span>Insights</span>
                      <span className='px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border border-purple-300 shadow-sm flex items-center gap-1'>
                        <span className='text-xs'>✨</span>
                        <span>AI</span>
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>{scaledFunctionDeviationRows.map(renderFunctionRow)}</tbody>
            </table>
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
