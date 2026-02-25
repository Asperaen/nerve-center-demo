import {
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BudgetPerformanceWaterfall from '../components/BudgetPerformanceWaterfall';
import BusinessGroupPerformanceWaterfall from '../components/BusinessGroupPerformanceWaterfall';
import HeaderFilters from '../components/HeaderFilters';
import {
  CostImpactBreakdownLayer,
  MVABreakdownLayer,
  ProductAnalysisLayer,
} from '../components/layers';
import { type TimeframeOption } from '../components/TimeframePicker';
import { MONTHS, TREND_MONTHS } from '../constants';
import { useBudgets, type BusinessGroup } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { PNL_BREAKDOWN_DATA, type PnlBreakdownRow } from '../data/mockBgData';
import {
  type BusinessGroupData,
  type BusinessGroupMetricWithTrend,
  type MonthlyTrendPoint,
} from '../data/mockBusinessGroupPerformance';
import { mockBudgetForecastStages } from '../data/mockForecast';
import type {
  BreadcrumbItem,
  BudgetForecastStage,
  NavigationLayer,
} from '../types';
import { setStoredTimeframe } from '../utils/timeframeStorage';

const roundToOne = (value: number) => Math.round(value * 10) / 10;
const toMillions = (value: number) => value / 1_000;
const normalizeGroupId = (groupName: string) => {
  const key = groupName.trim().toLowerCase().replace(/\s*\(parent\)\s*$/i, '');
  return key === 'other' ? 'others' : key;
};

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
  valueMode: 'actual' | 'forecast',
  budgetMode: 'full-year' | 'ytm',
  lastYearMode: 'full-year' | 'ytm',
  scale: number = 1,
  idOverride?: string,
  nameOverride?: string
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
      acc.ytmLastYearRevenue += unit.ytmLastYearRevenue ?? 0;
      acc.ytmLastYearGrossProfit += unit.ytmLastYearGrossProfit ?? 0;
      acc.ytmLastYearOperatingProfit += unit.ytmLastYearOperatingProfit ?? 0;
      acc.ytmLastYearNetProfit += unit.ytmLastYearNetProfit ?? 0;
      acc.lastYearRevenue += unit.lastYearRevenue;
      acc.lastYearGrossProfit += unit.lastYearGrossProfit;
      acc.lastYearOperatingProfit += unit.lastYearOperatingProfit;
      acc.lastYearNetProfit += unit.lastYearNetProfit;
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
      ytmLastYearRevenue: 0,
      ytmLastYearGrossProfit: 0,
      ytmLastYearOperatingProfit: 0,
      ytmLastYearNetProfit: 0,
      lastYearRevenue: 0,
      lastYearGrossProfit: 0,
      lastYearOperatingProfit: 0,
      lastYearNetProfit: 0,
      forecastRevenue: 0,
      forecastGrossProfit: 0,
      forecastOperatingProfit: 0,
      forecastNetProfit: 0,
    }
  );

  const name = nameOverride ?? groupName;
  const id = idOverride ?? normalizeGroupId(groupName);
  const insightBase = `${name} performance`;
  const actualScale = valueMode === 'actual' && budgetMode === 'ytm' ? 1 : scale;
  const budgetScale = budgetMode === 'ytm' ? 1 : scale;
  const lastYearScale = lastYearMode === 'ytm' ? 1 : scale;
  const forecastScale = scale;
  const revenue =
    valueMode === 'forecast'
      ? forecastScale * toMillions(totals.forecastRevenue)
      : actualScale * toMillions(totals.ytmRevenueActual ?? totals.revenue);
  const grossProfit =
    valueMode === 'forecast'
      ? forecastScale * toMillions(totals.forecastGrossProfit)
      : actualScale * toMillions(totals.ytmGrossProfitActual ?? totals.grossProfit);
  const operatingProfit =
    valueMode === 'forecast'
      ? forecastScale * toMillions(totals.forecastOperatingProfit)
      : actualScale * toMillions(totals.ytmOperatingProfitActual ?? totals.operatingProfit);
  const netProfit =
    valueMode === 'forecast'
      ? forecastScale * toMillions(totals.forecastNetProfit)
      : actualScale * toMillions(totals.ytmNetProfitActual ?? totals.netProfit);
  const revenueBudget = budgetScale * toMillions(
    budgetMode === 'ytm' ? totals.ytmRevenueBudget : totals.revenueBudget
  );
  const grossProfitBudget = budgetScale * toMillions(
    budgetMode === 'ytm' ? totals.ytmGrossProfitBudget : totals.grossProfitBudget
  );
  const operatingProfitBudget = budgetScale * toMillions(
    budgetMode === 'ytm' ? totals.ytmOperatingProfitBudget : totals.operatingProfitBudget
  );
  const netProfitBudget = budgetScale * toMillions(
    budgetMode === 'ytm' ? totals.ytmNetProfitBudget : totals.netProfitBudget
  );
  const lastYearRevenue = lastYearScale * toMillions(
    lastYearMode === 'ytm' ? totals.ytmLastYearRevenue : totals.lastYearRevenue
  );
  const lastYearGrossProfit = lastYearScale * toMillions(
    lastYearMode === 'ytm' ? totals.ytmLastYearGrossProfit : totals.lastYearGrossProfit
  );
  const lastYearOperatingProfit = lastYearScale * toMillions(
    lastYearMode === 'ytm'
      ? totals.ytmLastYearOperatingProfit
      : totals.lastYearOperatingProfit
  );
  const lastYearNetProfit = lastYearScale * toMillions(
    lastYearMode === 'ytm' ? totals.ytmLastYearNetProfit : totals.lastYearNetProfit
  );

  return {
    id,
    name,
    rev: buildMetric(
      revenue,
      revenueBudget,
      lastYearRevenue,
      `${insightBase} Revenue trends align with group mix.`,
      'budget',
      name,
      'Revenue'
    ),
    gp: buildMetric(
      grossProfit,
      grossProfitBudget,
      lastYearGrossProfit,
      `${insightBase} Gross profit reflects mix and cost discipline.`,
      'budget',
      name,
      'Gross Profit'
    ),
    op: buildMetric(
      operatingProfit,
      operatingProfitBudget,
      lastYearOperatingProfit,
      `${insightBase} Operating profit tracks execution momentum.`,
      'budget',
      name,
      'Operating Profit'
    ),
    np: buildMetric(
      netProfit,
      netProfitBudget,
      lastYearNetProfit,
      `${insightBase} Net profit reflects margin resilience.`,
      'budget',
      name,
      'Net Profit'
    ),
  };
};
const buildUnitRow = (
  groupId: string,
  unit: BusinessUnitSource,
  valueMode: 'actual' | 'forecast',
  budgetMode: 'full-year' | 'ytm',
  lastYearMode: 'full-year' | 'ytm',
  scale: number = 1
): BusinessGroupData => {
  const unitId = `${groupId}-${unit.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`;
  const actualScale = valueMode === 'actual' && budgetMode === 'ytm' ? 1 : scale;
  const budgetScale = budgetMode === 'ytm' ? 1 : scale;
  const lastYearScale = lastYearMode === 'ytm' ? 1 : scale;
  const forecastScale = scale;
  const revenue =
    valueMode === 'forecast'
      ? forecastScale * toMillions(unit.forecastRevenue)
      : actualScale * toMillions(unit.ytmRevenueActual ?? unit.revenue);
  const grossProfit =
    valueMode === 'forecast'
      ? forecastScale * toMillions(unit.forecastGrossProfit)
      : actualScale * toMillions(unit.ytmGrossProfitActual ?? unit.grossProfit);
  const operatingProfit =
    valueMode === 'forecast'
      ? forecastScale * toMillions(unit.forecastOperatingProfit)
      : actualScale * toMillions(unit.ytmOperatingProfitActual ?? unit.operatingProfit);
  const netProfit =
    valueMode === 'forecast'
      ? forecastScale * toMillions(unit.forecastNetProfit)
      : actualScale * toMillions(unit.ytmNetProfitActual ?? unit.netProfit);
  const revenueBudget = budgetScale * toMillions(
    budgetMode === 'ytm' ? unit.ytmRevenueBudget : unit.revenueBudget
  );
  const grossProfitBudget = budgetScale * toMillions(
    budgetMode === 'ytm' ? unit.ytmGrossProfitBudget : unit.grossProfitBudget
  );
  const operatingProfitBudget = budgetScale * toMillions(
    budgetMode === 'ytm'
      ? unit.ytmOperatingProfitBudget
      : unit.operatingProfitBudget
  );
  const netProfitBudget = budgetScale * toMillions(
    budgetMode === 'ytm' ? unit.ytmNetProfitBudget : unit.netProfitBudget
  );
  const lastYearRevenue = lastYearScale * toMillions(
    lastYearMode === 'ytm' ? unit.ytmLastYearRevenue : unit.lastYearRevenue
  );
  const lastYearGrossProfit = lastYearScale * toMillions(
    lastYearMode === 'ytm'
      ? unit.ytmLastYearGrossProfit
      : unit.lastYearGrossProfit
  );
  const lastYearOperatingProfit = lastYearScale * toMillions(
    lastYearMode === 'ytm'
      ? unit.ytmLastYearOperatingProfit
      : unit.lastYearOperatingProfit
  );
  const lastYearNetProfit = lastYearScale * toMillions(
    lastYearMode === 'ytm' ? unit.ytmLastYearNetProfit : unit.lastYearNetProfit
  );
  const insightBase = `${unit.name} performance.`;

  return {
    id: unitId,
    name: unit.name,
    rev: buildMetric(
      revenue,
      revenueBudget,
      lastYearRevenue,
      `${insightBase} Revenue outlook follows segment demand.`,
      'budget',
      unit.name,
      'Revenue'
    ),
    gp: buildMetric(
      grossProfit,
      grossProfitBudget,
      lastYearGrossProfit,
      `${insightBase} GP reflects product mix and cost structure.`,
      'budget',
      unit.name,
      'Gross Profit'
    ),
    op: buildMetric(
      operatingProfit,
      operatingProfitBudget,
      lastYearOperatingProfit,
      `${insightBase} OP tracks execution pace.`,
      'budget',
      unit.name,
      'Operating Profit'
    ),
    np: buildMetric(
      netProfit,
      netProfitBudget,
      lastYearNetProfit,
      `${insightBase} NP supported by margin discipline.`,
      'budget',
      unit.name,
      'Net Profit'
    ),
  };
};

