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
import BUSINESS_GROUP_DATA from '../data/mockBgData';
import {
  type BusinessGroupData,
  type BusinessGroupMetricWithTrend,
  type MonthlyTrendPoint,
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

const TREND_MONTHS = [
  'Dec',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
];

const toMillions = (value: number) => value / 1_000;

const normalizeGroupId = (groupName: string) => {
  const key = groupName.trim().toLowerCase();
  return key === 'other' ? 'others' : key;
};

const buildTrend = (value: number): MonthlyTrendPoint[] => {
  const start = value * 0.94;
  const end = value * 1.06;
  const steps = TREND_MONTHS.length - 1;
  return TREND_MONTHS.map((month, index) => {
    const ratio = steps === 0 ? 0 : index / steps;
    return {
      month,
      value: Math.round((start + (end - start) * ratio) * 10) / 10,
    };
  });
};

const calcPercent = (value: number, baseline: number) => {
  if (baseline === 0) return 0;
  return ((value - baseline) / baseline) * 100;
};

const buildMetric = (
  value: number,
  budget: number,
  lastYear: number,
  aiInsight: string,
  percentBasis: 'budget' | 'last-year'
): BusinessGroupMetricWithTrend => ({
  value,
  baseline: budget,
  stly: lastYear,
  percent: calcPercent(value, percentBasis === 'last-year' ? lastYear : budget),
  trend: buildTrend(value),
  aiInsight,
});

type BusinessGroupSource = (typeof BUSINESS_GROUP_DATA)[number];
type BusinessUnitSource = BusinessGroupSource['businessUnits'][number];

const buildGroupRow = (
  groupName: string,
  units: BusinessUnitSource[],
  scale: number,
  valueMode: 'actual' | 'budget' | 'forecast',
  budgetMode: 'full-year' | 'ytm',
  lastYearMode: 'full-year' | 'ytm',
  idOverride?: string,
  nameOverride?: string
): BusinessGroupData => {
  const totals = units.reduce(
    (acc, unit) => {
      acc.revenue += unit.revenue;
      acc.grossProfit += unit.grossProfit;
      acc.operatingProfit += unit.operatingProfit;
      acc.netProfit += unit.netProfit;
      acc.revenueBudget += unit.revenueBudget;
      acc.grossProfitBudget += unit.grossProfitBudget;
      acc.operatingProfitBudget += unit.operatingProfitBudget;
      acc.netProfitBudget += unit.netProfitBudget;
      acc.ytmRevenueBudget += unit.ytmRevenueBudget ?? 0;
      acc.ytmGrossProfitBudget += unit.ytmGrossProfitBudget ?? 0;
      acc.ytmOperatingProfitBudget += unit.ytmOperatingProfitBudget ?? 0;
      acc.ytmNetProfitBudget += unit.ytmNetProfitBudget ?? 0;
      acc.lastYearRevenue += unit.lastYearRevenue;
      acc.lastYearGrossProfit += unit.lastYearGrossProfit;
      acc.lastYearOperatingProfit += unit.lastYearOperatingProfit;
      acc.lastYearNetProfit += unit.lastYearNetProfit;
      acc.ytmLastYearRevenue += unit.ytmLastYearRevenue ?? 0;
      acc.ytmLastYearGrossProfit += unit.ytmLastYearGrossProfit ?? 0;
      acc.ytmLastYearOperatingProfit += unit.ytmLastYearOperatingProfit ?? 0;
      acc.ytmLastYearNetProfit += unit.ytmLastYearNetProfit ?? 0;
      acc.forecastRevenue += unit.forecastRevenue;
      acc.forecastGrossProfit += unit.forecastGrossProfit;
      acc.forecastOperatingProfit += unit.forecastOperatingProfit;
      acc.forecastNetProfit += unit.forecastNetProfit;
      return acc;
    },
    {
      revenue: 0,
      grossProfit: 0,
      operatingProfit: 0,
      netProfit: 0,
      revenueBudget: 0,
      grossProfitBudget: 0,
      operatingProfitBudget: 0,
      netProfitBudget: 0,
      ytmRevenueBudget: 0,
      ytmGrossProfitBudget: 0,
      ytmOperatingProfitBudget: 0,
      ytmNetProfitBudget: 0,
      lastYearRevenue: 0,
      lastYearGrossProfit: 0,
      lastYearOperatingProfit: 0,
      lastYearNetProfit: 0,
      ytmLastYearRevenue: 0,
      ytmLastYearGrossProfit: 0,
      ytmLastYearOperatingProfit: 0,
      ytmLastYearNetProfit: 0,
      forecastRevenue: 0,
      forecastGrossProfit: 0,
      forecastOperatingProfit: 0,
      forecastNetProfit: 0,
    }
  );

  const name = nameOverride ?? groupName;
  const id = idOverride ?? normalizeGroupId(groupName);
  const insightBase = `${name} performance from BUSINESS_GROUP_DATA.`;
  const revenue = toMillions(
    valueMode === 'budget'
      ? totals.revenueBudget
      : valueMode === 'forecast'
      ? totals.forecastRevenue
      : totals.revenue
  ) * scale;
  const grossProfit = toMillions(
    valueMode === 'budget'
      ? totals.grossProfitBudget
      : valueMode === 'forecast'
      ? totals.forecastGrossProfit
      : totals.grossProfit
  ) * scale;
  const operatingProfit = toMillions(
    valueMode === 'budget'
      ? totals.operatingProfitBudget
      : valueMode === 'forecast'
      ? totals.forecastOperatingProfit
      : totals.operatingProfit
  ) * scale;
  const netProfit = toMillions(
    valueMode === 'budget'
      ? totals.netProfitBudget
      : valueMode === 'forecast'
      ? totals.forecastNetProfit
      : totals.netProfit
  ) * scale;
  const revenueBudget = toMillions(
    budgetMode === 'ytm' ? totals.ytmRevenueBudget : totals.revenueBudget
  ) * scale;
  const grossProfitBudget = toMillions(
    budgetMode === 'ytm' ? totals.ytmGrossProfitBudget : totals.grossProfitBudget
  ) * scale;
  const operatingProfitBudget = toMillions(
    budgetMode === 'ytm'
      ? totals.ytmOperatingProfitBudget
      : totals.operatingProfitBudget
  ) * scale;
  const netProfitBudget = toMillions(
    budgetMode === 'ytm' ? totals.ytmNetProfitBudget : totals.netProfitBudget
  ) * scale;
  const lastYearRevenue = toMillions(
    lastYearMode === 'ytm' ? totals.ytmLastYearRevenue : totals.lastYearRevenue
  ) * scale;
  const lastYearGrossProfit = toMillions(
    lastYearMode === 'ytm'
      ? totals.ytmLastYearGrossProfit
      : totals.lastYearGrossProfit
  ) * scale;
  const lastYearOperatingProfit = toMillions(
    lastYearMode === 'ytm'
      ? totals.ytmLastYearOperatingProfit
      : totals.lastYearOperatingProfit
  ) * scale;
  const lastYearNetProfit = toMillions(
    lastYearMode === 'ytm' ? totals.ytmLastYearNetProfit : totals.lastYearNetProfit
  ) * scale;
  const percentBasis = valueMode === 'budget' ? 'last-year' : 'budget';

  return {
    id,
    name,
    rev: buildMetric(
      revenue,
      revenueBudget,
      lastYearRevenue,
      `${insightBase} Revenue trends align with group mix.`,
      percentBasis
    ),
    gp: buildMetric(
      grossProfit,
      grossProfitBudget,
      lastYearGrossProfit,
      `${insightBase} Gross profit reflects mix and cost discipline.`,
      percentBasis
    ),
    op: buildMetric(
      operatingProfit,
      operatingProfitBudget,
      lastYearOperatingProfit,
      `${insightBase} Operating profit tracks execution momentum.`,
      percentBasis
    ),
    np: buildMetric(
      netProfit,
      netProfitBudget,
      lastYearNetProfit,
      `${insightBase} Net profit reflects margin resilience.`,
      percentBasis
    ),
  };
};

const buildUnitRow = (
  groupId: string,
  unit: BusinessUnitSource,
  scale: number,
  valueMode: 'actual' | 'budget' | 'forecast',
  budgetMode: 'full-year' | 'ytm',
  lastYearMode: 'full-year' | 'ytm'
): BusinessGroupData => {
  const unitId = `${groupId}-${unit.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`;
  const revenue = toMillions(
    valueMode === 'budget'
      ? unit.revenueBudget
      : valueMode === 'forecast'
      ? unit.forecastRevenue
      : unit.revenue
  ) * scale;
  const grossProfit = toMillions(
    valueMode === 'budget'
      ? unit.grossProfitBudget
      : valueMode === 'forecast'
      ? unit.forecastGrossProfit
      : unit.grossProfit
  ) * scale;
  const operatingProfit = toMillions(
    valueMode === 'budget'
      ? unit.operatingProfitBudget
      : valueMode === 'forecast'
      ? unit.forecastOperatingProfit
      : unit.operatingProfit
  ) * scale;
  const netProfit = toMillions(
    valueMode === 'budget'
      ? unit.netProfitBudget
      : valueMode === 'forecast'
      ? unit.forecastNetProfit
      : unit.netProfit
  ) * scale;
  const revenueBudget = toMillions(
    budgetMode === 'ytm' ? unit.ytmRevenueBudget : unit.revenueBudget
  ) * scale;
  const grossProfitBudget = toMillions(
    budgetMode === 'ytm' ? unit.ytmGrossProfitBudget : unit.grossProfitBudget
  ) * scale;
  const operatingProfitBudget = toMillions(
    budgetMode === 'ytm'
      ? unit.ytmOperatingProfitBudget
      : unit.operatingProfitBudget
  ) * scale;
  const netProfitBudget = toMillions(
    budgetMode === 'ytm' ? unit.ytmNetProfitBudget : unit.netProfitBudget
  ) * scale;
  const lastYearRevenue = toMillions(
    lastYearMode === 'ytm' ? unit.ytmLastYearRevenue : unit.lastYearRevenue
  ) * scale;
  const lastYearGrossProfit = toMillions(
    lastYearMode === 'ytm'
      ? unit.ytmLastYearGrossProfit
      : unit.lastYearGrossProfit
  ) * scale;
  const lastYearOperatingProfit = toMillions(
    lastYearMode === 'ytm'
      ? unit.ytmLastYearOperatingProfit
      : unit.lastYearOperatingProfit
  ) * scale;
  const lastYearNetProfit = toMillions(
    lastYearMode === 'ytm' ? unit.ytmLastYearNetProfit : unit.lastYearNetProfit
  ) * scale;
  const insightBase = `${unit.name} performance from BUSINESS_GROUP_DATA.`;
  const percentBasis = valueMode === 'budget' ? 'last-year' : 'budget';

  return {
    id: unitId,
    name: unit.name,
    rev: buildMetric(
      revenue,
      revenueBudget,
      lastYearRevenue,
      `${insightBase} Revenue outlook follows segment demand.`,
      percentBasis
    ),
    gp: buildMetric(
      grossProfit,
      grossProfitBudget,
      lastYearGrossProfit,
      `${insightBase} GP reflects product mix and cost structure.`,
      percentBasis
    ),
    op: buildMetric(
      operatingProfit,
      operatingProfitBudget,
      lastYearOperatingProfit,
      `${insightBase} OP tracks execution pace.`,
      percentBasis
    ),
    np: buildMetric(
      netProfit,
      netProfitBudget,
      lastYearNetProfit,
      `${insightBase} NP supported by margin discipline.`,
      percentBasis
    ),
  };
};

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
  const mainBuOptions = useMemo(
    () =>
      BUSINESS_GROUP_DATA.map((group) => ({
        id: normalizeGroupId(group.group),
        name: group.group,
      })),
    []
  );

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
    const scale = 1;
    const valueMode =
      isBudgetView || homeToggle === 'budget'
        ? 'budget'
        : homeToggle === 'full-year'
        ? 'forecast'
        : 'actual';
    const budgetMode = homeToggle === 'ytm' ? 'ytm' : 'full-year';
    const lastYearMode = homeToggle === 'ytm' ? 'ytm' : 'full-year';
    if (selectedBu === 'all') {
      const groupRows = BUSINESS_GROUP_DATA.map((group) =>
        buildGroupRow(
          group.group,
          group.businessUnits,
          scale,
          valueMode,
          budgetMode,
          lastYearMode
        )
      );
      const overallRow = buildGroupRow(
        'Overall',
        BUSINESS_GROUP_DATA.flatMap((group) => group.businessUnits),
        scale,
        valueMode,
        budgetMode,
        lastYearMode,
        'overall',
        'Overall'
      );
      return [...groupRows, overallRow];
    }

    const selectedGroup = BUSINESS_GROUP_DATA.find(
      (group) => normalizeGroupId(group.group) === selectedBu
    );
    if (!selectedGroup) {
      return [];
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const unitRows = selectedGroup.businessUnits.map((unit) =>
      buildUnitRow(groupId, unit, scale, valueMode, budgetMode, lastYearMode)
    );
    const overallRow = buildGroupRow(
      selectedGroup.group,
      selectedGroup.businessUnits,
      scale,
      valueMode,
      budgetMode,
      lastYearMode,
      `${groupId}-overall`,
      `${selectedGroup.group} overall`
    );
    return [...unitRows, overallRow];
  }, [selectedBu, selectedTimeframe, homeToggle, isBudgetView]);

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

    const lastYearOpValue = overallRow.op.stly;
    const budgetOpValue = overallRow.op.value;

    const roundToOne = (value: number) => Math.round(value * 10) / 10;

    let runningValue = roundToOne(lastYearOpValue);
    const baseStages = mockBudgetForecastStages.map((stage) => {
      const isBaselineStage = stage.type === 'baseline';
      const isBudgetStage = stage.stage === 'budget';
      const isActualStage = stage.stage === 'actuals';

      if (isBudgetStage) {
        runningValue = roundToOne(lastYearOpValue);
        return {
          ...stage,
          value: runningValue,
          delta: runningValue,
        };
      }

      if (isActualStage) {
        runningValue = roundToOne(budgetOpValue);
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

    const totalChange = roundToOne(budgetOpValue - lastYearOpValue);
    const fallbackShare = (ratio: number) =>
      totalChange === 0
        ? roundToOne(lastYearOpValue * ratio)
        : roundToOne(totalChange * ratio);

    const oneOffDeltaRaw =
      stageById.get('one-off-adjustments')?.delta ?? fallbackShare(0.12);
    const oneOffDelta = -Math.abs(oneOffDeltaRaw);
    const headwindsDelta =
      stageById.get('market-performance')?.delta ?? fallbackShare(0.28);
    const l4DeltaRaw =
      stageById.get('l4-vs-planned')?.delta ?? fallbackShare(0.22);
    const l3DeltaRaw =
      stageById.get('l3-vs-target')?.delta ?? fallbackShare(0.18);
    const l4Delta = Math.abs(l4DeltaRaw);
    const l3Delta = Math.abs(l3DeltaRaw);

    const afterOneOff = roundToOne(lastYearOpValue + oneOffDelta);
    const afterHeadwinds = roundToOne(afterOneOff + headwindsDelta);
    const beforePipeline = afterHeadwinds;
    const afterL4 = roundToOne(beforePipeline + l4Delta);
    const afterL3 = roundToOne(afterL4 + l3Delta);
    const withPipeline =
      stageById.get('forecast')?.value ?? roundToOne(afterL3);
    const ideationTotal = selectedBu === 'all'
      ? BUSINESS_GROUP_DATA.reduce(
          (sum, group) =>
            sum +
            group.businessUnits.reduce(
              (unitSum, unit) => unitSum + unit.ideationTarget,
              0
            ),
          0
        )
      : BUSINESS_GROUP_DATA.find(
          (group) => normalizeGroupId(group.group) === selectedBu
        )?.businessUnits.reduce(
          (sum, unit) => sum + unit.ideationTarget,
          0
        ) ?? 0;
    const ideationDelta = roundToOne(toMillions(ideationTotal));

    // Work backwards: withPipeline + ideationDelta = budgetOpValue
    const withPipeline = roundToOne(budgetOpValue - ideationDelta);

    // The remaining change from lastYearOpValue to withPipeline must be distributed
    // among one-off items, headwinds/tailwinds, L4, and L3
    const remainingChange = roundToOne(withPipeline - lastYearOpValue);

    // Create variation with both favorable (positive) and adverse (negative) deltas
    // Make deltas visible by basing them on the baseline value, not remaining change
    // One-off items: Always adverse (reduces value) - represents one-time costs
    // Headwinds/Tailwinds: Variable - can be favorable or adverse based on market
    // L4 and L3: Always favorable (pipeline initiatives add value)
    
    // One-off is a visible adverse impact (8% of last year OP)
    const oneOffDelta = roundToOne(-Math.abs(lastYearOpValue * 0.08));
    
    // Headwinds/Tailwinds: Variable based on overall performance (6% of last year OP)
    // If growth is strong (>20%), headwinds are favorable; otherwise adverse
    const growthRate = lastYearOpValue === 0 ? 0 : (budgetOpValue - lastYearOpValue) / lastYearOpValue;
    const headwindsIsFavorable = growthRate > 0.20;
    const headwindsMagnitude = Math.abs(lastYearOpValue * 0.06);
    const headwindsDelta = headwindsIsFavorable 
      ? roundToOne(headwindsMagnitude) 
      : roundToOne(-headwindsMagnitude);
    
    // Calculate what L4 and L3 need to cover (the remaining gap after one-off and headwinds)
    const pipelineNeeded = roundToOne(remainingChange - oneOffDelta - headwindsDelta);
    
    // L4 gets 40% of pipeline needed, L3 gets the rest
    const l4Delta = roundToOne(pipelineNeeded * 0.40);
    const l3Delta = roundToOne(pipelineNeeded - l4Delta);

    const afterOneOff = roundToOne(lastYearOpValue + oneOffDelta);
    const afterHeadwinds = roundToOne(afterOneOff + headwindsDelta);
    const beforePipeline = afterHeadwinds;
    const afterL4 = roundToOne(beforePipeline + l4Delta);
    const afterL3 = roundToOne(afterL4 + l3Delta);
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
      _stage: BudgetForecastStage['stage'],
      delta: number,
      fallback: BudgetForecastStage['type']
    ): BudgetForecastStage['type'] => {
      if (fallback === 'baseline') {
        return fallback;
      }
      // For all non-baseline stages, color based on delta sign
      return delta >= 0 ? 'positive' : 'negative';
    };

    return [
      makeStage(
        'budget',
        'Last year OP',
        roundToOne(lastYearOpValue),
        roundToOne(lastYearOpValue),
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
        roundToOne(budgetOpValue),
        roundToOne(budgetOpValue),
        'baseline'
      ),
    ];
  }, [isBudgetView, tableData, selectedBu]);

  const getExpandedSubGroups = (bgId: string) => {
    const scale = 1;
    const valueMode =
      isBudgetView || homeToggle === 'budget'
        ? 'budget'
        : homeToggle === 'full-year'
        ? 'forecast'
        : 'actual';
    const budgetMode = homeToggle === 'ytm' ? 'ytm' : 'full-year';
    const lastYearMode = homeToggle === 'ytm' ? 'ytm' : 'full-year';
    const selectedGroup = BUSINESS_GROUP_DATA.find(
      (group) => normalizeGroupId(group.group) === bgId
    );
    if (!selectedGroup) {
      return [];
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    return selectedGroup.businessUnits.map((unit) =>
      buildUnitRow(groupId, unit, scale, valueMode, budgetMode, lastYearMode)
    );
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
    const budgetPercent = calcPercent(metric.value, metric.baseline);
    const lastYearPercent = calcPercent(metric.value, metric.stly);
    const primaryPercent = isBudgetMode ? lastYearPercent : budgetPercent;
    const percentColor =
      primaryPercent > 0
        ? 'bg-green-100 text-green-700'
        : primaryPercent < 0
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-600';
    const percentSign = primaryPercent > 0 ? '+' : '';
    const lastYearPercentColor =
      lastYearPercent > 0
        ? 'bg-green-100 text-green-700'
        : lastYearPercent < 0
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 text-gray-600';
    const lastYearPercentSign = lastYearPercent > 0 ? '+' : '';

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
      primaryPercent > 0
        ? '#22c55e'
        : primaryPercent < 0
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
              ${metric.value.toFixed(0)}M
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
              ${metric.value.toFixed(0)}M
            </div>
          </div>
          <div className='text-center'>
            {!isBudgetMode && (
            <div className='text-xs text-gray-500 mb-0.5'>
              vs budget ${metric.baseline.toFixed(0)}M
            </div>
            )}
            <div className='text-xs text-gray-500'>
              vs Last Year ${metric.stly.toFixed(0)}M
            </div>
          </div>
          <div className='flex flex-col gap-0.5'>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${percentColor}`}>
              {percentSign}
              {primaryPercent.toFixed(1)}%
            </span>
            {!isBudgetView && (
            <span
                className={`px-1.5 py-0.5 rounded text-xs font-semibold ${lastYearPercentColor}`}>
                {lastYearPercentSign}
                {lastYearPercent.toFixed(1)}%
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
                {primaryPercent.toFixed(1)}%
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
