import { useState, useMemo } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  ChartBarIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { format, isToday } from 'date-fns';
import { mockActions } from '../data/mockActions';
import { internalPulseColumns } from '../data/mockInternalPulse';
import {
  getAllBusinessGroupData,
  getSubBusinessGroupsWithOverall,
  getMainBusinessGroupOptions,
  getSubBusinessGroups,
  type BusinessGroupMetricWithTrend,
  type BusinessGroupData,
} from '../data/mockBusinessGroupPerformance';
import { mockKPIs } from '../data/mockKPIs';
import {
  mockExecutiveInitiatives,
  mockMilestones,
  calculateSummaryStatistics,
} from '../data/mockExecutiveDashboard';
import { mockCalendarEvents } from '../data/mockCalendar';
import type { PulseMetric, Meeting, MeetingMaterial } from '../types';
import RootCauseAnalysisSidebar from '../components/RootCauseAnalysisSidebar';
import MeetingSchedulingModal from '../components/MeetingSchedulingModal';
import CreateActionModal from '../components/CreateActionModal';
import { findRelevantMeetings } from '../utils/meetingRelevance';
import type { SelectedItem } from '../utils/meetingRelevance';

interface ExecutiveSummaryPageContext {
  meetingMaterials: Record<string, MeetingMaterial[]>;
}

