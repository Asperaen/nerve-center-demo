import {
  ArrowRightIcon,
  CalendarIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
 
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { MONTHS, TREND_MONTHS } from '../constants';
import { useBudgets, type BusinessGroup } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';
import {
  BUDGET_WATERFALL_DATA,
  KEY_CALLOUTS_BY_BG,
  PNL_BREAKDOWN_DATA,
  type BudgetWaterfallRow,
  type FunctionTargetRow,
  type PnlBreakdownRow,
} from '../data/mockBgData';
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
import { derivePnlPassthrough } from '../utils/pnlBreakdownUtils';
import {
  getStoredTimeframe,
  setStoredTimeframe,
} from '../utils/timeframeStorage';

const toMillions = (value: number) => value / 1_000;

/** YTM end month index (0-based). Jan=0, Feb=1. Only months 0..YTM_END_MONTH_INDEX have actuals. */
const YTM_END_MONTH_INDEX = 1;

const normalizeGroupId = (groupName: string) => {
  const key = groupName.trim().toLowerCase().replace(/\s*\(parent\)\s*$/i, '');
  const normalized = key.replace(/\s*&\s*/g, ' ').replace(/\s+/g, '-');
  if (normalized === 'other-subsidiary-intergroup-adjustments') {
    return 'mbu';
  }
  return key === 'other' ? 'others' : key;
};

const getUnitId = (groupId: string, unitName: string) =>
  `${groupId}-${unitName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

// Simple hash function to generate a unique seed from a string
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

const buildTrend = (
  value: number,
  baseline: number,
  _lastYear: number,
  seed: number = 0
): MonthlyTrendPoint[] => {
  // Calculate performance vs budget to determine trend direction
  const percentVsBudget = baseline === 0 ? 0 : ((value - baseline) / baseline) * 100;
  const isOutperforming = percentVsBudget >= 0;
  
  // Calculate the magnitude of variance (capped for visual consistency)
  const varianceMagnitude = Math.min(Math.abs(percentVsBudget), 50) / 100;
  
  // Calculate the range of values in the trend (10-25% of current value based on variance)
  const trendRange = Math.abs(value) * (0.1 + varianceMagnitude * 0.15);
  
  // Define start and end values based on performance
  let startValue: number;
  let endValue: number;
  
  if (isOutperforming) {
    startValue = value - trendRange;
    endValue = value;
  } else {
    startValue = value + trendRange;
    endValue = value;
  }
  
  const steps = TREND_MONTHS.length - 1;
  
  // Use seed to select different curve shapes (0-5 different patterns)
  const curveType = seed % 6;
  // Use seed for additional variation within each curve type
  const seedVariation = ((seed >> 3) % 100) / 100; // 0-1 range
  const seedPhase = ((seed >> 6) % 100) / 50; // 0-2 range
  
  return TREND_MONTHS.map((month, index) => {
    const ratio = steps === 0 ? 0 : index / steps;
    
    // Apply different curve shapes based on curveType
    let curveRatio: number;
    
    switch (curveType) {
      case 0:
        // Ease-out: fast start, slow finish
        curveRatio = 1 - Math.pow(1 - ratio, 2 + seedVariation);
        break;
      case 1:
        // Ease-in: slow start, fast finish
        curveRatio = Math.pow(ratio, 2 + seedVariation);
        break;
      case 2:
        // S-curve: slow start, fast middle, slow finish
        curveRatio = ratio < 0.5
          ? 2 * Math.pow(ratio, 2)
          : 1 - Math.pow(-2 * ratio + 2, 2) / 2;
        break;
      case 3:
        // Dip then recover (for upward) or bump then fall (for downward)
        const dipDepth = 0.15 + seedVariation * 0.2;
        const dipCenter = 0.3 + seedVariation * 0.2;
        const dipEffect = Math.exp(-Math.pow((ratio - dipCenter) / 0.2, 2)) * dipDepth;
        curveRatio = ratio - dipEffect * (1 - ratio);
        break;
      case 4:
        // Stepped/plateau in middle
        const plateauStart = 0.3 + seedVariation * 0.1;
        const plateauEnd = 0.6 + seedVariation * 0.1;
        if (ratio < plateauStart) {
          curveRatio = (ratio / plateauStart) * 0.4;
        } else if (ratio < plateauEnd) {
          curveRatio = 0.4 + ((ratio - plateauStart) / (plateauEnd - plateauStart)) * 0.2;
        } else {
          curveRatio = 0.6 + ((ratio - plateauEnd) / (1 - plateauEnd)) * 0.4;
        }
        break;
      case 5:
      default:
        // Wavy progression
        const waveAmp = 0.08 + seedVariation * 0.07;
        const waveFreq = 1.5 + seedPhase;
        curveRatio = ratio + Math.sin(ratio * Math.PI * waveFreq) * waveAmp * (1 - Math.abs(ratio - 0.5) * 2);
        curveRatio = Math.max(0, Math.min(1, curveRatio));
        break;
    }
    
    // Ensure curveRatio stays in valid range
    curveRatio = Math.max(0, Math.min(1, curveRatio));
    
    // Interpolate between start and end using the curved ratio
    const trendValue = startValue + (endValue - startValue) * curveRatio;
    
    return {
      month,
      value: Math.round(trendValue * 10) / 10,
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
  percentBasis: 'budget' | 'last-year',
  groupName: string,
  metricName: string
): BusinessGroupMetricWithTrend => {
  // Generate a unique seed from the combination of group name and metric name
  const seed = hashString(`${groupName}-${metricName}`);
  return {
    value,
    baseline: budget,
    stly: lastYear,
    percent: calcPercent(value, percentBasis === 'last-year' ? lastYear : budget),
    trend: buildTrend(value, budget, lastYear, seed),
    aiInsight,
  };
};

type BusinessGroupSource = BusinessGroup;
type BusinessUnitSource = BusinessGroupSource['businessUnits'][number];

const buildGroupRow = (
  groupName: string,
  units: BusinessUnitSource[],
  fullYearScale: number,
  ytmScale: number,
  valueMode: 'actual' | 'budget' | 'forecast',
  budgetMode: 'full-year' | 'ytm',
  lastYearMode: 'full-year' | 'ytm',
  idOverride?: string,
  nameOverride?: string,
  actualValueScale?: number
): BusinessGroupData => {
  const totals = units.reduce(
    (acc, unit) => {
      acc.revenue += unit.revenue;
      acc.grossProfit += unit.grossProfit;
      acc.operatingProfit += unit.operatingProfit;
      acc.netProfit += unit.netProfit;
        acc.ytmRevenueActual += unit.ytmRevenueActual ?? 0;
        acc.ytmGrossProfitActual += unit.ytmGrossProfitActual ?? 0;
        acc.ytmOperatingProfitActual += unit.ytmOperatingProfitActual ?? 0;
        acc.ytmNetProfitActual += unit.ytmNetProfitActual ?? 0;
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
      ytmRevenueActual: 0,
      ytmGrossProfitActual: 0,
      ytmOperatingProfitActual: 0,
      ytmNetProfitActual: 0,
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
  const insightBase = `${name} performance.`;
  const budgetScale = budgetMode === 'ytm' ? ytmScale : fullYearScale;
  const lastYearScale = lastYearMode === 'ytm' ? ytmScale : fullYearScale;
  const valueScale =
    valueMode === 'budget'
      ? budgetScale
      : valueMode === 'actual'
      ? (actualValueScale ?? 1)
      : fullYearScale;
  const revenue = toMillions(
    valueMode === 'budget'
      ? budgetMode === 'ytm'
        ? totals.ytmRevenueBudget
        : totals.revenueBudget
      : valueMode === 'forecast'
      ? totals.forecastRevenue
      : totals.ytmRevenueActual ?? totals.revenue
  ) * valueScale;
  const grossProfit = toMillions(
    valueMode === 'budget'
      ? budgetMode === 'ytm'
        ? totals.ytmGrossProfitBudget
        : totals.grossProfitBudget
      : valueMode === 'forecast'
      ? totals.forecastGrossProfit
      : totals.ytmGrossProfitActual ?? totals.grossProfit
  ) * valueScale;
  const operatingProfit = toMillions(
    valueMode === 'budget'
      ? budgetMode === 'ytm'
        ? totals.ytmOperatingProfitBudget
        : totals.operatingProfitBudget
      : valueMode === 'forecast'
      ? totals.forecastOperatingProfit
      : totals.ytmOperatingProfitActual ?? totals.operatingProfit
  ) * valueScale;
  const netProfit = toMillions(
    valueMode === 'budget'
      ? budgetMode === 'ytm'
        ? totals.ytmNetProfitBudget
        : totals.netProfitBudget
      : valueMode === 'forecast'
      ? totals.forecastNetProfit
      : totals.ytmNetProfitActual ?? totals.netProfit
  ) * valueScale;
  const revenueBudget = toMillions(
    budgetMode === 'ytm' ? totals.ytmRevenueBudget : totals.revenueBudget
  ) * budgetScale;
  const grossProfitBudget = toMillions(
    budgetMode === 'ytm' ? totals.ytmGrossProfitBudget : totals.grossProfitBudget
  ) * budgetScale;
  const operatingProfitBudget = toMillions(
    budgetMode === 'ytm'
      ? totals.ytmOperatingProfitBudget
      : totals.operatingProfitBudget
  ) * budgetScale;
  const netProfitBudget = toMillions(
    budgetMode === 'ytm' ? totals.ytmNetProfitBudget : totals.netProfitBudget
  ) * budgetScale;
  const lastYearRevenue = toMillions(
    lastYearMode === 'ytm' ? totals.ytmLastYearRevenue : totals.lastYearRevenue
  ) * lastYearScale;
  const lastYearGrossProfit = toMillions(
    lastYearMode === 'ytm'
      ? totals.ytmLastYearGrossProfit
      : totals.lastYearGrossProfit
  ) * lastYearScale;
  const lastYearOperatingProfit = toMillions(
    lastYearMode === 'ytm'
      ? totals.ytmLastYearOperatingProfit
      : totals.lastYearOperatingProfit
  ) * lastYearScale;
  const lastYearNetProfit = toMillions(
    lastYearMode === 'ytm' ? totals.ytmLastYearNetProfit : totals.lastYearNetProfit
  ) * lastYearScale;
  const percentBasis = valueMode === 'budget' ? 'last-year' : 'budget';

  return {
    id,
    name,
    rev: buildMetric(
      revenue,
      revenueBudget,
      lastYearRevenue,
      `${insightBase} Revenue trends align with group mix.`,
      percentBasis,
      name,
      'Revenue'
    ),
    gp: buildMetric(
      grossProfit,
      grossProfitBudget,
      lastYearGrossProfit,
      `${insightBase} Gross profit reflects mix and cost discipline.`,
      percentBasis,
      name,
      'Gross Profit'
    ),
    op: buildMetric(
      operatingProfit,
      operatingProfitBudget,
      lastYearOperatingProfit,
      `${insightBase} Operating profit tracks execution momentum.`,
      percentBasis,
      name,
      'Operating Profit'
    ),
    np: buildMetric(
      netProfit,
      netProfitBudget,
      lastYearNetProfit,
      `${insightBase} Net profit reflects margin resilience.`,
      percentBasis,
      name,
      'Net Profit'
    ),
  };
};

const buildUnitRow = (
  groupId: string,
  unit: BusinessUnitSource,
  fullYearScale: number,
  ytmScale: number,
  valueMode: 'actual' | 'budget' | 'forecast',
  budgetMode: 'full-year' | 'ytm',
  lastYearMode: 'full-year' | 'ytm',
  actualValueScale?: number
): BusinessGroupData => {
  const unitId = `${groupId}-${unit.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`;
  const budgetScale = budgetMode === 'ytm' ? ytmScale : fullYearScale;
  const lastYearScale = lastYearMode === 'ytm' ? ytmScale : fullYearScale;
  const valueScale =
    valueMode === 'budget'
      ? budgetScale
      : valueMode === 'actual'
      ? (actualValueScale ?? 1)
      : fullYearScale;
  const revenue = toMillions(
    valueMode === 'budget'
      ? budgetMode === 'ytm'
        ? unit.ytmRevenueBudget
        : unit.revenueBudget
      : valueMode === 'forecast'
      ? unit.forecastRevenue
      : unit.ytmRevenueActual ?? unit.revenue
  ) * valueScale;
  const grossProfit = toMillions(
    valueMode === 'budget'
      ? budgetMode === 'ytm'
        ? unit.ytmGrossProfitBudget
        : unit.grossProfitBudget
      : valueMode === 'forecast'
      ? unit.forecastGrossProfit
      : unit.ytmGrossProfitActual ?? unit.grossProfit
  ) * valueScale;
  const operatingProfit = toMillions(
    valueMode === 'budget'
      ? budgetMode === 'ytm'
        ? unit.ytmOperatingProfitBudget
        : unit.operatingProfitBudget
      : valueMode === 'forecast'
      ? unit.forecastOperatingProfit
      : unit.ytmOperatingProfitActual ?? unit.operatingProfit
  ) * valueScale;
  const netProfit = toMillions(
    valueMode === 'budget'
      ? budgetMode === 'ytm'
        ? unit.ytmNetProfitBudget
        : unit.netProfitBudget
      : valueMode === 'forecast'
      ? unit.forecastNetProfit
      : unit.ytmNetProfitActual ?? unit.netProfit
  ) * valueScale;
  const revenueBudget = toMillions(
    budgetMode === 'ytm' ? unit.ytmRevenueBudget : unit.revenueBudget
  ) * budgetScale;
  const grossProfitBudget = toMillions(
    budgetMode === 'ytm' ? unit.ytmGrossProfitBudget : unit.grossProfitBudget
  ) * budgetScale;
  const operatingProfitBudget = toMillions(
    budgetMode === 'ytm'
      ? unit.ytmOperatingProfitBudget
      : unit.operatingProfitBudget
  ) * budgetScale;
  const netProfitBudget = toMillions(
    budgetMode === 'ytm' ? unit.ytmNetProfitBudget : unit.netProfitBudget
  ) * budgetScale;
  const lastYearRevenue = toMillions(
    lastYearMode === 'ytm' ? unit.ytmLastYearRevenue : unit.lastYearRevenue
  ) * lastYearScale;
  const lastYearGrossProfit = toMillions(
    lastYearMode === 'ytm'
      ? unit.ytmLastYearGrossProfit
      : unit.lastYearGrossProfit
  ) * lastYearScale;
  const lastYearOperatingProfit = toMillions(
    lastYearMode === 'ytm'
      ? unit.ytmLastYearOperatingProfit
      : unit.lastYearOperatingProfit
  ) * lastYearScale;
  const lastYearNetProfit = toMillions(
    lastYearMode === 'ytm' ? unit.ytmLastYearNetProfit : unit.lastYearNetProfit
  ) * lastYearScale;
  const insightBase = `${unit.name} performance.`;
  const percentBasis = valueMode === 'budget' ? 'last-year' : 'budget';

  return {
    id: unitId,
    name: unit.name,
    rev: buildMetric(
      revenue,
      revenueBudget,
      lastYearRevenue,
      `${insightBase} Revenue outlook follows segment demand.`,
      percentBasis,
      unit.name,
      'Revenue'
    ),
    gp: buildMetric(
      grossProfit,
      grossProfitBudget,
      lastYearGrossProfit,
      `${insightBase} GP reflects product mix and cost structure.`,
      percentBasis,
      unit.name,
      'Gross Profit'
    ),
    op: buildMetric(
      operatingProfit,
      operatingProfitBudget,
      lastYearOperatingProfit,
      `${insightBase} OP tracks execution pace.`,
      percentBasis,
      unit.name,
      'Operating Profit'
    ),
    np: buildMetric(
      netProfit,
      netProfitBudget,
      lastYearNetProfit,
      `${insightBase} NP supported by margin discipline.`,
      percentBasis,
      unit.name,
      'Net Profit'
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
  const { businessGroups } = useBudgets();
  const buildBgPerformanceUrl = useCallback(
    (params: Record<string, string | undefined>) => {
      const nextParams = new URLSearchParams(searchParams);
      Object.entries(params).forEach(([key, value]) => {
        if (!value) {
          nextParams.delete(key);
          return;
        }
        nextParams.set(key, value);
      });
      return `/business-group-performance?${nextParams.toString()}`;
    },
    [searchParams]
  );

  // Selection state
  const [selectedFinancialKPIs, setSelectedFinancialKPIs] = useState<
    Set<string>
  >(new Set());
  // Modal state
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const [selectedBu, setSelectedBu] = useState<string>('all');
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );
  const [activeBudgetStage, setActiveBudgetStage] =
    useState<BudgetForecastStage | null>(null);
  const [impactRationaleFilter, setImpactRationaleFilter] =
    useState<string>('all');
  const [impactSearch, setImpactSearch] = useState<string>('');
  const mainBuOptions = useMemo(
    () =>
      businessGroups.map((group) => ({
        id: normalizeGroupId(group.group),
        name: group.group,
      })),
    [businessGroups]
  );

  const selectedBuLabel = useMemo(() => {
    if (selectedBu === 'all') {
      return 'Overall';
    }
    return mainBuOptions.find((bu) => bu.id === selectedBu)?.name ?? 'Overall';
  }, [selectedBu, mainBuOptions]);

  const selectedGroup = useMemo(() => {
    if (selectedBu === 'all') {
      return null;
    }
    return (
      businessGroups.find(
        (group) => normalizeGroupId(group.group) === selectedBu
      ) ?? null
    );
  }, [businessGroups, selectedBu]);

  useEffect(() => {
    if (!isBudgetView) {
      return;
    }
    if (!selectedGroup) {
      setSelectedGroupIds(new Set());
      return;
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const overallId = `${groupId}-overall`;
    const buParam = searchParams.get('bg') ? searchParams.get('bu') : null;
    if (buParam) {
      const requestedUnits = buParam
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      if (requestedUnits.length > 0) {
        const unitIds = requestedUnits
          .map((unitName) => getUnitId(groupId, unitName))
          .filter((unitId) =>
            selectedGroup.businessUnits.some(
              (unit) => getUnitId(groupId, unit.name) === unitId
            )
          );
        if (unitIds.length > 0) {
          setSelectedGroupIds(new Set(unitIds));
          return;
        }
      }
    }
    setSelectedGroupIds(new Set([overallId]));
  }, [isBudgetView, searchParams, selectedGroup]);

  const selectedUnits = useMemo(() => {
    if (!selectedGroup) {
      return [];
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const overallId = `${groupId}-overall`;
    const isAllSelected =
      selectedGroupIds.size === 0 || selectedGroupIds.has(overallId);
    return isAllSelected
      ? selectedGroup.businessUnits
      : selectedGroup.businessUnits.filter((unit) =>
          selectedGroupIds.has(getUnitId(groupId, unit.name))
        );
  }, [selectedGroup, selectedGroupIds]);

  const isAllBuSelected = useMemo(() => {
    if (!selectedGroup) {
      return true;
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const overallId = `${groupId}-overall`;
    return selectedGroupIds.size === 0 || selectedGroupIds.has(overallId);
  }, [selectedGroup, selectedGroupIds]);

  const isDeGroupSelected = useMemo(() => {
    if (!isBudgetView || !selectedGroup || selectedBu === 'all') {
      return false;
    }
    if (selectedUnits.length !== 1) {
      return false;
    }
    const normalized =
      selectedUnits[0].name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    return normalizeGroupId(selectedGroup.group) === 'pcbg' && normalized === 'aebu1';
  }, [isBudgetView, selectedBu, selectedGroup, selectedUnits]);

  const showBuSelection = isBudgetView && selectedBu !== 'all' && selectedGroup;

  const toggleBuSelection = (unitId: string | 'all') => {
    if (!selectedGroup) {
      return;
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const overallId = `${groupId}-overall`;
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (unitId === 'all') {
        next.clear();
        next.add(overallId);
        return next;
      }
      next.delete(overallId);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      if (next.size === 0) {
        next.add(overallId);
      }
      setSearchParams(
        (prevParams) => {
          const params = new URLSearchParams(prevParams);
          const selectedUnitIds = Array.from(next).filter(
            (id) => id !== overallId
          );
          if (selectedUnitIds.length === 0) {
            params.delete('bu');
            return params;
          }
          const unitNames = selectedGroup.businessUnits
            .filter((unit) =>
              selectedUnitIds.includes(getUnitId(groupId, unit.name))
            )
            .map((unit) => unit.name);
          if (unitNames.length === 0) {
            params.delete('bu');
            return params;
          }
          params.set('bg', selectedBu);
          params.set('bu', unitNames.join(','));
          return params;
        },
        { replace: true }
      );
      return next;
    });
  };

  const { formatAmount, currencyLabel } = useCurrency();

  const formatMn = (value: number) =>
    formatAmount(value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  const formatMnWhole = (value: number) =>
    `${formatAmount(value, { maximumFractionDigits: 0 })}M`;
  const formatPnlValue = (value: number) =>
    `${formatMn(toMillions(value))}M`;

  const resolvePnlGroupKey = useCallback((groupName: string) => {
    const normalized = normalizeGroupId(groupName);
    if (normalized === 'pcbg') {
      return 'PCBG';
    }
    if (normalized === 'sdbg') {
      return 'SDBG';
    }
    if (normalized === 'isbg') {
      return 'ISBG';
    }
    if (normalized === 'aep') {
      return 'AEP';
    }
    if (normalized === 'others') {
      return 'Others';
    }
    if (normalized === 'mbu') {
      return 'MBU';
    }
    return null;
  }, []);

  const pnlGroupKey = useMemo(() => {
    if (!selectedGroup) {
      return null;
    }
    return resolvePnlGroupKey(selectedGroup.group);
  }, [resolvePnlGroupKey, selectedGroup]);

  const selectedUnitNames = useMemo(
    () => selectedUnits.map((unit) => unit.name),
    [selectedUnits]
  );

  const activePnlRows = useMemo<PnlBreakdownRow[]>(() => {
    if (!pnlGroupKey) {
      return [];
    }
    const rows = PNL_BREAKDOWN_DATA[pnlGroupKey] ?? [];
    const filtered =
      selectedUnitNames.length === 0
        ? rows
        : rows.filter((row) => selectedUnitNames.includes(row.unit));
    return derivePnlPassthrough(filtered);
  }, [pnlGroupKey, selectedUnitNames]);

  const pnlTitle = useMemo(() => {
    if (!selectedGroup || isAllBuSelected) {
      return 'All BUs';
    }
    if (selectedUnitNames.length === 1) {
      return selectedUnitNames[0];
    }
    if (selectedUnitNames.length <= 3) {
      return selectedUnitNames.join(', ');
    }
    return `${selectedUnitNames.length} BUs selected`;
  }, [isAllBuSelected, selectedGroup, selectedUnitNames]);

  const groupedPnlRows = useMemo(() => {
    const grouped = new Map<string, PnlBreakdownRow[]>();
    activePnlRows.forEach((row) => {
      if (!grouped.has(row.unit)) {
        grouped.set(row.unit, []);
      }
      grouped.get(row.unit)?.push(row);
    });
    return grouped;
  }, [activePnlRows]);

  const showPnlUnitColumn = groupedPnlRows.size > 1;

  const pnlHierarchy = [
    { label: 'Revenue', children: ['Passthrough', 'Controllable'] },
    {
      label: 'COGS',
      children: [
        { label: 'BOM', children: ['Buy-Sell', 'AVAP', 'Controllable'] },
        { label: 'MVA', children: ['DL', 'IDL', 'G&A'] },
      ],
    },
    { label: 'R&D', children: ['FTE', 'Non-FTE'] },
    { label: 'SG&A' },
    { label: 'Share expenses' },
    { label: 'Operating profit' },
    { label: '(Line items between OP and net)' },
    { label: 'Net profit' },
  ] as const;

  const renderPnlRows = useCallback(
    (rows: PnlBreakdownRow[], showUnit: boolean = true, timeframeScope: TimeframeOption = 'full-year') => {
      const used = new Set<number>();

      const getNextRow = (label: string) => {
        for (let i = 0; i < rows.length; i += 1) {
          if (!used.has(i) && rows[i].lineItem === label) {
            used.add(i);
            return { row: rows[i], index: i };
          }
        }
        return null;
      };

      const renderValueRow = (
        row: PnlBreakdownRow,
        index: number,
        level: number,
        isGroup: boolean
      ) => {
        // Use YTM or Full Year values based on toggle
        const budgetValue = timeframeScope === 'ytm'
          ? row.ytmBudget
          : row.fullYearBudget;
        const lastYearValue = timeframeScope === 'ytm'
          ? row.lastYearYtm
          : row.lastYearFullYear;
        const deviation = (budgetValue ?? 0) - (lastYearValue ?? 0);
        const isBoldLineItem =
          ['SG&A', 'Share expenses', 'R&D', 'Revenue'].includes(row.lineItem) ||
          row.lineItem.startsWith('COGS');

        return (
          <tr
            key={`${row.unit}-${row.lineItem}-${index}`}
            className='border-b border-gray-200 last:border-b-0'>
            <td className='px-4 py-3 text-gray-600'>
              {showUnit ? row.unit : ''}
            </td>
            <td className='px-4 py-3 text-gray-600'>
              <span
                className={isGroup || isBoldLineItem ? 'font-semibold text-gray-900' : 'text-gray-700'}
                style={{ paddingLeft: `${level * 16}px` }}>
                {row.lineItem}
              </span>
            </td>
            <td className='px-4 py-3 text-right text-gray-700'>
              {formatPnlValue(budgetValue)}
            </td>
            <td className='px-4 py-3 text-right text-gray-700'>
              {formatPnlValue(lastYearValue)}
            </td>
            <td className='px-4 py-3 text-right text-gray-700'>
              {formatPnlValue(deviation)}
            </td>
          </tr>
        );
      };

      const renderLabelRow = (label: string, level: number) => (
        <tr key={`label-${label}-${level}`} className='border-b border-gray-200 last:border-b-0'>
          <td className='px-4 py-3 text-gray-600' />
          <td className='px-4 py-3 text-gray-600'>
            <span
              className={
                label === 'Revenue' || label === 'COGS'
                  ? 'font-bold text-gray-900'
                  : 'font-semibold text-gray-900'
              }
              style={{ paddingLeft: `${level * 16}px` }}>
              {label}
            </span>
          </td>
          <td className='px-4 py-3 text-right text-gray-400'>—</td>
          <td className='px-4 py-3 text-right text-gray-400'>—</td>
          <td className='px-4 py-3 text-right text-gray-400'>—</td>
        </tr>
      );

      const renderNode = (
        node: { label: string; children?: readonly (string | { label: string; children?: readonly string[] })[] },
        level: number
      ): React.ReactNode[] => {
        const rowMatch = getNextRow(node.label);
        const items: React.ReactNode[] = [];
        if (rowMatch) {
          const isBoldRow = node.label === 'Operating profit' || node.label === 'Net profit';
          items.push(renderValueRow(rowMatch.row, rowMatch.index, level, isBoldRow));
        } else if (node.children && node.children.length > 0) {
          items.push(renderLabelRow(node.label, level));
        }
        (node.children ?? []).forEach((child) => {
          if (typeof child === 'string') {
            const childMatch = getNextRow(child);
            if (childMatch) {
              items.push(
                renderValueRow(childMatch.row, childMatch.index, level + 1, false)
              );
            }
            return;
          }
          items.push(...renderNode(child, level + 1));
        });
        return items;
      };

      const output: React.ReactNode[] = [];
      pnlHierarchy.forEach((node) => {
        output.push(...renderNode(node, 0));
      });

      rows.forEach((row, index) => {
        if (!used.has(index)) {
          output.push(renderValueRow(row, index, 0, false));
        }
      });

      return output;
    },
    [formatPnlValue]
  );

  const selectedImpactUnits = useMemo(() => {
    if (isBudgetView && selectedBu !== 'all' && selectedUnits.length > 0) {
      return selectedUnits;
    }
    if (selectedBu === 'all') {
      return businessGroups.flatMap((group) => group.businessUnits);
    }
    return selectedGroup?.businessUnits ?? [];
  }, [businessGroups, isBudgetView, selectedBu, selectedGroup, selectedUnits]);

  const opImpactRows = useMemo(
    () =>
      selectedImpactUnits.flatMap((unit) =>
        (unit.opImpactDetails ?? []).map((detail) => ({
          ...detail,
          bu: unit.name,
        }))
      ),
    [selectedImpactUnits]
  );
  const opImpactTotals = useMemo(() => {
    const oneOff = opImpactRows
      .filter((row) => row.category.toLowerCase().includes('one-off'))
      .reduce((sum, row) => sum + row.opImpact, 0);
    const headwinds = opImpactRows
      .filter((row) => {
        const category = row.category.toLowerCase();
        return category.includes('headwind') || category.includes('tailwind');
      })
      .reduce((sum, row) => sum + row.opImpact, 0);
    const volumeMix = opImpactRows
      .filter((row) => {
        const category = row.category.toLowerCase();
        return category.includes('volume') || category.includes('mix');
      })
      .reduce((sum, row) => sum + row.opImpact, 0);
    const leakages = opImpactRows
      .filter((row) => row.category.toLowerCase().includes('leak'))
      .reduce((sum, row) => sum + row.opImpact, 0);
    return { oneOff, headwinds, volumeMix, leakages };
  }, [opImpactRows]);

  const functionTargetRows = useMemo(() => {
    if (selectedBu === 'all') {
      return null;
    }
    const units =
      isBudgetView && selectedUnits.length > 0
        ? selectedUnits
        : selectedGroup?.businessUnits ?? [];
    if (units.length === 0) {
      return null;
    }
    const baseRows = units[0]?.functionTargetBreakdown ?? [];
    if (baseRows.length === 0) {
      return null;
    }
    const rowOrder = baseRows.map(
      (row) => `${row.function}|${row.coreKpi}|${row.coreImprovementTarget}`
    );
    const aggregateMap = new Map<string, FunctionTargetRow>();

    units.forEach((unit) => {
      const rows = unit.functionTargetBreakdown ?? [];
      rows.forEach((row) => {
        const key = `${row.function}|${row.coreKpi}|${row.coreImprovementTarget}`;
        const existing = aggregateMap.get(key) ?? {
          function: row.function,
          opTarget: 0,
          coreKpi: row.coreKpi,
          coreImprovementTarget: row.coreImprovementTarget,
        };
        const nextValue =
          typeof row.opTarget === 'number'
            ? (typeof existing.opTarget === 'number' ? existing.opTarget : 0) +
              row.opTarget
            : existing.opTarget || row.opTarget;
        aggregateMap.set(key, {
          function: row.function,
          opTarget: nextValue,
          coreKpi: row.coreKpi,
          coreImprovementTarget: row.coreImprovementTarget,
        });
      });
    });

    return rowOrder
      .map((key) => aggregateMap.get(key))
      .filter((row): row is FunctionTargetRow => Boolean(row));
  }, [isBudgetView, selectedBu, selectedGroup, selectedUnits]);

  const impactRationaleOptions = useMemo(
    () =>
      Array.from(new Set(opImpactRows.map((row) => row.costRationale))).filter(
        Boolean
      ),
    [opImpactRows]
  );

  const getOpImpactRowsForStage = useCallback(
    (stage: BudgetForecastStage) => {
      if (opImpactRows.length === 0) {
        return [];
      }
      const normalized = (value: string) => value.toLowerCase();
      if (stage.stage === 'one-off-adjustments') {
        return opImpactRows.filter((row) =>
          normalized(row.category).includes('one-off')
        );
      }
      if (stage.stage === 'market-performance') {
        return opImpactRows.filter((row) => {
          const category = normalized(row.category);
          return category.includes('headwind') || category.includes('tailwind');
        });
      }
      return [];
    },
    [opImpactRows]
  );

  const renderOpImpactTooltip = useCallback(
    (stage: BudgetForecastStage) => {
      if (
        stage.stage !== 'one-off-adjustments' &&
        stage.stage !== 'market-performance'
      ) {
        return null;
      }
      const stageRows = getOpImpactRowsForStage(stage);
      const totalImpact =
        stage.delta ?? stageRows.reduce((sum, row) => sum + row.opImpact, 0);
      const topItems = [...stageRows]
        .sort((a, b) => Math.abs(b.opImpact) - Math.abs(a.opImpact))
        .slice(0, 4);

      if (topItems.length === 0) {
        return (
          <p className='text-xs text-gray-500'>
            No op-impact items available.
          </p>
        );
      }
      const remainingCount = Math.max(0, stageRows.length - topItems.length);

      return (
        <div className='space-y-2'>
          <p className='text-2xl font-semibold text-gray-900'>
            {formatMn(totalImpact)}M
          </p>
          <p className='text-xs font-semibold text-gray-700'>
            Items
          </p>
          <ul className='space-y-1'>
            {topItems.map((item, index) => (
              <li key={`${item.bu}-${item.item}-${index}`} className='text-xs'>
                <span className='font-semibold text-gray-900'>{item.bu}</span>
                <span className='text-gray-600'> — {item.item}</span>
                <span className='ml-2 font-semibold text-gray-900'>
                  {formatMn(item.opImpact)}M
                </span>
              </li>
            ))}
          </ul>
          {remainingCount > 0 && (
            <p className='text-[11px] text-gray-500'>
              +{remainingCount} more items
            </p>
          )}
        </div>
      );
    },
    [formatMn, getOpImpactRowsForStage]
  );

  const getInitiativePerformanceUrl = () => {
    if (!selectedGroup || selectedBu === 'all') {
      return null;
    }
    const params = new URLSearchParams();
    params.set('bg', selectedBu);
    const groupId = normalizeGroupId(selectedGroup.group);
    const overallId = `${groupId}-overall`;
    const selectedUnitIds = Array.from(selectedGroupIds).filter(
      (id) => id !== overallId
    );
    if (selectedUnitIds.length > 0) {
      const unitNames = selectedGroup.businessUnits
        .filter((unit) => selectedUnitIds.includes(getUnitId(groupId, unit.name)))
        .map((unit) => unit.name);
      if (unitNames.length > 0) {
        params.set('bu', unitNames.join(','));
      }
    }
    params.set('timeframe', selectedTimeframeScope);
    params.set('months', `${monthRange[0]}-${monthRange[1]}`);
    return `/initiative-performance?${params.toString()}`;
  };

  const renderIdeationTooltip = (stage: BudgetForecastStage) => {
    if (stage.stage !== 'ideation') {
      return null;
    }

    const rows = [
      {
        category: 'Topline / Pricing',
        kpi: 'Contribution margin %',
        baseline: '3%',
        inYear: '4%',
        fullyRamped: '5%',
      },
      {
        category: '',
        kpi: 'Margin on BOM % (cross functional)',
        baseline: '4%',
        inYear: '5%',
        fullyRamped: '6%',
      },
      {
        category: 'Manufacturing',
        kpi: 'UPPH - Direct labor',
        baseline: '1.30',
        inYear: '1.56',
        fullyRamped: '1.95',
      },
      {
        category: '',
        kpi: 'Headcount - Indirect labor',
        baseline: '1250',
        inYear: '1095',
        fullyRamped: '1035',
      },
      {
        category: '',
        kpi: 'OEE2 - Equipment Efficiency',
        baseline: '75%',
        inYear: '82%',
        fullyRamped: '85%',
      },
      {
        category: '',
        kpi: 'Material Yield (%)* - Material consumption efficiency',
        baseline: '123%',
        inYear: '117%',
        fullyRamped: '105%',
      },
      {
        category: '',
        kpi: 'G&A Var. Unit cost',
        baseline: '5.1',
        inYear: '4.2',
        fullyRamped: '3.7',
      },
      {
        category: '',
        kpi: 'G&A Fix (Abs) - G&A Fix cost against budget **',
        baseline: '100',
        inYear: '110',
        fullyRamped: '110',
      },
      {
        category: '',
        kpi: 'FPY',
        baseline: '80%',
        inYear: '91%',
        fullyRamped: '95%',
      },
      {
        category: 'Procurement',
        kpi: 'MP day-1 BOM cost achievement',
        baseline: '92%',
        inYear: '96%',
        fullyRamped: '98%',
      },
      {
        category: '',
        kpi: 'Spending cost reduction (%)',
        baseline: '15%',
        inYear: '18%',
        fullyRamped: '20%',
      },
      {
        category: 'R&D productivity',
        kpi: 'Labor productivity (Mn USD rev. / FTE)',
        baseline: '3.1',
        inYear: '4.2',
        fullyRamped: '5.1',
      },
      {
        category: '',
        kpi: 'Non-labor productivity (Mn USD rev. / Non FTE)',
        baseline: '8.1',
        inYear: '8.5',
        fullyRamped: '9.2',
      },
      {
        category: '',
        kpi: 'R&D intensity (% of revenue)',
        baseline: '9%',
        inYear: '8%',
        fullyRamped: '7%',
      },
      {
        category: '',
        kpi: 'GP per unit R&D spent (Mn USD)',
        baseline: '6.2',
        inYear: '7.1',
        fullyRamped: '7.9',
      },
      {
        category: 'SG&A',
        kpi: '% of revenue',
        baseline: '6%',
        inYear: '5%',
        fullyRamped: '5%',
      },
      {
        category: '',
        kpi: 'GP per unit SG&A spent (Mn USD)',
        baseline: '8.2',
        inYear: '9.1',
        fullyRamped: '10.3',
      },
    ];

    return (
      <div className='max-w-[720px]'>
        <p className='text-2xl font-semibold text-gray-900'>
          {formatMn(stage.delta ?? 0)}M
        </p>
        <p className='text-xs font-semibold text-gray-700 mb-2'>
          In-year improvement targets
        </p>
        <div className='overflow-hidden rounded-md border border-gray-200'>
          <table className='w-full text-xs'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-2 py-2 text-left font-semibold text-gray-700'>
                  Category
                </th>
                <th className='px-2 py-2 text-left font-semibold text-gray-700'>
                  KPI
                </th>
                <th className='px-2 py-2 text-left font-semibold text-gray-700'>
                  Baseline (2025)
                </th>
                <th className='px-2 py-2 text-left font-semibold text-gray-700'>
                  In-year target (2026)
                </th>
                <th className='px-2 py-2 text-left font-semibold text-gray-700'>
                  Fully ramp up target
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.kpi}-${index}`}
                  className='border-b border-gray-200 last:border-b-0'>
                  <td className='px-2 py-2 text-gray-700'>
                    {row.category}
                  </td>
                  <td className='px-2 py-2 text-gray-700'>{row.kpi}</td>
                  <td className='px-2 py-2 text-gray-700'>{row.baseline}</td>
                  <td className='px-2 py-2 text-gray-700'>{row.inYear}</td>
                  <td className='px-2 py-2 text-gray-700'>
                    {row.fullyRamped}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBudgetTooltip = useCallback(
    (stage: BudgetForecastStage) =>
      renderIdeationTooltip(stage) ?? renderOpImpactTooltip(stage),
    [renderIdeationTooltip, renderOpImpactTooltip]
  );

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [financialView, setFinancialView] = useState<'absolute' | 'margin'>(
    'absolute'
  );

  const defaultVersion =
    defaultHomeToggle === 'budget'
      ? 'budget'
      : defaultHomeToggle === 'full-year'
      ? 'forecast'
      : 'actual';
  const normalizeTimeframe = (value?: TimeframeOption | null) =>
    value === 'ytm' || value === 'full-year' ? value : 'ytm';
  const [selectedVersion, setSelectedVersion] = useState<
    'budget' | 'actual' | 'forecast'
  >(isBudgetView ? 'budget' : defaultVersion);
  const [selectedTimeframeScope, setSelectedTimeframeScope] = useState<
    TimeframeOption
  >(() =>
    isBudgetView
      ? 'full-year'
      : normalizeTimeframe(getStoredTimeframe())
  );
  const [monthRange, setMonthRange] = useState<[number, number]>([0, YTM_END_MONTH_INDEX]);
  const [monthAnchor, setMonthAnchor] = useState<number | null>(null);
  const [isMonthRangeCustom, setIsMonthRangeCustom] =
    useState<boolean>(false);
  const hasParsedMonthParamsRef = useRef(false);
  const isActualsView = !isBudgetView && selectedVersion === 'actual';
  const isPercentView = financialView === 'margin';

  const handleTimeframeChange = (timeframe: 'full-year' | 'ytm') => {
    setSelectedTimeframeScope(timeframe);
    setIsMonthRangeCustom(false);
    setMonthAnchor(null);
    if (isActualsView || timeframe === 'ytm') {
      setMonthRange([0, YTM_END_MONTH_INDEX]);
      return;
    }
    setMonthRange(timeframe === 'full-year' ? [0, 11] : [0, YTM_END_MONTH_INDEX]);
  };

  const handleMonthClick = (monthIndex: number) => {
    if (selectedTimeframeScope === 'ytm' && !isActualsView) {
      return;
    }
    if (isActualsView) {
      if (monthIndex > YTM_END_MONTH_INDEX) return;
      if (monthAnchor === null || !isMonthRangeCustom) {
        setMonthAnchor(monthIndex);
        setMonthRange([monthIndex, monthIndex]);
        setIsMonthRangeCustom(true);
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete('months');
            return next;
          },
          { replace: true }
        );
        return;
      }
      const start = Math.min(monthAnchor, monthIndex);
      const end = Math.min(Math.max(monthAnchor, monthIndex), YTM_END_MONTH_INDEX);
      setMonthRange([start, end]);
      setMonthAnchor(null);
      setIsMonthRangeCustom(true);
      return;
    }
    if (monthAnchor === null || !isMonthRangeCustom) {
      setMonthAnchor(monthIndex);
      setMonthRange([monthIndex, monthIndex]);
      setIsMonthRangeCustom(true);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('months');
          return next;
        },
        { replace: true }
      );
      return;
    }
    const start = Math.min(monthAnchor, monthIndex);
    const end = Math.max(monthAnchor, monthIndex);
    setMonthRange([start, end]);
    setMonthAnchor(null);
    setIsMonthRangeCustom(true);
  };

  useEffect(() => {
    const isYtm = selectedTimeframeScope === 'ytm';
    const nextRange: [number, number] =
      isActualsView || isYtm ? [0, YTM_END_MONTH_INDEX] : [0, 11];
    setIsMonthRangeCustom(false);
    setMonthAnchor(null);
    setMonthRange(nextRange);
  }, [selectedTimeframeScope, isActualsView]);

  useEffect(() => {
    if (!isActualsView) {
      return;
    }
    setMonthRange((prev) => {
      if (prev[1] <= YTM_END_MONTH_INDEX) return prev;
      return [Math.max(0, Math.min(prev[0], YTM_END_MONTH_INDEX)), YTM_END_MONTH_INDEX];
    });
  }, [isActualsView]);

  useEffect(() => {
    setStoredTimeframe(selectedTimeframeScope);
  }, [selectedTimeframeScope]);

  useEffect(() => {
    const toggleParam = searchParams.get('toggle');
    const timeframeParam = searchParams.get('timeframe');
    const timeframeValue =
      timeframeParam === 'ytm' || timeframeParam === 'full-year'
        ? timeframeParam
        : toggleParam;
    const versionParam = searchParams.get('version');
    if (versionParam === 'budget' || versionParam === 'actual' || versionParam === 'forecast') {
      setSelectedVersion(isBudgetView ? 'budget' : versionParam);
    } else if (toggleParam === 'budget') {
      setSelectedVersion('budget');
    } else if (timeframeValue === 'full-year') {
      setSelectedVersion(isBudgetView ? 'budget' : 'forecast');
    } else if (timeframeValue === 'ytm') {
      setSelectedVersion(isBudgetView ? 'budget' : 'actual');
    }
    if (timeframeValue === 'ytm' || timeframeValue === 'full-year') {
      setSelectedTimeframeScope(timeframeValue);
    }
  }, [searchParams, isBudgetView]);

  useEffect(() => {
    if (!isBudgetView) {
      setSelectedBu('all');
      setSelectedGroupIds(new Set());
      return;
    }
    const bgParam = searchParams.get('bg');
    const buParam = searchParams.get('bu');

    // If both bg and bu are present, select the BG and mark the BU as selected
    if (bgParam && buParam) {
      const normalizedBg = normalizeGroupId(bgParam);
      const validBu = mainBuOptions.find((bu) => normalizeGroupId(bu.id) === normalizedBg);
      if (validBu) {
        setSelectedBu(validBu.id);
        // Find the business unit and set it as selected
        const group = businessGroups.find((g) => normalizeGroupId(g.group) === normalizedBg);
        if (group) {
          const unit = group.businessUnits.find((u) => u.name === buParam);
          if (unit) {
            const unitId = `${normalizedBg}-${unit.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            setSelectedGroupIds(new Set([unitId]));
          }
        }
      }
      return;
    }

    // Otherwise, just handle bg parameter
    const param = bgParam ?? buParam;
    if (!param) {
      return;
    }
    if (param === 'all') {
      setSelectedBu('all');
      return;
    }
    const normalizedParam = normalizeGroupId(param);
    const validBu = mainBuOptions.find((bu) => normalizeGroupId(bu.id) === normalizedParam);
    if (validBu) {
      setSelectedBu(validBu.id);
    }
  }, [isBudgetView, searchParams, mainBuOptions, businessGroups]);

  useEffect(() => {
    if (hasParsedMonthParamsRef.current) {
      return;
    }
    hasParsedMonthParamsRef.current = true;
    const viewParam = searchParams.get('view');
    if (viewParam === 'absolute' || viewParam === 'margin') {
      setFinancialView(viewParam);
    }
    const monthsParam = searchParams.get('months');
    if (!monthsParam) {
      return;
    }
    const [startRaw, endRaw] = monthsParam.split('-').map(Number);
    if (
      Number.isFinite(startRaw) &&
      Number.isFinite(endRaw) &&
      startRaw >= 0 &&
      endRaw >= startRaw &&
      endRaw < 12
    ) {
      const versionParam = searchParams.get('version');
      let start = startRaw;
      let end = endRaw;
      if (versionParam === 'actual') {
        end = Math.min(end, YTM_END_MONTH_INDEX);
        start = Math.min(start, end);
      }
      setMonthRange([start, end]);
      setIsMonthRangeCustom(true);
      setMonthAnchor(null);
    }
  }, [searchParams]);

  useEffect(() => {
    const nextMonths = (() => {
      let [s, e] = monthRange;
      if (selectedVersion === 'actual') {
        e = Math.min(e, YTM_END_MONTH_INDEX);
        s = Math.min(s, e);
      }
      return `${s}-${e}`;
    })();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        let changed = false;
        if (next.get('version') !== selectedVersion) {
          next.set('version', selectedVersion);
          changed = true;
        }
        if (next.get('timeframe') !== selectedTimeframeScope) {
          next.set('timeframe', selectedTimeframeScope);
          changed = true;
        }
        if (next.get('toggle') !== next.get('timeframe')) {
          next.delete('toggle');
          changed = true;
        }
        if (monthAnchor === null && next.get('months') !== nextMonths) {
          next.set('months', nextMonths);
          changed = true;
        }
        if (next.get('view') !== financialView) {
          next.set('view', financialView);
          changed = true;
        }
        return changed ? next : prev;
      },
      { replace: true }
    );
  }, [
    financialView,
    monthAnchor,
    monthRange,
    selectedTimeframeScope,
    selectedVersion,
    setSearchParams,
  ]);

  const handleBuChange = (buId: string) => {
    setSelectedBu(buId);
    if (buId === 'all') {
      setSelectedGroupIds(new Set());
    }
    setSearchParams(
      (prev) => {
        if (prev.get('bg') === buId) {
          return prev;
        }
        const next = new URLSearchParams(prev);
        next.set('bg', buId);
        next.delete('bu');
        next.delete('units');
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
    alert(`Meeting "${meeting.title}" scheduled successfully!`);
  };

  const handleAddToMeetings = (
    meetingIds: string[],
    materials: MeetingMaterial[]
  ) => {
    // In a real app, this would update meetings via API
    alert(
      `Added ${materials.length} item${materials.length !== 1 ? 's' : ''} to ${
        meetingIds.length
      } meeting${meetingIds.length !== 1 ? 's' : ''}!`
    );
  };

  const tableData = useMemo(() => {
    const valueMode = isBudgetView || selectedVersion === 'budget'
      ? 'budget'
      : selectedVersion === 'forecast'
      ? 'forecast'
      : 'actual';
    // For actual: use month range clamped to YTM so table responds to month selection
    const clampedStart =
      valueMode === 'actual'
        ? Math.max(0, Math.min(monthRange[0], YTM_END_MONTH_INDEX))
        : monthRange[0];
    const clampedEnd =
      valueMode === 'actual'
        ? Math.min(monthRange[1], YTM_END_MONTH_INDEX)
        : monthRange[1];
    const selectedMonthCount = Math.max(0, clampedEnd - clampedStart) + 1;
    const effectiveMonthCount =
      valueMode === 'actual'
        ? selectedMonthCount
        : monthRange[1] - monthRange[0] + 1;
    const monthCount = effectiveMonthCount;
    const fullYearScale = monthCount / 12;
    const ytmScale = monthCount / 2;
    const actualValueScale =
      valueMode === 'actual'
        ? selectedMonthCount / (YTM_END_MONTH_INDEX + 1)
        : undefined;
    const budgetMode =
      selectedTimeframeScope === 'ytm' ? 'ytm' : 'full-year';
    const lastYearMode =
      selectedTimeframeScope === 'ytm' ? 'ytm' : 'full-year';
    if (selectedBu === 'all') {
      const groupRows = businessGroups.map((group) =>
        buildGroupRow(
          group.group,
          group.businessUnits,
          fullYearScale,
          ytmScale,
          valueMode,
          budgetMode,
          lastYearMode,
          undefined,
          undefined,
          actualValueScale
        )
      );
      const overallRow = buildGroupRow(
        'Consolidated Financial',
        businessGroups.flatMap((group) => group.businessUnits),
        fullYearScale,
        ytmScale,
        valueMode,
        budgetMode,
        lastYearMode,
        'overall',
        'Consolidated Financial',
        actualValueScale
      );
      return [...groupRows, overallRow];
    }

    if (!selectedGroup) {
      return [];
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const unitsForTable = isBudgetView
      ? selectedUnits
      : selectedGroup.businessUnits;
    const unitRows = unitsForTable.map((unit) =>
      buildUnitRow(
        groupId,
        unit,
        fullYearScale,
        ytmScale,
        valueMode,
        budgetMode,
        lastYearMode,
        actualValueScale
      )
    );
    const overallRow = buildGroupRow(
      selectedGroup.group,
      unitsForTable,
      fullYearScale,
      ytmScale,
      valueMode,
      budgetMode,
      lastYearMode,
      `${groupId}-overall`,
      `${selectedGroup.group} overall`,
      actualValueScale
    );
    return [...unitRows, overallRow];
  }, [
    businessGroups,
    selectedBu,
    selectedGroup,
    selectedUnits,
    selectedTimeframeScope,
    monthRange,
    selectedVersion,
    isBudgetView,
  ]);

  const budgetWaterfallStages = useMemo(() => {
    if (!isBudgetView) {
      return [];
    }
    const roundToOne = (value: number) => Math.round(value * 10) / 10;
    const monthCount = monthRange[1] - monthRange[0] + 1;
    const monthFactor = Math.min(12, Math.max(1, monthCount)) / 12;
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
      return delta >= 0 ? 'positive' : 'negative';
    };
    type BudgetMetricKey = Exclude<keyof BudgetWaterfallRow, 'bg' | 'bu'>;
    const selectedBudgetRows = (() => {
      if (BUDGET_WATERFALL_DATA.length === 0) {
        return [] as BudgetWaterfallRow[];
      }
      if (selectedBu === 'all') {
        return BUDGET_WATERFALL_DATA;
      }
      const selectedBgName = selectedGroup?.group
        ?? mainBuOptions.find((bu) => bu.id === selectedBu)?.name
        ?? selectedBu;
      const bgRows = BUDGET_WATERFALL_DATA.filter((row) => row.bg === selectedBgName);
      if (!selectedGroup) {
        return bgRows;
      }
      const groupId = normalizeGroupId(selectedGroup.group);
      const overallId = `${groupId}-overall`;
      const selectedUnitIds = Array.from(selectedGroupIds).filter(
        (id) => id !== overallId
      );
      if (selectedUnitIds.length === 0) {
        return bgRows;
      }
      const selectedUnitNames = selectedGroup.businessUnits
        .filter((unit) => selectedUnitIds.includes(getUnitId(groupId, unit.name)))
        .map((unit) => unit.name);
      if (selectedUnitNames.length === 0) {
        return bgRows;
      }
      return bgRows.filter((row) => selectedUnitNames.includes(row.bu));
    })();
    if (selectedBudgetRows.length > 0) {
      const sum = (key: BudgetMetricKey) =>
        roundToOne(
          selectedBudgetRows.reduce(
            (total, row) => total + row[key] * monthFactor,
            0
          )
        );
      const lastYearOpValue = sum('lastYearOp');
      const volumeMixDelta = sum('volumeMix');
      const headwindsDelta = sum('headwinds');
      const oneOffDelta = sum('oneOff');
      const carryOverDelta = sum('carryOver');
      const ideationDelta = sum('ideationTarget');
      const plannedLeakagesDelta = sum('plannedLeakages');
      const budgetTarget = sum('budgetTarget');
      const afterVolumeMix = roundToOne(lastYearOpValue + volumeMixDelta);
      const afterHeadwinds = roundToOne(afterVolumeMix + headwindsDelta);
      const afterOneOff = roundToOne(afterHeadwinds + oneOffDelta);
      const preImprovementOp = roundToOne(afterOneOff);
      const afterCarryOver = roundToOne(preImprovementOp + carryOverDelta);
      const afterIdeation = roundToOne(afterCarryOver + ideationDelta);

      return [
        makeStage(
          'budget',
          '2025 OP',
          roundToOne(lastYearOpValue),
          roundToOne(lastYearOpValue),
          'baseline'
        ),
        makeStage(
          'confirmed-volume-mix',
          'Confirmed volume/mix change',
          afterVolumeMix,
          roundToOne(volumeMixDelta),
          getBudgetStageType('confirmed-volume-mix', volumeMixDelta, 'positive')
        ),
        makeStage(
          'market-performance',
          'Planned headwind / tailwind',
          afterHeadwinds,
          roundToOne(headwindsDelta),
          getBudgetStageType('market-performance', headwindsDelta, 'positive')
        ),
        makeStage(
          'one-off-adjustments',
          'Known one-off items',
          afterOneOff,
          roundToOne(oneOffDelta),
          getBudgetStageType('one-off-adjustments', oneOffDelta, 'positive')
        ),
        makeStage(
          'l4-to-l5-leakage',
          'Pre improvement OP',
          preImprovementOp,
          preImprovementOp,
          'baseline'
        ),
        makeStage(
          'carry-over-improvements',
          'Carry-over improvements',
          afterCarryOver,
          roundToOne(carryOverDelta),
          getBudgetStageType('carry-over-improvements', carryOverDelta, 'positive')
        ),
        makeStage(
          'ideation',
          'In-Year improvement target',
          afterIdeation,
          roundToOne(ideationDelta),
          getBudgetStageType('ideation', ideationDelta, 'positive')
        ),
        makeStage(
          'planned-leakages',
          'Planned leakages',
          budgetTarget,
          roundToOne(plannedLeakagesDelta),
          getBudgetStageType('planned-leakages', plannedLeakagesDelta, 'positive')
        ),
        makeStage(
          'actuals',
          '2026 OP target (Budget)',
          roundToOne(budgetTarget),
          roundToOne(budgetTarget),
          'baseline'
        ),
      ];
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

    const budgetGap = budgetOpValue - lastYearOpValue;
    const epsilon = Math.max(0.05, Math.abs(budgetGap) * 0.01);
    const ensureNonZero = (value: number, fallbackSign = 1) => {
      if (value !== 0) return value;
      return epsilon * (fallbackSign >= 0 ? 1 : -1);
    };
    const volumeMixDelta = ensureNonZero(roundToOne(opImpactTotals.volumeMix), 1);
    const headwindsDelta = ensureNonZero(roundToOne(opImpactTotals.headwinds), -1);
    const oneOffDelta = ensureNonZero(roundToOne(opImpactTotals.oneOff), 1);
    let plannedLeakagesDelta = ensureNonZero(
      roundToOne(opImpactTotals.leakages),
      -1
    );
    const ideationTotal = (selectedUnits.length > 0
      ? selectedUnits
      : businessGroups.flatMap((group) => group.businessUnits)
    ).reduce((sum, unit) => sum + unit.ideationTarget, 0);
    const ideationDelta = ensureNonZero(roundToOne(toMillions(ideationTotal)), 1);

    const afterVolumeMix = roundToOne(lastYearOpValue + volumeMixDelta);
    const afterHeadwinds = roundToOne(afterVolumeMix + headwindsDelta);
    const afterOneOff = roundToOne(afterHeadwinds + oneOffDelta);
    const preImprovementOp = afterOneOff;

    let carryOverDelta = roundToOne(
      budgetOpValue - preImprovementOp - plannedLeakagesDelta - ideationDelta
    );
    if (carryOverDelta === 0) {
      const carrySign = budgetOpValue >= preImprovementOp ? 1 : -1;
      carryOverDelta = ensureNonZero(0, carrySign);
      plannedLeakagesDelta = roundToOne(
        plannedLeakagesDelta - carryOverDelta + (carrySign * 0)
      );
      if (plannedLeakagesDelta === 0) {
        plannedLeakagesDelta = ensureNonZero(0, -1);
        carryOverDelta = roundToOne(
          budgetOpValue - preImprovementOp - plannedLeakagesDelta - ideationDelta
        );
      }
    }
    const afterCarryOver = roundToOne(preImprovementOp + carryOverDelta);
    const afterIdeation = roundToOne(afterCarryOver + ideationDelta);
    const budgetTarget = roundToOne(
      preImprovementOp + carryOverDelta + ideationDelta + plannedLeakagesDelta
    );

    return [
      makeStage(
        'budget',
        '2025 OP',
        roundToOne(lastYearOpValue),
        roundToOne(lastYearOpValue),
        'baseline'
      ),
      makeStage(
        'confirmed-volume-mix',
        'Confirmed volume/mix change',
        afterVolumeMix,
        roundToOne(volumeMixDelta),
        getBudgetStageType('confirmed-volume-mix', volumeMixDelta, 'positive')
      ),
      makeStage(
        'market-performance',
        'Planned headwind / tailwind',
        afterHeadwinds,
        roundToOne(headwindsDelta),
        getBudgetStageType('market-performance', headwindsDelta, 'positive')
      ),
      makeStage(
        'one-off-adjustments',
        'Known one-off items',
        afterOneOff,
        roundToOne(oneOffDelta),
        getBudgetStageType('one-off-adjustments', oneOffDelta, 'positive')
      ),
      makeStage(
        'l4-to-l5-leakage',
        'Pre improvement OP',
        preImprovementOp,
        preImprovementOp,
        'baseline'
      ),
      makeStage(
        'carry-over-improvements',
        'Carry-over improvements',
        afterCarryOver,
        roundToOne(carryOverDelta),
        getBudgetStageType('carry-over-improvements', carryOverDelta, 'positive')
      ),
      makeStage(
        'ideation',
        'In-Year improvement target',
        afterIdeation,
        roundToOne(ideationDelta),
        getBudgetStageType('ideation', ideationDelta, 'positive')
      ),
      makeStage(
        'planned-leakages',
        'Planned leakages',
        budgetTarget,
        roundToOne(plannedLeakagesDelta),
        getBudgetStageType('planned-leakages', plannedLeakagesDelta, 'positive')
      ),
      makeStage(
        'actuals',
        '2026 OP target (Budget)',
        roundToOne(budgetTarget),
        roundToOne(budgetTarget),
        'baseline'
      ),
    ];
  }, [businessGroups, isBudgetView, opImpactTotals, tableData, selectedBu, monthRange]);

  const keyCallOut = useMemo(() => {
    if (!isBudgetView) {
      return null;
    }
    if (isDeGroupSelected) {
      const callouts = KEY_CALLOUTS_BY_BG.PCBG?.['AEBU1'];
      if (callouts?.budget?.length) {
        return {
          bulletPoints: callouts.budget,
          rootCauseAnalysis: '',
        };
      }
    }
    const overallRow =
      tableData.find(
        (row) => row.id === 'overall' || row.id.endsWith('-overall')
      ) ?? tableData[tableData.length - 1];
    if (!overallRow) {
      return null;
    }
    const lastYearOpValue = overallRow.op.stly;
    const budgetOpValue = overallRow.op.value;
    const delta = budgetOpValue - lastYearOpValue;
    const deltaSign = delta >= 0 ? '+' : '-';
    const percent =
      lastYearOpValue === 0 ? 0 : (delta / Math.abs(lastYearOpValue)) * 100;
    const percentSign = percent >= 0 ? '+' : '-';
    const magnitude = Math.abs(percent);
    const intensity =
      magnitude >= 7.5 ? 'material' : magnitude >= 3 ? 'moderate' : 'slight';
    const formatSigned = (value: number) =>
      `${value >= 0 ? '+' : '-'}${formatMn(Math.abs(value))}`;
    const ideationTotal = selectedImpactUnits.reduce(
      (sum, unit) => sum + unit.ideationTarget,
      0
    );
    const ideationMn = toMillions(ideationTotal);

    return {
      bulletPoints: [
        `Budget OP is ${formatMn(budgetOpValue)} Mn ${currencyLabel} vs last year ${formatMn(
          lastYearOpValue
        )} Mn ${currencyLabel} (${percentSign}${magnitude.toFixed(1)}%).`,
        `Volume/mix ${formatSigned(opImpactTotals.volumeMix)} Mn and headwinds/tailwinds ${formatSigned(
          opImpactTotals.headwinds
        )} Mn drive the core movement.`,
        `One-off items ${formatSigned(opImpactTotals.oneOff)} Mn, planned leakages ${formatSigned(
          opImpactTotals.leakages
        )} Mn, and ideation target ${formatSigned(ideationMn)} Mn shape the budget bridge.`,
      ],
      rootCauseAnalysis: `Budget OP shows a ${intensity} ${delta >= 0 ? 'increase' : 'decrease'} versus last year (${deltaSign}${formatMn(
        Math.abs(delta)
      )} Mn ${currencyLabel}). The budget bridge is led by volume/mix and headwinds, with one-offs, planned leakages, and ideation targets explaining the remainder.`,
    };
  }, [
    isBudgetView,
    tableData,
    opImpactTotals,
    selectedImpactUnits,
    currencyLabel,
    formatMn,
    isDeGroupSelected,
  ]);

  const budgetMarginSummary = useMemo(() => {
    if (!isBudgetView) {
      return null;
    }
    const overallRow =
      tableData.find(
        (row) => row.id === 'overall' || row.id.endsWith('-overall')
      ) ?? tableData[tableData.length - 1];
    if (!overallRow) {
      return null;
    }
    const calcPercent = (numerator: number, denominator: number) =>
      denominator === 0 ? 0 : (numerator / denominator) * 100;
    return {
      revenue: {
        lastYear: overallRow.rev.stly,
        budget: overallRow.rev.value,
      },
      lastYear: {
        gp: calcPercent(overallRow.gp.stly, overallRow.rev.stly),
        op: calcPercent(overallRow.op.stly, overallRow.rev.stly),
      },
      budget: {
        gp: calcPercent(overallRow.gp.value, overallRow.rev.value),
        op: calcPercent(overallRow.op.value, overallRow.rev.value),
      },
    };
  }, [isBudgetView, tableData]);

  const activeBudgetDetails = useMemo(() => {
    if (!activeBudgetStage) {
      return null;
    }
    if (activeBudgetStage.stage === 'ideation') {
      return {
        type: 'ideation' as const,
        totalImpact: activeBudgetStage.delta ?? 0,
        rows: functionTargetRows ?? [],
      };
    }
    if (
      activeBudgetStage.stage !== 'one-off-adjustments' &&
      activeBudgetStage.stage !== 'market-performance'
    ) {
      return null;
    }
    const rows = getOpImpactRowsForStage(activeBudgetStage);
    const normalizedSearch = impactSearch.trim().toLowerCase();
    const filteredRows = rows.filter((row) => {
      if (
        impactRationaleFilter !== 'all' &&
        row.costRationale !== impactRationaleFilter
      ) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }
      return (
        row.bu.toLowerCase().includes(normalizedSearch) ||
        row.item.toLowerCase().includes(normalizedSearch) ||
        row.lineItem.toLowerCase().includes(normalizedSearch)
      );
    });

    const sortedRows = [...filteredRows].sort(
      (a, b) => Math.abs(b.opImpact) - Math.abs(a.opImpact)
    );

    return {
      type: 'op-impact' as const,
      totalImpact: rows.reduce((sum, row) => sum + row.opImpact, 0),
      rows: sortedRows,
    };
  }, [
    activeBudgetStage,
    getOpImpactRowsForStage,
    functionTargetRows,
    impactRationaleFilter,
    impactSearch,
  ]);

  const getExpandedSubGroups = (bgId: string) => {
    const valueMode = isBudgetView || selectedVersion === 'budget'
      ? 'budget'
      : selectedVersion === 'forecast'
      ? 'forecast'
      : 'actual';
    const clampedStart =
      valueMode === 'actual'
        ? Math.max(0, Math.min(monthRange[0], YTM_END_MONTH_INDEX))
        : monthRange[0];
    const clampedEnd =
      valueMode === 'actual'
        ? Math.min(monthRange[1], YTM_END_MONTH_INDEX)
        : monthRange[1];
    const selectedMonthCount = Math.max(0, clampedEnd - clampedStart) + 1;
    const effectiveMonthCount =
      valueMode === 'actual'
        ? selectedMonthCount
        : monthRange[1] - monthRange[0] + 1;
    const monthCount = effectiveMonthCount;
    const fullYearScale = monthCount / 12;
    const ytmScale = monthCount / 2;
    const actualValueScale =
      valueMode === 'actual'
        ? selectedMonthCount / (YTM_END_MONTH_INDEX + 1)
        : undefined;
    const budgetMode =
      selectedTimeframeScope === 'ytm' ? 'ytm' : 'full-year';
    const lastYearMode =
      selectedTimeframeScope === 'ytm' ? 'ytm' : 'full-year';
    const selectedGroup = businessGroups.find(
      (group) => normalizeGroupId(group.group) === bgId
    );
    if (!selectedGroup) {
      return [];
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    return selectedGroup.businessUnits.map((unit) =>
      buildUnitRow(
        groupId,
        unit,
        fullYearScale,
        ytmScale,
        valueMode,
        budgetMode,
        lastYearMode,
        actualValueScale
      )
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
    isNavigable?: boolean,
    isSubGroup?: boolean,
    parentBgId?: string,
    revenueMetric?: BusinessGroupMetricWithTrend,
    forceAbsoluteView: boolean = false
  ) => {
    const isBudgetMode = isBudgetView || selectedVersion === 'budget';
    const handleCellClick = (e: React.MouseEvent) => {
      if (isNavigable && groupId) {
        e.stopPropagation(); // Prevent row expansion from triggering
        if (isBudgetView) {
          if (selectedBu !== 'all') {
            navigate(
              buildBgPerformanceUrl({
                bg: selectedBu,
                bu: isSubGroup ? groupName : undefined,
                selected: undefined,
              })
            );
            return;
          }
          handleBuChange(groupId === 'overall' ? 'all' : groupId);
          return;
        }
        if (selectedVersion === 'budget') {
          const params = new URLSearchParams();
          const bgParam = isSubGroup && parentBgId ? parentBgId : groupId;
          params.set('bg', bgParam);
          if (isSubGroup && parentBgId) {
            params.set('bu', groupName);
          }
          navigate(`/budget?${params.toString()}`);
          return;
        }
        if (selectedVersion === 'forecast') {
          const params = new URLSearchParams();
          const bgParam = isSubGroup && parentBgId ? parentBgId : groupId;
          params.set('bg', bgParam);
          params.set('timeframe', selectedTimeframeScope);
          if (isSubGroup && parentBgId) {
            params.set('bu', groupName);
          }
          navigate(`/market-intelligence?${params.toString()}`);
          return;
        }
        // Navigate to business group performance with the BG and BU selected
        // For sub-rows (expanded BUs under a BG), use the parent BG and select this BU
        if (isSubGroup && parentBgId) {
          navigate(
            buildBgPerformanceUrl({
              bg: parentBgId,
              selected: groupId,
            })
          );
          return;
        }
        // When a specific BG is already selected on home page, pass both BG and BU selection
        if (selectedBu !== 'all' && groupId !== 'overall' && !groupId?.endsWith('-overall')) {
          // Clicking on a BU row when a BG is selected - pass both bg and selected params
          navigate(
            buildBgPerformanceUrl({
              bg: selectedBu,
              selected: groupId,
            })
          );
          return;
        }
        const bgParam = groupId !== 'overall' ? groupId : 'all';
        navigate(
          buildBgPerformanceUrl({
            bg: bgParam,
            selected: undefined,
          })
        );
      }
    };
    const displayValue = metric.value;
    const displayRevenue = revenueMetric?.value ?? 0;
    const baselineRevenue = revenueMetric?.baseline ?? 0;
    const lastYearRevenue = revenueMetric?.stly ?? 0;
    const calcMargin = (value: number, revenue: number) =>
      revenue === 0 ? 0 : (value / revenue) * 100;
    const displayMargin =
      calcMargin(displayValue, displayRevenue);
    const baselineMargin =
      calcMargin(metric.baseline, baselineRevenue);
    const lastYearMargin =
      calcMargin(metric.stly, lastYearRevenue);
    const usePercentView = isPercentView && !forceAbsoluteView;
    const budgetPercent = usePercentView
      ? displayMargin - baselineMargin  // Percentage point delta
      : calcPercent(metric.value, metric.baseline);
    const lastYearPercent = usePercentView
      ? displayMargin - lastYearMargin  // Percentage point delta
      : calcPercent(metric.value, metric.stly);
    const primaryPercent = isBudgetMode ? lastYearPercent : budgetPercent;
    const formatCellValue = (value: number) =>
      usePercentView ? `${value.toFixed(1)}%` : formatMnWhole(value);
    const comparisonValue = usePercentView ? displayMargin : displayValue;
    const comparisonBaseline = usePercentView ? baselineMargin : metric.baseline;
    const comparisonLastYear = usePercentView ? lastYearMargin : metric.stly;
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
    const deltaUnit = usePercentView ? ' p.p.' : '%';

    // Calculate trend line for sparkline
    const trendValues =
      usePercentView && revenueMetric
        ? metric.trend.map((t, index) => {
            const revenueValue = revenueMetric.trend[index]?.value ?? 0;
            return calcMargin(t.value, revenueValue);
          })
        : metric.trend.map((t) => t.value);
    const minVal = Math.min(...trendValues);
    const maxVal = Math.max(...trendValues);
    const range = maxVal - minVal || 1;

    // Generate SVG path for trend line
    const pathPoints = trendValues
      .map((value, i) => {
        const x = (i / (metric.trend.length - 1)) * 180;
        const y = 40 - ((value - minVal) / range) * 35;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const trendColor =
      primaryPercent > 0
        ? '#22c55e'
        : primaryPercent < 0
        ? '#ef4444'
        : '#6b7280';

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
              {formatCellValue(comparisonValue)}
            </div>
          </div>
          <div className='text-center'>
            {!isBudgetMode && (
            <div className='text-xs text-gray-500 mb-0.5 flex flex-col items-center'>
                <span>vs budget</span>
                <span>{formatCellValue(comparisonBaseline)}</span>
            </div>
            )}
          <div className='text-xs text-gray-500 flex flex-col items-center'>
              <span>vs Last Year</span>
              <span>{formatCellValue(comparisonLastYear)}</span>
          </div>
          </div>
          <div className='flex flex-col gap-0.5'>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${percentColor}`}>
              {percentSign}
              {primaryPercent.toFixed(1)}{deltaUnit}
            </span>
            {!isBudgetMode && (
            <span
                className={`px-1.5 py-0.5 rounded text-xs font-semibold ${lastYearPercentColor}`}>
                {lastYearPercentSign}
                {lastYearPercent.toFixed(1)}{deltaUnit}
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
                {primaryPercent.toFixed(1)}{deltaUnit}
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
    isOverallRow: boolean = false,
    parentBgId?: string
  ) => {
    const isExpanded = expandedRows.has(group.id);
    const shouldExpandOnClick = isExpandable && !isSubGroup && !isOverallRow;
    // Disable navigation when the row should expand in-place.
    const isMetricNavigable = !shouldExpandOnClick;
    const isRowClickable = shouldExpandOnClick || isMetricNavigable;
    const isRowSelected =
      Boolean(showBuSelection) && selectedGroupIds.has(group.id);

    const handleRowClick = () => {
      if (isBudgetView) {
        if (isSubGroup && parentBgId) {
          setSelectedBu(parentBgId);
          setSelectedGroupIds(
            new Set([getUnitId(parentBgId, group.name)])
          );
          return;
        }
        if (showBuSelection) {
          toggleBuSelection(isOverallRow ? 'all' : group.id);
          return;
        }
        if (shouldExpandOnClick) {
          toggleRowExpansion(group.id);
        }
        return;
      }
      if (shouldExpandOnClick) {
        toggleRowExpansion(group.id);
        return;
      }
      if (isMetricNavigable) {
        const buId = isOverallRow ? 'all' : group.id;
        if (isBudgetView) {
          if (selectedBu !== 'all') {
            navigate(
              buildBgPerformanceUrl({
                bg: selectedBu,
                bu: isSubGroup ? group.name : undefined,
                selected: undefined,
              })
            );
            return;
          }
          handleBuChange(buId);
          return;
        }
        if (selectedVersion === 'budget') {
          const params = new URLSearchParams();
          const bgParam = isSubGroup && parentBgId ? parentBgId : buId;
          params.set('bg', bgParam);
          if (isSubGroup && parentBgId) {
            params.set('bu', group.name);
          }
          navigate(`/budget?${params.toString()}`);
          return;
        }
        if (selectedVersion === 'forecast') {
          const params = new URLSearchParams();
          const bgParam = isSubGroup && parentBgId ? parentBgId : buId;
          params.set('bg', bgParam);
          params.set('timeframe', selectedTimeframeScope);
          if (isSubGroup && parentBgId) {
            params.set('bu', group.name);
          }
          navigate(`/market-intelligence?${params.toString()}`);
          return;
        }
        // Navigate to business group performance with the BG and BU selected
        // For sub-rows (expanded BUs under a BG), use the parent BG and select this BU
        if (isSubGroup && parentBgId) {
          navigate(
            buildBgPerformanceUrl({
              bg: parentBgId,
              selected: group.id,
            })
          );
          return;
        }
        // When a specific BG is already selected on home page, pass both BG and BU selection
        if (selectedBu !== 'all' && !isOverallRow) {
          // Clicking on a BU row when a BG is selected - pass both bg and selected params
          navigate(
            buildBgPerformanceUrl({
              bg: selectedBu,
              selected: group.id,
            })
          );
          return;
        }
        const bgParam = buId !== 'all' ? buId : 'all';
        navigate(
          buildBgPerformanceUrl({
            bg: bgParam,
            selected: undefined,
          })
        );
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
        } ${isRowClickable ? 'cursor-pointer' : ''} ${
          isRowSelected ? 'bg-primary-100/60' : ''
        }`}
        onClick={isRowClickable ? handleRowClick : undefined}
        >
        <td className={`px-6 py-3 border-b border-r border-gray-200 ${isRowClickable ? 'cursor-pointer' : ''}`}>
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
          isMetricNavigable,
          isSubGroup,
          parentBgId,
          undefined,
          true
        )}
        {renderMetricCell(
          group.gp,
          group.name,
          isPercentView ? 'Gross Profit Margin' : 'Gross Profit',
          false,
          group.id,
          isMetricNavigable,
          isSubGroup,
          parentBgId,
          group.rev
        )}
        {renderMetricCell(
          group.op,
          group.name,
          isPercentView ? 'Operating Profit Margin' : 'Operating Profit',
          false,
          group.id,
          isMetricNavigable,
          isSubGroup,
          parentBgId,
          group.rev
        )}
        {renderMetricCell(
          group.np,
          group.name,
          isPercentView ? 'Net Profit Margin' : 'Net Profit',
          true,
          group.id,
          isMetricNavigable,
          isSubGroup,
          parentBgId,
          group.rev
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
              isBudgetView ? (
                <div className='flex flex-col gap-3'>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium text-gray-600 w-32'>
                      Version
                    </span>
                    <div className='flex bg-gray-100 rounded-lg p-1'>
                      <button
                        onClick={() => setSelectedVersion('budget')}
                        className='px-4 py-2 text-sm font-medium rounded-md transition-colors bg-white text-gray-900 shadow-sm'>
                        Budget
                      </button>
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium text-gray-600 w-32'>
                      Timeframe <span className='text-gray-400'>(2026)</span>
                    </span>
                    <div className='flex bg-gray-100 rounded-lg p-1'>
                      {(
                        [
                          { id: 'full-year', label: 'Full year' },
                          { id: 'ytm', label: 'Year to Month' },
                        ] as const
                      ).map((option) => {
                        const isSelected = selectedTimeframeScope === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleTimeframeChange(option.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                              isSelected
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}>
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium text-gray-600 w-32'>
                      Months <span className='text-gray-400'>(2026)</span>
                    </span>
                    <div className='flex flex-wrap gap-1'>
                      {MONTHS.map((month, index) => {
                        const [start, end] = monthRange;
                        const isSelected = index >= start && index <= end;
                        const isDisabled =
                          isActualsView
                            ? index > YTM_END_MONTH_INDEX
                            : selectedTimeframeScope === 'ytm';
                        return (
                          <button
                            key={month}
                            title={isActualsView && index > YTM_END_MONTH_INDEX ? 'Future month; no actuals yet.' : undefined}
                            onClick={() => handleMonthClick(index)}
                            disabled={isDisabled}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                              isSelected
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                            } ${
                              isDisabled
                                ? 'cursor-not-allowed opacity-50 hover:text-gray-600'
                                : ''
                            }`}>
                            {month}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {isMonthRangeCustom && (
                    <button
                      onClick={() =>
                        handleTimeframeChange(
                          selectedTimeframeScope as 'full-year' | 'ytm'
                        )
                      }
                      className='text-xs text-gray-500 hover:text-gray-700 underline'>
                      Reset timeframe
                    </button>
                  )}
                  <p className='text-sm text-gray-500'>
                    Showing:{' '}
                    {selectedVersion === 'budget' ? 'Budget' : selectedVersion === 'actual' ? 'Actual' : 'Forecast'}{' '}
                    {selectedTimeframeScope === 'ytm'
                      ? `YTM (${MONTHS[0]}–${MONTHS[YTM_END_MONTH_INDEX]})`
                      : isActualsView
                      ? `Full year (YTM)`
                      : isMonthRangeCustom
                      ? `${MONTHS[monthRange[0]]}–${MONTHS[monthRange[1]]} 2026`
                      : 'Full year'}
                  </p>
                </div>
              ) : (
                <div className='flex flex-col gap-3'>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium text-gray-600 w-32'>
                      Version
                    </span>
                    <div className='flex bg-gray-100 rounded-lg p-1'>
                      {(
                        [
                          { id: 'budget', label: 'Budget' },
                          { id: 'actual', label: 'Actuals' },
                          { id: 'forecast', label: 'Forecast' },
                        ] as const
                      ).map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedVersion(option.id)}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            selectedVersion === option.id
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium text-gray-600 w-32'>
                      Timeframe <span className='text-gray-400'>(2026)</span>
                    </span>
                    <div
                      className={`flex bg-gray-100 rounded-lg p-1`}>
                      {(
                        [
                          { id: 'full-year', label: 'Full year' },
                          { id: 'ytm', label: 'Year to Month' },
                        ] as const
                      ).map((option) => {
                        const isSelected = selectedTimeframeScope === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleTimeframeChange(option.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                              isSelected
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}>
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <span className='text-sm font-medium text-gray-600 w-32'>
                      Months <span className='text-gray-400'>(2026)</span>
                    </span>
                    <div className='flex flex-wrap gap-1'>
                      {MONTHS.map((month, index) => {
                        const [start, end] = monthRange;
                        const isSelected = index >= start && index <= end;
                        const isDisabled =
                          isActualsView
                            ? index > YTM_END_MONTH_INDEX
                            : selectedTimeframeScope === 'ytm';
                        return (
                          <button
                            key={month}
                            title={isActualsView && index > YTM_END_MONTH_INDEX ? 'Future month; no actuals yet.' : undefined}
                            onClick={() => handleMonthClick(index)}
                            disabled={isDisabled}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                              isSelected
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                            } ${
                              isDisabled
                                ? 'cursor-not-allowed opacity-50 hover:text-gray-600'
                                : ''
                            }`}>
                            {month}
                          </button>
                        );
                      })}
                    </div>
                    {isMonthRangeCustom && (
                      <button
                        onClick={() =>
                          handleTimeframeChange(
                            selectedTimeframeScope as 'full-year' | 'ytm'
                          )
                        }
                        className='text-xs text-gray-500 hover:text-gray-700 underline'>
                        Reset timeframe
                      </button>
                    )}
                  </div>
                  <p className='text-sm text-gray-500'>
                    Showing:{' '}
                    {selectedVersion === 'budget' ? 'Budget' : selectedVersion === 'actual' ? 'Actual' : 'Forecast'}{' '}
                    {selectedTimeframeScope === 'ytm'
                      ? `YTM (${MONTHS[0]}–${MONTHS[YTM_END_MONTH_INDEX]})`
                      : isActualsView
                      ? `Full year (YTM)`
                      : isMonthRangeCustom
                      ? `${MONTHS[monthRange[0]]}–${MONTHS[monthRange[1]]} 2026`
                      : 'Full year'}
                  </p>
                </div>
              )
            }
            buOptions={mainBuOptions}
            selectedBu={selectedBu}
            onBuChange={handleBuChange}
            showBu={isBudgetView}
          />
        </div>
        {isBudgetView && selectedBu !== 'all' && selectedGroup && (
          <div className='mb-6 flex items-center gap-4'>
            <span className='text-sm font-medium text-gray-600 w-32'>
              Select BU
            </span>
            <div className='flex flex-wrap bg-gray-100 rounded-lg p-1'>
              {(() => {
                const groupId = normalizeGroupId(selectedGroup.group);
                const overallId = `${groupId}-overall`;
                const isAllSelected = selectedGroupIds.has(overallId);
                const toggleUnit = toggleBuSelection;

                return (
                  <>
                    <button
                      onClick={() => toggleUnit('all')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        isAllSelected
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}>
                      All BUs
                    </button>
                    {selectedGroup.businessUnits.map((unit) => {
                      const unitId = getUnitId(groupId, unit.name);
                      const isSelected =
                        !isAllSelected && selectedGroupIds.has(unitId);
                      return (
                        <button
                          key={unitId}
                          onClick={() => toggleUnit(unitId)}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            isSelected
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}>
                          {unit.name}
                        </button>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {isBudgetView && keyCallOut && (
          <div className='mb-6'>
            <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-2xl font-bold text-gray-900'>Key Call Out</h2>
                <span className='px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border-2 border-purple-400 shadow-md shadow-purple-200/50 flex items-center gap-1.5'>
                  <span className='text-sm'>✨</span>
                  <span>AI</span>
                </span>
              </div>
              <div className='space-y-3'>
                <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
                  {keyCallOut.bulletPoints.map((point, index) => {
                    const trimmed = point.trim();
                    const isSubBullet = trimmed.startsWith('• ');
                    return (
                      <li
                        key={index}
                        className={`text-sm ${
                          isSubBullet ? 'ml-5 list-circle' : ''
                        }`}>
                        {isSubBullet ? trimmed.slice(2) : point}
                      </li>
                    );
                  })}
                </ul>
                {keyCallOut.rootCauseAnalysis && (
                  <div className='mt-4 pt-4 border-t border-gray-200'>
                    <p className='text-sm text-gray-700 leading-relaxed'>
                      {keyCallOut.rootCauseAnalysis}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                {isBudgetView
                  ? 'Budget by Business Group'
                  : 'Business Group Performance'}
              </h2>
                <p className='text-sm text-gray-600 mt-1'>
                  {isPercentView ? '% of revenue' : `Mn, ${currencyLabel}`}
                </p>
            </div>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-600'>View:</span>
                <span
                  className={`text-sm ${
                    !isPercentView
                      ? 'font-semibold text-gray-900'
                      : 'text-gray-500'
                  }`}>
                  Absolute
                </span>
                <button
                  onClick={() =>
                    setFinancialView(isPercentView ? 'absolute' : 'margin')
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    isPercentView ? 'bg-primary-600' : 'bg-gray-200'
                  }`}>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPercentView ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span
                  className={`text-sm ${
                    isPercentView
                      ? 'font-semibold text-gray-900'
                      : 'text-gray-500'
                  }`}>
                  % of revenue
                </span>
              </div>
              <Link
                to={buildBgPerformanceUrl({ bg: 'all', selected: undefined, bu: undefined })}
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
                      {isPercentView ? 'Gross Profit Margin' : 'Gross Profit'}
                    </span>
                  </th>
                  <th className='text-center px-4 py-3 border-b border-r border-gray-200'>
                    <span className='text-sm font-bold text-gray-900'>
                      {isPercentView
                        ? 'Operating Profit Margin'
                        : 'Operating Profit'}
                    </span>
                  </th>
                  <th className='text-center px-4 py-3 border-b border-gray-200'>
                    <span className='text-sm font-bold text-gray-900'>
                      {isPercentView ? 'Net Profit Margin' : 'Net Profit'}
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
                          renderTableRow(subGroup, false, true, false, group.id)
                        )}
                      </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
            {isBudgetView && budgetWaterfallStages.length > 0 && (
              <div className='mt-6'>
                <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
                  <BudgetPerformanceWaterfall
                    stages={budgetWaterfallStages}
                    title='Budget waterfall by value drivers'
                    subtitle={`Mn ${currencyLabel} • ${selectedBuLabel}`}
                    onStageClick={(stage) => {
                      if (
                        stage.stage === 'one-off-adjustments' ||
                        stage.stage === 'market-performance' ||
                        stage.stage === 'ideation'
                      ) {
                        setActiveBudgetStage(stage);
                      }
                    }}
                    onStageDoubleClick={(stage) => {
                      if (stage.stage === 'ideation') {
                        const url = getInitiativePerformanceUrl();
                        if (url) {
                          navigate(url);
                        }
                      }
                    }}
                    tooltipContent={renderBudgetTooltip}
                  />
                  {budgetMarginSummary && (
                    <div className='mt-6 w-full rounded-lg border border-gray-200 bg-gray-50 px-6 py-4'>
                      <div className='flex w-full flex-col gap-4 sm:items-center sm:justify-between'>
                        <div className='flex w-full items-center justify-between gap-6 text-gray-700'>
                          <div className='flex flex-col'>
                            <span>last year actual Revenue</span>
                            <span className='text-3xl  font-semibold'>
                              {formatAmount(budgetMarginSummary.revenue.lastYear, {
                                maximumFractionDigits: 0,
                                minimumFractionDigits: 0,
                              })}{' '}
                              Mn {currencyLabel}
                            </span>
                          </div>
                          <div className='flex flex-col items-end'>
                            <span>current year budget Revenue</span>
                            <span className='text-3xl  font-semibold'>
                              {formatAmount(budgetMarginSummary.revenue.budget, {
                                maximumFractionDigits: 0,
                                minimumFractionDigits: 0,
                              })}{' '}
                              Mn {currencyLabel}
                            </span>
                          </div>
                        </div>
                        <div className='flex w-full items-center justify-between gap-6 text-gray-700'>
                          <div className='flex flex-col'>
                            <span>last year actual GP</span>
                            <span className='text-3xl  font-semibold'>
                              {budgetMarginSummary.lastYear.gp.toFixed(1)}%
                            </span>
                          </div>
                          <div className='flex flex-col items-end'>
                            <span>current year budget GP</span>
                            <span className='text-3xl  font-semibold'>
                              {budgetMarginSummary.budget.gp.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className='flex w-full items-center justify-between gap-6 text-gray-700'>
                          <div className='flex flex-col'>
                            <span>last year actual OP</span>
                            <span className='text-3xl  font-semibold'>
                              {budgetMarginSummary.lastYear.op.toFixed(1)}%
                            </span>
                          </div>
                          <div className='flex flex-col items-end'>
                            <span>current year budget OP</span>
                            <span className='text-3xl font-semibold'>
                              {budgetMarginSummary.budget.op.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {isBudgetView && selectedBu !== 'all' && selectedGroup && (
              <div className='mt-6'>
                <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 overflow-hidden'>
                  <div className='px-6 py-5 border-b border-gray-200'>
                    <div>
                      <p className='text-xs uppercase tracking-widest text-gray-400 font-semibold'>
                        BU P&amp;L breakdown
                      </p>
                      <h3 className='text-xl font-bold text-gray-900'>
                        {pnlTitle}
                      </h3>
                      <p className='text-sm text-gray-500 mt-1'>
                        Mn {currencyLabel}
                      </p>
                    </div>
                  </div>
                  <div className='max-h-[70vh] overflow-auto'>
                    <table className='w-full text-sm'>
                      <thead className='bg-gray-50 border-b border-gray-200'>
                        <tr>
                          <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                            {showPnlUnitColumn ? 'BU' : ''}
                          </th>
                          <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                            Line item
                          </th>
                          <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                            Full year budget
                          </th>
                          <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                            Last year (full year)
                          </th>
                          <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                            Deviation
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activePnlRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className='px-4 py-6 text-center text-sm text-gray-500'>
                              No P&amp;L breakdown available.
                            </td>
                          </tr>
                        ) : groupedPnlRows.size <= 1 ? (
                          renderPnlRows(activePnlRows, showPnlUnitColumn, selectedTimeframeScope)
                        ) : (
                          Array.from(groupedPnlRows.entries()).map(
                            ([unit, rows]) => (
                              <React.Fragment key={unit}>
                                <tr className='bg-gray-50'>
                                  <td
                                    className='px-4 py-2 font-semibold text-gray-900'
                                    colSpan={5}>
                                    {unit}
                                  </td>
                                </tr>
                                {renderPnlRows(rows, false, selectedTimeframeScope)}
                              </React.Fragment>
                            )
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeBudgetStage && activeBudgetDetails && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6'
          onClick={() => setActiveBudgetStage(null)}>
          <div
            className='flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200 max-h-[80vh]'
            onClick={(event: React.MouseEvent<HTMLDivElement>) =>
              event.stopPropagation()
            }>
            <div className='flex items-start justify-between gap-4 border-b border-gray-200 p-6'>
              <div>
                <p className='text-xs uppercase tracking-wide text-gray-500'>
                  Metric details
                </p>
                <h3 className='text-xl font-bold text-gray-900'>
                  {activeBudgetStage.label}
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  {selectedBuLabel} • Budget
                </p>
              </div>
              <button
                type='button'
                className='rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-gray-700 hover:border-gray-300'
                onClick={() => setActiveBudgetStage(null)}>
                <XMarkIcon className='h-4 w-4' />
              </button>
            </div>
            <div className='flex-1 overflow-y-auto p-6 space-y-5'>
              <div className='grid gap-4 sm:grid-cols-3'>
                <div className='rounded-lg border border-gray-200 bg-slate-50 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500'>
                    Total impact
                  </p>
                  <p className='mt-2 text-2xl font-semibold text-gray-900'>
                    {formatMn(activeBudgetDetails.totalImpact)} Mn {currencyLabel}
                  </p>
                </div>
                <div className='rounded-lg border border-gray-200 bg-slate-50 p-4'>
                  <p className='text-xs tracking-wide text-gray-500'>
                    Selected BGs and BUs
                  </p>
                  <div className='mt-2 space-y-1'>
                    <p className='text-lg font-semibold text-gray-900'>
                      {selectedBuLabel}
                    </p>
                    {selectedUnits.length > 0 && (
                      <p className='text-sm text-gray-600'>
                        {selectedUnits.map(u => u.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className='rounded-lg border border-gray-200 bg-slate-50 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500'>
                    Context
                  </p>
                  <p className='mt-2 text-lg font-semibold text-gray-900'>
                    Operating Profit
                  </p>
                </div>
              </div>
              {activeBudgetDetails.type === 'op-impact' && (
                <div className='flex flex-wrap gap-3'>
                  <select
                    className='rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700'
                    value={impactRationaleFilter}
                    onChange={(event) =>
                      setImpactRationaleFilter(event.target.value)
                    }>
                    <option value='all'>All rationales</option>
                    {impactRationaleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input
                    className='flex-1 min-w-[200px] rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700'
                    placeholder='Filter items...'
                    value={impactSearch}
                    onChange={(event) => setImpactSearch(event.target.value)}
                  />
                </div>
              )}
              <div className='overflow-hidden rounded-lg border border-gray-200'>
                {activeBudgetDetails.type === 'ideation' ? (
                  <table className='w-full text-sm'>
                    <thead className='bg-gray-50 border-b border-gray-200'>
                      <tr>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          Category
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          KPI
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          Baseline (2025)
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          In-year target (2026)
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          Fully ramp up target
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          category: 'Topline / Pricing',
                          kpi: 'Contribution margin %',
                          baseline: '3%',
                          inYear: '4%',
                          fullyRamped: '5%',
                        },
                        {
                          category: '',
                          kpi: 'Margin on BOM % (cross functional)',
                          baseline: '4%',
                          inYear: '5%',
                          fullyRamped: '6%',
                        },
                        {
                          category: 'Manufacturing',
                          kpi: 'UPPH - Direct labor',
                          baseline: '1.30',
                          inYear: '1.56',
                          fullyRamped: '1.95',
                        },
                        {
                          category: '',
                          kpi: 'Headcount - Indirect labor',
                          baseline: '1250',
                          inYear: '1095',
                          fullyRamped: '1035',
                        },
                        {
                          category: '',
                          kpi: 'OEE2 - Equipment Efficiency',
                          baseline: '75%',
                          inYear: '82%',
                          fullyRamped: '85%',
                        },
                        {
                          category: '',
                          kpi: 'Material Yield (%)* - Material consumption efficiency',
                          baseline: '123%',
                          inYear: '117%',
                          fullyRamped: '105%',
                        },
                        {
                          category: '',
                          kpi: 'G&A Var. Unit cost',
                          baseline: '5.1',
                          inYear: '4.2',
                          fullyRamped: '3.7',
                        },
                        {
                          category: '',
                          kpi: 'G&A Fix (Abs) - G&A Fix cost against budget **',
                          baseline: '100',
                          inYear: '110',
                          fullyRamped: '110',
                        },
                        {
                          category: '',
                          kpi: 'FPY',
                          baseline: '80%',
                          inYear: '91%',
                          fullyRamped: '95%',
                        },
                        {
                          category: 'Procurement',
                          kpi: 'MP day-1 BOM cost achievement',
                          baseline: '92%',
                          inYear: '96%',
                          fullyRamped: '98%',
                        },
                        {
                          category: '',
                          kpi: 'Spending cost reduction (%)',
                          baseline: '15%',
                          inYear: '18%',
                          fullyRamped: '20%',
                        },
                        {
                          category: 'R&D productivity',
                          kpi: 'Labor productivity (Mn USD rev. / FTE)',
                          baseline: '3.1',
                          inYear: '4.2',
                          fullyRamped: '5.1',
                        },
                        {
                          category: '',
                          kpi: 'Non-labor productivity (Mn USD rev. / Non FTE)',
                          baseline: '8.1',
                          inYear: '8.5',
                          fullyRamped: '9.2',
                        },
                        {
                          category: '',
                          kpi: 'R&D intensity (% of revenue)',
                          baseline: '9%',
                          inYear: '8%',
                          fullyRamped: '7%',
                        },
                        {
                          category: '',
                          kpi: 'GP per unit R&D spent (Mn USD)',
                          baseline: '6.2',
                          inYear: '7.1',
                          fullyRamped: '7.9',
                        },
                        {
                          category: 'SG&A',
                          kpi: '% of revenue',
                          baseline: '6%',
                          inYear: '5%',
                          fullyRamped: '5%',
                        },
                        {
                          category: '',
                          kpi: 'GP per unit SG&A spent (Mn USD)',
                          baseline: '8.2',
                          inYear: '9.1',
                          fullyRamped: '10.3',
                        },
                      ].map((row, index) => (
                        <tr
                          key={`${row.kpi}-${index}`}
                          className='border-b border-gray-200 last:border-b-0'>
                          <td className='px-4 py-3 text-gray-700'>
                            {row.category}
                          </td>
                          <td className='px-4 py-3 text-gray-700'>{row.kpi}</td>
                          <td className='px-4 py-3 text-gray-700'>{row.baseline}</td>
                          <td className='px-4 py-3 text-gray-700'>{row.inYear}</td>
                          <td className='px-4 py-3 text-gray-700'>
                            {row.fullyRamped}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className='w-full text-sm'>
                    <thead className='bg-gray-50 border-b border-gray-200'>
                      <tr>
                        {selectedImpactUnits.length > 1 && (
                          <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                            BU
                          </th>
                        )}
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          Line item
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          Rationale
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          Item
                        </th>
                        <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                          OP impact (Mn {currencyLabel})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBudgetDetails.rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={selectedImpactUnits.length > 1 ? 5 : 4}
                            className='px-4 py-6 text-center text-sm text-gray-500'>
                            No op-impact items available.
                          </td>
                        </tr>
                      ) : (
                        activeBudgetDetails.rows.map((row, index) => (
                          <tr
                            key={`${row.bu}-${row.item}-${index}`}
                            className='border-b border-gray-200 last:border-b-0'>
                            {selectedImpactUnits.length > 1 && (
                              <td className='px-4 py-3 font-semibold text-gray-900'>
                                {row.bu}
                              </td>
                            )}
                            <td className='px-4 py-3 text-gray-600'>
                              {row.lineItem}
                            </td>
                            <td className='px-4 py-3 text-gray-600'>
                              {row.costRationale}
                            </td>
                            <td className='px-4 py-3 text-gray-600'>
                              {row.item}
                            </td>
                            <td className='px-4 py-3 text-right font-semibold text-gray-900'>
                              {formatMn(row.opImpact)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
