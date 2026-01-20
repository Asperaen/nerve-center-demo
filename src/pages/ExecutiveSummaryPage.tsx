import {
  ArrowRightIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { format, isToday } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import {
  Link,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from 'react-router-dom';
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
  type BusinessGroupMetricWithTrend
} from '../data/mockBusinessGroupPerformance';
import { mockCalendarEvents } from '../data/mockCalendar';
import {
  calculateSummaryStatistics,
  mockExecutiveInitiatives,
  mockMilestones,
} from '../data/mockExecutiveDashboard';
import { internalPulseColumns } from '../data/mockInternalPulse';
import { mockKPIs } from '../data/mockKPIs';
import type { Meeting, MeetingMaterial, PulseMetric } from '../types';
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
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);

  const [selectedBu, setSelectedBu] = useState<string>('all');
  const mainBuOptions = getMainBusinessGroupOptions();

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [showComparisonDetails, setShowComparisonDetails] =
    useState<boolean>(true);

  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeframeOption>(() => getStoredTimeframe());
  const [homeToggle, setHomeToggle] = useState<
    'budget' | 'ytm' | 'full-year'
  >(defaultHomeToggle);

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
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('bu', buId);
      return next;
    });
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
    const dataTimeframe = selectedTimeframe === 'ytm' ? 'ytm' : 'full-year';
    if (selectedBu === 'all') {
      return getAllBusinessGroupData(dataTimeframe);
    }
    return getSubBusinessGroupsWithOverall(selectedBu, dataTimeframe);
  }, [selectedBu, selectedTimeframe]);

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
        if (homeToggle === 'budget') {
          navigate(`/budget?bu=${groupId}&toggle=budget`);
        } else if (homeToggle === 'full-year') {
          navigate(`/market-intelligence?bu=${groupId}&toggle=full-year`);
        } else {
          navigate(`/business-group-performance?bu=${groupId}&toggle=ytm`);
        }
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
    // Only main business groups (not sub-groups, not overall/Grand Total) should navigate on click
    const isMetricNavigable =
      !isSubGroup && !isOverallRow && group.id !== 'overall';

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
                    { id: 'ytm', label: 'Remainder of the year' },
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
                        setHomeToggle(option.id as 'budget' | 'ytm' | 'full-year');
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
          <div className={isBudgetView ? 'bg-white rounded-xl border border-gray-200/60 shadow-sm p-6' : ''}>
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
                        showComparisonDetails ? 'translate-x-6' : 'translate-x-1'
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
