import {
    ArrowRightIcon,
    CalendarIcon,
    ChartBarIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
 
import React, { useEffect, useMemo, useState } from 'react';
import {
    Link,
    useNavigate,
    useOutletContext,
    useSearchParams,
} from 'react-router-dom';
import BudgetPerformanceWaterfall from '../components/BudgetPerformanceWaterfall';
import HeaderFilters from '../components/HeaderFilters';
import MeetingSchedulingModal from '../components/MeetingSchedulingModal';
import RootCauseAnalysisSidebar from '../components/RootCauseAnalysisSidebar';
import { type TimeframeOption } from '../components/TimeframePicker';
import {
    getAllBusinessGroupData,
    getMainBusinessGroupOptions,
    getSubBusinessGroups,
    getSubBusinessGroupsWithOverall,
    type BusinessGroupData,
    type BusinessGroupMetricWithTrend,
} from '../data/mockBusinessGroupPerformance';
import { mockBudgetForecastStages } from '../data/mockForecast';
import { internalPulseColumns } from '../data/mockInternalPulse';
import type {
  BudgetForecastStage,
  Meeting,
  MeetingMaterial,
  PulseMetric,
} from '../types';
import type { SelectedItem } from '../utils/meetingRelevance';
import { findRelevantMeetings } from '../utils/meetingRelevance';
import {
    getStoredTimeframe,
    setStoredTimeframe,
} from '../utils/timeframeStorage';

interface ExecutiveSummaryPageContext {
  meetingMaterials: Record<string, MeetingMaterial[]>;
}

interface ExecutiveSummaryPageProps {
  isBudgetView?: boolean;
  defaultHomeToggle?: 'budget' | 'ytm' | 'full-year';
  pageTitle?: string;
}

export default function ExecutiveSummaryPage({
  isBudgetView = false,
  defaultHomeToggle = 'ytm',
  pageTitle,
}: ExecutiveSummaryPageProps) {
  useOutletContext<ExecutiveSummaryPageContext>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selection state
  const [selectedFinancialKPIs, setSelectedFinancialKPIs] = useState<
    Set<string>
  >(new Set());

  // Modal state
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const [selectedBu, setSelectedBu] = useState<string>('all');
  const mainBuOptions = getMainBusinessGroupOptions();

  const selectedBuLabel = useMemo(() => {
    if (selectedBu === 'all') {
      return 'Overall';
    }
    return mainBuOptions.find((bu) => bu.id === selectedBu)?.name ?? 'Overall';
  }, [selectedBu, mainBuOptions]);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [showComparisonDetails, setShowComparisonDetails] =
    useState<boolean>(true);

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(
    () => (isBudgetView ? 'full-year' : getStoredTimeframe())
  );
  const [homeToggle, setHomeToggle] = useState<'budget' | 'ytm' | 'full-year'>(
    defaultHomeToggle
  );

  useEffect(() => {
    setStoredTimeframe(selectedTimeframe);
  }, [selectedTimeframe]);

  useEffect(() => {
    if (homeToggle === 'ytm') {
      setSelectedTimeframe('ytm');
    } else {
      setSelectedTimeframe('full-year');
    }
  }, [homeToggle]);

  useEffect(() => {
    const toggleParam = searchParams.get('toggle');
    if (
      toggleParam === 'budget' ||
      toggleParam === 'ytm' ||
      toggleParam === 'full-year'
    ) {
      if (isBudgetView && toggleParam === 'budget') {
        setHomeToggle('full-year');
      } else {
        setHomeToggle(toggleParam);
      }
      return;
    }
    if (toggleParam) {
      setHomeToggle(isBudgetView ? 'full-year' : 'ytm');
    }
  }, [searchParams, isBudgetView]);

  useEffect(() => {
    const buParam = searchParams.get('bu');
    if (!buParam) {
      return;
    }
    if (buParam === 'all') {
      setSelectedBu('all');
      return;
    }
    const validBu = mainBuOptions.find((bu) => bu.id === buParam);
    if (validBu) {
      setSelectedBu(validBu.id);
    }
  }, [searchParams, mainBuOptions]);

  const handleBuChange = (buId: string) => {
    setSelectedBu(buId);
    setSearchParams(
      (prev) => {
        if (prev.get('bu') === buId) {
          return prev;
        }
        const next = new URLSearchParams(prev);
        next.set('bu', buId);
        return next;
      },
      { replace: true }
    );
  };

  // Get Financial and Topline KPIs from Internal Pulse
  const getFinancialAndToplineKPIs = (): PulseMetric[] => {
    const metrics: PulseMetric[] = [];

    // Get Financial column KPIs
    const financialColumn = internalPulseColumns.find(
      (col) => col.type === 'financial'
    );
    if (financialColumn) {
      // Get P&L metrics (Net Profit, Operating Profit)
      const plSection = financialColumn.sections.find((s) => s.title === 'P&L');
      if (plSection) {
        const netProfit = plSection.metrics.find((m) => m.id === 'net-profit');
        const operatingProfit = plSection.metrics.find(
          (m) => m.id === 'operating-profit'
        );
        if (netProfit) metrics.push(netProfit);
        if (operatingProfit) metrics.push(operatingProfit);
      }

      // Get Working Capital metrics
      const workingCapitalSection = financialColumn.sections.find(
        (s) => s.title === 'Working Capital'
      );
      if (workingCapitalSection) {
        const workingCapital = workingCapitalSection.metrics.find(
          (m) => m.id === 'working-capital'
        );
        if (workingCapital) metrics.push(workingCapital);
      }
    }

    // Get Topline column KPIs (Total Revenue)
    const toplineColumn = internalPulseColumns.find(
      (col) => col.type === 'topline'
    );
    if (toplineColumn) {
      const revenueSection = toplineColumn.sections.find(
        (s) => s.title === 'Revenue'
      );
      if (revenueSection) {
        const totalRevenue = revenueSection.metrics.find(
          (m) => m.id === 'total-revenue'
        );
        if (totalRevenue) metrics.push(totalRevenue);
      }
    }

    return metrics;
  };

  const financialAndToplineKPIs = getFinancialAndToplineKPIs();

  const clearAllSelections = () => {
    setSelectedFinancialKPIs(new Set());
  };

  // Compute selected items for modals
  const selectedItemsForModals = useMemo((): SelectedItem[] => {
    const items: SelectedItem[] = [];

    // Add financial KPIs
    financialAndToplineKPIs.forEach((kpi) => {
      if (selectedFinancialKPIs.has(kpi.id)) {
        items.push({
          type: 'financial-kpi',
          id: kpi.id,
          name: kpi.name,
          data: kpi,
        });
      }
    });

    return items;
  }, [selectedFinancialKPIs, financialAndToplineKPIs]);

  // Find relevant meetings
  const relevantMeetings = useMemo(() => {
    if (selectedItemsForModals.length === 0) return [];
    return findRelevantMeetings(selectedItemsForModals);
  }, [selectedItemsForModals]);

  // Total selected count
  const totalSelectedCount = selectedFinancialKPIs.size;

  // Meeting handlers
  const handleScheduleNewMeeting = (meeting: Omit<Meeting, 'id'>) => {
    // In a real app, this would create the meeting via API
    // For now, we'll just log it
    console.log('Schedule new meeting:', meeting);
    // You could also update mockCalendarEvents here
    alert(`Meeting "${meeting.title}" scheduled successfully!`);
  };

  const handleAddToMeetings = (
    meetingIds: string[],
    materials: MeetingMaterial[]
  ) => {
    // In a real app, this would update meetings via API
    console.log('Add materials to meetings:', meetingIds, materials);
    alert(
      `Added ${materials.length} item${materials.length !== 1 ? 's' : ''} to ${
        meetingIds.length
      } meeting${meetingIds.length !== 1 ? 's' : ''}!`
    );
  };

  const tableData = useMemo(() => {
    const dataTimeframe = selectedTimeframe === 'ytm' ? 'ytm' : 'full-year';
    if (selectedBu === 'all') {
      return getAllBusinessGroupData(dataTimeframe);
    }
    return getSubBusinessGroupsWithOverall(selectedBu, dataTimeframe);
  }, [selectedBu, selectedTimeframe]);

  const budgetWaterfallStages = useMemo(() => {
    if (!isBudgetView) {
      return [];
    }
    const overallRow =
      tableData.find(
        (row) => row.id === 'overall' || row.id.endsWith('-overall')
      ) ?? tableData[tableData.length - 1];
    if (!overallRow) {
      return mockBudgetForecastStages;
    }

    const budgetValue = overallRow.np.baseline;
    const actualValue = overallRow.np.value;
    const baseBudgetValue =
      mockBudgetForecastStages.find((stage) => stage.stage === 'budget')
        ?.value ?? 0;
    const scaleFactor =
      baseBudgetValue === 0 ? 1 : budgetValue / baseBudgetValue;

    const roundToOne = (value: number) => Math.round(value * 10) / 10;

    let runningValue = roundToOne(budgetValue);
    const baseStages = mockBudgetForecastStages.map((stage) => {
      const isBaselineStage = stage.type === 'baseline';
      const isBudgetStage = stage.stage === 'budget';
      const isActualStage = stage.stage === 'actuals';

      if (isBudgetStage) {
        runningValue = roundToOne(budgetValue);
        return {
          ...stage,
          value: runningValue,
          delta: runningValue,
        };
      }

      if (isActualStage) {
        runningValue = roundToOne(actualValue);
        return {
          ...stage,
          value: runningValue,
          delta: runningValue,
        };
      }

      if (isBaselineStage) {
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

    const stageById = new Map(
      baseStages.map((stage) => [stage.stage, stage])
    );

    const totalChange = roundToOne(actualValue - budgetValue);
    const fallbackShare = (ratio: number) =>
      totalChange === 0
        ? roundToOne(budgetValue * ratio)
        : roundToOne(totalChange * ratio);

    const oneOffDeltaRaw =
      stageById.get('one-off-adjustments')?.delta ?? fallbackShare(0.12);
    const oneOffDelta = -Math.abs(oneOffDeltaRaw);
    const headwindsDelta =
      stageById.get('market-performance')?.delta ?? fallbackShare(0.28);
    const l4Delta =
      stageById.get('l4-vs-planned')?.delta ?? fallbackShare(0.22);
    const l3Delta =
      stageById.get('l3-vs-target')?.delta ?? fallbackShare(0.18);

    const afterOneOff = roundToOne(budgetValue + oneOffDelta);
    const afterHeadwinds = roundToOne(afterOneOff + headwindsDelta);
    const beforePipeline = afterHeadwinds;
    const afterL4 = roundToOne(beforePipeline + l4Delta);
    const afterL3 = roundToOne(afterL4 + l3Delta);
    const withPipeline =
      stageById.get('forecast')?.value ?? roundToOne(afterL3);
    const ideationDelta =
      totalChange === 0
        ? fallbackShare(0.2)
        : roundToOne(actualValue - withPipeline);
    const afterIdeation = roundToOne(withPipeline + ideationDelta);

    const makeStage = (
      stage: BudgetForecastStage['stage'],
      label: string,
      value: number,
      delta: number,
      type: BudgetForecastStage['type']
    ): BudgetForecastStage => ({
      stage,
      label,
      value,
      delta,
      type,
      isClickable: true,
    });

    const getBudgetStageType = (
      stage: BudgetForecastStage['stage'],
      delta: number,
      fallback: BudgetForecastStage['type']
    ): BudgetForecastStage['type'] => {
      if (fallback === 'baseline') {
        return fallback;
      }
      if (stage === 'market-performance' || stage === 'one-off-adjustments') {
        return delta >= 0 ? 'positive' : 'negative';
      }
      return 'positive';
    };

    return [
      makeStage(
        'budget',
        'Last year OP',
        roundToOne(budgetValue),
        roundToOne(budgetValue),
        'baseline'
      ),
      makeStage(
        'one-off-adjustments',
        'One-off items',
        afterOneOff,
        roundToOne(oneOffDelta),
        getBudgetStageType('one-off-adjustments', oneOffDelta, 'positive')
      ),
      makeStage(
        'market-performance',
        'Headwinds/Tailwinds',
        afterHeadwinds,
        roundToOne(headwindsDelta),
        getBudgetStageType('market-performance', headwindsDelta, 'positive')
      ),
      makeStage(
        'l4-to-l5-leakage',
        'Current year OP before transformation pipeline',
        beforePipeline,
        beforePipeline,
        'baseline'
      ),
      makeStage(
        'l4-vs-planned',
        'Ramp up of already implemented (L4) initiatives',
        afterL4,
        roundToOne(l4Delta),
        getBudgetStageType('l4-vs-planned', l4Delta, 'positive')
      ),
      makeStage(
        'l3-vs-target',
        'Initiatives to be implemented (L3)',
        afterL3,
        roundToOne(l3Delta),
        getBudgetStageType('l3-vs-target', l3Delta, 'positive')
      ),
      makeStage(
        'forecast',
        'Current year OP with transformation pipeline',
        roundToOne(withPipeline),
        roundToOne(withPipeline),
        'baseline'
      ),
      makeStage(
        'ideation',
        'Current year ideation target',
        afterIdeation,
        ideationDelta,
        getBudgetStageType('ideation', ideationDelta, 'positive')
      ),
      makeStage(
        'actuals',
        'Current year OP target',
        roundToOne(actualValue),
        roundToOne(actualValue),
        'baseline'
      ),
    ];
  }, [isBudgetView, tableData]);

  const getExpandedSubGroups = (bgId: string) => {
    const dataTimeframe = selectedTimeframe === 'ytm' ? 'ytm' : 'full-year';
    return getSubBusinessGroups(bgId, dataTimeframe);
  };

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

  const renderMetricCell = (
    metric: BusinessGroupMetricWithTrend,
    groupName: string,
    metricName: string,
    isLast: boolean = false,
    groupId?: string,
    isNavigable?: boolean
  ) => {
    const isBudgetMode = isBudgetView || homeToggle === 'budget';
    const handleCellClick = (e: React.MouseEvent) => {
      if (isNavigable && groupId) {
        e.stopPropagation(); // Prevent row expansion from triggering
        if (isBudgetView) {
          handleBuChange(groupId === 'overall' ? 'all' : groupId);
          return;
        }
        if (homeToggle === 'budget') {
          navigate(`/budget?bu=${groupId}`);
          return;
        }
        if (homeToggle === 'full-year') {
          navigate(`/market-intelligence?bu=${groupId}&timeframe=full-year`);
          return;
        }
        navigate(`/business-group-performance?bu=${groupId}&toggle=${homeToggle}`);
      }
    };
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
          onClick={handleCellClick}
          className={`px-4 py-3 border-b border-gray-200 ${
            !isLast ? 'border-r' : ''
          } relative group ${
            isNavigable ? 'cursor-pointer hover:bg-primary-50/50' : ''
          }`}>
          <div className='text-left'>
            <div className='text-base font-bold text-gray-900'>
              ${(isBudgetMode ? metric.baseline : metric.value).toFixed(1)}B
            </div>
          </div>
        </td>
      );
    }

    return (
      <td
        key={metricName}
        onClick={handleCellClick}
        className={`px-4 py-3 border-b border-gray-200 ${
          !isLast ? 'border-r' : ''
        } relative group ${
          isNavigable ? 'cursor-pointer hover:bg-primary-50/50' : ''
        }`}>
        <div className='flex items-center justify-center gap-4'>
          <div className='text-left'>
            <div className='text-base font-bold text-gray-900'>
              ${(isBudgetMode ? metric.baseline : metric.value).toFixed(0)}M
            </div>
          </div>
          <div className='text-center'>
            {!isBudgetMode && (
              <div className='text-xs text-gray-500 mb-0.5'>
                vs budget ${metric.baseline.toFixed(0)}M
              </div>
            )}
            <div className='text-xs text-gray-500'>
              vs Last Year ${metric.baseline.toFixed(0)}M
            </div>
          </div>
          <div className='flex flex-col gap-0.5'>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${percentColor}`}>
              {percentSign}
              {metric.percent.toFixed(1)}%
            </span>
            {!isBudgetView && (
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-semibold ${percentColor}`}>
                {percentSign}
                {metric.percent.toFixed(1)}%
              </span>
            )}
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
    // Only main business groups (including overall/Grand Total) should navigate on click
    const isMetricNavigable = !isSubGroup;

    const handleRowClick = () => {
      if (isMetricNavigable) {
        const buId = isOverallRow ? 'all' : group.id;
        if (isBudgetView) {
          handleBuChange(buId);
          return;
        }
        if (homeToggle === 'budget') {
          navigate(`/budget?bu=${buId}`);
          return;
        }
        if (homeToggle === 'full-year') {
          navigate(`/market-intelligence?bu=${buId}&timeframe=full-year`);
          return;
        }
        navigate(`/business-group-performance?bu=${buId}&toggle=${homeToggle}`);
      }
    };

    return (
      <tr
        key={group.id}
        className={`${
          isOverallRow
            ? 'bg-primary-50/50'
            : isSubGroup
            ? 'bg-gray-50'
            : 'hover:bg-gray-50 transition-colors'
        } ${isMetricNavigable ? 'cursor-pointer' : ''}`}
        onClick={isMetricNavigable ? handleRowClick : undefined}>
        <td className='px-6 py-3 border-b border-r border-gray-200'>
          <div className='flex items-center gap-2'>
            {isExpandable && (
              <button
                type='button'
                className='text-gray-400'
                onClick={(event) => {
                  event.stopPropagation();
                  toggleRowExpansion(group.id);
                }}>
                {isExpanded ? (
                  <ChevronDownIcon className='w-4 h-4' />
                ) : (
                  <ChevronRightIcon className='w-4 h-4' />
                )}
              </button>
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
        {renderMetricCell(
          group.rev,
          group.name,
          'Revenue',
          false,
          group.id,
          isMetricNavigable
        )}
        {renderMetricCell(
          group.gp,
          group.name,
          'Gross Profit',
          false,
          group.id,
          isMetricNavigable
        )}
        {renderMetricCell(
          group.op,
          group.name,
          'Operating Profit',
          false,
          group.id,
          isMetricNavigable
        )}
        {renderMetricCell(
          group.np,
          group.name,
          'Net Profit',
          true,
          group.id,
          isMetricNavigable
        )}
      </tr>
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        {/* Action Bar - appears when items are selected */}
        {totalSelectedCount > 0 && (
          <div className='sticky top-4 z-40 mb-6 bg-white rounded-xl border-2 border-primary-500 shadow-lg p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-gray-700'>
                    {totalSelectedCount} item
                    {totalSelectedCount !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={clearAllSelections}
                    className='text-xs text-gray-500 hover:text-gray-700 underline'>
                    Clear all
                  </button>
                </div>
                <p className='text-xs text-gray-500'>
                  💡 Drag selected items directly to calendar events on the left
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setIsAISidebarOpen(true)}
                  className='flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium'>
                  <SparklesIcon className='w-5 h-5' />
                  AI Analysis
                </button>
                <button
                  onClick={() => setIsMeetingModalOpen(true)}
                  className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium'>
                  <CalendarIcon className='w-5 h-5' />
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>
              {pageTitle ?? (isBudgetView ? 'Budget' : 'Home')}
            </h1>
            {/* <button
              onClick={() => setIsCreateActionModalOpen(true)}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
              <PlusIcon className='w-5 h-5' />
              Create Action
            </button> */}
          </div>
        </div>

        {/* Timeframe Filter */}
        <div className='mb-6'>
          <HeaderFilters
            timeframeContent={
              <div className='flex items-center gap-4'>
                <span className='text-sm font-medium text-gray-600 w-32'>
                  Timeframe
                </span>
                <div className='flex bg-gray-100 rounded-lg p-1'>
                  {(isBudgetView
                    ? [
                        { id: 'full-year', label: 'Full year' },
                      ]
                    : [
                        { id: 'budget', label: 'Budget' },
                        { id: 'ytm', label: 'Year to Month actuals' },
                        { id: 'full-year', label: 'Full year forecast' },
                      ]
                  ).map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setHomeToggle(
                          option.id as 'budget' | 'ytm' | 'full-year'
                        );
                        if (option.id === 'budget') {
                          setSelectedTimeframe('full-year');
                        } else if (option.id === 'ytm') {
                          setSelectedTimeframe('ytm');
                        } else {
                          setSelectedTimeframe('full-year');
                        }
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        homeToggle === option.id
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            }
            buOptions={mainBuOptions}
            selectedBu={selectedBu}
            onBuChange={handleBuChange}
            showBu={isBudgetView}
          />
        </div>

        {/* Business Group Performance Section */}
        <div className='mb-8'>
          <div
            className={
              isBudgetView
                ? 'bg-white rounded-xl border border-gray-200/60 shadow-sm p-6'
                : ''
            }>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                  <ChartBarIcon className='w-6 h-6 text-primary-600' />
                  Business Group Performance
                </h2>
                <p className='text-sm text-gray-600 mt-1'>Mn, USD</p>
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
                        showComparisonDetails
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <Link
                  to='/business-group-performance?bu=all'
                  className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
                  Business Group Details
                  <ArrowRightIcon className='w-4 h-4' />
                </Link>
              </div>
            </div>
            <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-visible'>
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
                      <React.Fragment key={group.id}>
                        {renderTableRow(
                          group,
                          isExpandable,
                          false,
                          isOverallRow
                        )}
                        {isExpanded &&
                          getExpandedSubGroups(group.id).map((subGroup) =>
                            renderTableRow(subGroup, false, true, false)
                          )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {isBudgetView && budgetWaterfallStages.length > 0 && (
              <div className='mt-6'>
                <BudgetPerformanceWaterfall
                  stages={budgetWaterfallStages}
                  title='Budget deviation waterfall of BU performance by value driver'
                  subtitle={`Mn USD • ${selectedBuLabel}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis Sidebar */}
      <RootCauseAnalysisSidebar
        isOpen={isAISidebarOpen}
        onToggle={() => setIsAISidebarOpen(!isAISidebarOpen)}
        selectedExternalItems={[]}
        selectedInternalItems={[]}
        activeTab='internal'
        hasSelectedItems={totalSelectedCount > 0}
      />

      {/* Meeting Scheduling Modal */}
      <MeetingSchedulingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        selectedItems={selectedItemsForModals}
        relevantMeetings={relevantMeetings}
        onScheduleNewMeeting={handleScheduleNewMeeting}
        onAddToMeetings={handleAddToMeetings}
      />

      {/* Create Action Modal */}
      {/* <CreateActionModal
        isOpen={isCreateActionModalOpen}
        onClose={() => setIsCreateActionModalOpen(false)}
      /> */}
    </div>
  );
}
