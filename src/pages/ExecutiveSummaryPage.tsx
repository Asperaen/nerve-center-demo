import {
  ArrowRightIcon,
  CalendarIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
 
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Link,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import BudgetPerformanceWaterfall from '../components/BudgetPerformanceWaterfall';
import HeaderFilters from '../components/HeaderFilters';
import MeetingSchedulingModal from '../components/MeetingSchedulingModal';
import RootCauseAnalysisSidebar from '../components/RootCauseAnalysisSidebar';
import { type TimeframeOption } from '../components/TimeframePicker';
import { useBudgets, type BusinessGroup } from '../contexts/BudgetContext';
import type { FunctionTargetRow, ValueDriverRow } from '../data/mockBgData';
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

type BusinessGroupSource = BusinessGroup;
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
  const insightBase = `${name} performance.`;
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
  const { businessGroups } = useBudgets();

  // Selection state
  const [selectedFinancialKPIs, setSelectedFinancialKPIs] = useState<
    Set<string>
  >(new Set());

  // Modal state
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const [selectedBu, setSelectedBu] = useState<string>('all');
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

  const formatMn = (value: number) =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

  const selectedImpactUnits = useMemo(() => {
    if (selectedBu === 'all') {
      return businessGroups.flatMap((group) => group.businessUnits);
    }
    const selectedGroup = businessGroups.find(
      (group) => normalizeGroupId(group.group) === selectedBu
    );
    return selectedGroup?.businessUnits ?? [];
  }, [businessGroups, selectedBu]);

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

  const ideationValueRows = useMemo(() => {
    if (selectedBu === 'all') {
      return null;
    }
    const selectedGroup = businessGroups.find(
      (group) => normalizeGroupId(group.group) === selectedBu
    );
    if (!selectedGroup || selectedGroup.businessUnits.length === 0) {
      return null;
    }
    const baseRows =
      selectedGroup.businessUnits[0]?.valueDriverBreakdown ?? [];
    if (baseRows.length === 0) {
      return null;
    }
    const rowOrder = baseRows.map((row) => row.vs);
    const aggregateMap = new Map<string, ValueDriverRow>();

    selectedGroup.businessUnits.forEach((unit) => {
      const rows = unit.valueDriverBreakdown ?? [];
      rows.forEach((row) => {
        const existing = aggregateMap.get(row.vs) ?? {
          vs: row.vs,
          topline: 0,
          bomGtk: 0,
          bomNonGtk: 0,
          mfg: 0,
          rnd: 0,
          sga: 0,
        };
        const mergeValue = (prev: number | string, next: number | string) => {
          if (typeof next === 'number') {
            return (typeof prev === 'number' ? prev : 0) + next;
          }
          return prev || next;
        };
        aggregateMap.set(row.vs, {
          vs: row.vs,
          topline: mergeValue(existing.topline, row.topline),
          bomGtk: mergeValue(existing.bomGtk, row.bomGtk),
          bomNonGtk: mergeValue(existing.bomNonGtk, row.bomNonGtk),
          mfg: mergeValue(existing.mfg, row.mfg),
          rnd: mergeValue(existing.rnd, row.rnd),
          sga: mergeValue(existing.sga, row.sga),
        });
      });
    });

    return rowOrder
      .map((vs) => aggregateMap.get(vs))
      .filter((row): row is ValueDriverRow => Boolean(row));
  }, [businessGroups, selectedBu]);

  const functionTargetRows = useMemo(() => {
    if (selectedBu === 'all') {
      return null;
    }
    const selectedGroup = businessGroups.find(
      (group) => normalizeGroupId(group.group) === selectedBu
    );
    if (!selectedGroup || selectedGroup.businessUnits.length === 0) {
      return null;
    }
    const baseRows =
      selectedGroup.businessUnits[0]?.functionTargetBreakdown ?? [];
    if (baseRows.length === 0) {
      return null;
    }
    const rowOrder = baseRows.map(
      (row) => `${row.function}|${row.coreKpi}|${row.coreImprovementTarget}`
    );
    const aggregateMap = new Map<string, FunctionTargetRow>();

    selectedGroup.businessUnits.forEach((unit) => {
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
  }, [businessGroups, selectedBu]);
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

  const renderIdeationTooltip = useCallback(
    (stage: BudgetForecastStage) => {
      if (stage.stage !== 'ideation') {
        return null;
      }
      if (!ideationValueRows || ideationValueRows.length === 0) {
        return (
          <p className='text-xs text-gray-500'>
            Select a BG to view ideation value drivers.
          </p>
        );
      }
      const formatValue = (value: number | string) =>
        typeof value === 'number' ? formatMn(value) : value || '-';

      return (
        <div className='max-w-[560px]'>
          <p className='text-xs font-semibold text-gray-700 mb-2'>
            Ideation value drivers (Mn USD)
          </p>
          <div className='overflow-hidden rounded-md border border-gray-200'>
            <table className='w-full text-xs'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-2 py-2 text-left font-semibold text-gray-700'>
                    VS
                  </th>
                  <th className='px-2 py-2 text-right font-semibold text-gray-700'>
                    Topline
                  </th>
                  <th className='px-2 py-2 text-right font-semibold text-gray-700'>
                    BOM - GTK
                  </th>
                  <th className='px-2 py-2 text-right font-semibold text-gray-700'>
                    BOM - Non GTK
                  </th>
                  <th className='px-2 py-2 text-right font-semibold text-gray-700'>
                    MFG
                  </th>
                  <th className='px-2 py-2 text-right font-semibold text-gray-700'>
                    R&D
                  </th>
                  <th className='px-2 py-2 text-right font-semibold text-gray-700'>
                    SG&A
                  </th>
                </tr>
              </thead>
              <tbody>
                {ideationValueRows.map((row) => (
                  <tr
                    key={row.vs}
                    className='border-b border-gray-200 last:border-b-0'>
                    <td className='px-2 py-2 text-gray-700'>{row.vs}</td>
                    <td className='px-2 py-2 text-right text-gray-700'>
                      {formatValue(row.topline)}
                    </td>
                    <td className='px-2 py-2 text-right text-gray-700'>
                      {formatValue(row.bomGtk)}
                    </td>
                    <td className='px-2 py-2 text-right text-gray-700'>
                      {formatValue(row.bomNonGtk)}
                    </td>
                    <td className='px-2 py-2 text-right text-gray-700'>
                      {formatValue(row.mfg)}
                    </td>
                    <td className='px-2 py-2 text-right text-gray-700'>
                      {formatValue(row.rnd)}
                    </td>
                    <td className='px-2 py-2 text-right text-gray-700'>
                      {formatValue(row.sga)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    },
    [formatMn, ideationValueRows]
  );

  const renderBudgetTooltip = useCallback(
    (stage: BudgetForecastStage) =>
      renderIdeationTooltip(stage) ?? renderOpImpactTooltip(stage),
    [renderIdeationTooltip, renderOpImpactTooltip]
  );

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
    const buParam = searchParams.get('bg') ?? searchParams.get('bu');
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
        if (prev.get('bg') === buId) {
          return prev;
        }
        const next = new URLSearchParams(prev);
        next.set('bg', buId);
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
      const groupRows = businessGroups.map((group) =>
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
        businessGroups.flatMap((group) => group.businessUnits),
        scale,
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
  }, [businessGroups, selectedBu, selectedTimeframe, homeToggle, isBudgetView]);

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

    const ideationTotal =
      selectedBu === 'all'
        ? businessGroups.reduce(
            (sum, group) =>
              sum +
              group.businessUnits.reduce(
                (unitSum, unit) => unitSum + unit.ideationTarget,
                0
              ),
            0
          )
        : businessGroups.find(
            (group) => normalizeGroupId(group.group) === selectedBu
          )?.businessUnits.reduce(
            (sum, unit) => sum + unit.ideationTarget,
            0
          ) ?? 0;
    const ideationDelta = roundToOne(toMillions(ideationTotal));

    // Work backwards: withPipeline + ideationDelta = budgetOpValue
    const withPipeline = roundToOne(budgetOpValue - ideationDelta);

    // Remaining change from last year to pipeline value
    const remainingChange = roundToOne(withPipeline - lastYearOpValue);

    const oneOffDelta = roundToOne(opImpactTotals.oneOff);
    const headwindsDelta = roundToOne(opImpactTotals.headwinds);

    // L4 and L3 cover the remaining gap after one-off and headwinds
    const pipelineNeeded = roundToOne(remainingChange - oneOffDelta - headwindsDelta);
    const l4Delta = roundToOne(pipelineNeeded * 0.4);
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
        'Remaining impact of initiatives implemented in previous year',
        afterL4,
        roundToOne(l4Delta),
        getBudgetStageType('l4-vs-planned', l4Delta, 'positive')
      ),
      makeStage(
        'l3-vs-target',
        'Impact of initiatives planned in previous year but not yet implemented',
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
  }, [businessGroups, isBudgetView, opImpactTotals, tableData, selectedBu]);

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
    const scale = 1;
    const valueMode =
      isBudgetView || homeToggle === 'budget'
        ? 'budget'
        : homeToggle === 'full-year'
        ? 'forecast'
        : 'actual';
    const budgetMode = homeToggle === 'ytm' ? 'ytm' : 'full-year';
    const lastYearMode = homeToggle === 'ytm' ? 'ytm' : 'full-year';
    const selectedGroup = businessGroups.find(
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
    isNavigable?: boolean,
    isSubGroup?: boolean,
    parentBgId?: string
  ) => {
    const isBudgetMode = isBudgetView || homeToggle === 'budget';
    const handleCellClick = (e: React.MouseEvent) => {
      if (isNavigable && groupId) {
        e.stopPropagation(); // Prevent row expansion from triggering
        if (isBudgetView) {
          if (selectedBu !== 'all') {
            const unitsParam = isSubGroup
              ? `&bu=${encodeURIComponent(groupName)}`
              : '';
            navigate(
              `/business-group-performance?bg=${encodeURIComponent(selectedBu)}${unitsParam}&toggle=ytm`
            );
            return;
          }
          handleBuChange(groupId === 'overall' ? 'all' : groupId);
          return;
        }
        if (homeToggle === 'budget') {
          navigate(`/budget?bg=${encodeURIComponent(groupId)}`);
          return;
        }
        if (homeToggle === 'full-year') {
          navigate(`/market-intelligence?bg=${encodeURIComponent(groupId)}&timeframe=full-year`);
          return;
        }
        // Navigate to business group performance with the BG and BU selected
        // For sub-rows (expanded BUs under a BG), use the parent BG and select this BU
        if (isSubGroup && parentBgId) {
          navigate(`/business-group-performance?bg=${encodeURIComponent(parentBgId)}&selected=${encodeURIComponent(groupId)}&toggle=${homeToggle}`);
          return;
        }
        // When a specific BG is already selected on home page, pass both BG and BU selection
        if (selectedBu !== 'all' && groupId !== 'overall' && !groupId?.endsWith('-overall')) {
          // Clicking on a BU row when a BG is selected - pass both bg and selected params
          navigate(`/business-group-performance?bg=${encodeURIComponent(selectedBu)}&selected=${encodeURIComponent(groupId)}&toggle=${homeToggle}`);
          return;
        }
        const bgParam = groupId !== 'overall' ? groupId : 'all';
        navigate(`/business-group-performance?bg=${encodeURIComponent(bgParam)}&toggle=${homeToggle}`);
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

  const renderTableRow = (
    group: BusinessGroupData,
    isExpandable: boolean = false,
    isSubGroup: boolean = false,
    isOverallRow: boolean = false,
    parentBgId?: string
  ) => {
    const isExpanded = expandedRows.has(group.id);
    // All rows are navigable - main rows AND expanded sub-rows (like A Group, B Group under HH)
    // This allows users to click on any BG row to navigate to the Business Group Performance page
    const isMetricNavigable = true;

    const handleRowClick = () => {
      if (isMetricNavigable) {
        const buId = isOverallRow ? 'all' : group.id;
        if (isBudgetView) {
          if (selectedBu !== 'all') {
            const unitsParam = isSubGroup
              ? `&bu=${encodeURIComponent(group.name)}`
              : '';
            navigate(
              `/business-group-performance?bg=${encodeURIComponent(selectedBu)}${unitsParam}&toggle=ytm`
            );
            return;
          }
          handleBuChange(buId);
          return;
        }
        if (homeToggle === 'budget') {
          navigate(`/budget?bg=${encodeURIComponent(buId)}`);
          return;
        }
        if (homeToggle === 'full-year') {
          navigate(`/market-intelligence?bg=${encodeURIComponent(buId)}&timeframe=full-year`);
          return;
        }
        // Navigate to business group performance with the BG and BU selected
        // For sub-rows (expanded BUs under a BG), use the parent BG and select this BU
        if (isSubGroup && parentBgId) {
          navigate(`/business-group-performance?bg=${encodeURIComponent(parentBgId)}&selected=${encodeURIComponent(group.id)}&toggle=${homeToggle}`);
          return;
        }
        // When a specific BG is already selected on home page, pass both BG and BU selection
        if (selectedBu !== 'all' && !isOverallRow) {
          // Clicking on a BU row when a BG is selected - pass both bg and selected params
          navigate(`/business-group-performance?bg=${encodeURIComponent(selectedBu)}&selected=${encodeURIComponent(group.id)}&toggle=${homeToggle}`);
          return;
        }
        const bgParam = buId !== 'all' ? buId : 'all';
        navigate(`/business-group-performance?bg=${encodeURIComponent(bgParam)}&toggle=${homeToggle}`);
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
        <td className={`px-6 py-3 border-b border-r border-gray-200 ${isMetricNavigable ? 'cursor-pointer' : ''}`}>
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
          parentBgId
        )}
        {renderMetricCell(
          group.gp,
          group.name,
          'Gross Profit',
          false,
          group.id,
          isMetricNavigable,
          isSubGroup,
          parentBgId
        )}
        {renderMetricCell(
          group.op,
          group.name,
          'Operating Profit',
          false,
          group.id,
          isMetricNavigable,
          isSubGroup,
          parentBgId
        )}
        {renderMetricCell(
          group.np,
          group.name,
          'Net Profit',
          true,
          group.id,
          isMetricNavigable,
          isSubGroup,
          parentBgId
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
                {isBudgetView
                  ? 'Budget by Business Group'
                  : 'Business Group Performance'}
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
                to='/business-group-performance?bg=all'
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
                <BudgetPerformanceWaterfall
                  stages={budgetWaterfallStages}
                  title='Budget deviation waterfall of BU performance by value driver'
                  subtitle={`Mn USD • ${selectedBuLabel}`}
                  onStageClick={(stage) => {
                    if (
                      stage.stage === 'one-off-adjustments' ||
                      stage.stage === 'market-performance' ||
                      stage.stage === 'ideation'
                    ) {
                      setActiveBudgetStage(stage);
                    }
                  }}
                  tooltipContent={renderBudgetTooltip}
                />
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
                    {formatMn(activeBudgetDetails.totalImpact)} Mn USD
                  </p>
                </div>
                <div className='rounded-lg border border-gray-200 bg-slate-50 p-4'>
                  <p className='text-xs tracking-wide text-gray-500'>
                    Selected BGs
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
                          Function
                        </th>
                        <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                          OP Target
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          Core KPI
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          Core improvement target
                        </th>
                        <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                          KPI ramp up target
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBudgetDetails.rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className='px-4 py-6 text-center text-sm text-gray-500'>
                            Select a BG to view ideation targets.
                          </td>
                        </tr>
                      ) : (
                        activeBudgetDetails.rows.map((row) => (
                          <tr
                            key={`${row.function}-${row.coreKpi}-${row.coreImprovementTarget}`}
                            className='border-b border-gray-200 last:border-b-0'>
                            <td className='px-4 py-3 text-gray-700'>
                              {row.function}
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {typeof row.opTarget === 'number'
                                ? formatMn(row.opTarget)
                                : row.opTarget || '-'}
                            </td>
                            <td className='px-4 py-3 text-gray-700'>
                              {row.coreKpi}
                            </td>
                            <td className='px-4 py-3 text-gray-700'>
                              {row.coreImprovementTarget}
                            </td>
                            <td className='px-4 py-3 text-gray-700'>
                              {(() => {
                                const seed =
                                  row.coreKpi.length +
                                  row.function.length +
                                  row.coreImprovementTarget.length;
                                const isPositive = seed % 2 === 0;
                                const color = isPositive ? '#16a34a' : '#dc2626';
                                const base = isPositive ? 3 : 7;
                                const points = Array.from({ length: 7 }, (_, i) => {
                                  const trend = isPositive ? i : -i;
                                  const wobble = (seed + i * 3) % 4;
                                  return { index: i, value: base + trend + (wobble - 1.5) * 0.4 };
                                });
                                return (
                                  <div className='h-8 w-24'>
                                    <ResponsiveContainer width='100%' height='100%'>
                                      <LineChart data={points} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
                                        <XAxis
                                          dataKey='index'
                                          hide={false}
                                          axisLine
                                          tick={false}
                                          tickLine={false}
                                          height={8}
                                        />
                                        <YAxis
                                          hide={false}
                                          axisLine
                                          tick={false}
                                          tickLine={false}
                                          domain={['auto', 'auto']}
                                          width={8}
                                        />
                                        <Line
                                          type='monotone'
                                          dataKey='value'
                                          stroke={color}
                                          strokeWidth={2}
                                          dot={false}
                                          isAnimationActive={false}
                                        />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                );
                              })()}
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
                      {activeBudgetDetails.rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className='px-4 py-6 text-center text-sm text-gray-500'>
                            No op-impact items available.
                          </td>
                        </tr>
                      ) : (
                        activeBudgetDetails.rows.map((row, index) => (
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
