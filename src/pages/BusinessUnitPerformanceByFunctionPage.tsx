import { ChartBarIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import FunctionalPerformanceWaterfall, {
  type FunctionalPerformanceStage,
} from '../components/FunctionalPerformanceWaterfall';
import { useBudgets } from '../contexts/BudgetContext';
import { getAllBusinessGroupData } from '../data/mockBusinessGroupPerformance';
import { mockFunctionDeviationRows } from '../data/mockForecast';
import { getStoredTimeframe } from '../utils/timeframeStorage';

const normalizeFunction = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '');

const normalizeBu = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '');

const roundToOne = (value: number) => Math.round(value * 10) / 10;
const toMillions = (value: number) => value / 1_000;

const formatMn = (value: number) => {
  const sign = value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toFixed(1)}M`;
};

export default function BusinessUnitPerformanceByFunctionPage() {
  const { functionId } = useParams<{ functionId?: string }>();
  const [searchParams] = useSearchParams();
  const { businessGroups } = useBudgets();
  const functionParam =
    functionId ??
    searchParams.get('function') ??
    'topline';
  const normalizedFunction = normalizeFunction(functionParam);
  const isProcurement = normalizedFunction === 'procurement';
  const isManufacturing =
    normalizedFunction === 'mva' || normalizedFunction === 'manufacturing';
  const isRnD = normalizedFunction === 'rd' || normalizedFunction === 'r&d';
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    ['overall']
  );
  const [activeBucketId, setActiveBucketId] = useState<string | null>(null);
  const buParam = searchParams.get('bu') ?? '';
  const bgsParam = searchParams.get('bgs') ?? '';
  const selectedBus = buParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const normalized = normalizeBu(item);
      return normalized !== 'overall' && normalized !== 'all';
    });
  const selectedBgs = bgsParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const scaledRows = useMemo(() => {
    const timeframe = getStoredTimeframe();
    const dataTimeframe = timeframe === 'ytm' ? 'ytm' : 'full-year';
    const tableData = getAllBusinessGroupData(dataTimeframe);
    const overallRow = tableData.find((row) => row.id === 'overall');
    const normalizedSelected = [
      ...selectedBus,
      ...selectedBgs,
    ].map(normalizeBu);
    const selectedRows =
      normalizedSelected.length === 0
        ? overallRow
          ? [overallRow]
          : tableData
        : tableData.filter((row) =>
            normalizedSelected.includes(normalizeBu(row.name))
          );
    const selectedNpBaseline = selectedRows.reduce(
      (sum, row) => sum + row.np.baseline,
      0
    );
    const selectedNpValue = selectedRows.reduce(
      (sum, row) => sum + row.np.value,
      0
    );

    const roundToOne = (value: number) => Math.round(value * 10) / 10;
    const rowsById = new Map(
      mockFunctionDeviationRows.map((row) => [row.id, row])
    );
    const baseRevenue = rowsById.get('revenue')?.ytmBudget ?? 0;
    const baseCost = rowsById.get('cost')?.ytmBudget ?? 0;
    const baseRevenueActuals = rowsById.get('revenue')?.ytmActuals ?? 0;
    const baseCostActuals = rowsById.get('cost')?.ytmActuals ?? 0;

    const topBudgetScale =
      baseRevenue + baseCost === 0
        ? 1
        : selectedNpBaseline / (baseRevenue + baseCost);
    const topActualsScale =
      baseRevenueActuals + baseCostActuals === 0
        ? 1
        : selectedNpValue / (baseRevenueActuals + baseCostActuals);

    const revenueBudget = baseRevenue * topBudgetScale;
    const costBudget = baseCost * topBudgetScale;
    const revenueActuals = baseRevenueActuals * topActualsScale;
    const costActuals = baseCostActuals * topActualsScale;

    const revenueChildIds = ['topline'];
    const costChildIds = ['procurement', 'mva', 'rd', 'opex', 'shared-expenses'];

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
      revenueChildIds.reduce(
        (sum, id) => sum + (rowsById.get(id)?.ytmBudget ?? 0),
        0
      ),
      revenueBudget,
      'ytmBudget'
    );
    const revenueActualsChildren = scaleChildren(
      revenueChildIds,
      revenueChildIds.reduce(
        (sum, id) => sum + (rowsById.get(id)?.ytmActuals ?? 0),
        0
      ),
      revenueActuals,
      'ytmActuals'
    );
    const costBudgetChildren = scaleChildren(
      costChildIds,
      costChildIds.reduce(
        (sum, id) => sum + (rowsById.get(id)?.ytmBudget ?? 0),
        0
      ),
      costBudget,
      'ytmBudget'
    );
    const costActualsChildren = scaleChildren(
      costChildIds,
      costChildIds.reduce(
        (sum, id) => sum + (rowsById.get(id)?.ytmActuals ?? 0),
        0
      ),
      costActuals,
      'ytmActuals'
    );

    return mockFunctionDeviationRows.map((row) => {
      if (row.id === 'conn-op') {
        return {
          ...row,
          ytmBudget: roundToOne(selectedNpBaseline),
          ytmActuals: roundToOne(selectedNpValue),
        };
      }
      if (row.id === 'revenue') {
        return {
          ...row,
          ytmBudget: roundToOne(revenueBudget),
          ytmActuals: roundToOne(revenueActuals),
        };
      }
      if (row.id === 'cost') {
        return {
          ...row,
          ytmBudget: roundToOne(costBudget),
          ytmActuals: roundToOne(costActuals),
        };
      }
      if (revenueChildIds.includes(row.id)) {
        return {
          ...row,
          ytmBudget: revenueBudgetChildren.get(row.id) ?? 0,
          ytmActuals: revenueActualsChildren.get(row.id) ?? 0,
        };
      }
      if (costChildIds.includes(row.id)) {
        return {
          ...row,
          ytmBudget: costBudgetChildren.get(row.id) ?? 0,
          ytmActuals: costActualsChildren.get(row.id) ?? 0,
        };
      }
      return row;
    });
  }, [selectedBus]);

  const scaledFunctionRow = useMemo(() => {
    const normalizedParam = normalizeFunction(functionParam);
    return (
      scaledRows.find((row) => normalizeFunction(row.label) === normalizedParam) ??
      scaledRows[0]
    );
  }, [scaledRows, functionParam]);

  const keyCallout = useMemo(() => {
    const buLabel =
      selectedBus.length > 0 ? selectedBus.join(', ') : 'all BUs';
    const budget = scaledFunctionRow?.ytmBudget ?? 0;
    const actual = scaledFunctionRow?.ytmActuals ?? 0;
    const variance = actual - budget;
    const varianceLabel =
      variance >= 0 ? 'above budget' : 'below budget';
    const absVariance = Math.abs(variance);
    const functionLabel = scaledFunctionRow?.label ?? functionParam;

    return {
      headline: `${functionLabel} for ${buLabel} is ${formatMn(
        absVariance
      )} ${varianceLabel}.`,
      bullets: [
        `Budget: ${formatMn(budget)} • Actual: ${formatMn(actual)} • Variance: ${formatMn(
          variance
        )}.`,
        `Focus on ${functionLabel.toLowerCase()} execution levers across ${buLabel}.`,
        variance >= 0
          ? 'Upside driven by mix and volume momentum in selected BUs.'
          : 'Gap driven by cost pressure and mix drift in selected BUs.',
      ],
    };
  }, [functionParam, scaledFunctionRow, selectedBus]);

  const aiSummaryInsights = [
    'Procurement is tracking above budget on key spend categories driven by mix and higher input costs.',
    'L3 initiatives are behind target in IDS, while EMS shows stronger pipeline conversion.',
    'FX and part price variance explain most of the delta versus budget for the selected BUs.',
  ];
  const manufacturingInsights = [
    'MVA cost is above budget as DL efficiency gains trail plan in Site B and C.',
    'IDL hourly rate pressure is partially offset by favorable fixed MOH absorption.',
    'Variable MOH efficiency gaps remain the largest adverse driver vs budget.',
  ];
  const rndInsights = [
    'R&D spend is tracking above target driven by new project intake and timing shifts.',
    'Personnel delta remains the largest driver against plan, with HC mix changes in core programs.',
    'Central and cross-BU support is stable, while prototype/testing costs trend higher.',
  ];

  const selectedFunctionalUnits = useMemo(() => {
    const normalizedSelected = selectedBus.map(normalizeBu);
    const derivedGroupIds = normalizedSelected
      .filter((value) => value.endsWith('overall') && value !== 'overall')
      .map((value) => value.replace(/overall$/, ''))
      .filter(Boolean);
    const normalizedSelection = new Set([
      ...normalizedSelected,
      ...derivedGroupIds,
    ]);
    const includeAll =
      normalizedSelected.length === 0 ||
      normalizedSelection.has('overall') ||
      normalizedSelection.has('all') ||
      normalizedSelection.has('allbgs');

    const selectedUnits = businessGroups.flatMap((group) => {
      const groupId = normalizeBu(group.group);
      if (includeAll || normalizedSelection.has(groupId)) {
        return group.businessUnits;
      }
      return group.businessUnits.filter((unit) =>
        normalizedSelection.has(normalizeBu(unit.name))
      );
    });

    return selectedUnits.length > 0
      ? selectedUnits
      : businessGroups.flatMap((group) => group.businessUnits);
  }, [businessGroups, selectedBus]);

  const procurementOverallTotals = useMemo(() => {
    const totals = selectedFunctionalUnits.reduce(
      (acc, unit) => {
        const opBudgetScale =
          unit.operatingProfitBudget === 0
            ? 1
            : unit.ytmOperatingProfitBudget / unit.operatingProfitBudget;
        acc.budget += unit.functionalPerformance.procurement.budget * opBudgetScale;
        acc.actual += unit.functionalPerformance.procurement.actual;
        return acc;
      },
      { budget: 0, actual: 0 }
    );

    return {
      budget: roundToOne(toMillions(totals.budget)),
      actual: roundToOne(toMillions(totals.actual)),
    };
  }, [selectedFunctionalUnits]);

  const baseProcurementCategories = [
    {
      id: 'overall',
      label: 'Overall all',
      budget: 120,
      actual: 110,
      children: [
        {
          id: 'overall-direct',
          label: 'Direct materials',
          budget: 70,
          actual: 62,
        },
        {
          id: 'overall-indirect',
          label: 'Indirect materials',
          budget: 50,
          actual: 48,
        },
      ],
    },
    {
      id: 'category-a',
      label: 'Category A',
      budget: 42,
      actual: 47,
      children: [
        {
          id: 'category-a-raw',
          label: 'Raw materials',
          budget: 26,
          actual: 30,
        },
        {
          id: 'category-a-components',
          label: 'Components',
          budget: 16,
          actual: 17,
        },
      ],
    },
    {
      id: 'category-b',
      label: 'Category B',
      budget: 35,
      actual: 28,
      children: [
        {
          id: 'category-b-logistics',
          label: 'Logistics',
          budget: 18,
          actual: 14,
        },
        {
          id: 'category-b-suppliers',
          label: 'Supplier services',
          budget: 17,
          actual: 14,
        },
      ],
    },
    {
      id: 'category-c',
      label: 'Category C',
      budget: 43,
      actual: 35,
      children: [
        {
          id: 'category-c-energy',
          label: 'Energy',
          budget: 22,
          actual: 26,
        },
        {
          id: 'category-c-consumables',
          label: 'Consumables',
          budget: 21,
          actual: 9,
        },
      ],
    },
  ];

  const procurementCategories = useMemo(() => {
    const baseOverall = baseProcurementCategories[0];
    if (!baseOverall) {
      return baseProcurementCategories;
    }
    const budgetScale = Math.abs(
      baseOverall.budget === 0
        ? 1
        : procurementOverallTotals.budget / baseOverall.budget
    );
    const actualScale = Math.abs(
      baseOverall.actual === 0
        ? 1
        : procurementOverallTotals.actual / baseOverall.actual
    );

    return baseProcurementCategories.map((category) => ({
      ...category,
      budget: roundToOne(category.budget * budgetScale),
      actual: roundToOne(category.actual * actualScale),
      children: category.children?.map((child) => ({
        ...child,
        budget: roundToOne(child.budget * budgetScale),
        actual: roundToOne(child.actual * actualScale),
      })),
    }));
  }, [baseProcurementCategories, procurementOverallTotals]);

  const procurementBuckets = [
    {
      id: 'volume-change',
      label: 'Volume change variance',
      delta: -4.8,
      initiatives: [
        { name: 'Initiative 1', gap: '-1.6Mn', kpi: 'Unit price' },
        { name: 'Initiative 2', gap: '-2.2Mn', kpi: 'Unit price' },
      ],
      foundations: [
        {
          name: 'Category & spend optimization',
          kpi: 'Unit price',
          date: '2025.2',
        },
      ],
    },
    {
      id: 'l3-deviation',
      label: 'L3 deviation vs target',
      delta: 6.2,
      initiatives: [
        { name: 'Initiative 1', gap: '-1.4Mn', kpi: 'Unit price' },
        { name: 'Initiative 2', gap: '-2.0Mn', kpi: 'Unit price' },
      ],
      foundations: [
        {
          name: 'Category & spend optimization',
          kpi: 'Unit price',
          date: '2025.2',
        },
      ],
    },
    {
      id: 'l4-deviation',
      label: 'L4 deviation vs L3 plan',
      delta: 3.4,
      initiatives: [
        { name: 'Initiative 1', gap: '-1.2Mn', kpi: 'Unit price' },
        { name: 'Initiative 2', gap: '-1.8Mn', kpi: 'Unit price' },
      ],
      foundations: [
        {
          name: 'Category & spend optimization',
          kpi: 'Unit price',
          date: '2025.2',
        },
      ],
    },
  ];

  const manufacturingBuckets = [
    {
      id: 'vol-mix-change',
      label: 'Vol mix change',
      delta: -2.4,
      initiatives: [
        { name: 'Line balancing initiative', gap: '-0.9Mn', kpi: 'UPPH' },
        { name: 'Shift mix optimization', gap: '-1.1Mn', kpi: 'OEE' },
      ],
      foundations: [
        {
          name: 'Factory scheduling cadence',
          kpi: 'OEE',
          date: '2025.3',
        },
      ],
    },
    {
      id: 'labor-rate-impact',
      label: 'Labour rate impact',
      delta: 1.6,
      initiatives: [
        { name: 'Overtime control', gap: '+0.6Mn', kpi: 'Labor cost' },
        { name: 'Skill premium adjustment', gap: '+0.8Mn', kpi: 'Labor cost' },
      ],
      foundations: [
        {
          name: 'Workforce planning discipline',
          kpi: 'Labor cost',
          date: '2025.4',
        },
      ],
    },
    {
      id: 'dl-efficiency',
      label: 'DL efficiency gap',
      delta: -1.9,
      initiatives: [
        { name: 'UPPH stabilization', gap: '-0.8Mn', kpi: 'UPPH' },
        { name: 'Automation ramp', gap: '-1.1Mn', kpi: 'OEE' },
      ],
      foundations: [
        {
          name: 'Frontline capability program',
          kpi: 'UPPH',
          date: '2025.2',
        },
      ],
    },
    {
      id: 'idl-hc-gap',
      label: 'IDL HC gap',
      delta: 0.7,
      initiatives: [
        { name: 'Support headcount control', gap: '+0.4Mn', kpi: 'HC' },
        { name: 'Span of control review', gap: '+0.3Mn', kpi: 'HC' },
      ],
      foundations: [
        {
          name: 'Org design refresh',
          kpi: 'HC',
          date: '2025.5',
        },
      ],
    },
    {
      id: 'ga-variable-gap',
      label: 'GA variable efficiency',
      delta: -0.6,
      initiatives: [
        { name: 'Utility usage reduction', gap: '-0.3Mn', kpi: 'OPEX' },
        { name: 'Consumables optimization', gap: '-0.3Mn', kpi: 'OPEX' },
      ],
      foundations: [
        {
          name: 'Cost governance cadence',
          kpi: 'OPEX',
          date: '2025.1',
        },
      ],
    },
    {
      id: 'ga-fixed-gap',
      label: 'GA fixed cost gap',
      delta: 0.9,
      initiatives: [
        { name: 'Facility lease reset', gap: '+0.5Mn', kpi: 'Fixed cost' },
        { name: 'Maintenance contract uplift', gap: '+0.4Mn', kpi: 'Fixed cost' },
      ],
      foundations: [
        {
          name: 'Contract governance',
          kpi: 'Fixed cost',
          date: '2025.6',
        },
      ],
    },
    {
      id: 'fx-impact',
      label: 'Fx impact',
      delta: -0.8,
      initiatives: [
        { name: 'Hedge coverage expansion', gap: '-0.4Mn', kpi: 'FX' },
        { name: 'Supplier currency alignment', gap: '-0.4Mn', kpi: 'FX' },
      ],
      foundations: [
        {
          name: 'FX risk playbook',
          kpi: 'FX',
          date: '2025.7',
        },
      ],
    },
  ];

  const procurementTotals = useMemo(() => {
    const overall = procurementCategories[0];
    const selected = procurementCategories.filter((row) =>
      selectedCategoryIds.includes(row.id)
    );
    const activeRows = selected.length > 0 ? selected : [overall];
    const budgetTotal = activeRows.reduce((sum, row) => sum + row.budget, 0);
    const actualTotal = activeRows.reduce((sum, row) => sum + row.actual, 0);
    return { budgetTotal, actualTotal };
  }, [procurementCategories, selectedCategoryIds]);

  const procurementWaterfallStages = useMemo<FunctionalPerformanceStage[]>(() => {
    const rawBudgetValue = procurementTotals.budgetTotal;
    const rawActualValue = procurementTotals.actualTotal;
    const budgetValue = Math.abs(rawBudgetValue);
    const actualValue = Math.abs(rawActualValue);
    
    // Total change from budget to actual (negative = costs decreased, positive = costs increased)
    const totalChange = actualValue - budgetValue;
    
    const split = [0.24, 0.26, 0.22, 0.18, 0.1];
    // Distribute the total change proportionally
    const deltas = split.map((ratio) =>
      Number((totalChange * ratio).toFixed(1))
    );
    // Adjust last delta to ensure exact sum
    const currentSum = deltas.reduce((sum, value) => sum + value, 0);
    deltas[deltas.length - 1] = Number(
      (deltas[deltas.length - 1] + (totalChange - currentSum)).toFixed(1)
    );

    const [volumeDelta, l3Delta, l4Delta, partPriceDelta, fxDelta] = deltas;
    let running = budgetValue;
    const nextValue = (delta: number) => {
      running = Number((running + delta).toFixed(1));
      return running;
    };
    // Negative delta (cost decrease) is favorable/green, positive is adverse/red
    const getCostStageType = (delta: number): 'positive' | 'negative' =>
      delta <= 0 ? 'positive' : 'negative';

    return [
      {
        id: 'budget-spend',
        label: 'Budget spend',
        value: Number(budgetValue.toFixed(1)),
        delta: Number(budgetValue.toFixed(1)),
        type: 'baseline',
      },
      {
        id: 'volume-change',
        label: 'Volume change variance',
        value: nextValue(volumeDelta),
        delta: volumeDelta,
        type: getCostStageType(volumeDelta),
        isClickable: true,
      },
      {
        id: 'l3-deviation',
        label: 'L3 deviation vs target',
        value: nextValue(l3Delta),
        delta: l3Delta,
        type: getCostStageType(l3Delta),
        isClickable: true,
      },
      {
        id: 'l4-deviation',
        label: 'L4 deviation vs L3 plan',
        value: nextValue(l4Delta),
        delta: l4Delta,
        type: getCostStageType(l4Delta),
        isClickable: true,
      },
      {
        id: 'part-price',
        label: 'Part price variance',
        value: nextValue(partPriceDelta),
        delta: partPriceDelta,
        type: getCostStageType(partPriceDelta),
      },
      {
        id: 'fx-impact',
        label: 'FX impact',
        value: nextValue(fxDelta),
        delta: fxDelta,
        type: getCostStageType(fxDelta),
      },
      {
        id: 'actual-spend',
        label: 'Actual spend',
        value: Number(actualValue.toFixed(1)),
        delta: Number(actualValue.toFixed(1)),
        type: 'baseline',
      },
    ];
  }, [procurementTotals]);

  const manufacturingSites = useMemo(() => {
    const normalizedSelected = selectedBus.map(normalizeBu).filter(Boolean);
    const derivedGroupIds = normalizedSelected
      .filter((value) => value.endsWith('overall') && value !== 'overall')
      .map((value) => value.replace(/overall$/, ''))
      .filter(Boolean);
    const normalizedSelection = new Set([
      ...normalizedSelected,
      ...derivedGroupIds,
    ]);
    const isAllSelected =
      normalizedSelected.length === 0 ||
      normalizedSelection.has('all') ||
      normalizedSelection.has('overall');
    
    // Get entries from matching business units (checking both group and unit names)
    const entries = isAllSelected
      ? businessGroups.flatMap((group) =>
          group.businessUnits.flatMap((unit) => unit.mvaSites ?? [])
        )
      : businessGroups.flatMap((group) => {
          const groupId = normalizeBu(group.group);
          // If the group matches, include all its units' MVA sites
          if (normalizedSelection.has(groupId)) {
            return group.businessUnits.flatMap((unit) => unit.mvaSites ?? []);
          }
          // Otherwise, check if any sub-BU matches
          return group.businessUnits
            .filter((unit) => normalizedSelection.has(normalizeBu(unit.name)))
            .flatMap((unit) => unit.mvaSites ?? []);
        });
    if (entries.length === 0) {
      return [];
    }

    const siteTotals = new Map<
      string,
      { dl: { budget: number; actual: number }; idl: { budget: number; actual: number }; ga: { budget: number; actual: number } }
    >();
    for (const entry of entries) {
      const current = siteTotals.get(entry.site) ?? {
        dl: { budget: 0, actual: 0 },
        idl: { budget: 0, actual: 0 },
        ga: { budget: 0, actual: 0 },
      };
      current.dl.budget += entry.budgetDl;
      current.dl.actual += entry.actualDl;
      current.idl.budget += entry.budgetIdl;
      current.idl.actual += entry.actualIdl;
      current.ga.budget += entry.budgetGa;
      current.ga.actual += entry.actualGa;
      siteTotals.set(entry.site, current);
    }

    const buildRow = (label: string, id: string) => {
      const totals = siteTotals.get(label);
      if (!totals) return null;
      return { id, label, ...totals };
    };

    const overallRow = buildRow('Overall', 'overall');
    const siteA = buildRow('Site A', 'site-a');
    const siteB = buildRow('Site B', 'site-b');
    const siteC = buildRow('Site C', 'site-c');

    if (!overallRow) {
      return [];
    }

    return [
      {
        ...overallRow,
        label: 'Overall',
        children: [siteA, siteB, siteC].filter(Boolean),
      },
    ];
  }, [businessGroups, selectedBus]);

  const manufacturingMvaTotals = useMemo(() => {
    const normalizedSelected = selectedBus.map(normalizeBu).filter(Boolean);
    const isAllSelected =
      normalizedSelected.length === 0 ||
      normalizedSelected.includes('all') ||
      normalizedSelected.includes('overall');
    
    // Get entries from matching business units (checking both group and unit names)
    const entries = isAllSelected
      ? businessGroups.flatMap((group) =>
          group.businessUnits.flatMap((unit) => unit.mvaSites ?? [])
        )
      : businessGroups.flatMap((group) => {
          const groupId = normalizeBu(group.group);
          // If the group matches, include all its units' MVA sites
          if (normalizedSelected.includes(groupId)) {
            return group.businessUnits.flatMap((unit) => unit.mvaSites ?? []);
          }
          // Otherwise, check if any sub-BU matches
          return group.businessUnits
            .filter((unit) => normalizedSelected.includes(normalizeBu(unit.name)))
            .flatMap((unit) => unit.mvaSites ?? []);
        });

    const siteIdToName: Record<string, string> = {
      overall: 'Overall',
      'site-a': 'Site A',
      'site-b': 'Site B',
      'site-c': 'Site C',
    };
    const selectedSiteNames =
      selectedCategoryIds.length === 0 || selectedCategoryIds.includes('overall')
        ? new Set(['Overall'])
        : new Set(
            selectedCategoryIds
              .map((id) => siteIdToName[id])
              .filter(Boolean)
          );

    return entries
      .filter((entry) => selectedSiteNames.has(entry.site))
      .reduce(
        (acc, entry) => {
          acc.budgetMvaCost += entry.budgetMvaCost;
          acc.volMixChange += entry.volMixChange;
          acc.laborRateImpact += entry.laborRateImpact;
          acc.dlEfficiencyGap += entry.dlEfficiencyGap;
          acc.idlHcGap += entry.idlHcGap;
          acc.gaVariableEfficiency += entry.gaVariableEfficiency;
          acc.gaFixedCostGap += entry.gaFixedCostGap;
          acc.fxImpact += entry.fxImpact;
          acc.actualMvaCost += entry.actualMvaCost;
          return acc;
        },
        {
          budgetMvaCost: 0,
          volMixChange: 0,
          laborRateImpact: 0,
          dlEfficiencyGap: 0,
          idlHcGap: 0,
          gaVariableEfficiency: 0,
          gaFixedCostGap: 0,
          fxImpact: 0,
          actualMvaCost: 0,
        }
      );
  }, [businessGroups, selectedBus, selectedCategoryIds]);

  useEffect(() => {
    const availableIds = new Set(['overall', 'site-a', 'site-b', 'site-c']);
    const hasValidSelection = selectedCategoryIds.some((id) =>
      availableIds.has(id)
    );
    if (!hasValidSelection) {
      setSelectedCategoryIds(['overall']);
    }
  }, [manufacturingSites, selectedCategoryIds]);

  const manufacturingWaterfallStages = useMemo<FunctionalPerformanceStage[]>(() => {
    const manufacturingClickableIds = new Set(
      manufacturingBuckets.map((bucket) => bucket.id)
    );
    const budgetValue = manufacturingMvaTotals.budgetMvaCost;
    const actualValue = manufacturingMvaTotals.actualMvaCost;
    const volMixDelta = manufacturingMvaTotals.volMixChange;
    const laborRateDelta = manufacturingMvaTotals.laborRateImpact;
    const dlEfficiencyDelta = manufacturingMvaTotals.dlEfficiencyGap;
    const idlHcDelta = manufacturingMvaTotals.idlHcGap;
    const gaVariableDelta = manufacturingMvaTotals.gaVariableEfficiency;
    const gaFixedDelta = manufacturingMvaTotals.gaFixedCostGap;
    const fxDelta = manufacturingMvaTotals.fxImpact;
    let running = budgetValue;
    const nextValue = (delta: number) => {
      running = Number((running + delta).toFixed(1));
      return running;
    };
    const getCostStageType = (delta: number): 'positive' | 'negative' =>
      delta <= 0 ? 'positive' : 'negative';

    return [
      {
        id: 'budget-mva',
        label: 'Budget MVA cost',
        value: Number(budgetValue.toFixed(1)),
        delta: Number(budgetValue.toFixed(1)),
        type: 'baseline',
      },
      {
        id: 'vol-mix-change',
        label: 'Vol mix change',
        value: nextValue(volMixDelta),
        delta: volMixDelta,
        type: getCostStageType(volMixDelta),
        isClickable: manufacturingClickableIds.has('vol-mix-change'),
      },
      {
        id: 'labor-rate-impact',
        label: 'Labour rate impact',
        value: nextValue(laborRateDelta),
        delta: laborRateDelta,
        type: getCostStageType(laborRateDelta),
        isClickable: manufacturingClickableIds.has('labor-rate-impact'),
      },
      {
        id: 'dl-efficiency',
        label: 'DL efficiency gap',
        value: nextValue(dlEfficiencyDelta),
        delta: dlEfficiencyDelta,
        type: getCostStageType(dlEfficiencyDelta),
        isClickable: manufacturingClickableIds.has('dl-efficiency'),
      },
      {
        id: 'idl-hc-gap',
        label: 'IDL HC gap',
        value: nextValue(idlHcDelta),
        delta: idlHcDelta,
        type: getCostStageType(idlHcDelta),
        isClickable: manufacturingClickableIds.has('idl-hc-gap'),
      },
      {
        id: 'ga-variable-gap',
        label: 'GA variable efficiency',
        value: nextValue(gaVariableDelta),
        delta: gaVariableDelta,
        type: getCostStageType(gaVariableDelta),
        isClickable: manufacturingClickableIds.has('ga-variable-gap'),
      },
      {
        id: 'ga-fixed-gap',
        label: 'GA fixed cost gap',
        value: nextValue(gaFixedDelta),
        delta: gaFixedDelta,
        type: getCostStageType(gaFixedDelta),
        isClickable: manufacturingClickableIds.has('ga-fixed-gap'),
      },
      {
        id: 'fx-impact',
        label: 'Fx impact',
        value: nextValue(fxDelta),
        delta: fxDelta,
        type: getCostStageType(fxDelta),
        isClickable: manufacturingClickableIds.has('fx-impact'),
      },
      {
        id: 'actual-mva',
        label: 'Actual MVA cost',
        value: Number(actualValue.toFixed(1)),
        delta: Number(actualValue.toFixed(1)),
        type: 'baseline',
      },
    ];
  }, [manufacturingBuckets, manufacturingMvaTotals]);

  const rndTotals = useMemo(() => {
    const totals = selectedFunctionalUnits.reduce(
      (acc, unit) => {
        const opBudgetScale =
          unit.operatingProfitBudget === 0
            ? 1
            : unit.ytmOperatingProfitBudget / unit.operatingProfitBudget;
        acc.budget += unit.functionalPerformance.rnd.budget * opBudgetScale;
        acc.actual += unit.functionalPerformance.rnd.actual;
        return acc;
      },
      { budget: 0, actual: 0 }
    );
    return {
      budgetValue: Math.abs(roundToOne(toMillions(totals.budget))),
      actualValue: Math.abs(roundToOne(toMillions(totals.actual))),
    };
  }, [selectedFunctionalUnits]);

  const rndWaterfallStages = useMemo<FunctionalPerformanceStage[]>(() => {
    const budgetValue = rndTotals.budgetValue;
    const actualValue = rndTotals.actualValue;
    const totalDelta = actualValue - budgetValue;
    const split = [
      0.12,
      -0.06,
      0.05,
      0.04,
      0.03,
      0.16,
      0.1,
      0.08,
      0.07,
      0.05,
      0.08,
      0.08,
    ];
    const deltas = split.map((ratio) => Number((totalDelta * ratio).toFixed(1)));
    const weights = [
      1.1,
      1.25,
      1.05,
      0.95,
      1.1,
      1.45,
      1.2,
      1.7,
      1.3,
      1.45,
      1.2,
      1.55,
    ];
    const weighted = deltas.map((value, index) =>
      Number((value * (weights[index] ?? 1)).toFixed(1))
    );
    const minDelta = Math.max(1.2, Math.abs(totalDelta) * 0.14);
    const boosted = weighted.map((value) => {
      if (value === 0) return 0;
      const base = Math.max(Math.abs(value), minDelta);
      return Math.sign(value) * Number(base.toFixed(1));
    });
    const roundedDelta = boosted.reduce((sum, value) => sum + value, 0);
    boosted[boosted.length - 1] = Number(
      (totalDelta - (roundedDelta - boosted[boosted.length - 1])).toFixed(1)
    );
    let running = budgetValue;
    const nextValue = (delta: number) => {
      running = Number((running + delta).toFixed(1));
      return running;
    };
    const getCostStageType = (delta: number): 'positive' | 'negative' =>
      delta <= 0 ? 'positive' : 'negative';

    return [
      {
        id: 'rnd-expense-target',
        label: 'R&D expense target',
        value: Number(budgetValue.toFixed(1)),
        delta: Number(budgetValue.toFixed(1)),
        type: 'baseline',
      },
      {
        id: 'project-new',
        label: 'Project newly added',
        value: nextValue(-Math.abs(boosted[0])),
        delta: -Math.abs(boosted[0]),
        type: 'negative',
      },
      {
        id: 'project-cancelled',
        label: 'Project cancelled',
        value: nextValue(Math.abs(boosted[1])),
        delta: Math.abs(boosted[1]),
        type: 'positive',
      },
      {
        id: 'customer-request',
        label: 'Customer request item',
        value: nextValue(boosted[2]),
        delta: boosted[2],
        type: getCostStageType(boosted[2]),
      },
      {
        id: 'timeline-change',
        label: 'Timeline change',
        value: nextValue(boosted[3]),
        delta: boosted[3],
        type: getCostStageType(boosted[3]),
      },
      {
        id: 'cost-accounting',
        label: 'Cost per accounting rule (64) delta',
        value: nextValue(boosted[4]),
        delta: boosted[4],
        type: getCostStageType(boosted[4]),
      },
      {
        id: 'rnd-budget-control',
        label: 'R&D budget controlled by R&D',
        value: Number(running.toFixed(1)),
        delta: Number(running.toFixed(1)),
        type: 'baseline',
      },
      {
        id: 'personnel-delta',
        label: 'Personnel (61) delta',
        value: nextValue(boosted[5]),
        delta: boosted[5],
        type: getCostStageType(boosted[5]),
        isClickable: true,
      },
      {
        id: 'rental-dep',
        label: 'Rental & Dep. (62) delta',
        value: nextValue(boosted[6]),
        delta: boosted[6],
        type: getCostStageType(boosted[6]),
      },
      {
        id: 'travel',
        label: 'Travel (63) delta',
        value: nextValue(boosted[7]),
        delta: boosted[7],
        type: getCostStageType(boosted[7]),
      },
      {
        id: 'prototype',
        label: 'Prototype & testing (64) delta',
        value: nextValue(boosted[8]),
        delta: boosted[8],
        type: getCostStageType(boosted[8]),
      },
      {
        id: 'logistics',
        label: 'Logistics (65) delta',
        value: nextValue(boosted[9]),
        delta: boosted[9],
        type: getCostStageType(boosted[9]),
      },
      {
        id: 'central-support',
        label: 'Central & cross BU support',
        value: nextValue(boosted[10]),
        delta: boosted[10],
        type: getCostStageType(boosted[10]),
      },
      {
        id: 'fx-impact',
        label: 'FX Impact',
        value: nextValue(boosted[11]),
        delta: boosted[11],
        type: getCostStageType(boosted[11]),
      },
      {
        id: 'rnd-expense-actual',
        label: 'R&D expense actual',
        value: Number(actualValue.toFixed(1)),
        delta: Number(actualValue.toFixed(1)),
        type: 'baseline',
      },
    ];
  }, [rndTotals]);

  const activeBucket = [...procurementBuckets, ...manufacturingBuckets].find(
    (bucket) => bucket.id === activeBucketId
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50'>
      <div className='max-w-[1920px] mx-auto px-8 py-8 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              {{
                procurement: 'Functional Performance - Procurement',
                mva: 'Functional Performance - Manufacturing',
                manufacturing: 'Functional Performance - Manufacturing',
                rd: 'Functional Performance - R&D',
                'r&d': 'Functional Performance - R&D',
              }[normalizedFunction] ??
                `Functional Performance - ${scaledFunctionRow?.label ?? functionParam}`}
            </h1>
            <div className='flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2'>
              <span className='px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600 font-semibold'>
                {getStoredTimeframe() === 'ytm'
                  ? 'YTM actuals'
                  : 'Full year'}
              </span>
              <span className='px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600 font-semibold'>
                {selectedBus.length > 0
                  ? `BGs: ${selectedBus.join(', ')}`
                  : 'All BGs'}
              </span>
              {isProcurement && (
                <span className='text-sm text-gray-500'>Mn</span>
              )}
            </div>
          </div>
        </div>

        {isProcurement ? (
          <>
            <div className='space-y-3'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Key call-outs
              </h2>
              <div className='rounded-lg border border-gray-200 bg-white p-6'>
                <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
                  {aiSummaryInsights.map((insight) => (
                    <li key={insight}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 space-y-4'>
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Deviation by category
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  Total spend, USD Mn
                </p>
              </div>
              <div className='overflow-hidden rounded-lg border border-gray-200'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50 border-b border-gray-200'>
                    <tr>
                      <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                        Category
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Budget
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Actual
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Delta vs budget
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {procurementCategories.flatMap((row) => {
                      const delta = row.budget - row.actual;
                      const childIds = row.children?.map(c => c.id) ?? [];
                      // Parent is only checked when consolidated (all children selected → parent ID stored)
                      const isSelected = selectedCategoryIds.includes(row.id);
                      const parentRow = (
                        <tr
                          key={row.id}
                          className='border-b border-gray-200 last:border-b-0'>
                          <td className='px-4 py-3'>
                            <label className='flex items-center gap-3 text-gray-700'>
                              <input
                                type='checkbox'
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedCategoryIds((prev) => {
                                    if (row.id === 'overall') {
                                      return ['overall'];
                                    }
                                    let next = prev.filter(id => id !== 'overall');
                                    
                                    // Check if parent is consolidated (parent ID in selection)
                                    const isConsolidated = next.includes(row.id);
                                    // Check if any children are selected
                                    const hasChildrenSelected = childIds.some(id => next.includes(id));
                                    
                                    if (isConsolidated || hasChildrenSelected) {
                                      // Deselect: remove parent and all children
                                      next = next.filter(id => id !== row.id && !childIds.includes(id));
                                    } else {
                                      // Select: add all children (no consolidation - parent stays unchecked)
                                      childIds.forEach(id => {
                                        if (!next.includes(id)) next.push(id);
                                      });
                                    }
                                    
                                    return next.length === 0 ? ['overall'] : next;
                                  });
                                }}
                              />
                              <span className='font-semibold text-gray-900'>
                                {row.label}
                              </span>
                            </label>
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatMn(row.budget)}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatMn(row.actual)}
                          </td>
                          <td className='px-4 py-3 text-right font-semibold'>
                            <span
                              className={
                                delta >= 0
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }>
                              {formatMn(delta)}
                            </span>
                          </td>
                        </tr>
                      );

                      const children = row.children?.map((child) => {
                        const childDelta = child.budget - child.actual;
                        const isChildSelected = selectedCategoryIds.includes(child.id);
                        const siblingIds = row.children?.map(c => c.id) ?? [];
                        
                        return (
                          <tr
                            key={child.id}
                            className='border-b border-gray-100 last:border-b-0 bg-slate-50'>
                            <td className='px-4 py-2'>
                              <label className='flex items-center gap-3 text-gray-600'>
                                <input
                                  type='checkbox'
                                  checked={isChildSelected}
                                  onChange={() => {
                                    setSelectedCategoryIds((prev) => {
                                      let next = [...prev];
                                      if (next.includes(child.id)) {
                                        next = next.filter((id) => id !== child.id);
                                      } else {
                                        next = [...next, child.id];
                                        const allSiblingsSelected = siblingIds.every((id) =>
                                          next.includes(id)
                                        );
                                        if (allSiblingsSelected) {
                                          next = next.filter(
                                            (id) => !siblingIds.includes(id)
                                          );
                                          next.push(row.id);
                                        }
                                      }

                                      return next.length === 0 ? ['overall'] : next;
                                    });
                                  }}
                                />
                                <span className='pl-6 text-sm'>
                                  {child.label}
                                </span>
                              </label>
                            </td>
                            <td className='px-4 py-2 text-right text-gray-600'>
                              {formatMn(child.budget)}
                            </td>
                            <td className='px-4 py-2 text-right text-gray-600'>
                              {formatMn(child.actual)}
                            </td>
                            <td className='px-4 py-2 text-right font-semibold'>
                              <span
                                className={
                                  childDelta >= 0
                                    ? 'text-emerald-600'
                                    : 'text-rose-600'
                                }>
                                {formatMn(childDelta)}
                              </span>
                            </td>
                          </tr>
                        );
                      });

                      return [parentRow, ...(children ?? [])];
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <FunctionalPerformanceWaterfall
              stages={procurementWaterfallStages}
              title='Deviation waterfall of functional performance - Procurement'
              description='Procurement cost, USD Mn'
              brokenAxis="auto"
              onStageClick={(stage) => {
                if (
                  stage.id === 'volume-change' ||
                  stage.id === 'l3-deviation' ||
                  stage.id === 'l4-deviation'
                ) {
                  setActiveBucketId(stage.id);
                }
              }}
            />
          </>
        ) : isManufacturing ? (
          <>
            <div className='space-y-3'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Key call-outs
              </h2>
              <div className='rounded-lg border border-gray-200 bg-white p-6'>
                <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
                  {manufacturingInsights.map((insight) => (
                    <li key={insight}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 space-y-4'>
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Deviation by site
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  Total MVA cost, USD Mn
                </p>
              </div>
              <div className='overflow-hidden rounded-lg border border-gray-200'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50 border-b border-gray-200'>
                    <tr>
                      <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                        Site
                      </th>
                      <th className='px-4 py-3 text-center font-semibold text-gray-700'>
                        DL
                      </th>
                      <th className='px-4 py-3 text-center font-semibold text-gray-700'>
                        IDL
                      </th>
                      <th className='px-4 py-3 text-center font-semibold text-gray-700'>
                        G&amp;A
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {manufacturingSites.flatMap((row) => {
                      const isSelected = selectedCategoryIds.includes(row.id);
                      const renderCell = (metric: {
                        budget: number;
                        actual: number;
                      }) => (
                        <div className='text-sm text-gray-700'>
                          <div className='font-semibold'>
                            {formatMn(metric.actual)} (actuals)
                          </div>
                          <div className='text-xs text-gray-500'>
                            vs {formatMn(metric.budget)} (budget)
                          </div>
                        </div>
                      );
                      const parentRow = (
                        <tr key={row.id} className='border-b border-gray-200'>
                          <td className='px-4 py-3'>
                            <label className='flex items-center gap-3 text-gray-700'>
                              <input
                                type='checkbox'
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedCategoryIds((prev) => {
                                    if (prev.includes(row.id)) {
                                      const filtered = prev.filter((id) => id !== row.id);
                                      return filtered.length === 0 ? ['overall'] : filtered;
                                    }
                                    return [...prev, row.id];
                                  });
                                }}
                              />
                              <span className='font-semibold text-gray-900'>
                                {row.label}
                              </span>
                            </label>
                          </td>
                          <td className='px-4 py-3 text-center'>
                            {renderCell(row.dl)}
                          </td>
                          <td className='px-4 py-3 text-center'>
                            {renderCell(row.idl)}
                          </td>
                          <td className='px-4 py-3 text-center'>
                            {renderCell(row.ga)}
                          </td>
                        </tr>
                      );

                      const children = (row.children ?? [])
                        .filter(
                          (child): child is NonNullable<typeof child> =>
                            Boolean(child)
                        )
                        .map((child) => (
                        <tr
                          key={child.id}
                          className='border-b border-gray-100 bg-slate-50'>
                          <td className='px-4 py-2'>
                            <label className='flex items-center gap-3 text-gray-600'>
                              <input
                                type='checkbox'
                                checked={selectedCategoryIds.includes(child.id)}
                                onChange={() => {
                                  setSelectedCategoryIds((prev) => {
                                    const next = prev.filter(id => id !== 'overall');
                                    if (next.includes(child.id)) {
                                      const filtered = next.filter(id => id !== child.id);
                                      return filtered.length === 0 ? ['overall'] : filtered;
                                    } else {
                                      return [...next, child.id];
                                    }
                                  });
                                }}
                              />
                              <span className='pl-6 text-sm'>
                                {child.label}
                              </span>
                            </label>
                          </td>
                          <td className='px-4 py-2 text-center'>
                            {renderCell(child.dl)}
                          </td>
                          <td className='px-4 py-2 text-center'>
                            {renderCell(child.idl)}
                          </td>
                          <td className='px-4 py-2 text-center'>
                            {renderCell(child.ga)}
                          </td>
                        </tr>
                      ));

                      return [parentRow, ...(children ?? [])];
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <FunctionalPerformanceWaterfall
              stages={manufacturingWaterfallStages}
              title='Deviation waterfall by key value drivers'
              emphasisStageId='dl-efficiency'
              description='MVA cost, USD Mn'
              barSize={32}
              brokenAxis="auto"
              onStageClick={(stage) => {
                if (stage.isClickable) {
                  setActiveBucketId(stage.id);
                }
              }}
            />
          </>
        ) : isRnD ? (
          <>
            <div className='space-y-3'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Key call-outs
              </h2>
              <div className='rounded-lg border border-gray-200 bg-white p-6'>
                <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
                  {rndInsights.map((insight) => (
                    <li key={insight}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>

            <FunctionalPerformanceWaterfall
              stages={rndWaterfallStages}
              title='Deviation waterfall by key value drivers'
              description='R&D cost, USD Mn'
              barSize={32}
              brokenAxis="auto"
              onStageClick={(stage) => {
                if (stage.id === 'personnel-delta') {
                  setActiveBucketId(stage.id);
                }
              }}
            />
          </>
        ) : (
          <>
            <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h2 className='text-xl font-bold text-gray-900'>
                    Key Call Out
                  </h2>
                  <p className='text-sm text-gray-500 mt-1'>
                    {selectedBus.length > 0
                      ? `Selected BGs: ${selectedBus.join(', ')}`
                      : 'All BGs'}
                  </p>
                </div>
                <span className='px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border-2 border-purple-400 shadow-md shadow-purple-200/50 flex items-center gap-1.5'>
                  <span className='text-sm'>✨</span>
                  <span>AI</span>
                </span>
              </div>
              <div className='space-y-3 text-sm text-gray-700'>
                <p className='leading-relaxed'>{keyCallout.headline}</p>
                <ul className='list-disc list-inside space-y-1'>
                  {keyCallout.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
                <div className='flex items-center gap-2 mb-3 text-sm text-gray-500'>
                  <ChartBarIcon className='w-4 h-4 text-primary-600' />
                  <span>Budget</span>
                </div>
                <div className='text-3xl font-bold text-gray-900'>
                  {formatMn(scaledFunctionRow?.ytmBudget ?? 0)}
                </div>
                <p className='text-xs text-gray-500 mt-2'>YTM budget</p>
              </div>
              <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
                <div className='flex items-center gap-2 mb-3 text-sm text-gray-500'>
                  <ChartBarIcon className='w-4 h-4 text-primary-600' />
                  <span>Actual</span>
                </div>
                <div className='text-3xl font-bold text-gray-900'>
                  {formatMn(scaledFunctionRow?.ytmActuals ?? 0)}
                </div>
                <p className='text-xs text-gray-500 mt-2'>YTM actuals</p>
              </div>
            </div>
          </>
        )}
      </div>

      {activeBucketId && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4'
          onClick={() => setActiveBucketId(null)}>
          <div
            className='w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-gray-200'
            onClick={(event) => event.stopPropagation()}>
            {activeBucketId === 'dl-efficiency' ? (
              <>
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Top initiative deviation
                    </h3>
                  </div>
                  <button
                    type='button'
                    className='rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-gray-300'
                    onClick={() => setActiveBucketId(null)}>
                    Close
                  </button>
                </div>
                <div className='mt-4 space-y-6 text-sm text-gray-700'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr>
                        <th className='text-left font-semibold text-gray-700 pb-2'>
                          Top initiative deviation
                        </th>
                        <th className='text-left font-semibold text-gray-700 pb-2'>
                          Gap to target
                        </th>
                        <th className='text-left font-semibold text-gray-700 pb-2'>
                          KPI impacted
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: 'Initiative 1',
                          gap: '-2.0Mn',
                          kpi: 'UPPH',
                        },
                        {
                          name: 'Initiative 2',
                          gap: '-1.3Mn',
                          kpi: 'UPPH, OEE',
                        },
                      ].map((row) => (
                        <tr key={row.name} className='border-t border-gray-200'>
                          <td className='py-2'>{row.name}</td>
                          <td className='py-2'>{row.gap}</td>
                          <td className='py-2'>{row.kpi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div>
                    <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                      Key Performance Foundations
                    </h4>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr>
                          <th className='text-left font-semibold text-gray-700 pb-2'>
                            Initiative
                          </th>
                          <th className='text-left font-semibold text-gray-700 pb-2'>
                            KPI impacted
                          </th>
                          <th className='text-left font-semibold text-gray-700 pb-2'>
                            Process confirmation date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            name: '17. Performance mgmt.',
                            kpi: 'UPPH',
                            date: '2025.1',
                          },
                          {
                            name: '19. Frontline capabilities',
                            kpi: 'UPPH',
                            date: '2025.4',
                          },
                          {
                            name: '20. Asset / labor productivity',
                            kpi: 'UPPH, OEE',
                            date: '2024.9',
                          },
                          {
                            name: '21. Automation',
                            kpi: 'UPPH',
                            date: '2024.9',
                          },
                        ].map((row) => (
                          <tr key={row.name} className='border-t border-gray-200'>
                            <td className='py-2'>{row.name}</td>
                            <td className='py-2'>{row.kpi}</td>
                            <td className='py-2'>{row.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : activeBucketId === 'personnel-delta' ? (
              <>
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Top initiative deviation
                    </h3>
                  </div>
                  <button
                    type='button'
                    className='rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-gray-300'
                    onClick={() => setActiveBucketId(null)}>
                    Close
                  </button>
                </div>
                <div className='mt-4 space-y-6 text-sm text-gray-700'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr>
                        <th className='text-left font-semibold text-gray-700 pb-2'>
                          Top initiative deviation
                        </th>
                        <th className='text-left font-semibold text-gray-700 pb-2'>
                          Gap to target
                        </th>
                        <th className='text-left font-semibold text-gray-700 pb-2'>
                          KPI impacted
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: 'Initiative 1',
                          gap: '-1.8Mn',
                          kpi: 'HC',
                        },
                        {
                          name: 'Initiative 2',
                          gap: '-2.6Mn',
                          kpi: 'HC',
                        },
                      ].map((row) => (
                        <tr key={row.name} className='border-t border-gray-200'>
                          <td className='py-2'>{row.name}</td>
                          <td className='py-2'>{row.gap}</td>
                          <td className='py-2'>{row.kpi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div>
                    <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                      Key Performance Foundations
                    </h4>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr>
                          <th className='text-left font-semibold text-gray-700 pb-2'>
                            Initiative
                          </th>
                          <th className='text-left font-semibold text-gray-700 pb-2'>
                            KPI impacted
                          </th>
                          <th className='text-left font-semibold text-gray-700 pb-2'>
                            Process confirmation date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            name: '11. Resourcing & project mgmt.',
                            kpi: 'HC',
                            date: '2025.4',
                          },
                          {
                            name: '12. Labor productivity (ME / EE design)',
                            kpi: 'HC',
                            date: '2024.6',
                          },
                        ].map((row) => (
                          <tr key={row.name} className='border-t border-gray-200'>
                            <td className='py-2'>{row.name}</td>
                            <td className='py-2'>{row.kpi}</td>
                            <td className='py-2'>{row.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : activeBucket ? (
              <>
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Top initiative deviation
                    </h3>
                  </div>
                  <button
                    type='button'
                    className='rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-gray-300'
                    onClick={() => setActiveBucketId(null)}>
                    Close
                  </button>
                </div>
                <div className='mt-4 space-y-6 text-sm text-gray-700'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr>
                        <th className='text-left font-semibold text-gray-700 pb-2'>
                          Top initiative deviation
                        </th>
                        <th className='text-left font-semibold text-gray-700 pb-2'>
                          Gap to target
                        </th>
                        <th className='text-left font-semibold text-gray-700 pb-2'>
                          KPI impacted
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBucket.initiatives.map((row) => (
                        <tr key={row.name} className='border-t border-gray-200'>
                          <td className='py-2'>{row.name}</td>
                          <td className='py-2'>{row.gap}</td>
                          <td className='py-2'>{row.kpi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div>
                    <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                      Key Performance Foundations
                    </h4>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr>
                          <th className='text-left font-semibold text-gray-700 pb-2'>
                            Initiative
                          </th>
                          <th className='text-left font-semibold text-gray-700 pb-2'>
                            KPI impacted
                          </th>
                          <th className='text-left font-semibold text-gray-700 pb-2'>
                            Process confirmation date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeBucket.foundations.map((row) => (
                          <tr key={row.name} className='border-t border-gray-200'>
                            <td className='py-2'>{row.name}</td>
                            <td className='py-2'>{row.kpi}</td>
                            <td className='py-2'>{row.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
