import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  ChartBarIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
  CalendarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, format, isToday } from 'date-fns';
import { mockNews } from '../data/mockNews';
import { mockActions } from '../data/mockActions';
import { internalPulseColumns } from '../data/mockInternalPulse';
import { mockKPIs } from '../data/mockKPIs';
import { mockVarianceAnalysisData } from '../data/mockExecutiveDashboard';
import { mockCalendarEvents } from '../data/mockCalendar';
import type { PulseMetric, Meeting, MeetingMaterial } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import RootCauseAnalysisSidebar from '../components/RootCauseAnalysisSidebar';
import MeetingSchedulingModal from '../components/MeetingSchedulingModal';
import CreateActionModal from '../components/CreateActionModal';
import { findRelevantMeetings } from '../utils/meetingRelevance';
import type { SelectedItem } from '../utils/meetingRelevance';

export default function ExecutiveSummaryPage() {
  // Selection state
  const [selectedOperationMetrics, setSelectedOperationMetrics] = useState<
    Set<string>
  >(new Set());
  const [selectedNewsItems, setSelectedNewsItems] = useState<Set<string>>(
    new Set()
  );
  const [selectedFinancialKPIs, setSelectedFinancialKPIs] = useState<
    Set<string>
  >(new Set());

  // Modal state
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);
  // Get Operation metrics from Internal Pulse (UPPH, OEE, Gold price)
  const operationColumn = internalPulseColumns.find(
    (col) => col.type === 'operation'
  );

  const getOperationMetrics = (): PulseMetric[] => {
    if (!operationColumn) return [];

    const metrics: PulseMetric[] = [];

    // Get COPQ from Quality section
    const qualitySection = operationColumn.sections.find(
      (s) => s.title === 'Quality'
    );
    if (qualitySection) {
      const copq = qualitySection.metrics.find((m) => m.id === 'copq');
      if (copq) metrics.push(copq);
    }

    // Get UPPH and OEE from MFG section
    const mfgSection = operationColumn.sections.find((s) => s.title === 'MFG');
    if (mfgSection) {
      const upph = mfgSection.metrics.find((m) => m.id === 'upph');
      const oee = mfgSection.metrics.find((m) => m.id === 'oee');
      if (upph) metrics.push(upph);
      if (oee) metrics.push(oee);
    }

    // Get Gold price from Procurement section
    const procurementSection = operationColumn.sections.find(
      (s) => s.title === 'Procurement'
    );
    if (procurementSection) {
      const gold = procurementSection.metrics.find(
        (m) => m.id === 'gold-material'
      );
      if (gold) metrics.push(gold);
    }

    // Get Inventory Turnover rate from Supply Chain section
    const supplyChainSection = operationColumn.sections.find(
      (s) => s.title === 'Supply Chain'
    );
    if (supplyChainSection) {
      const inventoryTurnover = supplyChainSection.metrics.find(
        (m) => m.id === 'inventory-turnover'
      );
      if (inventoryTurnover) metrics.push(inventoryTurnover);
    }

    return metrics;
  };

  const keyOperationMetrics = getOperationMetrics();

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
  const toggleOperationMetric = (metricId: string) => {
    setSelectedOperationMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(metricId)) {
        next.delete(metricId);
      } else {
        next.add(metricId);
      }
      return next;
    });
  };

  const toggleNewsItem = (newsId: string) => {
    setSelectedNewsItems((prev) => {
      const next = new Set(prev);
      if (next.has(newsId)) {
        next.delete(newsId);
      } else {
        next.add(newsId);
      }
      return next;
    });
  };

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
    setSelectedOperationMetrics(new Set());
    setSelectedNewsItems(new Set());
    setSelectedFinancialKPIs(new Set());
  };

  // Compute selected items for modals
  const selectedItemsForModals = useMemo((): SelectedItem[] => {
    const items: SelectedItem[] = [];

    // Add operation metrics
    keyOperationMetrics.forEach((metric) => {
      if (selectedOperationMetrics.has(metric.id)) {
        items.push({
          type: 'operation-metric',
          id: metric.id,
          name: metric.name,
          data: metric,
        });
      }
    });

    // Add news items
    mockNews.forEach((news) => {
      if (selectedNewsItems.has(news.id)) {
        items.push({
          type: 'news',
          id: news.id,
          name: news.headline,
          data: news,
        });
      }
    });

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
  }, [
    selectedOperationMetrics,
    selectedNewsItems,
    selectedFinancialKPIs,
    keyOperationMetrics,
    financialAndToplineKPIs,
  ]);

  // Find relevant meetings
  const relevantMeetings = useMemo(() => {
    if (selectedItemsForModals.length === 0) return [];
    return findRelevantMeetings(selectedItemsForModals);
  }, [selectedItemsForModals]);

  // Get selected news items for AI sidebar
  const selectedNewsForAI = useMemo(() => {
    return mockNews.filter((news) => selectedNewsItems.has(news.id));
  }, [selectedNewsItems]);

  // Total selected count
  const totalSelectedCount =
    selectedOperationMetrics.size +
    selectedNewsItems.size +
    selectedFinancialKPIs.size;

  // Helper function to collect all selected items for drag
  const getAllSelectedItemsForDrag = (): Array<{
    type: 'external-pulse' | 'internal-pulse';
    itemId: string;
  }> => {
    const allSelectedItems: Array<{
      type: 'external-pulse' | 'internal-pulse';
      itemId: string;
    }> = [];

    // Add all selected operation metrics
    keyOperationMetrics.forEach((m) => {
      if (selectedOperationMetrics.has(m.id)) {
        allSelectedItems.push({
          type: 'internal-pulse',
          itemId: m.id,
        });
      }
    });

    // Add all selected news items
    mockNews.forEach((n) => {
      if (selectedNewsItems.has(n.id)) {
        allSelectedItems.push({
          type: 'external-pulse',
          itemId: n.id,
        });
      }
    });

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

  // Filter critical external news (urgent + high impact)
  const criticalNews = mockNews
    .filter(
      (news) => news.urgencyLevel === 'urgent' && news.impactLevel === 'high'
    )
    .slice(0, 5)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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

  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Helper to format metric value
  const formatMetricValue = (metric: PulseMetric): string => {
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
    return 'No comparison data';
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
    const currentDate = new Date('2024-11-04T17:07:00+08:00'); // Current time as per calendar
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Get all critical meetings (today and this week)
    const allMeetings = mockCalendarEvents.filter((meeting) => {
      const meetingDate = new Date(meeting.startTime);
      meetingDate.setHours(0, 0, 0, 0);
      return (
        meetingDate >= today &&
        meetingDate <= weekEnd &&
        (meeting.isCritical ||
          meeting.attendees.some(
            (att) =>
              att.role?.toLowerCase().includes('customer') ||
              (att.role?.toLowerCase().includes('ceo') &&
                att.email !== 'ceo@company.com')
          ) ||
          meeting.title.toLowerCase().includes('procurement') ||
          meeting.meetingType === 'finance-review')
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

    const todayMeetings = allMeetings
      .filter((m) => isToday(new Date(m.startTime)))
      .map(processMeeting);

    const weekMeetings = allMeetings
      .filter((m) => !isToday(new Date(m.startTime)))
      .slice(0, 5) // Top 5 for the week
      .map(processMeeting);

    const totalActionItems =
      todayMeetings.reduce((sum, m) => sum + m.materials.length, 0) +
      weekMeetings.reduce((sum, m) => sum + m.materials.length, 0);

    return {
      todayMeetings,
      weekMeetings,
      totalActionItems,
    };
  };

  const executiveBriefing = getExecutiveBriefing();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        {/* Page Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-4xl font-bold text-gray-900'>CEO Mind Space</h1>
            <button
              onClick={() => setIsCreateActionModalOpen(true)}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
              <PlusIcon className='w-5 h-5' />
              Create Action
            </button>
          </div>

          {/* Executive Briefing - Critical Meetings */}
          <div className='bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden mb-6'>
            <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <CalendarIcon className='w-7 h-7 text-white' />
                  <h2 className='text-2xl font-bold text-white'>
                    Meetings Briefing
                  </h2>
                </div>
              </div>
            </div>

            <div className='p-6'>
              {/* Today's Critical Meetings */}
              {executiveBriefing.todayMeetings.length > 0 && (
                <div className='mb-6'>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='w-1 h-6 bg-red-500 rounded-full'></div>
                    <h3 className='text-lg font-bold text-gray-900'>
                      🎯 Today's Critical Meetings
                    </h3>
                    <span className='text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-md'>
                      {executiveBriefing.todayMeetings.length} Meeting
                      {executiveBriefing.todayMeetings.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {executiveBriefing.todayMeetings.map((item) => (
                      <div
                        key={item.meeting.id}
                        className={`border-2 rounded-xl p-4 transition-all hover:shadow-lg flex flex-col ${
                          item.priority === 'critical'
                            ? 'border-red-300 bg-red-50/50'
                            : item.priority === 'high'
                            ? 'border-orange-300 bg-orange-50/50'
                            : 'border-blue-300 bg-blue-50/50'
                        }`}>
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
                </div>
              )}

              {/* This Week's Critical Meetings */}
              {executiveBriefing.weekMeetings.length > 0 && (
                <div>
                  <div className='flex items-center gap-2 mb-4'>
                    <div className='w-1 h-6 bg-blue-500 rounded-full'></div>
                    <h3 className='text-lg font-bold text-gray-900'>
                      📅 This Week's Critical Meetings
                    </h3>
                    <span className='text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-md'>
                      {executiveBriefing.weekMeetings.length} Meeting
                      {executiveBriefing.weekMeetings.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3'>
                    {executiveBriefing.weekMeetings.map((item) => (
                      <div
                        key={item.meeting.id}
                        className={`border-2 rounded-lg p-3 transition-all hover:shadow-md flex flex-col ${
                          item.priority === 'critical'
                            ? 'border-red-200 bg-red-50/30'
                            : item.priority === 'high'
                            ? 'border-orange-200 bg-orange-50/30'
                            : 'border-blue-200 bg-blue-50/30'
                        }`}>
                        <div className='flex-1'>
                          <div className='flex items-center gap-1.5 mb-1.5 flex-wrap'>
                            <span className='text-xs font-bold text-gray-700'>
                              {item.time}
                            </span>
                            <span
                              className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                                item.priority === 'critical'
                                  ? 'bg-red-200 text-red-800'
                                  : item.priority === 'high'
                                  ? 'bg-orange-200 text-orange-800'
                                  : 'bg-blue-200 text-blue-800'
                              }`}>
                              {item.priority.toUpperCase()}
                            </span>
                          </div>
                          <h4 className='text-xs font-bold text-gray-900 mb-1.5 line-clamp-2'>
                            {item.meeting.title}
                          </h4>
                          {item.keyAttendees.length > 0 && (
                            <p className='text-xs text-gray-600 mb-2 line-clamp-2'>
                              With: {item.keyAttendees.slice(0, 2).join(', ')}
                              {item.keyAttendees.length > 2 && ' + more'}
                            </p>
                          )}
                        </div>

                        {/* Materials Summary */}
                        {item.materials.length > 0 && (
                          <div className='mt-2 pt-2 border-t border-gray-200'>
                            <div className='flex flex-wrap gap-1.5'>
                              {item.materials.map((material, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                    material.type === 'deck'
                                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                      : material.type === 'action'
                                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                      : 'bg-blue-100 text-blue-700 border border-blue-300'
                                  }`}>
                                  {material.type === 'deck'
                                    ? '📊'
                                    : material.type === 'action'
                                    ? '⚠️'
                                    : '📄'}{' '}
                                  <span className='line-clamp-1'>
                                    {material.description}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {executiveBriefing.todayMeetings.length === 0 &&
                executiveBriefing.weekMeetings.length === 0 && (
                  <div className='text-center py-8 text-gray-500'>
                    <CalendarIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p className='text-sm font-medium'>
                      No critical meetings scheduled
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

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

        {/* Key Leading parameter Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <ChartBarIcon className='w-6 h-6 text-primary-600' />
              Operational Leading Parameters
            </h2>
            <Link
              to='/internal-pulse'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              Internal Pulse
              <ArrowRightIcon className='w-4 h-4' />
            </Link>
          </div>
          <p className='text-gray-600 mb-4'>
            Critical leading operational parameters directly impact operational
            performance and profitability.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
            {keyOperationMetrics.map((metric) => {
              const status = getMetricStatus(metric);
              const trend = getMetricTrend(metric);
              const valueText = formatMetricValue(metric);
              const comparisonText = getComparisonText(metric);

              const isSelected = selectedOperationMetrics.has(metric.id);

              const handleDragStart = (e: React.DragEvent) => {
                // Don't start drag if clicking on checkbox
                const target = e.target as HTMLElement;
                if (target.closest('input[type="checkbox"]')) {
                  e.preventDefault();
                  return;
                }

                if (!isSelected) {
                  e.preventDefault();
                  return;
                }

                // Get all selected items for multi-drag
                const allSelectedItems = getAllSelectedItemsForDrag();

                // Store all selected items as JSON for multi-drag
                e.dataTransfer.setData(
                  'multipleItems',
                  JSON.stringify(allSelectedItems)
                );
                // Also set single item for backward compatibility
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

              return (
                <div
                  key={metric.id}
                  draggable={isSelected}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-xl border-2 shadow-lg shadow-gray-200/50 p-4 hover:shadow-xl transition-all duration-300 min-w-0 relative ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50/30 cursor-move'
                      : 'border-gray-200 cursor-pointer'
                  }`}
                  onClick={() => toggleOperationMetric(metric.id)}>
                  <div className='flex items-start justify-between mb-3 gap-2'>
                    <div className='flex items-start gap-2 flex-1 min-w-0'>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => toggleOperationMetric(metric.id)}
                        onClick={(e) => e.stopPropagation()}
                        className='mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer'
                      />
                      <h3 className='text-xs font-medium text-gray-600 break-words flex-1 min-w-0'>
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
                  <div className='mb-3 min-w-0'>
                    <div className='break-words'>
                      <span className='text-2xl xl:text-xl 2xl:text-2xl font-bold text-gray-900 leading-tight'>
                        {valueText}
                      </span>
                    </div>
                    {metric.subMetrics && metric.id === 'gold-material' && (
                      <div className='mt-2 text-xs text-gray-500 break-words'>
                        Market: $
                        {metric.subMetrics
                          .find((m) => m.name.includes('Market price'))
                          ?.value.toLocaleString('en-US') || 'N/A'}
                        /oz
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
                          : 'text-gray-600'
                      }`}
                      title={comparisonText}>
                      {comparisonText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical External News Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <SparklesIcon className='w-6 h-6 text-primary-600' />
              Critical News
            </h2>
            <Link
              to='/external-pulse'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              External Pulse
              <ArrowRightIcon className='w-4 h-4' />
            </Link>
          </div>
          <p className='text-gray-600 mb-4'>
            US tariff on Chinese-made EV connectors threatens $10M revenue
            impact, while China's rare earth export restrictions could increase
            costs by $5M. These urgent, high-impact developments require
            immediate supply chain adjustments and production shifts.
          </p>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {criticalNews.length > 0 ? (
              criticalNews.map((news) => {
                const isSelected = selectedNewsItems.has(news.id);

                const handleDragStart = (e: React.DragEvent) => {
                  // Don't start drag if clicking on checkbox
                  const target = e.target as HTMLElement;
                  if (target.closest('input[type="checkbox"]')) {
                    e.preventDefault();
                    return;
                  }

                  if (!isSelected) {
                    e.preventDefault();
                    return;
                  }

                  // Get all selected items for multi-drag
                  const allSelectedItems = getAllSelectedItemsForDrag();

                  // Store all selected items as JSON for multi-drag
                  e.dataTransfer.setData(
                    'multipleItems',
                    JSON.stringify(allSelectedItems)
                  );
                  // Also set single item for backward compatibility
                  e.dataTransfer.setData('materialType', 'external-pulse');
                  e.dataTransfer.setData('itemId', news.id);
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

                return (
                  <div
                    key={news.id}
                    draggable={isSelected}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-200 p-6 ${
                      isSelected
                        ? 'border-primary-500 ring-2 ring-primary-200 cursor-move'
                        : news.riskOrOpportunity === 'risk'
                        ? 'border-red-200 bg-gradient-to-br from-red-50/50 to-white cursor-pointer'
                        : 'border-green-200 bg-gradient-to-br from-green-50/50 to-white cursor-pointer'
                    }`}
                    onClick={() => toggleNewsItem(news.id)}>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-start gap-2 flex-1'>
                        <input
                          type='checkbox'
                          checked={isSelected}
                          onChange={() => toggleNewsItem(news.id)}
                          onClick={(e) => e.stopPropagation()}
                          className='mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer'
                        />
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                news.riskOrOpportunity === 'risk'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                              {news.riskOrOpportunity === 'risk'
                                ? 'RISK'
                                : 'OPPORTUNITY'}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                news.impactLevel === 'high'
                                  ? 'bg-orange-100 text-orange-800'
                                  : news.impactLevel === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                              {news.impactLevel.toUpperCase()} IMPACT
                            </span>
                            <span className='px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 capitalize'>
                              {news.category}
                            </span>
                          </div>
                          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                            {news.headline}
                          </h3>
                          <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                            {news.summary}
                          </p>
                          {news.analyzingBy && (
                            <div className='flex items-center gap-2 mt-2 mb-2'>
                              <span className='text-xs text-gray-500'>
                                Analyzing:
                              </span>
                              <span className='text-xs font-medium text-primary-600'>
                                {news.analyzingBy}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center justify-between text-xs text-gray-500'>
                      <span>{formatRelativeTime(news.timestamp)}</span>
                      <span>{news.source}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='col-span-2 bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500'>
                No critical external news at this time
              </div>
            )}
          </div>
        </div>

        {/* Wave Status Glance Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <ChartBarIcon className='w-6 h-6 text-primary-600' />
              Wave Status Glance
            </h2>
            <Link
              to='/wave-executive-dashboard'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              Wave Dashboard
              <ArrowRightIcon className='w-4 h-4' />
            </Link>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Left: Summary */}
              <div className='flex flex-col justify-center'>
                <p className='text-gray-600 mb-4 text-base leading-relaxed'>
                  The Variance Analysis shows the breakdown of L4+ Actual Net
                  Recurring Revenue compared to the Bottom-Up Plan. Positive
                  variances from accelerated initiatives, over-delivery, and new
                  additions are offset by delays, delivery leakage, and
                  initiatives moved or cancelled. The net total variance of{' '}
                  <span className='font-semibold text-gray-900'>
                    $
                    {mockVarianceAnalysisData
                      .find((d) => d.type === 'total')
                      ?.value.toFixed(1) || '0.0'}
                    M
                  </span>{' '}
                  indicates overall performance against plan.
                </p>
                <div className='mt-4 space-y-2'>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='w-3 h-3 rounded bg-green-500'></div>
                    <span className='text-gray-700'>
                      Positive variances: Accelerated, Over-delivered, Added
                      initiatives
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <div className='w-3 h-3 rounded bg-red-500'></div>
                    <span className='text-gray-700'>
                      Negative variances: Delayed, Leakage, Moved, Cancelled
                    </span>
                  </div>
                </div>
              </div>
              {/* Right: Variance Analysis Chart */}
              <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm p-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <h3 className='text-sm font-bold text-gray-900'>
                    Variance Analysis - L4+ Actual Net Recurring Revenue
                    (Annualized, Million USD) vs. Bottom-Up Plan
                  </h3>
                  <InformationCircleIcon className='w-4 h-4 text-gray-400' />
                </div>
                <div className='h-64'>
                  <ResponsiveContainer
                    width='100%'
                    height='100%'>
                    <BarChart data={mockVarianceAnalysisData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis
                        dataKey='category'
                        angle={-45}
                        textAnchor='end'
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey='value'>
                        {mockVarianceAnalysisData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.type === 'positive'
                                ? '#10b981'
                                : entry.type === 'negative'
                                ? '#ef4444'
                                : '#60a5fa'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Topline KPIs Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <ChartBarIcon className='w-6 h-6 text-primary-600' />
              Financial & Topline KPIs
            </h2>
            <Link
              to='/internal-pulse'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              Internal Pulse
              <ArrowRightIcon className='w-4 h-4' />
            </Link>
          </div>
          <p className='text-gray-600 mb-4'>
            Key financial and topline KPIs updated after monthly review
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {financialAndToplineKPIs.map((metric) => {
              const status = getMetricStatus(metric);
              const trend = getMetricTrend(metric);
              const valueText = formatMetricValue(metric);
              const comparisonText = getComparisonText(metric);
              const isSelected = selectedFinancialKPIs.has(metric.id);

              const handleDragStart = (e: React.DragEvent) => {
                // Don't start drag if clicking on checkbox
                const target = e.target as HTMLElement;
                if (target.closest('input[type="checkbox"]')) {
                  e.preventDefault();
                  return;
                }

                if (!isSelected) {
                  e.preventDefault();
                  return;
                }

                // Get all selected items for multi-drag
                const allSelectedItems = getAllSelectedItemsForDrag();

                // Store all selected items as JSON for multi-drag
                e.dataTransfer.setData(
                  'multipleItems',
                  JSON.stringify(allSelectedItems)
                );
                // Also set single item for backward compatibility
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

              return (
                <div
                  key={metric.id}
                  draggable={isSelected}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-xl border-2 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50/30 cursor-move'
                      : 'border-gray-200 cursor-pointer'
                  }`}
                  onClick={() => toggleFinancialKPI(metric.id)}>
                  <div className='flex items-start justify-between mb-3 gap-2'>
                    <div className='flex items-start gap-2 flex-1 min-w-0'>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => toggleFinancialKPI(metric.id)}
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
                  </div>
                  <div className='flex items-center gap-1.5 min-w-0 mb-3'>
                    {getTrendIcon(trend)}
                    <span
                      className={`text-xs font-semibold truncate ${
                        metric.comparisons?.vsLastYear?.percent !== undefined
                          ? metric.comparisons.vsLastYear.percent >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                          : metric.comparisons?.vsLastRefresh?.percent !==
                            undefined
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
            })}
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
        selectedExternalItems={selectedNewsForAI}
        selectedInternalItems={[]} // PulseMetrics are different from FinancialMetrics, so we pass empty for now
        activeTab={selectedNewsForAI.length > 0 ? 'external' : 'internal'}
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
      <CreateActionModal
        isOpen={isCreateActionModalOpen}
        onClose={() => setIsCreateActionModalOpen(false)}
      />
    </div>
  );
}
