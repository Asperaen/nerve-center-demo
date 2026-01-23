import {
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BudgetPerformanceWaterfall from '../components/BudgetPerformanceWaterfall';
import BusinessGroupPerformanceWaterfall from '../components/BusinessGroupPerformanceWaterfall';
import HeaderFilters from '../components/HeaderFilters';
import {
  CostImpactBreakdownLayer,
  MVABreakdownLayer,
  ProductAnalysisLayer,
} from '../components/layers';
import TimeframePicker, { type TimeframeOption } from '../components/TimeframePicker';
import { useBudgets, type BusinessGroup } from '../contexts/BudgetContext';
import {
  type BusinessGroupData,
  type BusinessGroupMetricWithTrend,
  type MonthlyTrendPoint,
} from '../data/mockBusinessGroupPerformance';
import {
  mockBudgetForecastStages,
  mockFunctionDeviationRows,
  type FunctionDeviationRow,
} from '../data/mockForecast';
import type {
  BreadcrumbItem,
  BudgetForecastStage,
  NavigationLayer,
} from '../types';
import { setStoredTimeframe } from '../utils/timeframeStorage';

const roundToOne = (value: number) => Math.round(value * 10) / 10;
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
  const revenue = toMillions(
    valueMode === 'forecast' ? totals.forecastRevenue : totals.revenue
  );
  const grossProfit = toMillions(
    valueMode === 'forecast' ? totals.forecastGrossProfit : totals.grossProfit
  );
  const operatingProfit = toMillions(
    valueMode === 'forecast'
      ? totals.forecastOperatingProfit
      : totals.operatingProfit
  );
  const netProfit = toMillions(
    valueMode === 'forecast' ? totals.forecastNetProfit : totals.netProfit
  );
  const revenueBudget = toMillions(
    budgetMode === 'ytm' ? totals.ytmRevenueBudget : totals.revenueBudget
  );
  const grossProfitBudget = toMillions(
    budgetMode === 'ytm' ? totals.ytmGrossProfitBudget : totals.grossProfitBudget
  );
  const operatingProfitBudget = toMillions(
    budgetMode === 'ytm'
      ? totals.ytmOperatingProfitBudget
      : totals.operatingProfitBudget
  );
  const netProfitBudget = toMillions(
    budgetMode === 'ytm' ? totals.ytmNetProfitBudget : totals.netProfitBudget
  );
  const lastYearRevenue = toMillions(
    lastYearMode === 'ytm' ? totals.ytmLastYearRevenue : totals.lastYearRevenue
  );
  const lastYearGrossProfit = toMillions(
    lastYearMode === 'ytm'
      ? totals.ytmLastYearGrossProfit
      : totals.lastYearGrossProfit
  );
  const lastYearOperatingProfit = toMillions(
    lastYearMode === 'ytm'
      ? totals.ytmLastYearOperatingProfit
      : totals.lastYearOperatingProfit
  );
  const lastYearNetProfit = toMillions(
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
  lastYearMode: 'full-year' | 'ytm'
): BusinessGroupData => {
  const unitId = `${groupId}-${unit.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`;
  const revenue = toMillions(
    valueMode === 'forecast' ? unit.forecastRevenue : unit.revenue
  );
  const grossProfit = toMillions(
    valueMode === 'forecast' ? unit.forecastGrossProfit : unit.grossProfit
  );
  const operatingProfit = toMillions(
    valueMode === 'forecast'
      ? unit.forecastOperatingProfit
      : unit.operatingProfit
  );
  const netProfit = toMillions(
    valueMode === 'forecast' ? unit.forecastNetProfit : unit.netProfit
  );
  const revenueBudget = toMillions(
    budgetMode === 'ytm' ? unit.ytmRevenueBudget : unit.revenueBudget
  );
  const grossProfitBudget = toMillions(
    budgetMode === 'ytm' ? unit.ytmGrossProfitBudget : unit.grossProfitBudget
  );
  const operatingProfitBudget = toMillions(
    budgetMode === 'ytm'
      ? unit.ytmOperatingProfitBudget
      : unit.operatingProfitBudget
  );
  const netProfitBudget = toMillions(
    budgetMode === 'ytm' ? unit.ytmNetProfitBudget : unit.netProfitBudget
  );
  const lastYearRevenue = toMillions(
    lastYearMode === 'ytm' ? unit.ytmLastYearRevenue : unit.lastYearRevenue
  );
  const lastYearGrossProfit = toMillions(
    lastYearMode === 'ytm'
      ? unit.ytmLastYearGrossProfit
      : unit.lastYearGrossProfit
  );
  const lastYearOperatingProfit = toMillions(
    lastYearMode === 'ytm'
      ? unit.ytmLastYearOperatingProfit
      : unit.lastYearOperatingProfit
  );
  const lastYearNetProfit = toMillions(
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
  const [selectedBu, setSelectedBu] = useState<string>(initialBu);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );
  const [activeDeviationStage, setActiveDeviationStage] =
    useState<BudgetForecastStage | null>(null);
  const [impactRationaleFilter, setImpactRationaleFilter] =
    useState<string>('all');
  const [impactSearch, setImpactSearch] = useState<string>('');

  // Expanded rows state (for "All BGs" view)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Comparison details toggle
  const [showComparisonDetails, setShowComparisonDetails] =
    useState<boolean>(true);

  // Layer navigation state
  const [currentLayer, setCurrentLayer] = useState<NavigationLayer>(1);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [selectedCOGSTab] = useState<'sites' | 'products'>('sites');
  const isBudgetMode = selectedTimeframe === 'budget';

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
      next.set('toggle', selectedTimeframe);
      return next;
    });
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

  useEffect(() => {
    if (selectedTimeframe !== 'ytm') {
      setSelectedTimeframe('ytm');
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    const toggleParam = searchParams.get('toggle');
    if (!toggleParam) {
      return;
    }
    if (toggleParam === 'ytm') {
      setSelectedTimeframe('ytm');
      return;
    }
    // If an invalid timeframe is preselected, default to the first option (YTM).
    setSelectedTimeframe('ytm');
  }, [searchParams]);

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
    const selectedParam = searchParams.get('selected');
    if (!selectedParam) {
      return;
    }
    const normalizedSelected = normalizeGroupId(selectedParam);
    // Set the selected group IDs based on the URL parameter
    setSelectedGroupIds(new Set([normalizedSelected]));
  }, [searchParams]);

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
          lastYearMode
        )
      );
      const overallRow = buildGroupRow(
        'Overall',
        businessGroups.flatMap((group) => group.businessUnits),
        valueMode,
        budgetMode,
        lastYearMode,
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
      buildUnitRow(groupId, unit, valueMode, budgetMode, lastYearMode)
    );
    const overallRow = buildGroupRow(
      selectedGroup.group,
      selectedGroup.businessUnits,
      valueMode,
      budgetMode,
      lastYearMode,
      `${groupId}-overall`,
      `${selectedGroup.group} overall`
    );
    return [...unitRows, overallRow];
  }, [businessGroups, selectedBu, selectedTimeframe]);

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
          lastYearMode
        );
        return [row.id, row] as const;
      });
    });
    return new Map(entries);
  }, [businessGroups, selectedTimeframe]);

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
    const overallRow = tableData.find((row) => isOverallRowId(row.id));
    if (overallRow) {
      setSelectedGroupIds(new Set([overallRow.id]));
    } else if (tableData.length === 0) {
      setSelectedGroupIds(new Set());
    }
  }, [tableData, searchParams]);

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
      buildUnitRow(groupId, unit, valueMode, budgetMode, lastYearMode)
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
    const displayedActual = isBudgetMode ? budget : actual;
    const delta = displayedActual - budget;
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
        `Actual NP is ${formatMn(
          displayedActual
        )} Mn USD versus Budget NP of ${formatMn(budget)} Mn USD.`,
        `This is a ${intensity} ${performance}: ${deltaSign}${formatMn(
          Math.abs(delta)
        )} Mn USD (${percentSign}${magnitude.toFixed(1)}%).`,
        `${sectionTitle} overall performance sits ${directionText} plan, implying execution and mix effects are the primary drivers.`,
      ],
      rootCauseAnalysis: `Root cause analysis indicates ${sectionTitle} is tracking ${directionText} plan with a ${intensity} variance. The ${performance} vs budget suggests execution and mix levers are the dominant contributors, with variance of ${deltaSign}${formatMn(
        Math.abs(delta)
      )} Mn USD (${percentSign}${magnitude.toFixed(1)}%) between Actual and Budget NP.`,
    };
  }, [tableData, selectionMetrics, sectionTitle, isBudgetMode]);

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
    return { oneOff, headwinds };
  }, [opImpactRows]);
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

  const buildScaledWaterfallStages = (): BudgetForecastStage[] => {
    const budgetValue = selectionMetrics.selectedOpBaseline;
    const actualValue = selectionMetrics.selectedOpValue;
    const baseBudgetValue =
      mockBudgetForecastStages.find((stage) => stage.stage === 'budget')
        ?.value ?? 0;
    const scaleFactor =
      baseBudgetValue === 0 ? 1 : budgetValue / baseBudgetValue;

    let runningValue = roundToOne(budgetValue);
    const totalChange = roundToOne(actualValue - budgetValue);
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
    let adjustedSum = 0;
    const adjustedMap = new Map<string, number>();
    adjustableStages.forEach((stage, index) => {
      const raw = stage.delta ?? 0;
      const boosted =
        raw === 0 ? 0 : Math.sign(raw) * Math.max(Math.abs(raw), minDelta);
      adjustedMap.set(stage.stage, boosted);
      if (index < adjustableStages.length - 1) {
        adjustedSum += boosted;
      }
    });
    const lastStage = adjustableStages[adjustableStages.length - 1];
    const balancedDelta = roundToOne(totalChange - adjustedSum);
    adjustedMap.set(lastStage.stage, balancedDelta);

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
    [selectionMetrics.selectedOpBaseline, selectionMetrics.selectedOpValue]
  );

  const budgetWaterfallStages = useMemo(() => {
    // budgetValue = Last Year OP (starting point)
    // actualValue = Current Year OP Target (ending point)
    const budgetValue = selectionMetrics.selectedNpBaseline;
    const actualValue = selectionMetrics.selectedNpValue;

    // Ideation is a fixed calculated value that cannot be adjusted
    const ideationDelta = selectionMetrics.selectedIdeation;

    // Work backwards: withPipeline + ideationDelta = actualValue
    const withPipeline = roundToOne(actualValue - ideationDelta);

    // The remaining change from budgetValue to withPipeline must be distributed
    // among one-off items, headwinds/tailwinds, L4, and L3
    const remainingChange = roundToOne(withPipeline - budgetValue);

    // Create variation with both favorable (positive) and adverse (negative) deltas
    // Make deltas visible by basing them on the baseline value, not remaining change
    // One-off items: Always adverse (reduces value) - represents one-time costs
    // Headwinds/Tailwinds: Variable - can be favorable or adverse based on market
    // L4 and L3: Always favorable (pipeline initiatives add value)
    
    const oneOffDelta = roundToOne(opImpactTotals.oneOff);
    const headwindsDelta = roundToOne(opImpactTotals.headwinds);
    
    // Calculate what L4 and L3 need to cover (the remaining gap after one-off and headwinds)
    const pipelineNeeded = roundToOne(remainingChange - oneOffDelta - headwindsDelta);
    
    // L4 gets 40% of pipeline needed, L3 gets the rest
    const l4Delta = roundToOne(pipelineNeeded * 0.40);
    const l3Delta = roundToOne(pipelineNeeded - l4Delta);

    const afterOneOff = roundToOne(budgetValue + oneOffDelta);
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
  }, [
    opImpactTotals,
    selectionMetrics.selectedNpBaseline,
    selectionMetrics.selectedNpValue,
    selectionMetrics.selectedIdeation,
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

    if (selectedTimeframe === 'budget') {
      if (
        activeDeviationStage.stage !== 'one-off-adjustments' &&
        activeDeviationStage.stage !== 'market-performance'
      ) {
        return null;
      }
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

      const sortedRows = [...filteredRows].sort(
        (a, b) => Math.abs(b.opImpact) - Math.abs(a.opImpact)
      );

      return {
        type: 'op-impact' as const,
        totalImpact: rows.reduce((sum, row) => sum + row.opImpact, 0),
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
    selectedBuNames,
    selectedTimeframe,
  ]);

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
    const unitIdFor = (groupId: string, unitName: string) =>
      `${groupId}-${unitName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const allUnits = businessGroups.flatMap((group) =>
      group.businessUnits.map((unit) => ({
        groupId: normalizeGroupId(group.group),
        unit,
      }))
    );
    const selectedGroup =
      selectedBu === 'all'
        ? null
        : businessGroups.find(
            (group) => normalizeGroupId(group.group) === selectedBu
          );
    const selectedGroupUnits = selectedGroup
      ? selectedGroup.businessUnits.map((unit) => ({
          groupId: normalizeGroupId(selectedGroup.group),
          unit,
        }))
      : [];
    const overallRow = tableData.find((row) => isOverallRowId(row.id));
    const overallId = overallRow?.id;
    const hasOverallSelected =
      selectedGroupIds.size === 0 ||
      (overallId ? selectedGroupIds.has(overallId) : false);

    const selectedUnits = hasOverallSelected
      ? selectedBu === 'all'
        ? allUnits
        : selectedGroupUnits
      : allUnits.filter(({ groupId, unit }) => {
          if (selectedGroupIds.has(groupId)) {
            return true;
          }
          return selectedGroupIds.has(unitIdFor(groupId, unit.name));
        });

    const unitsToUse = selectedUnits.length > 0 ? selectedUnits : allUnits;

    const mvaTotals = unitsToUse
      .flatMap(({ unit }) => unit.mvaSites ?? [])
      .filter((entry) => entry.site === 'Overall')
      .reduce(
        (acc, entry) => {
          acc.budgetMvaCost += entry.budgetMvaCost;
          acc.actualMvaCost += entry.actualMvaCost;
          return acc;
        },
        { budgetMvaCost: 0, actualMvaCost: 0 }
      );

    const totals = unitsToUse.reduce(
      (acc, { unit }) => {
        const opBudgetScale =
          unit.operatingProfitBudget === 0
            ? 1
            : unit.ytmOperatingProfitBudget / unit.operatingProfitBudget;
        acc.topLineBudget += unit.ytmRevenueBudget;
        acc.topLineActual += unit.functionalPerformance.topLine.actual;
        acc.procurementBudget +=
          unit.functionalPerformance.procurement.budget * opBudgetScale;
        acc.procurementActual += unit.functionalPerformance.procurement.actual;
        acc.manufacturingBudget +=
          unit.functionalPerformance.manufacturing.budget * opBudgetScale;
        acc.manufacturingActual +=
          unit.functionalPerformance.manufacturing.actual;
        acc.rndBudget += unit.functionalPerformance.rnd.budget * opBudgetScale;
        acc.rndActual += unit.functionalPerformance.rnd.actual;
        acc.opexBudget += unit.functionalPerformance.opex.budget * opBudgetScale;
        acc.opexActual += unit.functionalPerformance.opex.actual;
        acc.sharedExpensesBudget +=
          unit.functionalPerformance.sharedExpenses.budget * opBudgetScale;
        acc.sharedExpensesActual +=
          unit.functionalPerformance.sharedExpenses.actual;
        acc.opBudget += unit.ytmOperatingProfitBudget;
        acc.opActual += unit.operatingProfit;
        return acc;
      },
      {
        topLineBudget: 0,
        topLineActual: 0,
        procurementBudget: 0,
        procurementActual: 0,
        manufacturingBudget: 0,
        manufacturingActual: 0,
        rndBudget: 0,
        rndActual: 0,
        opexBudget: 0,
        opexActual: 0,
        sharedExpensesBudget: 0,
        sharedExpensesActual: 0,
        opBudget: 0,
        opActual: 0,
      }
    );

    const topLineBudget = roundToOne(toMillions(totals.topLineBudget));
    const topLineActual = roundToOne(toMillions(totals.topLineActual));
    const opBudgetDisplay = roundToOne(toMillions(totals.opBudget));
    const opActualDisplay = roundToOne(toMillions(totals.opActual));
    const procurementBudget = roundToOne(toMillions(totals.procurementBudget));
    const procurementActual = roundToOne(toMillions(totals.procurementActual));
    const manufacturingBudget = roundToOne(
      toMillions(totals.manufacturingBudget)
    );
    const manufacturingActual = roundToOne(
      toMillions(totals.manufacturingActual)
    );
    const rndBudget = roundToOne(toMillions(totals.rndBudget));
    const rndActual = roundToOne(toMillions(totals.rndActual));
    const opexBudget = roundToOne(toMillions(totals.opexBudget));
    const opexActual = roundToOne(toMillions(totals.opexActual));
    const sharedExpensesBudget = roundToOne(
      toMillions(totals.sharedExpensesBudget)
    );
    const sharedExpensesActual = roundToOne(
      toMillions(totals.sharedExpensesActual)
    );
    const mvaBudget = roundToOne(mvaTotals.budgetMvaCost);
    const mvaActual = roundToOne(mvaTotals.actualMvaCost);
    const budgetSubtotal =
      topLineBudget +
      procurementBudget +
      manufacturingBudget +
      rndBudget +
      opexBudget +
      sharedExpensesBudget;
    const actualSubtotal =
      topLineActual +
      procurementActual +
      manufacturingActual +
      rndActual +
      opexActual +
      sharedExpensesActual;
    const adjustedSharedBudget = roundToOne(
      sharedExpensesBudget + (opBudgetDisplay - budgetSubtotal)
    );
    const adjustedSharedActual = roundToOne(
      sharedExpensesActual + (opActualDisplay - actualSubtotal)
    );

    const costBudget = roundToOne(
      procurementBudget +
        manufacturingBudget +
        rndBudget +
        opexBudget +
        adjustedSharedBudget
    );
    const costActual = roundToOne(
      procurementActual +
        manufacturingActual +
        rndActual +
        opexActual +
        adjustedSharedActual
    );
    const connOpBudget = opBudgetDisplay;
    const connOpActual = opActualDisplay;

    const valuesById = new Map<string, { budget: number; actual: number }>([
      ['conn-op', { budget: connOpBudget, actual: connOpActual }],
      ['revenue', { budget: topLineBudget, actual: topLineActual }],
      ['topline', { budget: topLineBudget, actual: topLineActual }],
      ['cost', { budget: costBudget, actual: costActual }],
      ['procurement', { budget: procurementBudget, actual: procurementActual }],
      ['mva', { budget: mvaBudget, actual: mvaActual }],
      ['rd', { budget: rndBudget, actual: rndActual }],
      ['opex', { budget: opexBudget, actual: opexActual }],
      [
        'shared-expenses',
        { budget: adjustedSharedBudget, actual: adjustedSharedActual },
      ],
    ]);

    const scaledRows = mockFunctionDeviationRows.map((row) => {
      const resolved = valuesById.get(row.id);
      if (!resolved) {
        return row;
      }
      if (row.id === 'conn-op') {
        return {
          ...row,
          label: selectedGroupLabel,
          ytmBudget: resolved.budget,
          ytmActuals: resolved.actual,
        };
      }
      return {
        ...row,
        ytmBudget: resolved.budget,
        ytmActuals: resolved.actual,
      };
    });

    if (isBudgetMode) {
      return scaledRows.map((row) => ({
        ...row,
        ytmActuals: row.ytmBudget,
      }));
    }
    return scaledRows;
  }, [
    businessGroups,
    selectedBu,
    selectedGroupIds,
    tableData,
    selectedGroupLabel,
    isBudgetMode,
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
    const displayValue = isBudgetMode ? metric.baseline : metric.value;
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
          className={`px-4 py-3 border-b border-gray-200 ${
            !isLast ? 'border-r' : ''
          } relative group`}>
          <div className='text-left'>
            <div className='text-base font-bold text-gray-900'>
              ${displayValue.toFixed(1)}M
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
              ${displayValue.toFixed(1)}M
            </div>
          </div>
          <div className='text-center'>
            {!isBudgetMode && (
              <div className='text-xs text-gray-500 mb-0.5'>
                vs budget ${metric.baseline.toFixed(1)}M
              </div>
            )}
            <div className='text-xs text-gray-500'>
              vs Last Year ${metric.stly.toFixed(1)}M
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

  const renderFunctionRow = (row: FunctionDeviationRow) => {
    const labelClasses = row.isEmphasis
      ? 'text-gray-900 font-semibold'
      : 'text-gray-700';
    const insight = getFunctionInsight(row);
    const delta = row.ytmActuals - row.ytmBudget;
    const showDrilldown =
      row.id === 'procurement' ||
      row.id === 'mva' ||
      row.id === 'rd';
    const valueColor = 'text-gray-900';
    const costRowIds = new Set([
      'cost',
      'procurement',
      'mva',
      'rd',
      'opex',
      'shared-expenses',
    ]);
    const isCostRow = costRowIds.has(row.id);
    const isCostValueNegative = row.ytmBudget < 0 || row.ytmActuals < 0;
    const isFavorable = isCostRow
      ? isCostValueNegative
        ? row.ytmActuals >= row.ytmBudget
        : row.ytmActuals <= row.ytmBudget
      : row.ytmActuals >= row.ytmBudget;
    const deltaColor = delta === 0
      ? 'text-gray-600'
      : isFavorable
      ? 'text-opportunity-700'
      : 'text-risk-700';
    const handleRowDrillDown = () => {
      if (!showDrilldown) {
        return;
      }
      const params = new URLSearchParams();

      // Check if there are specific table selections (selectedGroupIds)
      const hasTableSelections = selectedGroupIds.size > 0 &&
        !Array.from(selectedGroupIds).every((id) => isOverallRowId(id));

      if (hasTableSelections) {
        // Separate BG-level selections from BU-level (unit) selections
        const selectedIds = Array.from(selectedGroupIds).filter((id) => !isOverallRowId(id));
        const bgIds = selectedIds.filter((id) => !unitRowsById.has(id));
        const buIds = selectedIds.filter((id) => unitRowsById.has(id));

        // Get BG names from tableData
        const bgNames = bgIds
          .map((id) => tableData.find((row) => row.id === id)?.name)
          .filter((name): name is string => Boolean(name));

        // Get BU names from unitRowsById
        const buNames = buIds
          .map((id) => unitRowsById.get(id)?.name)
          .filter((name): name is string => Boolean(name));

        if (bgNames.length > 0) {
          params.set('bg', bgNames.join(','));
        } else if (selectedBu !== 'all') {
          // If no BG selected in table, use dropdown selection
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
        // No table selections and dropdown is "All BGs"
        params.set('bg', 'all');
      } else {
        // Use the BG dropdown selection
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
        `/business-unit-performance/functional-performance/${row.id}?${params.toString()}`
      );
    };
    return (
      <tr
        key={row.id}
        className='border-b border-gray-200 last:border-b-0 hover:bg-indigo-50/60 transition-colors'
        onDoubleClick={handleRowDrillDown}
        title={showDrilldown ? 'Double click to drill down' : undefined}>
        <td className='px-6 py-3'>
          <div
            className={`${labelClasses}`}
            style={{ paddingLeft: row.indentLevel ? row.indentLevel * 20 : 0 }}>
            {row.label}
          </div>
        </td>
        <td className={`px-6 py-3 text-right ${valueColor}`}>
          {formatMn(row.ytmBudget)}
        </td>
        <td className={`px-6 py-3 text-right ${valueColor}`}>
          {formatMn(row.ytmActuals)}
        </td>
        <td className='px-6 py-3 text-right'>
          <span className={`text-sm font-semibold ${deltaColor}`}>
            {formatMn(delta)}
          </span>
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
        <td className='px-4 py-3 text-right'>
          {showDrilldown ? (
            <button
              onClick={(event) => {
                event.stopPropagation();
                handleRowDrillDown();
              }}
              className='text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline'>
              View details
            </button>
          ) : (
            <span className='text-xs text-transparent'>View details</span>
          )}
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
      toggleGroupSelection(group.id);
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
            {`Financial actual performance review - ${sectionTitle}${
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
              <TimeframePicker
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={setSelectedTimeframe}
                options={[
                  { value: 'ytm', label: 'Year to Month actuals' },
                ]}
              />
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
                  <h2 className='text-2xl font-bold text-gray-900'>
                    Financial actuals by BU - {sectionTitle}
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
              <p className='text-sm text-gray-600 mt-1'>Mn, USD</p>
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
        {selectedTimeframe === 'budget' ? (
          <BudgetPerformanceWaterfall
            stages={budgetWaterfallStages}
            title='Budget waterfall by value driver'
            subtitle={
              <span className='inline-flex items-center gap-1.5 text-sm text-gray-500'>
                <span>Operating Profit, Mn USD • {selectedBuLabel}</span>
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
                <span>Operating Profit, Mn USD • {selectedBuLabel}</span>
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
            onStageClick={(stage: BudgetForecastStage) => {
              const selectedUnitNames = Array.from(selectedGroupIds)
                .map((id) => unitRowsById.get(id)?.name)
                .filter((name): name is string => Boolean(name));
              const unitParam = selectedUnitNames.length
                ? `&bu=${encodeURIComponent(selectedUnitNames.join(','))}`
                : '';
              const selectedGroupNames = Array.from(selectedGroupIds).filter(
                (id) => !isOverallRowId(id) && !unitRowsById.has(id)
              );
              const resolvedBgParam =
                selectedBu === 'all' && selectedGroupNames.length > 0
                  ? selectedGroupNames.join(',')
                  : selectedBu;
              if (stage.stage === 'l3-vs-target') {
                navigate(
                  `/initiative-performance?bg=${encodeURIComponent(
                    resolvedBgParam
                  )}&timeframe=full-year${unitParam}`
                );
                return;
              }
              if (stage.stage === 'l4-vs-planned') {
                navigate(
                  `/actual-initiative-implementation?bg=${encodeURIComponent(
                    resolvedBgParam
                  )}&timeframe=full-year${unitParam}`
                );
                return;
              }
              setActiveDeviationStage(stage);
            }}
          />
        )}
      </div>

      {/* Deviation by Functions Section */}
      <div className='max-w-[1920px] mx-auto px-8 pb-12'>
        <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300'>
          <div className='mb-4'>
            <h2 className='text-2xl font-bold text-gray-900'>
              Deviation of BU performance by functions
            </h2>
            <p className='text-sm text-gray-500 mt-1'>
              <span className='inline-flex items-center gap-1.5'>
                <span>Mn, USD • {selectedBuLabel}</span>
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
            </p>
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
                  <th className='px-6 py-3 text-right font-semibold text-gray-700'>
                    Delta vs budget
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
                  <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                    <span className='sr-only'>Details</span>
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
                    : 'Full year forecast'}
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
                    {formatMn(activeDeviationDetails.totalImpact)} Mn USD
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
                          OP impact (Mn USD)
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
                          Impact (Mn USD)
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
    </div>
  );
}