const getUnitId = (groupId: string, unitName: string) =>
  `${groupId}-${unitName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

export default function BusinessGroupPerformancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { businessGroups } = useBudgets();

  // Get initial BU from query param
  const initialBuParam =
    searchParams.get('bg') || searchParams.get('bu') || 'all';
  const initialBu =
    initialBuParam === 'all' ? 'all' : normalizeGroupId(initialBuParam);

  // Filter states
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeframeOption>(() => 'ytm');
  const initialMonths = (() => {
    const monthsParam = searchParams.get('months');
    if (!monthsParam) {
      return null;
    }
    const [startRaw, endRaw] = monthsParam.split('-').map(Number);
    if (
      Number.isFinite(startRaw) &&
      Number.isFinite(endRaw) &&
      startRaw >= 0 &&
      endRaw >= startRaw &&
      endRaw < 12
    ) {
      return [startRaw, endRaw] as [number, number];
    }
    return null;
  })();
  const [monthRange, setMonthRange] = useState<[number, number]>(
    initialMonths ?? [0, 1]
  );
  const [monthAnchor, setMonthAnchor] = useState<number | null>(null);
  const [isMonthRangeCustom, setIsMonthRangeCustom] = useState<boolean>(
    Boolean(initialMonths)
  );
  const [selectedBu, setSelectedBu] = useState<string>(initialBu);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );
  const [activeDeviationStage, setActiveDeviationStage] =
    useState<BudgetForecastStage | null>(null);
  const [impactRationaleFilter, setImpactRationaleFilter] =
    useState<string>('all');
  const [impactSearch, setImpactSearch] = useState<string>('');
  const [activePnlGroup, setActivePnlGroup] = useState<string | null>(null);
  const rowClickTimeoutRef = useRef<number | null>(null);

  // Expanded rows state (for "All BGs" view)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [financialView, setFinancialView] = useState<'absolute' | 'margin'>(
    'absolute'
  );

  // Layer navigation state
  const [currentLayer, setCurrentLayer] = useState<NavigationLayer>(1);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [selectedCOGSTab] = useState<'sites' | 'products'>('sites');
  const isBudgetMode = selectedTimeframe === 'budget';
  const isPercentView = financialView === 'margin';
  const timeframeScale = useMemo(
    () => (monthRange[1] - monthRange[0] + 1) / 12,
    [monthRange]
  );

  // Get main BU options
  const mainBuOptions = useMemo(
    () =>
      businessGroups.map((group) => ({
        id: normalizeGroupId(group.group),
        name: group.group,
      })),
    [businessGroups]
  );

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
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('bg', buId);
      next.set('timeframe', selectedTimeframe);
      next.delete('toggle');
      next.set('months', `${monthRange[0]}-${monthRange[1]}`);
      next.set('view', financialView);
      next.delete('bu');
      next.delete('units');
      return next;
    });
    // Reset expanded rows when changing filter
    setExpandedRows(new Set());
  };

  const handleTimeframeChange = (timeframe: 'full-year' | 'ytm') => {
    // Actual (Reconciliation) page only supports YTM
    if (timeframe === 'full-year') {
      return;
    }
    setSelectedTimeframe(timeframe);
    setIsMonthRangeCustom(false);
    setMonthAnchor(null);
    const nextRange: [number, number] = [0, 1];
    setMonthRange(nextRange);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('timeframe', 'ytm');
      next.delete('toggle');
      next.set('months', `${nextRange[0]}-${nextRange[1]}`);
      next.set('view', financialView);
      return next;
    });
  };

  const handleMonthClick = (monthIndex: number) => {
    if (selectedTimeframe === 'ytm') {
      return;
    }
    if (monthAnchor === null || !isMonthRangeCustom) {
      setMonthAnchor(monthIndex);
      setMonthRange([monthIndex, monthIndex]);
      setIsMonthRangeCustom(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('months', `${monthIndex}-${monthIndex}`);
        next.set('view', financialView);
        return next;
      });
      return;
    }
    const start = Math.min(monthAnchor, monthIndex);
    const end = Math.max(monthAnchor, monthIndex);
    setMonthRange([start, end]);
    setMonthAnchor(null);
    setIsMonthRangeCustom(true);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('months', `${start}-${end}`);
      next.set('view', financialView);
      return next;
    });
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
    // Only store YTM for this page
    if (selectedTimeframe === 'ytm') {
      setStoredTimeframe(selectedTimeframe);
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    // Actual (Reconciliation) page only supports YTM
    if (selectedTimeframe !== 'ytm') {
      setSelectedTimeframe('ytm');
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    if (isMonthRangeCustom) {
      return;
    }
    setMonthRange(selectedTimeframe === 'ytm' ? [0, 1] : [0, 11]);
  }, [selectedTimeframe, isMonthRangeCustom]);

  useEffect(() => {
    // Actual (Reconciliation) page only supports YTM, ignore URL params
    const timeframeParam = searchParams.get('timeframe');
    if (timeframeParam && timeframeParam !== 'ytm') {
      // Force YTM and update URL to reflect the correct state
      setSelectedTimeframe('ytm');
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('timeframe', 'ytm');
        next.set('months', '0-1');
        return next;
      });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'absolute' || viewParam === 'margin') {
      setFinancialView(viewParam);
    }
    const monthsParam = searchParams.get('months');
    if (!monthsParam) {
      return;
    }
    if (monthAnchor !== null) {
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
      setMonthRange([startRaw, endRaw]);
      setIsMonthRangeCustom(true);
      setMonthAnchor(null);
    }
  }, [searchParams, monthAnchor]);

  // Sync selectedBu with URL bg parameter when navigating to this page
  useEffect(() => {
    const bgParam = searchParams.get('bg') ?? searchParams.get('bu');
    if (!bgParam) {
      return;
    }
    const normalizedBg = bgParam === 'all' ? 'all' : normalizeGroupId(bgParam);
    // Only update if the value actually changed to avoid unnecessary re-renders
    setSelectedBu((current) => (current !== normalizedBg ? normalizedBg : current));
  }, [searchParams]);

  // Sync selectedGroupIds with URL selected parameter when navigating to this page
  useEffect(() => {
    if (selectedBu !== 'all') {
      return;
    }
    const selectedParam = searchParams.get('selected');
    if (!selectedParam) {
      return;
    }
    const normalizedSelected = normalizeGroupId(selectedParam);
    // Set the selected group IDs based on the URL parameter
    setSelectedGroupIds(new Set([normalizedSelected]));
  }, [searchParams, selectedBu]);

  const isOverallRowId = (id: string) =>
    id === 'overall' || id.endsWith('-overall');

  // Get data based on selected BU
  const tableData = useMemo(() => {
    const valueMode = selectedTimeframe === 'full-year' ? 'forecast' : 'actual';
    const budgetMode = selectedTimeframe === 'ytm' ? 'ytm' : 'full-year';
    const lastYearMode = selectedTimeframe === 'ytm' ? 'ytm' : 'full-year';
    if (selectedBu === 'all') {
      const groupRows = businessGroups.map((group) =>
        buildGroupRow(
          group.group,
          group.businessUnits,
          valueMode,
          budgetMode,
          lastYearMode,
          timeframeScale
        )
      );
      const overallRow = buildGroupRow(
        'Overall',
        businessGroups.flatMap((group) => group.businessUnits),
        valueMode,
        budgetMode,
        lastYearMode,
        timeframeScale,
        'overall',
        'Overall'
      );
      return [...groupRows, overallRow];
    }
    const selectedGroup = businessGroups.find(
      (group) => normalizeGroupId(group.group) === selectedBu
    );
    if (!selectedGroup) {
      return [];
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const unitRows = selectedGroup.businessUnits.map((unit) =>
      buildUnitRow(groupId, unit, valueMode, budgetMode, lastYearMode, timeframeScale)
    );
    const overallRow = buildGroupRow(
      selectedGroup.group,
      selectedGroup.businessUnits,
      valueMode,
      budgetMode,
      lastYearMode,
      timeframeScale,
      `${groupId}-overall`,
      `${selectedGroup.group} overall`
    );
    return [...unitRows, overallRow];
  }, [businessGroups, selectedBu, selectedTimeframe, timeframeScale]);

  const unitRowsById = useMemo(() => {
    const valueMode = selectedTimeframe === 'full-year' ? 'forecast' : 'actual';
    const budgetMode = selectedTimeframe === 'ytm' ? 'ytm' : 'full-year';
    const lastYearMode = selectedTimeframe === 'ytm' ? 'ytm' : 'full-year';
    const entries = businessGroups.flatMap((group) => {
      const groupId = normalizeGroupId(group.group);
      return group.businessUnits.map((unit) => {
        const row = buildUnitRow(
          groupId,
          unit,
          valueMode,
          budgetMode,
          lastYearMode,
          timeframeScale
        );
        return [row.id, row] as const;
      });
    });
    return new Map(entries);
  }, [businessGroups, selectedTimeframe, timeframeScale]);

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
        // When selecting a BU (child), also select the parent BG
        // BU IDs are formatted as "{groupId}-{unitName}", so check if this is a child of any BG
        const parentBgId = tableData
          .filter((row) => !isOverallRowId(row.id))
          .find((row) => bgId.startsWith(`${row.id}-`))?.id;
        if (parentBgId) {
          next.add(parentBgId);
        }
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
    // Don't override if a specific BU is selected via URL parameter
    const selectedParam = searchParams.get('selected');
    if (selectedParam) {
      return;
    }
    if (selectedGroupIds.size > 0) {
      return;
    }
    const overallRow = tableData.find((row) => isOverallRowId(row.id));
    if (overallRow) {
      setSelectedGroupIds(new Set([overallRow.id]));
    } else if (tableData.length === 0) {
      setSelectedGroupIds(new Set());
    }
  }, [selectedGroupIds, tableData, searchParams]);

  useEffect(() => {
    // Don't override if a specific BU is selected via URL parameter
    const selectedParam = searchParams.get('selected');
    if (selectedParam) {
      return;
    }
    if (selectedGroupIds.size === 0) {
      const overallRow = tableData.find((row) => isOverallRowId(row.id));
      if (overallRow) {
        setSelectedGroupIds(new Set([overallRow.id]));
      }
    }
  }, [selectedGroupIds, tableData, searchParams]);

  useEffect(() => {
    if (selectedBu === 'all') {
      return;
    }
    const unitsParam =
      searchParams.get('bg') ? searchParams.get('bu') : searchParams.get('units');
    if (!unitsParam) {
      return;
    }
    const selectedGroup = businessGroups.find(
      (group) => normalizeGroupId(group.group) === selectedBu
    );
    if (!selectedGroup) {
      return;
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const unitIds = unitsParam
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((unitName) => getUnitId(groupId, unitName));
    const validUnitIds = unitIds.filter((unitId) =>
      selectedGroup.businessUnits.some(
        (unit) => getUnitId(groupId, unit.name) === unitId
      )
    );
    if (validUnitIds.length > 0) {
      setSelectedGroupIds(new Set(validUnitIds));
    }
  }, [businessGroups, searchParams, selectedBu]);

  // Auto-expand parent BG when BU is specified in URL
  useEffect(() => {
    const bgParam = searchParams.get('bg');
    const buParam = searchParams.get('bu');
    if (bgParam && buParam && selectedBu !== 'all') {
      const normalizedBg = normalizeGroupId(bgParam);
      setExpandedRows((prev) => {
        if (!prev.has(normalizedBg)) {
          const next = new Set(prev);
          next.add(normalizedBg);
          return next;
        }
        return prev;
      });
    }
  }, [searchParams, selectedBu]);

  // Get sub-groups for expanded rows
  const getExpandedSubGroups = (bgId: string) => {
    const valueMode = selectedTimeframe === 'full-year' ? 'forecast' : 'actual';
    const budgetMode = selectedTimeframe === 'ytm' ? 'ytm' : 'full-year';
    const lastYearMode = selectedTimeframe === 'ytm' ? 'ytm' : 'full-year';
    const selectedGroup = businessGroups.find(
      (group) => normalizeGroupId(group.group) === bgId
    );
    if (!selectedGroup) {
      return [];
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    return selectedGroup.businessUnits.map((unit) =>
      buildUnitRow(groupId, unit, valueMode, budgetMode, lastYearMode, timeframeScale)
    );
  };

  const sectionTitle = useMemo(() => {
    if (selectedBu === 'all') {
      return 'All BGs';
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
    const totalOpValue =
      overallRow?.op.value ??
      baseRows.reduce((sum, row) => sum + row.op.value, 0);
    const totalOpBaseline =
      overallRow?.op.baseline ??
      baseRows.reduce((sum, row) => sum + row.op.baseline, 0);

    let selectedRows =
      selectedGroupIds.size === 0
        ? overallRow
          ? [overallRow]
          : baseRows
        : tableData.filter((row) => selectedGroupIds.has(row.id));
    if (selectedRows.length === 0 && selectedGroupIds.size > 0) {
      const fallbackRows = Array.from(selectedGroupIds)
        .map((id) => unitRowsById.get(id))
        .filter((row): row is BusinessGroupData => Boolean(row));
      if (fallbackRows.length > 0) {
        selectedRows = fallbackRows;
      }
    }
    const hasOverallSelected = selectedRows.some((row) =>
      isOverallRowId(row.id)
    );
    const selectedNpValue = hasOverallSelected
      ? overallRow?.np.value ?? totalNpValue
      : selectedRows.reduce((sum, row) => sum + row.np.value, 0);
    const selectedNpBaseline = hasOverallSelected
      ? overallRow?.np.baseline ?? totalNpBaseline
      : selectedRows.reduce((sum, row) => sum + row.np.baseline, 0);
    const selectedOpValue = hasOverallSelected
      ? overallRow?.op.value ?? totalOpValue
      : selectedRows.reduce((sum, row) => sum + row.op.value, 0);
    const selectedOpBaseline = hasOverallSelected
      ? overallRow?.op.baseline ?? totalOpBaseline
      : selectedRows.reduce((sum, row) => sum + row.op.baseline, 0);

    const scaleFactor =
      totalNpBaseline === 0 ? 1 : selectedNpBaseline / totalNpBaseline;

    // Calculate ideation target based on selected business units
    const getIdeationForSelection = () => {
      if (selectedBu === 'all') {
        // Sum ideation from all business groups
        return businessGroups.reduce(
          (sum, group) =>
            sum +
            group.businessUnits.reduce(
              (unitSum, unit) => unitSum + unit.ideationTarget,
              0
            ),
          0
        );
      }
      // Sum ideation from the selected business group's units
      const selectedGroup = businessGroups.find(
        (group) => normalizeGroupId(group.group) === selectedBu
      );
      if (!selectedGroup) return 0;
      return selectedGroup.businessUnits.reduce(
        (sum, unit) => sum + unit.ideationTarget,
        0
      );
    };
    const selectedIdeation = roundToOne(toMillions(getIdeationForSelection()));

    return {
      totalNpBaseline,
      totalNpValue,
      selectedNpBaseline,
      selectedNpValue,
      totalOpBaseline,
      totalOpValue,
      selectedOpBaseline,
      selectedOpValue,
      scaleFactor,
      selectedIdeation,
    };
  }, [businessGroups, selectedGroupIds, tableData, unitRowsById, selectedBu]);

  const { formatAmount, currencyLabel } = useCurrency();

  const formatMn = (value: number) =>
    formatAmount(value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  const formatMnValue = (value: number) => `${formatMn(value)}M`;
  const formatPnlValue = (value: number) => formatMnValue(toMillions(value));

  const resolvePnlGroupKey = useCallback((groupName: string) => {
    const normalized = normalizeGroupId(groupName);
    if (normalized === 'hh') {
      return 'HH (Parent)';
    }
    if (normalized === 'fit') {
      return 'FIT';
    }
    if (normalized === 'fii') {
      return 'FII';
    }
    if (normalized === 'fih') {
      return 'FIH';
    }
    if (normalized === 'others') {
      return 'Others';
    }
    return null;
  }, []);

  const activePnlRows = useMemo<PnlBreakdownRow[]>(() => {
    if (!activePnlGroup) {
      return [];
    }
    return PNL_BREAKDOWN_DATA[activePnlGroup] ?? [];
  }, [activePnlGroup]);

  const unitGroupKeyById = useMemo(() => {
    const entries: Array<[string, string]> = [];
    businessGroups.forEach((group) => {
      const groupKey = resolvePnlGroupKey(group.group);
      if (!groupKey) {
        return;
      }
      const groupId = normalizeGroupId(group.group);
      group.businessUnits.forEach((unit) => {
        entries.push([getUnitId(groupId, unit.name), groupKey]);
      });
    });
    return new Map(entries);
  }, [businessGroups, resolvePnlGroupKey]);

  const selectedPnlUnitIds = useMemo(
    () => Array.from(selectedGroupIds).filter((id) => unitRowsById.has(id)),
    [selectedGroupIds, unitRowsById]
  );

  const selectedPnlUnitNames = useMemo(
    () =>
      selectedPnlUnitIds
        .map((id) => unitRowsById.get(id)?.name)
        .filter((name): name is string => Boolean(name)),
    [selectedPnlUnitIds, unitRowsById]
  );

  const selectedPnlGroupKey = useMemo(() => {
    if (selectedPnlUnitIds.length === 0) {
      return null;
    }
    const groupKeys = new Set(
      selectedPnlUnitIds
        .map((id) => unitGroupKeyById.get(id))
        .filter((key): key is string => Boolean(key))
    );
    if (groupKeys.size !== 1) {
      return null;
    }
    return Array.from(groupKeys)[0];
  }, [selectedPnlUnitIds, unitGroupKeyById]);

  const selectedPnlRows = useMemo<PnlBreakdownRow[]>(() => {
    if (!selectedPnlGroupKey || selectedPnlUnitNames.length === 0) {
      return [];
    }
    const rows = PNL_BREAKDOWN_DATA[selectedPnlGroupKey] ?? [];
    return rows.filter((row) => selectedPnlUnitNames.includes(row.unit));
  }, [selectedPnlGroupKey, selectedPnlUnitNames]);

  const pnlTitle = useMemo(() => {
    if (selectedPnlUnitNames.length === 0) {
      return 'All BUs';
    }
    if (selectedPnlUnitNames.length === 1) {
      return selectedPnlUnitNames[0];
    }
    if (selectedPnlUnitNames.length <= 3) {
      return selectedPnlUnitNames.join(', ');
    }
    return `${selectedPnlUnitNames.length} BUs selected`;
  }, [selectedPnlUnitNames]);

  const groupedPnlRows = useMemo(() => {
    const grouped = new Map<string, PnlBreakdownRow[]>();
    selectedPnlRows.forEach((row) => {
      if (!grouped.has(row.unit)) {
        grouped.set(row.unit, []);
      }
      grouped.get(row.unit)?.push(row);
    });
    return grouped;
  }, [selectedPnlRows]);

  const showPnlUnitColumn = groupedPnlRows.size > 1;

  const keyCallOut = useMemo(() => {
    const overallRow =
      tableData.find((row) => isOverallRowId(row.id)) ?? tableData[0];
    const actual = overallRow?.np.value ?? selectionMetrics.selectedNpValue;
    const budget = overallRow?.np.baseline ?? selectionMetrics.selectedNpBaseline;
    const displayedActual = isBudgetMode ? budget : actual;
    const delta = displayedActual - budget;
    const deltaSign = delta >= 0 ? '+' : '-';
    const percent =
      budget === 0 ? 0 : (delta / Math.abs(budget)) * 100;
    const percentSign = percent >= 0 ? '+' : '-';
    const magnitude = Math.abs(percent);
    const directionText = delta >= 0 ? 'above' : 'below';

    // Get selected BU name for custom content
    const selectedBuName = selectedGroupIds.size === 1
      ? tableData.find((row) => selectedGroupIds.has(row.id))?.name
      : selectedGroupIds.size === 0
      ? overallRow?.name
      : undefined;

    // Custom content for D/E Group
    if (selectedBuName === 'D/E Group') {
      return {
        summary: `Actual NP reached USD 232M, trailing budget by negative USD 39M (–14.2%), indicating a volume / mix gap versus plan.`,
        isGain: false,
        drivers: [
          'The primary negative driver is volume/mix softness, mainly driven by volume decline in Account B, which more than offset other positives.',
          'Cost headwinds mainly from direct labor, resulting in an estimated ~2 p.p. gross margin impact.',
          'Exchange rate (tailwind) and one-time benefit has secured over USD 100M OP, providing a meaningful upside lever.',
        ],
        actions: [
          'Prioritizing margin recovery levers (pricing actions, mix optimization, and cost take-out).',
          'Fast-tracking late-stage initiatives with the highest OP impact to minimize leakage in the primary positive impact source.',
          'Tightening spend controls and reassessing discretionary programs to recover identified leakage potential.',
        ],
      };
    }

    const drivers =
      delta >= 0
        ? [
            `Volume/mix is running ${directionText} plan, lifting NP conversion.`,
            `Cost discipline and productivity offsets protected margins.`,
            `Pricing and portfolio actions sustained GP-to-OP flow-through.`,
          ]
        : [
            `Volume/mix softness is pulling NP ${directionText} plan.`,
            `Cost headwinds (materials, labor, FX) are compressing margins.`,
            `Execution slippage delayed L4 delivery and OP capture.`,
          ];
    const actions =
      delta >= 0
        ? [
            `Lock in pricing and mix gains with targeted account plans.`,
            `Accelerate execution on L4 pipeline to sustain momentum.`,
            `Reinvest selectively in high-return initiatives to protect run-rate.`,
          ]
        : [
            `Prioritize margin recovery levers (pricing, mix, and cost takeout).`,
            `Fast-track late initiatives with highest OP impact.`,
            `Tighten spend control and revisit discretionary programs.`,
          ];
    return {
      summary: `Actual NP is ${formatMn(displayedActual)} Mn ${currencyLabel} vs Budget ${formatMn(
        budget
      )} Mn ${currencyLabel} (${deltaSign}${formatMn(
        Math.abs(delta)
      )} Mn, ${percentSign}${magnitude.toFixed(1)}%).`,
      isGain: delta >= 0,
      drivers,
      actions,
    };
  }, [tableData, selectionMetrics, sectionTitle, isBudgetMode, selectedGroupIds, currencyLabel]);

  const selectedBuLabel = useMemo(() => {
    if (selectedGroupIds.size === 0) {
      const overallRow = tableData.find((row) => isOverallRowId(row.id));
      return overallRow?.name ?? 'Overall';
    }
    const selectedRows = tableData.filter((row) =>
      selectedGroupIds.has(row.id)
    );
    if (selectedRows.length === 0) {
      return 'Overall';
    }
    if (selectedRows.length === 1) {
      return selectedRows[0]?.name ?? 'Overall';
    }
    return `${selectedRows.length} BUs selected`;
  }, [selectedGroupIds, tableData]);

  const selectedBuNames = useMemo(() => {
    if (selectedGroupIds.size === 0) {
      const overallRow = tableData.find((row) => isOverallRowId(row.id));
      return overallRow ? [overallRow.name] : ['Overall'];
    }
    return tableData
      .filter((row) => selectedGroupIds.has(row.id))
      .map((row) => row.name);
  }, [selectedGroupIds, tableData]);

  const selectedBuSuffix = useMemo(() => {
    if (selectedGroupIds.size !== 1) {
      return undefined;
    }
    const [selectedId] = Array.from(selectedGroupIds);
    const unitRow = unitRowsById.get(selectedId);
    return unitRow?.name;
  }, [selectedGroupIds, unitRowsById]);

  const selectedBuTitle = useMemo(() => selectedBuNames.join(', '), [
    selectedBuNames,
  ]);

  const selectedImpactUnits = useMemo(() => {
    const hasOverallSelected =
      selectedGroupIds.size === 0 ||
      Array.from(selectedGroupIds).some((id) => isOverallRowId(id));

    if (selectedBu === 'all') {
      if (hasOverallSelected) {
        return businessGroups.flatMap((group) => group.businessUnits);
      }
      const selectedGroups = businessGroups.filter((group) =>
        selectedGroupIds.has(normalizeGroupId(group.group))
      );
      return selectedGroups.length > 0
        ? selectedGroups.flatMap((group) => group.businessUnits)
        : businessGroups.flatMap((group) => group.businessUnits);
    }

    const selectedGroup = businessGroups.find(
      (group) => normalizeGroupId(group.group) === selectedBu
    );
    if (!selectedGroup) {
      return [];
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    if (hasOverallSelected) {
      return selectedGroup.businessUnits;
    }
    return selectedGroup.businessUnits.filter((unit) =>
      selectedGroupIds.has(getUnitId(groupId, unit.name))
    );
  }, [businessGroups, selectedBu, selectedGroupIds]);

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
  const impactRationaleOptions = useMemo(
    () =>
      Array.from(new Set(opImpactRows.map((row) => row.costRationale))).filter(
        Boolean
      ),
    [opImpactRows]
  );

  // Hardcoded op impact details for HH + D/E Group
  const hhDeGroupOpImpactItems = useMemo(() => [
    {
      id: 1,
      bu: 'D/E group',
      lineItem: 'Revenue',
      costRationale: 'Market-driven',
      item: 'D customer demand volume drops due to US PC market shrink',
      opImpact: -85.0,
      category: 'volume-mix',
    },
    {
      id: 2,
      bu: 'D/E group',
      lineItem: 'Revenue',
      costRationale: 'Market-driven',
      item: 'H customer forecast product portfolio shifts to low price, low margin product series due to market change',
      opImpact: -81.3,
      category: 'volume-mix',
    },
    {
      id: 3,
      bu: 'D/E group',
      lineItem: 'COGS - Manufacturing cost',
      costRationale: 'Self-decision',
      item: 'Inventory write off reversal',
      opImpact: 33.0,
      category: 'one-off',
    },
    {
      id: 4,
      bu: 'D/E group',
      lineItem: 'COGS - Manufacturing cost',
      costRationale: 'Market-driven',
      item: 'Vietnam labor rate drops benefits direct labor cost',
      opImpact: 11.5,
      category: 'headwind-tailwind',
    },
    {
      id: 5,
      bu: 'D/E group',
      lineItem: 'Non-operating gain/loss',
      costRationale: 'Market-driven',
      item: 'Government subsidy of newly issued policy which was not baked in budget',
      opImpact: 49.7,
      category: 'headwind-tailwind',
    },
    {
      id: 6,
      bu: 'D/E group',
      lineItem: 'Non-operating gain/loss',
      costRationale: 'Market-driven',
      item: 'Exchange rate fluctuation between USD and RMB',
      opImpact: 15.3,
      category: 'headwind-tailwind',
    },
    {
      id: 7,
      bu: 'D/E group',
      lineItem: 'COGS - BOM cost',
      costRationale: 'Market-driven',
      item: 'Leakage of manufacturing cost saving initiative resulted by volume drop',
      opImpact: -0.5,
      category: 'leakage',
    },
    {
      id: 8,
      bu: 'D/E group',
      lineItem: 'COGS - Manufacturing cost',
      costRationale: 'Market-driven',
      item: 'Leakage of procurement cost saving initiative resulted by volume drop',
      opImpact: -1.3,
      category: 'leakage',
    },
    {
      id: 9,
      bu: 'D/E group',
      lineItem: 'Non-operating gain/loss',
      costRationale: 'Self-decision',
      item: 'Intergroup (Among Sub-BU) transaction profit offset (and miscellany)',
      opImpact: -0.8,
      category: 'other',
    },
    {
      id: 10,
      bu: 'D/E group',
      lineItem: 'COGS - BOM cost',
      costRationale: 'Self-decision',
      item: 'Supplier penalty claim on material (resin) delayed delivery',
      opImpact: 14.1,
      category: 'one-off',
    },
  ], []);

  // Stage to item IDs mapping for HH + D/E Group
  const stageToItemIdsMap: Record<string, number[]> = {
    'volume-mix': [1, 2],
    'confirmed-volume-mix': [1, 2],
    'headwinds-tailwinds': [4, 5, 6],
    'one-off-items': [3, 10],
    'one-off-adjustments': [9],
    'l4-to-l5-leakage': [7, 8],
  };

  const getOpImpactRowsForStage = useCallback(
    (stage: BudgetForecastStage) => {
      // Check if we're viewing HH + D/E Group for hardcoded data
      const isHHDEGroup = selectedBu === 'hh' && selectedBuNames.includes('D/E Group');

      if (isHHDEGroup) {
        const itemIds = stageToItemIdsMap[stage.stage] || [];
        return hhDeGroupOpImpactItems.filter((item) => itemIds.includes(item.id));
      }

      if (opImpactRows.length === 0) {
        return [];
      }
      const normalized = (value: string) => value.toLowerCase();
      if (stage.stage === 'confirmed-volume-mix') {
        return opImpactRows.filter((row) => {
          const category = normalized(row.category);
          return category.includes('volume') || category.includes('mix');
        });
      }
      if (stage.stage === 'one-off-items' || stage.stage === 'one-off-adjustments') {
        return opImpactRows.filter((row) =>
          normalized(row.category).includes('one-off')
        );
      }
      if (stage.stage === 'headwinds-tailwinds') {
        return opImpactRows.filter((row) => {
          const category = normalized(row.category);
          return category.includes('headwind') || category.includes('tailwind');
        });
      }
      return [];
    },
    [opImpactRows, hhDeGroupOpImpactItems, selectedBu, selectedBuNames]
  );

  const renderOpImpactTooltip = useCallback(
    (stage: BudgetForecastStage) => {
      if (
        stage.stage !== 'one-off-items' &&
        stage.stage !== 'one-off-adjustments' &&
        stage.stage !== 'headwinds-tailwinds'
      ) {
        return null;
      }
      const stageRows = getOpImpactRowsForStage(stage);
      const totalImpact = stageRows.reduce((sum, row) => sum + row.opImpact, 0);
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
          <p className='text-3xl font-semibold text-gray-900'>
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

  const reconciliationBaseStages = useMemo(() => {
    const getStage = (stage: BudgetForecastStage['stage']) =>
      mockBudgetForecastStages.find((item) => item.stage === stage);
    const budgetStage = getStage('budget');
    const actualStage = getStage('actuals');
    const l3Stage = getStage('l3-vs-target');
    const l4Stage = getStage('l4-vs-planned');
    const l5Stage = getStage('l4-to-l5-leakage');

    // Check if we're viewing HH + D/E Group for hardcoded waterfall data
    const isHHDEGroup = selectedBu === 'hh' && selectedBuNames.includes('D/E Group');

    // Hardcoded waterfall values for HH + D/E Group
    if (isHHDEGroup) {
      return [
        {
          ...budgetStage,
          stage: 'budget',
          label: 'Budget',
          value: 271.2,
          delta: 271.2,
          type: 'baseline',
          description: budgetStage?.description ?? 'Budget baseline',
          isClickable: false,
        },
        {
          stage: 'confirmed-volume-mix',
          label: 'Volume / mix change',
          value: 104.9,
          delta: -166.3,
          type: 'negative',
          description: 'Volume and mix change impact',
          isClickable: true,
        },
        {
          stage: 'headwinds-tailwinds',
          label: 'Change in headwind / tailwind',
          value: 181.4,
          delta: 76.5,
          type: 'positive',
          description: 'Headwind / tailwind change impact',
          isClickable: true,
          navigationTarget: '/market-intelligence?focus=headwinds-tailwinds',
        },
        {
          stage: 'one-off-items',
          label: 'One-off items change',
          value: 228.5,
          delta: 47.1,
          type: 'positive',
          description: 'One-off items change impact',
          isClickable: true,
        },
        {
          ...l3Stage,
          stage: 'l3-vs-target',
          label: 'L3 vs. target',
          value: 235.8,
          delta: 7.3,
          type: 'positive',
          description: l3Stage?.description ?? 'L3 initiative performance vs target',
        },
        {
          ...l4Stage,
          stage: 'l4-vs-planned',
          label: 'L4 vs. target',
          value: 234.8,
          delta: -1.0,
          type: 'negative',
          description: l4Stage?.description ?? 'L4 initiative performance vs target',
        },
        {
          ...l5Stage,
          stage: 'l4-to-l5-leakage',
          label: 'L5 vs. target',
          value: 233.0,
          delta: -1.8,
          type: 'negative',
          description: l5Stage?.description ?? 'L5 initiative performance vs target',
        },
        {
          stage: 'one-off-adjustments',
          label: 'Other factors',
          value: 232.2,
          delta: -0.8,
          type: 'negative',
          description: 'Other factors impacting actuals',
          isClickable: false,
        },
        {
          ...actualStage,
          stage: 'actuals',
          label: 'Actual',
          value: 232.2,
          delta: 232.2,
          type: 'baseline',
          description: actualStage?.description ?? 'Actual realized value',
          isClickable: false,
        },
      ] as BudgetForecastStage[];
    }

    const budgetBase = Math.abs(selectionMetrics.selectedOpBaseline);
    const actualBase = Math.abs(selectionMetrics.selectedOpValue);
    const clampDelta = (value: number, maxAbs: number) => {
      if (maxAbs <= 0) {
        return value;
      }
      const magnitude = Math.min(Math.abs(value), maxAbs);
      return Math.sign(value) * magnitude;
    };
    const minAdverse = 0.6;
    const minInitiative = 1.2;
    const volumeMixDelta = -Math.max(Math.abs(opImpactTotals.volumeMix), minAdverse);
    const maxIntermediateCap = Math.max(0.6, actualBase * 0.1);
    const oneOffCap = maxIntermediateCap;
    const headwindCap = Math.max(0.4, budgetBase * 0.08);
    const rawOneOff = clampDelta(opImpactTotals.oneOff, oneOffCap);
    const rawHeadwind = clampDelta(opImpactTotals.headwinds * 0.4, headwindCap);
    const minNonZero = 0.2;
    const oneOffDeltaBase =
      rawOneOff >= 0 && Math.abs(rawOneOff) < oneOffCap * 0.7
        ? -Math.abs(rawOneOff)
        : rawOneOff;
    const headwindDeltaBase =
      rawHeadwind <= 0 && Math.abs(rawHeadwind) < headwindCap * 0.7
        ? Math.abs(rawHeadwind)
        : rawHeadwind;
    const oneOffDelta =
      Math.abs(oneOffDeltaBase) < minNonZero
        ? -minNonZero
        : oneOffDeltaBase;
    const headwindDelta =
      Math.abs(headwindDeltaBase) < minNonZero
        ? minNonZero
        : headwindDeltaBase;
    const otherFactorsDelta = clampDelta(opImpactTotals.leakages, maxIntermediateCap);
    const initiativeBoost = 1.4;
    const l3DeltaBase = Math.max(Math.abs(l3Stage?.delta ?? 0), minInitiative);
    const l4DeltaBase = Math.max(Math.abs(l4Stage?.delta ?? 0), minInitiative);
    const l5DeltaBase = Math.max(Math.abs(l5Stage?.delta ?? 0), minInitiative);
    const l3Delta = l3DeltaBase * initiativeBoost;
    const l4Delta = l4DeltaBase * initiativeBoost;
    const l5Delta = l5DeltaBase * initiativeBoost;

    return [
      {
        ...budgetStage,
        stage: 'budget',
        label: 'Budget',
        type: 'baseline',
        description: budgetStage?.description ?? 'Budget baseline',
        isClickable: false,
      },
      {
        stage: 'confirmed-volume-mix',
        label: 'Volume / mix change',
        value: 0,
        delta: volumeMixDelta,
        type: 'negative',
        description: 'Volume and mix change impact',
        isClickable: true,
      },
      {
        stage: 'headwinds-tailwinds',
        label: 'Change in headwind / tailwind',
        value: 0,
        delta: headwindDelta,
        type: headwindDelta >= 0 ? 'positive' : 'negative',
        description: 'Headwind / tailwind change impact',
        isClickable: true,
        navigationTarget: '/market-intelligence?focus=headwinds-tailwinds',
      },
      {
        stage: 'one-off-items',
        label: 'One-off items change',
        value: 0,
        delta: oneOffDelta,
        type: oneOffDelta >= 0 ? 'positive' : 'negative',
        description: 'One-off items change impact',
        isClickable: true,
      },
      {
        ...l3Stage,
        stage: 'l3-vs-target',
        label: 'L3 vs. budget',
        delta: l3Delta,
        type: 'positive',
        description: l3Stage?.description ?? 'L3 initiative performance vs budget',
      },
      {
        ...l4Stage,
        stage: 'l4-vs-planned',
        label: 'L4 vs. L3',
        delta: l4Delta,
        type: 'positive',
        description: l4Stage?.description ?? 'L4 initiative performance vs L3',
      },
      {
        ...l5Stage,
        stage: 'l4-to-l5-leakage',
        label: 'L5 vs. L4 implemented',
        delta: l5Delta,
        type: 'positive',
        description:
          l5Stage?.description ?? 'L5 initiative performance vs L4 implemented',
        isClickable: true,
      },
      {
        stage: 'one-off-adjustments',
        label: 'Other factors',
        value: 0,
        delta: otherFactorsDelta,
        type: otherFactorsDelta >= 0 ? 'positive' : 'negative',
        description: 'Other factors impacting actuals',
        isClickable: true,
      },
      {
        ...actualStage,
        stage: 'actuals',
        label: 'Actual',
        type: 'baseline',
        description: actualStage?.description ?? 'Actual realized value',
        isClickable: false,
      },
    ] as BudgetForecastStage[];
  }, [opImpactTotals, selectionMetrics.selectedOpBaseline, selectedBu, selectedBuNames]);

  const buildScaledWaterfallStages = (): BudgetForecastStage[] => {
    // For HH + D/E Group, return hardcoded stages without any scaling/adjustment
    const isHHDEGroup = selectedBu === 'hh' && selectedBuNames.includes('D/E Group');
    if (isHHDEGroup) {
      return reconciliationBaseStages;
    }

    const budgetValue = selectionMetrics.selectedOpBaseline;
    const actualValue = selectionMetrics.selectedOpValue;
    const baseBudgetValue =
      reconciliationBaseStages.find((stage) => stage.stage === 'budget')?.value ??
      0;
    const scaleFactor =
      baseBudgetValue === 0 ? 1 : budgetValue / baseBudgetValue;

    let runningValue = roundToOne(budgetValue);
    const totalChange = roundToOne(actualValue - budgetValue);
    const baseStages = reconciliationBaseStages.map((stage) => {
      const isBaselineStage = stage.type === 'baseline';
      const isBudgetStage = stage.stage === 'budget';
      const isActualStage = stage.stage === 'actuals';

      if (isBudgetStage) {
        runningValue = roundToOne(budgetValue);
        return {
          ...stage,
          value: runningValue,
          delta: runningValue,
          isClickable: true,
        };
      }

      if (isActualStage) {
        runningValue = roundToOne(actualValue);
        return {
          ...stage,
          value: runningValue,
          delta: runningValue,
          isClickable: true,
        };
      }

      if (isBaselineStage) {
        return {
          ...stage,
          value: runningValue,
          delta: runningValue,
          isClickable: true,
        };
      }

      const scaledDelta =
        stage.delta === undefined
          ? undefined
          : roundToOne(stage.delta * scaleFactor);

      return {
        ...stage,
        value: runningValue,
        delta: scaledDelta,
        isClickable: true,
      };
    });

    const adjustableStages = baseStages.filter(
      (stage) =>
        stage.type !== 'baseline' &&
        stage.stage !== 'budget' &&
        stage.stage !== 'actuals'
    );
    if (adjustableStages.length === 0) {
      return baseStages;
    }

    const minDelta = Math.max(0.6, Math.abs(totalChange) * 0.08);
    const maxIntermediate = Math.max(0.6, Math.abs(actualValue) * 0.1);
    let adjustedSum = 0;
    const adjustedMap = new Map<string, number>();
    adjustableStages.forEach((stage, index) => {
      const raw = stage.delta ?? 0;
      let boosted =
        raw === 0 ? 0 : Math.sign(raw) * Math.max(Math.abs(raw), minDelta);
      if (
        stage.stage === 'one-off-items' ||
        stage.stage === 'one-off-adjustments'
      ) {
        const magnitude = Math.min(Math.abs(boosted), maxIntermediate);
        boosted = Math.sign(boosted || 1) * magnitude;
      }
      adjustedMap.set(stage.stage, boosted);
      if (index < adjustableStages.length - 1) {
        adjustedSum += boosted;
      }
    });
    const lastStage = adjustableStages[adjustableStages.length - 1];
    const balancedDelta = roundToOne(totalChange - adjustedSum);
    adjustedMap.set(lastStage.stage, balancedDelta);
    if (
      lastStage.stage === 'one-off-items' ||
      lastStage.stage === 'one-off-adjustments'
    ) {
      const cappedMagnitude = Math.min(Math.abs(balancedDelta), maxIntermediate);
      const cappedDelta = Math.sign(balancedDelta || 1) * cappedMagnitude;
      const remainder = roundToOne(balancedDelta - cappedDelta);
      adjustedMap.set(lastStage.stage, cappedDelta);
      if (remainder !== 0) {
        const fallbackStage = adjustableStages.find(
          (stage) =>
            stage.stage !== lastStage.stage &&
            stage.stage !== 'one-off-items' &&
            stage.stage !== 'one-off-adjustments'
        );
        if (fallbackStage) {
          const current = adjustedMap.get(fallbackStage.stage) ?? 0;
          adjustedMap.set(fallbackStage.stage, roundToOne(current + remainder));
        }
      }
    }

    runningValue = roundToOne(budgetValue);
    return baseStages.map((stage) => {
      if (stage.type === 'baseline' || stage.stage === 'budget') {
        runningValue = roundToOne(budgetValue);
        return stage;
      }
      if (stage.stage === 'actuals') {
        runningValue = roundToOne(actualValue);
        return {
          ...stage,
          value: runningValue,
          delta: runningValue,
        };
      }
      const delta = adjustedMap.get(stage.stage) ?? stage.delta ?? 0;
      const resolvedType = delta >= 0 ? 'positive' : 'negative';
      runningValue = roundToOne(runningValue + delta);
      return {
        ...stage,
        value: runningValue,
        delta,
        type: resolvedType,
      };
    });

  };

  const performanceWaterfallStages = useMemo(
    () =>
      buildScaledWaterfallStages().filter((stage) => stage.stage !== 'forecast'),
    [selectionMetrics.selectedOpBaseline, selectionMetrics.selectedOpValue, selectedBu, selectedBuNames, reconciliationBaseStages]
  );

  const budgetWaterfallStages = useMemo(() => {
    // budgetValue = 2025 OP (starting point)
    // actualValue = Current Year OP Target (ending point)
    const budgetValue = selectionMetrics.selectedOpBaseline;
    const actualValue = selectionMetrics.selectedOpValue;

    const volumeMixDelta = roundToOne(opImpactTotals.volumeMix);
    const headwindsDelta = roundToOne(opImpactTotals.headwinds);
    const oneOffDelta = roundToOne(opImpactTotals.oneOff);
    const plannedLeakagesDelta = roundToOne(opImpactTotals.leakages);

    const afterVolumeMix = roundToOne(budgetValue + volumeMixDelta);
    const afterHeadwinds = roundToOne(afterVolumeMix + headwindsDelta);
    const afterOneOff = roundToOne(afterHeadwinds + oneOffDelta);
    const preImprovementOp = afterOneOff;

    const carryOverDelta = roundToOne(
      actualValue - preImprovementOp - plannedLeakagesDelta
    );
    const afterCarryOver = roundToOne(preImprovementOp + carryOverDelta);
    const budgetTarget = roundToOne(
      preImprovementOp + carryOverDelta + plannedLeakagesDelta
    );

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
        '2025 OP',
        roundToOne(budgetValue),
        roundToOne(budgetValue),
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
  }, [
    opImpactTotals,
    selectionMetrics.selectedOpBaseline,
    selectionMetrics.selectedOpValue,
  ]);

  const activeDeviationDetails = useMemo(() => {
    if (!activeDeviationStage) {
      return null;
    }

    if (activeDeviationStage.stage === 'ideation') {
      return {
        type: 'ideation' as const,
        totalImpact: activeDeviationStage.delta ?? 0,
        table: {
          headers: [
            'Target',
            'Owner',
            'Topline',
            'PAC - GTK',
            'PAC - non-GTK',
            'MFG',
            'OPEX - R&D',
            'OPEX - non-R&D',
            'Central OPEX',
          ],
          subHeaders: [
            '',
            'Owner',
            'PM/Sales',
            'Sales head',
            'Procurement head',
            'BU head',
            'R&D head',
            'BU head',
            'Central function head',
          ],
          rows: [
            {
              group: 'CONN',
              owner: 'EMS',
              values: [10, '-', 12, 15, 3, 0, 1],
            },
            {
              group: '',
              owner: 'IDS',
              values: [29, 1, 23, 24, 10, 1, 1],
            },
            {
              group: '',
              owner: 'FMC',
              values: ['-', 0, 1, 2, 3, 0, 0],
            },
            {
              group: '',
              owner: 'A SBUs',
              values: ['-', 7, 2, 7, 6, 0, 1],
            },
            {
              group: 'Conn total',
              owner: '',
              values: [39, 8, 39, 49, 22, 2, 3],
              isTotal: true,
            },
            {
              group: 'Cable',
              owner: 'TSC',
              values: [17, 3, 4, 4, 1, 0, 0],
            },
            {
              group: '',
              owner: 'APS',
              values: ['-', 1, 10, 3, 1, 0, 0],
            },
            {
              group: '',
              owner: 'A SBUs',
              values: ['-', 27, 12, 12, 1, 0, 1],
            },
            {
              group: 'Cable total',
              owner: '',
              values: [17, 31, 26, 18, 2, 0, 1],
              isTotal: true,
            },
          ],
        },
      };
    }

    const isOpImpactStage = [
      'one-off-adjustments',
      'one-off-items',
      'headwinds-tailwinds',
      'confirmed-volume-mix',
      'volume-mix',
      'market-performance',
      'l4-to-l5-leakage',
    ].includes(activeDeviationStage.stage);

    if (isOpImpactStage) {
      const rows = getOpImpactRowsForStage(activeDeviationStage);
      const normalizedSearch = impactSearch.trim().toLowerCase();
      const filteredRows = rows.filter((row) => {
        if (impactRationaleFilter !== 'all' && row.costRationale !== impactRationaleFilter) {
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

      // For HH + D/E Group, use the hardcoded delta value and scale rows to match
      const isHHDEGroup = selectedBu === 'hh' && selectedBuNames.includes('D/E Group');
      const totalImpact = isHHDEGroup
        ? (activeDeviationStage.delta ?? 0)
        : rows.reduce((sum, row) => sum + row.opImpact, 0);

      // Scale rows proportionally if using hardcoded values for HH + D/E Group
      let adjustedRows = filteredRows;
      if (isHHDEGroup && rows.length > 0) {
        const originalSum = rows.reduce((sum, row) => sum + row.opImpact, 0);
        const scaleFactor = originalSum !== 0 ? totalImpact / originalSum : 1;
        adjustedRows = filteredRows.map((row) => ({
          ...row,
          opImpact: roundToOne(row.opImpact * scaleFactor),
        }));
      }

      const sortedRows = [...adjustedRows].sort(
        (a, b) => Math.abs(b.opImpact) - Math.abs(a.opImpact)
      );

      return {
        type: 'op-impact' as const,
        totalImpact,
        rows: sortedRows,
      };
    }

    const driversByStage: Record<string, string[]> = {
      'market-performance': [
        'Customer H total shipment increase by 2% vs FY shipment forecast budgeted',
        'Customer D increased shipment of Gaming Series X by 5%, which has 3p.p. higher GP margin',
      ],
      'l3-vs-target': [
        'Initiative ramp',
        'Execution cadence',
        'Delivery timing',
      ],
      'l4-vs-planned': ['Implemented waves', 'Ramp efficiency', 'Realized savings'],
      'one-off-adjustments': [
        'Restructuring items',
        'Non-recurring costs',
        'Scrap',
      ],
      'l4-to-l5-leakage': [
        'FX rate VND vs. USD causing favorable impact',
        'Labor rate in India increased causing adverse impact',
      ],
      'forecast': ['Pipeline realized', 'Transformation impact', 'Execution risk'],
      'ideation': ['Idea intake', 'Screening impact', 'Pilot outcomes'],
      'actuals': ['Target setting', 'Portfolio goals', 'Market outlook'],
    };

    const drivers =
      driversByStage[activeDeviationStage.stage] ?? [
        'Operational mix',
        'Customer timing',
        'Other factors',
      ];
    const totalImpact = activeDeviationStage.delta ?? 0;
    const buLabel =
      selectedBuNames.length > 0 ? selectedBuNames[0] : 'Overall';
    
    // Special handling for "Other factors" (l4-to-l5-leakage) stage
    // Two rows: FX rate (favorable/positive) and Labor rate (adverse/negative) summing to totalImpact
    const rows =
      activeDeviationStage.stage === 'l4-to-l5-leakage'
        ? (() => {
            // Calculate impacts that sum to total
            // FX rate is favorable (positive value), Labor rate is adverse (negative value)
            // If total is -4: FX = +1.5 (favorable), Labor = -5.5 (adverse), sum = -4
            const absTotalImpact = Math.abs(totalImpact);
            const fxImpact = roundToOne(absTotalImpact * 0.4); // Favorable (positive)
            const laborImpact = roundToOne(totalImpact - fxImpact); // Adverse (negative, makes sum work)
            return [
              {
                bu: buLabel,
                driver: drivers[0], // FX rate VND vs. USD causing favorable impact
                impact: fxImpact,
              },
              {
                bu: buLabel,
                driver: drivers[1], // Labor rate in India increased causing adverse impact
                impact: laborImpact,
              },
            ];
          })()
        : activeDeviationStage.stage === 'market-performance'
        ? [
            {
              bu: buLabel,
              driver: drivers[0],
              impact: 3.4,
            },
            {
              bu: buLabel,
              driver: drivers[1],
              impact: 2.3,
            },
          ]
        : (selectedBuNames.length > 0 ? selectedBuNames : ['Overall']).map(
            (name, index) => ({
              bu: name,
              driver: drivers[index % drivers.length],
              impact: roundToOne(
                totalImpact / Math.max(1, selectedBuNames.length) +
                  (index - 1) * 0.2
              ),
            })
          );

    return {
      type: 'default' as const,
      rows,
      totalImpact:
        activeDeviationStage.stage === 'market-performance'
          ? 5.7
          : totalImpact,
    };
  }, [
    activeDeviationStage,
    getOpImpactRowsForStage,
    impactRationaleFilter,
    impactSearch,
    selectedBu,
    selectedBuNames,
    selectedTimeframe,
  ]);


  const renderMetricCell = (
    metric: BusinessGroupMetricWithTrend,
    groupName: string,
    metricName: string,
    isLast: boolean = false,
    revenueMetric?: BusinessGroupMetricWithTrend,
    forceAbsoluteView: boolean = false
  ) => {
    const isPercentView = financialView === 'margin';
    const usePercentView = isPercentView && !forceAbsoluteView;
    const displayValue = isBudgetMode ? metric.baseline : metric.value;
    const displayRevenue = revenueMetric
      ? isBudgetMode
        ? revenueMetric.baseline
        : revenueMetric.value
      : 0;
    const baselineRevenue = revenueMetric?.baseline ?? 0;
    const lastYearRevenue = revenueMetric?.stly ?? 0;
    const calcMargin = (value: number, revenue: number) =>
      revenue === 0 ? 0 : (value / revenue) * 100;
    const displayMargin = calcMargin(displayValue, displayRevenue);
    const baselineMargin = calcMargin(metric.baseline, baselineRevenue);
    const lastYearMargin = calcMargin(metric.stly, lastYearRevenue);
    const budgetPercent = usePercentView
      ? displayMargin - baselineMargin  // Percentage point delta
      : calcPercent(metric.value, metric.baseline);
    const lastYearPercent = usePercentView
      ? displayMargin - lastYearMargin  // Percentage point delta
      : calcPercent(metric.value, metric.stly);
    const primaryPercent = isBudgetMode ? lastYearPercent : budgetPercent;
    const formatCellValue = (value: number) =>
      usePercentView ? `${value.toFixed(1)}%` : formatMnValue(value);
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
        className={`px-4 py-3 border-b border-gray-200 ${
          !isLast ? 'border-r' : ''
        } relative group`}>
        <div className='flex items-center justify-center gap-4'>
          <div className='text-left'>
            <div className='text-base font-bold text-gray-900'>
              {formatCellValue(comparisonValue)}
            </div>
          </div>
          <div className='text-center'>
            {!isBudgetMode && (
              <div className='text-xs text-gray-500 mb-0.5'>
                vs budget {formatCellValue(comparisonBaseline)}
              </div>
            )}
            <div className='text-xs text-gray-500'>
              vs Last Year {formatCellValue(comparisonLastYear)}
            </div>
          </div>
          <div className='flex flex-col gap-0.5'>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${percentColor}`}>
              {percentSign}
              {primaryPercent.toFixed(1)}%
            </span>
            {!isBudgetMode && (
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

  const navigateToFunctionPerformance = useCallback(
    (functionId: string) => {
      const params = new URLSearchParams();

      const hasTableSelections =
        selectedGroupIds.size > 0 &&
        !Array.from(selectedGroupIds).every((id) => isOverallRowId(id));

      if (hasTableSelections) {
        const selectedIds = Array.from(selectedGroupIds).filter(
          (id) => !isOverallRowId(id)
        );
        const bgIds = selectedIds.filter((id) => !unitRowsById.has(id));
        const buIds = selectedIds.filter((id) => unitRowsById.has(id));

        const bgNames = bgIds
          .map((id) => tableData.find((row) => row.id === id)?.name)
          .filter((name): name is string => Boolean(name));

        const buNames = buIds
          .map((id) => unitRowsById.get(id)?.name)
          .filter((name): name is string => Boolean(name));

        if (bgNames.length > 0) {
          params.set('bg', bgNames.join(','));
        } else if (selectedBu !== 'all') {
          const directMatch = mainBuOptions.find((option) => option.id === selectedBu);
          if (directMatch) {
            params.set('bg', directMatch.name);
          }
        } else {
          params.set('bg', 'all');
        }

        if (buNames.length > 0) {
          params.set('bu', buNames.join(','));
        }
      } else if (selectedBu === 'all') {
        params.set('bg', 'all');
      } else {
        const resolvedBgName = (() => {
          const directMatch = mainBuOptions.find((option) => option.id === selectedBu);
          if (directMatch) {
            return directMatch.name;
          }
          const matchedGroup = businessGroups.find((group) => {
            const groupId = normalizeGroupId(group.group);
            return group.businessUnits.some(
              (unit) => getUnitId(groupId, unit.name) === selectedBu
            );
          });
          return matchedGroup?.group ?? sectionTitle;
        })();
        params.set('bg', resolvedBgName);
      }

      navigate(
        `/business-unit-performance/functional-performance/${functionId}?${params.toString()}`
      );
    },
    [
      businessGroups,
      mainBuOptions,
      navigate,
      sectionTitle,
      selectedBu,
      selectedGroupIds,
      tableData,
      unitRowsById,
    ]
  );

  const normalizePnlLineItem = (lineItem: string) =>
    lineItem.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const pnlFunctionByLineItem: Record<string, string> = {
    controllable: 'procurement',
    mva: 'mva',
    'r-d': 'rd',
  };

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
    { label: 'Operating Profit' },
    { label: '(Line items between OP and net)' },
  ] as const;

  const pnlFullYearScale = useMemo(() => {
    if (selectedTimeframe !== 'full-year') {
      return 1;
    }
    return (monthRange[1] - monthRange[0] + 1) / 12;
  }, [monthRange, selectedTimeframe]);

  const renderPnlRows = useCallback(
    (rows: PnlBreakdownRow[], showUnit: boolean = true) => {
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
        isGroup: boolean,
        parentLabel?: string
      ) => {
        const functionId =
          pnlFunctionByLineItem[normalizePnlLineItem(row.lineItem)];
        const normalizedParent = parentLabel?.trim().toLowerCase();
        const isRevenueControllable =
          normalizedParent === 'revenue' &&
          normalizePnlLineItem(row.lineItem) === 'controllable';
        const showDrilldown = Boolean(functionId) && !isRevenueControllable;
        const isTopLevel = level === 0;
        return (
          <tr
            key={`${row.unit}-${row.lineItem}-${index}`}
            className={`border-b border-gray-200 last:border-b-0 ${
              showDrilldown ? 'hover:bg-indigo-50/60 transition-colors cursor-pointer' : ''
            }`}
            onDoubleClick={
              showDrilldown && functionId
                ? () => navigateToFunctionPerformance(functionId)
                : undefined
            }
            title={
              showDrilldown ? 'Double click to drill down' : undefined
            }>
            <td className='px-4 py-3 text-gray-600'>
              {showUnit ? row.unit : ''}
            </td>
            <td className='px-4 py-3 text-gray-600'>
              <span
                className={
                  isGroup || isTopLevel
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-700'
                }
                style={{ paddingLeft: `${level * 16}px` }}>
                {row.lineItem}
              </span>
            </td>
            <td className='px-4 py-3 text-right text-gray-700'>
              {formatPnlValue(row.ytmActual)}
            </td>
            <td className='px-4 py-3 text-right text-gray-700'>
              {formatPnlValue(row.ytmBudget)}
            </td>
            <td className='px-4 py-3 text-right text-gray-700'>
              {formatPnlValue((row.ytmActual ?? 0) - (row.ytmBudget ?? 0))}
            </td>
            <td className='px-4 py-3 text-right'>
              {showDrilldown && functionId ? (
                <button
                  type='button'
                  onClick={(event) => {
                    event.stopPropagation();
                    navigateToFunctionPerformance(functionId);
                  }}
                  className='text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline'>
                  View details
                </button>
              ) : null}
            </td>
          </tr>
        );
      };

      const renderLabelRow = (label: string, level: number) => (
        <tr
          key={`label-${label}-${level}`}
          className='border-b border-gray-200 last:border-b-0'>
          <td className='px-4 py-3 text-gray-600' />
          <td className='px-4 py-3 text-gray-600'>
            <span
              className='font-semibold text-gray-900'
              style={{ paddingLeft: `${level * 16}px` }}>
              {label}
            </span>
          </td>
          <td className='px-4 py-3 text-right text-gray-400'>—</td>
          <td className='px-4 py-3 text-right text-gray-400'>—</td>
          <td className='px-4 py-3 text-right text-gray-400'>—</td>
          <td className='px-4 py-3 text-right text-gray-400'>—</td>
        </tr>
      );

      const renderNode = (
        node: {
          label: string;
          children?: readonly (
            | string
            | { label: string; children?: readonly string[] }
          )[];
        },
        level: number
      ): React.ReactNode[] => {
        const rowMatch = getNextRow(node.label);
        const items: React.ReactNode[] = [];
        if (rowMatch) {
          items.push(
            renderValueRow(rowMatch.row, rowMatch.index, level, true, undefined)
          );
        } else if (node.children && node.children.length > 0) {
          items.push(renderLabelRow(node.label, level));
        }
        (node.children ?? []).forEach((child) => {
          if (typeof child === 'string') {
            const childMatch = getNextRow(child);
            if (childMatch) {
              items.push(
                renderValueRow(
                  childMatch.row,
                  childMatch.index,
                  level + 1,
                  false,
                  node.label
                )
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
    [
      formatPnlValue,
      navigateToFunctionPerformance,
      pnlFullYearScale,
      selectedTimeframe,
    ]
  );

  const renderTableRow = (
    group: BusinessGroupData,
    isExpandable: boolean = false,
    isSubGroup: boolean = false,
    isOverallRow: boolean = false
  ) => {
    const isExpanded = expandedRows.has(group.id);
    const isClickable = isExpandable || isSubGroup;
    const canOpenPnl = isExpandable && !isOverallRow && !isSubGroup;

    const handleRowClick = () => {
      console.log('Row clicked:', {
        groupId: group.id,
        groupName: group.name,
        selectedBu,
        isExpandable,
        isOverallRow,
        isSubGroup
      });

      // Don't do anything for overall rows
      if (isOverallRow) {
        return;
      }

      // When clicking on a top-level business group row (when viewing all BGs),
      // navigate to that specific BG
      if (selectedBu === 'all' && isExpandable) {
        console.log('Navigating to BG:', group.id);
        setSelectedBu(group.id);
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set('bg', group.id);
          next.set('timeframe', selectedTimeframe);
          next.delete('toggle');
          next.set('months', `${monthRange[0]}-${monthRange[1]}`);
          next.set('view', financialView);
          next.delete('bu');
          next.delete('units');
          next.delete('selected');
          console.log('New URL params:', next.toString());
          return next;
        });
        setExpandedRows(new Set());
        return;
      }

      // For sub-group (business unit) rows or any other clickable rows,
      // update the selection and URL params
      const newSelectedIds = new Set(selectedGroupIds);

      if (newSelectedIds.has(group.id)) {
        newSelectedIds.delete(group.id);
      } else {
        newSelectedIds.add(group.id);
      }

      setSelectedGroupIds(newSelectedIds);

      // Update URL params with the selection
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);

        // If we have selections, add them to URL
        if (newSelectedIds.size > 0) {
          const selectedArray = Array.from(newSelectedIds);
          next.set('selected', selectedArray.join(','));
        } else {
          next.delete('selected');
        }

        next.set('timeframe', selectedTimeframe);
        next.set('months', `${monthRange[0]}-${monthRange[1]}`);
        next.set('view', financialView);

        console.log('Updated selection URL params:', next.toString());
        return next;
      });
    };
    const handlePnlOpen = (event: React.MouseEvent<HTMLTableRowElement>) => {
      event.stopPropagation();
      if (rowClickTimeoutRef.current !== null) {
        window.clearTimeout(rowClickTimeoutRef.current);
        rowClickTimeoutRef.current = null;
      }
      const groupKey = resolvePnlGroupKey(group.name);
      if (groupKey) {
        setActivePnlGroup(groupKey);
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
            : 'hover:bg-indigo-50/60 transition-colors'
        } ${isClickable ? 'cursor-pointer' : ''}`}
        onClick={isClickable ? handleRowClick : undefined}
        onDoubleClick={canOpenPnl ? handlePnlOpen : undefined}
        title={
          canOpenPnl ? 'Double click to view P&L breakdown' : undefined
        }>
        <td className='px-6 py-3 border-b border-r border-gray-200'>
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              checked={selectedGroupIds.has(group.id)}
              onChange={(e) => {
                e.stopPropagation();
                toggleGroupSelection(group.id);
              }}
              onClick={(event) => event.stopPropagation()}
              className='h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500'
              aria-label={`Select ${group.name}`}
            />
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
        {renderMetricCell(group.rev, group.name, 'Revenue', false, undefined, true)}
        {renderMetricCell(
          group.gp,
          group.name,
          isPercentView ? 'Gross Profit Margin' : 'Gross Profit',
          false,
          group.rev
        )}
        {renderMetricCell(
          group.op,
          group.name,
          isPercentView ? 'Operating Profit Margin' : 'Operating Profit',
          false,
          group.rev
        )}
        {renderMetricCell(
          group.np,
          group.name,
          isPercentView ? 'Net Profit Margin' : 'Net Profit',
          true,
          group.rev
        )}
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
            {`Actual (Reconciliation) - ${sectionTitle}${
              selectedBuSuffix ? ` - ${selectedBuSuffix}` : ''
            }`}
          </h1>
        </div>
      </div>

      {/* Filters Section */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-[1920px] mx-auto px-8 py-6'>
          <HeaderFilters
            timeframeContent={
              <div className='flex flex-col gap-3'>
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
                      const isDisabled = option.id === 'full-year';
                      const isSelected = selectedTimeframe === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={isDisabled ? undefined : () => handleTimeframeChange(option.id)}
                          disabled={isDisabled}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            isSelected
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          } ${
                            isDisabled
                              ? 'cursor-not-allowed opacity-40 pointer-events-none bg-gray-50'
                              : ''
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
                      const isDisabled = selectedTimeframe === 'ytm';
                      return (
                        <button
                          key={month}
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
                      onClick={() => handleTimeframeChange(selectedTimeframe === 'ytm' ? 'ytm' : 'full-year')}
                      className='text-xs text-gray-500 hover:text-gray-700 underline'>
                      Reset timeframe
                    </button>
                  )}
                </div>
              </div>
            }
            buOptions={mainBuOptions}
            selectedBu={selectedBu}
            onBuChange={handleBuChange}
          />
          {selectedBu !== 'all' && (
            <div className='mt-4 flex items-center gap-4'>
              <span className='text-sm font-medium text-gray-600 w-32'>
                Select BU
              </span>
              <div className='flex flex-wrap bg-gray-100 rounded-lg p-1'>
                {(() => {
                  const selectedGroup = businessGroups.find(
                    (group) => normalizeGroupId(group.group) === selectedBu
                  );
                  if (!selectedGroup) {
                    return null;
                  }
                  const groupId = normalizeGroupId(selectedGroup.group);
                  const overallId = `${groupId}-overall`;
                  const isAllSelected = selectedGroupIds.has(overallId);

                  const toggleUnit = (unitId: string | 'all') => {
                    setSelectedGroupIds((prev) => {
                      const next = new Set(prev);
                      if (unitId === 'all') {
                        next.clear();
                        next.add(overallId);
                        setSearchParams((prevParams) => {
                          const params = new URLSearchParams(prevParams);
                          params.delete('bu');
                          params.delete('units');
                          return params;
                        });
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
                      setSearchParams((prevParams) => {
                        const params = new URLSearchParams(prevParams);
                        const selectedUnitIds = Array.from(next).filter(
                          (id) => id !== overallId
                        );
                        if (selectedUnitIds.length === 0) {
                          params.delete('bu');
                          params.delete('units');
                          return params;
                        }
                        const unitNames = selectedGroup.businessUnits
                          .filter((unit) =>
                            selectedUnitIds.includes(
                              getUnitId(groupId, unit.name)
                            )
                          )
                          .map((unit) => unit.name);
                        if (unitNames.length === 0) {
                          params.delete('bu');
                          params.delete('units');
                          return params;
                        }
                        if (params.get('bg')) {
                          params.set('bu', unitNames.join(','));
                          params.delete('units');
                        } else {
                          params.set('units', unitNames.join(','));
                          params.delete('bu');
                        }
                        return params;
                      });
                      return next;
                    });
                  };

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
        </div>
      </div>

      {/* Key Call Out Section */}
      <div className='max-w-[1920px] mx-auto px-8 pt-6'>
        <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900'>Key Call Out</h2>
            <span className='px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border-2 border-purple-400 shadow-md shadow-purple-200/50 flex items-center gap-1.5'>
              <span className='text-sm'>✨</span>
              <span>AI</span>
            </span>
          </div>
          <div className='space-y-4'>
            <p className='text-sm text-gray-700'>{keyCallOut.summary}</p>
            <div>
              <p className='text-sm font-semibold text-gray-900 mb-2'>
                Key drivers for P&amp;L {keyCallOut.isGain ? 'gain' : 'loss'}
              </p>
              <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
                {keyCallOut.drivers.map((point, index) => (
                  <li
                    key={index}
                    className='text-sm'>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className='pt-3 border-t border-gray-200'>
              <p className='text-sm font-semibold text-gray-900 mb-2'>
                Suggested actions
              </p>
              <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
                {keyCallOut.actions.map((point, index) => (
                  <li
                    key={index}
                    className='text-sm'>
                    {point}
                  </li>
                ))}
              </ul>
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
                  <h2 className='text-2xl font-bold text-gray-900'>
                    Financial actuals by BU - {sectionTitle}
                  </h2>
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
                      onClick={() => {
                        const nextView = isPercentView ? 'absolute' : 'margin';
                        setFinancialView(nextView);
                        setSearchParams((prev) => {
                          const next = new URLSearchParams(prev);
                          next.set('view', nextView);
                          return next;
                        });
                      }}
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
                </div>
              </div>
              <p className='text-sm text-gray-600 mt-1'>
                {isPercentView ? '% of revenue' : `Mn, ${currencyLabel}`}
              </p>
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
        {selectedTimeframe === 'budget' ? (
          <BudgetPerformanceWaterfall
            stages={budgetWaterfallStages}
            title='Budget waterfall by value driver'
            subtitle={
              <span className='inline-flex items-center gap-1.5 text-sm text-gray-500'>
                <span>Operating Profit, Mn {currencyLabel} • {selectedBuLabel}</span>
                {selectedBuNames.length > 1 && (
                  <span className='relative group inline-flex items-center'>
                    <InformationCircleIcon className='w-4 h-4 text-gray-400 group-hover:text-gray-600' />
                    <span className='absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600 shadow-lg opacity-0 transition-opacity group-hover:opacity-100'>
                      <span className='block text-xs font-semibold text-gray-700 mb-2'>
                        Selected BUs
                      </span>
                      <ul className='space-y-1'>
                        {selectedBuNames.map((name) => (
                          <li
                            key={name}
                            className='flex items-center gap-2'>
                            <span className='h-1.5 w-1.5 rounded-full bg-primary-500' />
                            <span>{name}</span>
                          </li>
                        ))}
                      </ul>
                    </span>
                  </span>
                )}
              </span>
            }
            onStageClick={(stage: BudgetForecastStage) => {
              if (
                stage.stage === 'ideation' ||
                stage.stage === 'one-off-adjustments' ||
                stage.stage === 'market-performance'
              ) {
                setActiveDeviationStage(stage);
              }
            }}
            tooltipContent={renderOpImpactTooltip}
          />
        ) : (
          <BusinessGroupPerformanceWaterfall
            stages={performanceWaterfallStages}
            title={`Performance deviation waterfall - ${sectionTitle} - ${selectedBuTitle}`}
            subtitle={
              <span className='inline-flex items-center gap-1.5 text-sm text-gray-500'>
                <span>Operating Profit, Mn {currencyLabel} • {selectedBuLabel}</span>
                {selectedBuNames.length > 1 && (
                  <span className='relative group inline-flex items-center'>
                    <InformationCircleIcon className='w-4 h-4 text-gray-400 group-hover:text-gray-600' />
                    <span className='absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600 shadow-lg opacity-0 transition-opacity group-hover:opacity-100'>
                      <span className='block text-xs font-semibold text-gray-700 mb-2'>
                        Selected BUs
                      </span>
                      <ul className='space-y-1'>
                        {selectedBuNames.map((name) => (
                          <li
                            key={name}
                            className='flex items-center gap-2'>
                            <span className='h-1.5 w-1.5 rounded-full bg-primary-500' />
                            <span>{name}</span>
                          </li>
                        ))}
                      </ul>
                    </span>
                  </span>
                )}
              </span>
            }
            brokenAxis="auto"
            labelDefinitions={{
              'volume-mix': 'Sales volume / mix change (RFQ won / loss)',
              'confirmed-volume-mix': 'Sales volume / mix change (RFQ won / loss)',
              'headwinds-tailwinds': 'Market headwind / tailwind (FX change, labor rate changes, R&D pressure due to CPU refresh)',
              'one-off-items': 'Unexpected (not in budget) one-off items (one-time investments, known claims)',
              'l3-vs-target': 'Pipeline planning gap',
              'l4-vs-planned': 'Pipeline execution gap',
              'l4-to-l5-leakage': 'Pipeline impact realization gap',
              'one-off-adjustments': 'Other miscellaneous',
            }}
            onStageClick={(stage: BudgetForecastStage) => {
              const selectedUnitNames = Array.from(selectedGroupIds)
                .map((id) => unitRowsById.get(id)?.name)
                .filter((name): name is string => Boolean(name));
              const unitParam = selectedUnitNames.length
                ? `&bu=${encodeURIComponent(selectedUnitNames.join(','))}`
                : '';
              if (stage.stage === 'l3-vs-target') {
                navigate(
                  `/initiative-performance?bg=${selectedBu}&timeframe=ytm${unitParam}`
                );
                return;
              }
              if (stage.stage === 'l4-vs-planned') {
                navigate(
                  `/actual-initiative-implementation?bg=${selectedBu}&timeframe=ytm${unitParam}`
                );
                return;
              }
              setActiveDeviationStage(stage);
            }}
          />
        )}
      </div>

      {selectedPnlUnitNames.length > 0 && (
        <div className='max-w-[1920px] mx-auto px-8 pb-12'>
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 overflow-hidden'>
            <div className='px-6 py-5 border-b border-gray-200'>
              <div>
                <p className='text-xs uppercase tracking-widest text-gray-400 font-semibold'>
                  BU P&amp;L breakdown
                </p>
                <h3 className='text-xl font-bold text-gray-900'>{pnlTitle}</h3>
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
                      YTM Actual
                    </th>
                    <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                      YTM Budget
                    </th>
                    <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                      Deviation
                    </th>
                    <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPnlRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className='px-4 py-6 text-center text-sm text-gray-500'>
                        No P&amp;L breakdown available.
                      </td>
                    </tr>
                  ) : groupedPnlRows.size <= 1 ? (
                    renderPnlRows(selectedPnlRows, showPnlUnitColumn)
                  ) : (
                    Array.from(groupedPnlRows.entries()).map(([unit, rows]) => (
                      <Fragment key={unit}>
                        <tr className='bg-gray-50'>
                          <td
                            className='px-4 py-2 font-semibold text-gray-900'
                            colSpan={6}>
                            {unit}
                          </td>
                        </tr>
                        {renderPnlRows(rows, false)}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
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
      {activeDeviationStage && activeDeviationDetails && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6'
          onClick={() => setActiveDeviationStage(null)}>
          <div
            className='flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200 max-h-[80vh]'
            onClick={(event: MouseEvent<HTMLDivElement>) =>
              event.stopPropagation()
            }>
            <div className='flex items-start justify-between gap-4 border-b border-gray-200 p-6'>
              <div>
                <p className='text-xs uppercase tracking-wide text-gray-500'>
                  Metric details
                </p>
                <h3 className='text-xl font-bold text-gray-900'>
                  {activeDeviationStage.label}
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  {selectedBuLabel} •{' '}
                  {selectedTimeframe === 'ytm'
                    ? 'Year to Month actuals'
                    : selectedTimeframe === 'budget'
                    ? 'Budget'
                    : 'Full year actuals'}
                </p>
              </div>
              <button
                type='button'
                className='rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-gray-700 hover:border-gray-300'
                onClick={() => setActiveDeviationStage(null)}>
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
                    {formatMn(activeDeviationDetails.totalImpact)} Mn {currencyLabel}
                  </p>
                </div>
                <div className='rounded-lg border border-gray-200 bg-slate-50 p-4'>
                  <p className='text-xs tracking-wide text-gray-500'>
                    SELECTED BUs
                  </p>
                  <p className='mt-2 text-lg font-semibold text-gray-900'>
                    {selectedBuLabel}
                  </p>
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
              {activeDeviationDetails.type === 'op-impact' && (
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
                {activeDeviationDetails.type === 'ideation' ? (
                  <table className='w-full text-xs'>
                    <thead>
                      <tr className='bg-primary-700 text-white'>
                        {activeDeviationDetails.table.headers.map((header) => (
                          <th
                            key={header}
                            className='px-4 py-3 text-left font-semibold'>
                            {header}
                          </th>
                        ))}
                      </tr>
                      <tr className='bg-gray-100 text-gray-700'>
                        {activeDeviationDetails.table.subHeaders.map(
                          (header, index) => (
                            <th
                              key={`${header}-${index}`}
                              className='px-4 py-2 text-left font-semibold'>
                              {header}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {activeDeviationDetails.table.rows.map((row, rowIndex) => (
                        <tr
                          key={`${row.group}-${row.owner}-${rowIndex}`}
                          className={`border-b border-gray-200 last:border-b-0 ${
                            row.isTotal ? 'bg-gray-100 font-semibold' : ''
                          }`}>
                          <td className='px-4 py-3 text-gray-900'>
                            {row.group}
                          </td>
                          <td className='px-4 py-3 text-gray-900'>
                            {row.owner}
                          </td>
                          {row.values.map((value, index) => (
                            <td
                              key={`${row.owner}-${index}`}
                              className='px-4 py-3 text-center text-gray-700'>
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : activeDeviationDetails.type === 'op-impact' ? (
                  <table className='w-full text-sm'>
                    <thead className='bg-gray-50 border-b border-gray-200'>
                      <tr>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          BU
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          Line item
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          Cost rationale
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
                      {activeDeviationDetails.rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className='px-4 py-6 text-center text-sm text-gray-500'>
                            No op-impact items available.
                          </td>
                        </tr>
                      ) : (
                        activeDeviationDetails.rows.map((row, index) => (
                          <tr
                            key={`${row.bu}-${row.item}-${index}`}
                            className='border-b border-gray-200 last:border-b-0'>
                            <td className='px-4 py-3 font-semibold text-gray-900'>
                              {row.bu}
                            </td>
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
                ) : (
                  <table className='w-full text-sm'>
                    <thead className='bg-gray-50 border-b border-gray-200'>
                      <tr>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          BU
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          Major drivers
                        </th>
                        <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                          Impact (Mn {currencyLabel})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeDeviationDetails.rows.map((row) => (
                        <tr
                          key={`${row.bu}-${row.driver}`}
                          className='border-b border-gray-200 last:border-b-0'>
                          <td className='px-4 py-3 font-semibold text-gray-900'>
                            {row.bu}
                          </td>
                          <td className='px-4 py-3 text-gray-600'>
                            {row.driver}
                          </td>
                          <td className='px-4 py-3 text-right font-semibold text-gray-900'>
                            {formatMn(row.impact)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {activePnlGroup && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6'
          onClick={() => setActivePnlGroup(null)}>
          <div
            className='w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden'
            onClick={(event) => event.stopPropagation()}>
            <div className='px-6 py-5 border-b border-gray-200 flex items-center justify-between'>
              <div>
                <p className='text-xs uppercase tracking-widest text-gray-400 font-semibold'>
                  P&amp;L breakdown
                </p>
                <h3 className='text-xl font-bold text-gray-900'>
                  {activePnlGroup}
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  Mn {currencyLabel}
                </p>
              </div>
              <button
                onClick={() => setActivePnlGroup(null)}
                className='p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700'>
                <XMarkIcon className='w-5 h-5' />
              </button>
            </div>
            <div className='max-h-[70vh] overflow-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                      BU
                    </th>
                    <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                      Line item
                    </th>
                    <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                      YTM Actual
                    </th>
                    <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                      YTM Budget
                    </th>
                    <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                      Deviation
                    </th>
                    <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activePnlRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className='px-4 py-6 text-center text-sm text-gray-500'>
                        No P&amp;L breakdown available.
                      </td>
                    </tr>
                  ) : (
                    activePnlRows.map((row, index) => {
                      const functionId =
                        pnlFunctionByLineItem[normalizePnlLineItem(row.lineItem)];
                      const isControllable =
                        normalizePnlLineItem(row.lineItem) === 'controllable';
                      const showDrilldown =
                        Boolean(functionId) && !isControllable;
                      return (
                        <tr
                          key={`${row.unit}-${row.lineItem}-${index}`}
                          className='border-b border-gray-200 last:border-b-0'>
                          <td className='px-4 py-3 font-semibold text-gray-900'>
                            {row.unit}
                          </td>
                          <td className='px-4 py-3 text-gray-600'>
                            {row.lineItem}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatPnlValue(row.ytmActual)}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatPnlValue(row.ytmBudget)}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatPnlValue((row.ytmActual ?? 0) - (row.ytmBudget ?? 0))}
                          </td>
                          <td className='px-4 py-3 text-right'>
                            {showDrilldown && functionId ? (
                              <button
                                type='button'
                                onClick={(event) => {
                                  event.stopPropagation();
                                  navigateToFunctionPerformance(functionId);
                                }}
                                className='text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline'>
                                View details
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