export default function ExecutiveSummaryPage() {
  useOutletContext<ExecutiveSummaryPageContext>();
  const navigate = useNavigate();

  // Selection state
  const [selectedFinancialKPIs, setSelectedFinancialKPIs] = useState<
    Set<string>
  >(new Set());

  // Modal state
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);

  const [selectedBu, setSelectedBu] = useState<string>('all');

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [showComparisonDetails, setShowComparisonDetails] = useState<boolean>(true);

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

  // Selection handlers
  const toggleFinancialKPI = (kpiId: string) => {
    setSelectedFinancialKPIs((prev) => {
      const next = new Set(prev);
      if (next.has(kpiId)) {
        next.delete(kpiId);
      } else {
        next.add(kpiId);
      }
      return next;
    });
  };

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

  // Helper function to collect all selected items for drag
  const getAllSelectedItemsForDrag = (): Array<{
    type: 'external-pulse' | 'internal-pulse';
    itemId: string;
  }> => {
    const allSelectedItems: Array<{
      type: 'external-pulse' | 'internal-pulse';
      itemId: string;
    }> = [];

    // Add all selected financial KPIs
    financialAndToplineKPIs.forEach((kpi) => {
      if (selectedFinancialKPIs.has(kpi.id)) {
        allSelectedItems.push({
          type: 'internal-pulse',
          itemId: kpi.id,
        });
      }
    });

    return allSelectedItems;
  };

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

  // Count high-priority actions
  const highPriorityActions = mockActions.filter(
    (action) => action.priority === 'high'
  );
  const urgentActions = highPriorityActions.filter(
    (action) =>
      action.status === 'todo' ||
      action.status === 'in-progress' ||
      action.status === 'reopen'
  );

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

  // Helper to format metric value
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

    // For UPPH and OEE, try to get actual value from mockKPIs as fallback
    if (
      metric.value === undefined &&
      (metric.id === 'upph' || metric.id === 'oee')
    ) {
      const kpiData = mockKPIs.find((kpi) => kpi.id === metric.id);
      if (kpiData) {
        if (metric.id === 'oee') {
          return `${kpiData.value.toFixed(1)}%`;
        }
        return `${kpiData.value.toFixed(1)} ${kpiData.unit}`;
      }
    }

    // For Inventory Turnover, use valuePercent as the actual rate value
    if (
      metric.id === 'inventory-turnover' &&
      metric.valuePercent !== undefined
    ) {
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

  // Helper to determine status from comparisons
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

  // Helper to determine trend from comparisons
  const getMetricTrend = (metric: PulseMetric): 'up' | 'down' | 'flat' => {
    if (metric.comparisons?.vsLastRefresh) {
      return metric.comparisons.vsLastRefresh.percent >= 0 ? 'up' : 'down';
    }
    if (metric.comparisons?.vsLastYear) {
      return metric.comparisons.vsLastYear.percent >= 0 ? 'up' : 'down';
    }
    return 'flat';
  };

  // Helper to get comparison text for display
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

  // Generate executive briefing with today's and week's critical meetings
  interface CriticalMeeting {
    meeting: Meeting;
    time: string;
    materials: {
      type: 'deck' | 'data' | 'action';
      description: string;
      items?: string[];
    }[];
    keyAttendees: string[];
    priority: 'critical' | 'high' | 'medium';
  }

  const getExecutiveBriefing = (): {
    todayMeetings: CriticalMeeting[];
    weekMeetings: CriticalMeeting[];
    totalActionItems: number;
  } => {
    const currentDate = new Date('2025-11-19T08:07:00+08:00'); // Current time: Nov 19, 2025 8:07 AM
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Get all critical meetings (only those marked with isCritical: true)
    const allMeetings = mockCalendarEvents.filter((meeting) => {
      const meetingDate = new Date(meeting.startTime);
      meetingDate.setHours(0, 0, 0, 0);
      return (
        meetingDate >= today &&
        meetingDate <= weekEnd &&
        meeting.isCritical === true
      );
    });

    // Sort by priority: critical first, then customer meetings, then by time
    allMeetings.sort((a, b) => {
      if (a.isCritical && !b.isCritical) return -1;
      if (!a.isCritical && b.isCritical) return 1;

      const aHasCustomer = a.attendees.some(
        (att) =>
          att.role?.toLowerCase().includes('customer') ||
          (att.role?.toLowerCase().includes('ceo') &&
            att.email !== 'ceo@company.com')
      );
      const bHasCustomer = b.attendees.some(
        (att) =>
          att.role?.toLowerCase().includes('customer') ||
          (att.role?.toLowerCase().includes('ceo') &&
            att.email !== 'ceo@company.com')
      );

      if (aHasCustomer && !bHasCustomer) return -1;
      if (!aHasCustomer && bHasCustomer) return 1;

      return a.startTime.getTime() - b.startTime.getTime();
    });

    const processMeeting = (meeting: Meeting): CriticalMeeting => {
      const meetingDate = new Date(meeting.startTime);
      const isTodayMeeting = isToday(meetingDate);
      const timeStr = isTodayMeeting
        ? format(meeting.startTime, 'h:mm a')
        : format(meeting.startTime, 'EEE, MMM d, h:mm a');

      // Extract key attendees (excluding CEO)
      const keyAttendees = meeting.attendees
        .filter((att) => att.email !== 'ceo@company.com')
        .map((att) => {
          if (att.role?.toLowerCase().includes('customer ceo')) {
            return `${att.name} (CEO)`;
          }
          if (att.role?.toLowerCase().includes('customer')) {
            return att.name;
          }
          if (att.role?.toLowerCase().includes('ceo')) {
            return `${att.name} (CEO)`;
          }
          return att.name;
        })
        .slice(0, 3);

      // Determine materials/preparation needed
      const materials: CriticalMeeting['materials'] = [];

      // Check if deck/presentation is needed
      const descLower = meeting.description?.toLowerCase() || '';
      const needsDeck =
        descLower.includes('deck') ||
        descLower.includes('presentation') ||
        descLower.includes('roadmap') ||
        descLower.includes('bring the');

      if (needsDeck) {
        // Check for multiple deck types mentioned
        const hasQ4PartnershipDeck =
          descLower.includes('q4 partnership deck') ||
          (descLower.includes('q4') &&
            descLower.includes('partnership') &&
            descLower.includes('deck'));
        const hasProductRoadmap =
          descLower.includes('product roadmap') ||
          descLower.includes('roadmap presentation');
        const hasPartnershipDeck =
          descLower.includes('partnership deck') && !hasQ4PartnershipDeck;
        const hasRoadmap = descLower.includes('roadmap') && !hasProductRoadmap;

        // Add multiple deck materials if both are mentioned
        if (hasQ4PartnershipDeck && hasProductRoadmap) {
          materials.push({
            type: 'deck',
            description: 'Q4 partnership deck',
          });
          materials.push({
            type: 'deck',
            description: 'Product roadmap presentation',
          });
        } else if (hasQ4PartnershipDeck) {
          materials.push({
            type: 'deck',
            description: 'Q4 partnership deck',
          });
        } else if (hasProductRoadmap) {
          materials.push({
            type: 'deck',
            description: 'Product roadmap presentation',
          });
        } else if (hasPartnershipDeck) {
          materials.push({
            type: 'deck',
            description: 'Partnership deck',
          });
        } else if (hasRoadmap) {
          materials.push({
            type: 'deck',
            description: 'Product roadmap presentation',
          });
        } else if (descLower.includes('q4')) {
          materials.push({
            type: 'deck',
            description: 'Q4 partnership deck',
          });
        } else if (descLower.includes('partnership')) {
          materials.push({
            type: 'deck',
            description: 'Partnership deck',
          });
        } else {
          materials.push({
            type: 'deck',
            description: 'Presentation deck',
          });
        }
      }

      // Check for existing materials
      if (meeting.materials && meeting.materials.length > 0) {
        const externalMaterials = meeting.materials.filter(
          (m) => m.type === 'external-pulse'
        );
        const internalMaterials = meeting.materials.filter(
          (m) => m.type === 'internal-pulse'
        );

        if (externalMaterials.length > 0 || internalMaterials.length > 0) {
          const items: string[] = [];
          if (externalMaterials.length > 0) {
            items.push(
              `${externalMaterials.length} external pulse item${
                externalMaterials.length > 1 ? 's' : ''
              }`
            );
          }
          if (internalMaterials.length > 0) {
            items.push(
              `${internalMaterials.length} internal pulse metric${
                internalMaterials.length > 1 ? 's' : ''
              }`
            );
          }
          materials.push({
            type: 'data',
            description: 'Review attached materials',
            items,
          });
        }
      }

      // Check for specific action items
      const titleLower = meeting.title.toLowerCase();
      if (titleLower.includes('procurement')) {
        const descLower = meeting.description?.toLowerCase() || '';
        if (descLower.includes('xiaochen')) {
          // Extract the specific action items mentioned
          let actionDesc = 'Verify with Xiaochen';
          if (descLower.includes('alternative rare earth supplier')) {
            actionDesc =
              'Verify with Xiaochen on alternative rare earth supplier negotiations';
          } else if (descLower.includes('rare earth')) {
            actionDesc = 'Verify with Xiaochen on rare earth supplier status';
          }
          if (descLower.includes('vietnam production shift')) {
            if (actionDesc.includes('rare earth')) {
              actionDesc += ' and Vietnam production shift timeline';
            } else {
              actionDesc =
                'Verify with Xiaochen on Vietnam production shift timeline';
            }
          }
          materials.push({
            type: 'action',
            description: actionDesc,
          });
        }
      }

      // Determine priority
      let priority: 'critical' | 'high' | 'medium' = 'medium';
      if (meeting.isCritical) {
        priority = 'critical';
      } else if (
        meeting.attendees.some(
          (att) =>
            att.role?.toLowerCase().includes('customer ceo') ||
            (att.role?.toLowerCase().includes('ceo') &&
              att.email !== 'ceo@company.com')
        )
      ) {
        priority = 'high';
      }

      return {
        meeting,
        time: timeStr,
        materials,
        keyAttendees,
        priority,
      };
    };

    // Combine all meetings and sort chronologically starting from today
    const allProcessedMeetings = allMeetings
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()) // Sort by time
      .map(processMeeting)
      .slice(0, 5); // Limit to 5 meetings

    const totalActionItems = allProcessedMeetings.reduce(
      (sum, m) => sum + m.materials.length,
      0
    );

    return {
      todayMeetings: allProcessedMeetings,
      weekMeetings: [], // No longer used, kept for compatibility
      totalActionItems,
    };
  };

  const executiveBriefing = getExecutiveBriefing();

  const tableData = useMemo(() => {
    if (selectedBu === 'all') {
      return getAllBusinessGroupData();
    }
    return getSubBusinessGroupsWithOverall(selectedBu);
  }, [selectedBu]);

  const getExpandedSubGroups = (bgId: string) => {
    return getSubBusinessGroups(bgId);
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
              ${metric.value.toFixed(1)}B
            </div>
          </div>
          <div className='text-center'>
            <div className='text-xs text-gray-500 mb-0.5'>
              vs budget ${metric.baseline.toFixed(1)}B
            </div>
            <div className='text-xs text-gray-500'>
              vs Last Year ${metric.baseline.toFixed(1)}B
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
                      ((trendValues[trendValues.length - 1] - minVal) /
                        range) *
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

  // Calculate Wave summary statistics
  const waveSummary = useMemo(() => {
    return calculateSummaryStatistics(mockExecutiveInitiatives, mockMilestones);
  }, []);

  const formatNetBenefit = (value: number): string => {
    return `Million USD ${value.toFixed(1)}`;
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
            <h1 className='text-4xl font-bold text-gray-900'>Home</h1>
            {/* <button
              onClick={() => setIsCreateActionModalOpen(true)}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
              <PlusIcon className='w-5 h-5' />
              Create Action
            </button> */}
          </div>

          {/* Executive Briefing - Critical Meetings */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                <CalendarIcon className='w-6 h-6 text-primary-600' />
                🎯 Upcoming Critical Meetings{' '}
              </h2>
            </div>

            {/* Upcoming Critical Meetings (up to 5) */}
            {executiveBriefing.todayMeetings.length > 0 && (
              <div className='grid grid-cols-5 gap-4 overflow-x-auto'>
                {executiveBriefing.todayMeetings.map((item) => (
                  <div
                    key={item.meeting.id}
                    className='border-2 border-gray-200 bg-white rounded-xl p-4 transition-all hover:shadow-lg flex flex-col'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-xs font-bold text-gray-700'>
                          {item.time}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            item.priority === 'critical'
                              ? 'bg-red-200 text-red-800'
                              : item.priority === 'high'
                              ? 'bg-orange-200 text-orange-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}>
                          {item.priority.toUpperCase()}
                        </span>
                      </div>
                      <h4 className='text-sm font-bold text-gray-900 mb-1.5 line-clamp-2'>
                        {item.meeting.title}
                      </h4>
                      {item.meeting.location && (
                        <p className='text-xs text-gray-600 mb-1.5 line-clamp-1'>
                          📍 {item.meeting.location}
                        </p>
                      )}
                      {item.keyAttendees.length > 0 && (
                        <p className='text-xs text-gray-600 mb-2 line-clamp-2'>
                          <span className='font-semibold'>With:</span>{' '}
                          {item.keyAttendees.slice(0, 2).join(', ')}
                          {item.keyAttendees.length > 2 && ' + more'}
                        </p>
                      )}
                    </div>

                    {/* Materials & Action Items */}
                    {item.materials.length > 0 && (
                      <div className='mt-3 pt-3 border-t border-gray-200'>
                        <p className='text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide'>
                          📋 Prep:
                        </p>
                        <div className='space-y-1.5'>
                          {item.materials.map((material, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-1.5 p-1.5 rounded-md ${
                                material.type === 'deck'
                                  ? 'bg-purple-100 border border-purple-300'
                                  : material.type === 'action'
                                  ? 'bg-amber-100 border border-amber-300'
                                  : 'bg-blue-100 border border-blue-300'
                              }`}>
                              <span className='text-xs mt-0.5 flex-shrink-0'>
                                {material.type === 'deck'
                                  ? '📊'
                                  : material.type === 'action'
                                  ? '⚠️'
                                  : '📄'}
                              </span>
                              <div className='flex-1 min-w-0'>
                                <p className='text-xs font-semibold text-gray-800 line-clamp-2'>
                                  {material.description}
                                </p>
                                {material.items && (
                                  <ul className='mt-0.5 space-y-0.5'>
                                    {material.items.map((item, i) => (
                                      <li
                                        key={i}
                                        className='text-xs text-gray-600 list-disc list-inside line-clamp-1'>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {executiveBriefing.todayMeetings.length === 0 && (
              <div className='text-center py-8 text-gray-500'>
                <CalendarIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                <p className='text-sm font-medium'>
                  No critical meetings scheduled
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Business Group Performance Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <ChartBarIcon className='w-6 h-6 text-primary-600' />
              Business Group Performance (Quarterly Actual)
            </h2>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-600'>Show Details</span>
                <button
                  onClick={() => setShowComparisonDetails(!showComparisonDetails)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    showComparisonDetails ? 'bg-primary-600' : 'bg-gray-200'
                  }`}>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showComparisonDetails ? 'translate-x-6' : 'translate-x-1'
                    }`} />
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

        {/* Quick Actions Summary Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <ClipboardDocumentListIcon className='w-6 h-6 text-primary-600' />
              Action Items Requiring Attention
            </h2>
            <Link
              to='/action-tracker'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              Action Tracker
              <ArrowRightIcon className='w-4 h-4' />
            </Link>
          </div>
          <p className='text-gray-600 mb-4'>
            {urgentActions.length} urgent high-priority actions requiring
            immediate attention, including Vietnam production shift for EV
            connectors, securing alternative rare earth suppliers, and
            accelerating Nvidia GB300 program engagement to capture data center
            growth.
          </p>
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
              <div className='text-center p-4 bg-red-50 rounded-lg border border-red-200'>
                <div className='text-3xl font-bold text-red-600 mb-1'>
                  {urgentActions.length}
                </div>
                <div className='text-sm font-medium text-red-800'>
                  Urgent High-Priority Actions
                </div>
              </div>
              <div className='text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
                <div className='text-3xl font-bold text-yellow-600 mb-1'>
                  {highPriorityActions.length}
                </div>
                <div className='text-sm font-medium text-yellow-800'>
                  Total High-Priority Actions
                </div>
              </div>
              <div className='text-center p-4 bg-blue-50 rounded-lg border border-blue-200'>
                <div className='text-3xl font-bold text-blue-600 mb-1'>
                  {mockActions.length}
                </div>
                <div className='text-sm font-medium text-blue-800'>
                  Total Actions
                </div>
              </div>
            </div>
            {urgentActions.length > 0 && (
              <div className='space-y-3'>
                <h4 className='text-sm font-semibold text-gray-700 mb-2'>
                  Top Urgent Actions:
                </h4>
                {urgentActions.slice(0, 3).map((action) => (
                  <div
                    key={action.id}
                    className='flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${
                            action.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : action.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                          {action.priority.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${
                            action.status === 'todo'
                              ? 'bg-blue-100 text-blue-800'
                              : action.status === 'in-progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : action.status === 'reopen'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                          {action.status.replace('-', ' ')}
                        </span>
                      </div>
                      <h5 className='text-sm font-medium text-gray-900'>
                        {action.title}
                      </h5>
                      <p className='text-xs text-gray-600 mt-1'>
                        Owner: {action.owner}
                      </p>
                    </div>
                  </div>
                ))}
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
