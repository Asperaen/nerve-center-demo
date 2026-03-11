import { ChartBarIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import FunctionalPerformanceWaterfall, {
  type FunctionalPerformanceGrouping,
  type FunctionalPerformanceStage,
} from '../components/FunctionalPerformanceWaterfall';
import { useBudgets } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { getAllBusinessGroupData } from '../data/mockBusinessGroupPerformance';
import { mockFunctionDeviationRows } from '../data/mockForecast';
import { getStoredTimeframe } from '../utils/timeframeStorage';
import { KEY_CALLOUTS_BY_BG } from '../data/mockBgData';

const normalizeFunction = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '');

const normalizeBu = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '');

const roundToOne = (value: number) => Math.round(value * 10) / 10;
const toMillions = (value: number) => value / 1_000;

type DeviationDataset = {
  baselineSpend: number;
  targetSpend: number;
  volumeChange: number;
  fxImpact: number;
  l3GapVsTarget: number;
  l4GapVsTarget: number;
  l5GapVsTarget: number;
  actualSpend: number;
  category: string;
  otherFactors?: number;
  inventoryDelay?: number;
  targetPctReduction?: number;
  actualPctReduction?: number;
}

/** Static procurement deviation by category (Total + Category A–E). Numbers only, no invented values. */
const PROCUREMENT_DEVIATION_BY_CATEGORY: DeviationDataset[] = [
  {
    category: 'Total',
    baselineSpend: 567,
    targetSpend: 520,
    targetPctReduction: 8,
    volumeChange: -185,
    fxImpact: 17,
    otherFactors: -42,
    inventoryDelay: 10,
    l3GapVsTarget: -42,
    l4GapVsTarget: 17,
    l5GapVsTarget: 67,
    actualSpend: 525,
    actualPctReduction: 10,
  },
  {
    category: 'Category A',
    baselineSpend: 142,
    targetSpend: 119,
    targetPctReduction: 16,
    volumeChange: -24,
    fxImpact: 17,
    otherFactors: 1,
    inventoryDelay: 2,
    l3GapVsTarget: -10,
    l4GapVsTarget: -2,
    l5GapVsTarget: -1,
    actualSpend: 101,
    actualPctReduction: -9,
  },
  {
    category: 'Category B',
    baselineSpend: 136,
    targetSpend: 120,
    targetPctReduction: 12,
    volumeChange: -24,
    fxImpact: 16,
    otherFactors: 26,
    inventoryDelay: 3,
    l3GapVsTarget: -10,
    l4GapVsTarget: -31,
    l5GapVsTarget: -9,
    actualSpend: 91,
    actualPctReduction: -36,
  },
  {
    category: 'Category C',
    baselineSpend: 74,
    targetSpend: 66,
    targetPctReduction: 10,
    volumeChange: -13,
    fxImpact: 9,
    otherFactors: -55,
    inventoryDelay: 1,
    l3GapVsTarget: -5,
    l4GapVsTarget: 31,
    l5GapVsTarget: 47,
    actualSpend: 80,
    actualPctReduction: 99,
  },
  {
    category: 'Category D',
    baselineSpend: 68,
    targetSpend: 65,
    targetPctReduction: 5,
    volumeChange: -13,
    fxImpact: 8,
    otherFactors: -6,
    inventoryDelay: 2,
    l3GapVsTarget: -5,
    l4GapVsTarget: 5,
    l5GapVsTarget: 6,
    actualSpend: 61,
    actualPctReduction: 9,
  },
  {
    category: 'Category E',
    baselineSpend: 147,
    targetSpend: 150,
    targetPctReduction: -2,
    volumeChange: -111,
    fxImpact: -33,
    otherFactors: -8,
    inventoryDelay: 2,
    l3GapVsTarget: -12,
    l4GapVsTarget: 14,
    l5GapVsTarget: 24,
    actualSpend: 39,
    actualPctReduction: 18,
  },
];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const mulberry32 = (seed: number) => {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const generateDeviationDataset = (
  budgetLineValueForSelectedBUs: number,
  actualLineValueForSelectedBUs: number,
  seedKey: string
): DeviationDataset[] => {
  const normalizedSeed = seedKey.toLowerCase();
  const isPcbgAebu1 =
    normalizedSeed.includes('pcbg') &&
    (normalizedSeed.includes('d/e') ||
      normalizedSeed.includes('d-e') ||
      normalizedSeed.includes('de'));
  const rng = mulberry32(hashString(seedKey));
  const randomBetween = (min: number, max: number) =>
    min + rng() * (max - min);
  const distributeTotal = (total: number, count: number) => {
    const weights = Array.from({ length: count }, () => randomBetween(0.7, 1.3));
    const weightSum = weights.reduce((sum, value) => sum + value, 0) || 1;
    const values = weights.map((weight) => (weight / weightSum) * total);
    const rounded = values.map((value) => roundToOne(value));
    const roundedSum = rounded.slice(0, -1).reduce((sum, value) => sum + value, 0);
    rounded[rounded.length - 1] = roundToOne(total - roundedSum);
    return rounded;
  };
  const distributeDelta = (delta: number) => {
    const positiveCount = 3;
    const negativeCount = 2;
    const positives = Array.from({ length: positiveCount }, () =>
      randomBetween(0.3, 1.4)
    );
    const negatives = Array.from({ length: negativeCount }, () =>
      randomBetween(0.3, 1.4)
    );
    let posSum = positives.reduce((sum, value) => sum + value, 0);
    let negSum = negatives.reduce((sum, value) => sum + value, 0);
    if (delta >= 0 && posSum <= negSum) {
      posSum = negSum + randomBetween(0.5, 1.2);
    }
    if (delta < 0 && negSum <= posSum) {
      negSum = posSum + randomBetween(0.5, 1.2);
    }
    const signedSum = posSum - negSum;
    const scale = signedSum === 0 ? 0 : delta / signedSum;
    const raw = [
      positives[0] * scale,
      positives[1] * scale,
      positives[2] * scale,
      -negatives[0] * scale,
      -negatives[1] * scale,
    ];
    const rounded = raw.map((value) => roundToOne(value));
    const roundedSum = rounded.slice(0, -1).reduce((sum, value) => sum + value, 0);
    rounded[rounded.length - 1] = roundToOne(delta - roundedSum);
    return rounded;
  };

  const clampAndRebalance = (
    values: number[],
    delta: number,
    maxAbs: number,
    preferredIndex: number
  ) => {
    if (maxAbs <= 0) {
      return values;
    }
    const clamped = values.map((value) =>
      Math.max(-maxAbs, Math.min(maxAbs, value))
    );
    let currentSum = clamped.reduce((sum, value) => sum + value, 0);
    let remaining = roundToOne(delta - currentSum);
    if (Math.abs(remaining) < 0.01) {
      return clamped;
    }
    const applyToIndex = (index: number) => {
      if (remaining === 0) {
        return;
      }
      const current = clamped[index];
      const capacity = remaining > 0 ? maxAbs - current : -maxAbs - current;
      if (capacity === 0) {
        return;
      }
      const deltaToApply =
        remaining > 0
          ? Math.min(remaining, capacity)
          : Math.max(remaining, capacity);
      clamped[index] = roundToOne(current + deltaToApply);
      remaining = roundToOne(remaining - deltaToApply);
    };
    applyToIndex(preferredIndex);
    for (let i = 0; i < clamped.length && remaining !== 0; i += 1) {
      if (i === preferredIndex) {
        continue;
      }
      applyToIndex(i);
    }
    return clamped;
  };

  const distributeDeltaForHhDe = (delta: number, minBar: number, maxAbs: number) => {
    const baseNegatives = Array.from({ length: 4 }, () =>
      randomBetween(0.4, 1.6)
    );
    const minValue = Math.max(0.2, minBar);
    const baseNegSum = baseNegatives.reduce((sum, value) => sum + value, 0);
    let negSumTarget = Math.max(minValue * 4, baseNegSum);
    if (negSumTarget + delta < minValue) {
      negSumTarget = minValue - delta;
    }
    const scale = baseNegSum === 0 ? 0 : negSumTarget / baseNegSum;
    let negatives = baseNegatives.map((value) => -value * scale);
    negatives = negatives.map((value) => -Math.max(minValue, Math.abs(value)));
    let negSum = -negatives.reduce((sum, value) => sum + value, 0);
    if (negSum + delta < minValue) {
      const needed = minValue - delta - negSum;
      negatives[negatives.length - 1] -= needed;
      negSum += needed;
    }
    let fx = delta + negSum;
    if (fx < minValue) {
      const bump = minValue - fx;
      negatives[negatives.length - 1] -= bump;
      negSum += bump;
      fx = delta + negSum;
    }
    const raw = [negatives[0], fx, negatives[1], negatives[2], negatives[3]];
    const rounded = raw.map((value) => roundToOne(value));
    const roundedSum = rounded.reduce((sum, value) => sum + value, 0);
    const diff = roundToOne(delta - roundedSum);
    rounded[1] = roundToOne(Math.max(minValue, rounded[1] + diff));
    const signed = [
      -Math.abs(rounded[0]),
      Math.abs(rounded[1]),
      -Math.abs(rounded[2]),
      -Math.abs(rounded[3]),
      -Math.abs(rounded[4]),
    ];
    return clampAndRebalance(signed, delta, maxAbs, 1);
  };

  const categories = Array.from({ length: 5 }, (_, index) => {
    const letter = String.fromCharCode(65 + index);
    return {
      category: `Category ${letter}`,
    };
  });

  const baselineScale = isPcbgAebu1 ? 1.1 : 0.7;
  const actualSpendValues = distributeTotal(
    actualLineValueForSelectedBUs,
    categories.length
  );
  const baselineSpendValues = distributeTotal(
    (isPcbgAebu1 ? actualLineValueForSelectedBUs : budgetLineValueForSelectedBUs) *
      baselineScale,
    categories.length
  );

  // For PCBG AEBU1, distribute the exact budget value across categories to preserve P&L breakdown totals
  const targetSpendValues = isPcbgAebu1
    ? distributeTotal(budgetLineValueForSelectedBUs, categories.length)
    : [];

  return categories.map((item, index) => {
    const actualSpend = actualSpendValues[index];
    const rawBaselineSpend = baselineSpendValues[index];
    const clampToActual = (value: number) =>
      Math.min(Math.max(value, actualSpend * 0.7), actualSpend * 1.3);
    const baselineSpend = isPcbgAebu1
      ? rawBaselineSpend
      : roundToOne(clampToActual(rawBaselineSpend));
    const targetSpend = isPcbgAebu1
      ? roundToOne(targetSpendValues[index])  // Use distributed budget value to preserve totals
      : roundToOne(
          clampToActual(baselineSpend * randomBetween(0.8, 1.1))
        );
    const delta = roundToOne(actualSpend - targetSpend);
    const minBar = Math.abs(actualSpend) * 0.05;
    const maxAbs = Math.abs(actualSpend) * 0.3;
    const [volumeChange, fxImpact, l3GapVsTarget, l4GapVsTarget, l5GapVsTarget] =
      isPcbgAebu1
        ? distributeDeltaForHhDe(delta, minBar, maxAbs)
        : clampAndRebalance(distributeDelta(delta), delta, maxAbs, 1);
    const reconciledActual = roundToOne(
      targetSpend +
        volumeChange +
        fxImpact +
        l3GapVsTarget +
        l4GapVsTarget +
        l5GapVsTarget
    );

    return {
      category: item.category,
      baselineSpend,
      targetSpend,
      volumeChange,
      fxImpact,
      l3GapVsTarget,
      l4GapVsTarget,
      l5GapVsTarget,
      actualSpend: reconciledActual,
    };
  });
};

export default function BusinessUnitPerformanceByFunctionPage() {
  const { functionId } = useParams<{ functionId?: string }>();
  const [searchParams] = useSearchParams();
  const { businessGroups } = useBudgets();
  const { formatAmount, currencyLabel } = useCurrency();
  const formatMn = (value: number) =>
    `${formatAmount(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  const formatPercent = (value: number) => `${roundToOne(value)}%`;
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
  const [selectedProcurementCategoryIds, setSelectedProcurementCategoryIds] =
    useState<string[]>(['total']);

  const categoryToId = (category: string): string =>
    category.toLowerCase().replace(/\s+/g, '-');
  const buParam = searchParams.get('bu') ?? '';
  const bgsParam = searchParams.get('bg') ?? searchParams.get('bgs') ?? '';
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

  // BG display (filters out 'all' and 'overall')
  const displayBgs = useMemo(() => {
    return selectedBgs.filter((item) => {
      const normalized = normalizeBu(item);
      return normalized !== 'overall' && normalized !== 'all';
    });
  }, [selectedBgs]);

  // BU display (already filtered in selectedBus definition)
  const displayBus = selectedBus;

  const scaledRows = useMemo(() => {
    const timeframeParam =
      searchParams.get('toggle') ?? searchParams.get('timeframe');
    const timeframe =
      timeframeParam === 'ytm' || timeframeParam === 'full-year'
        ? timeframeParam
        : getStoredTimeframe();
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

  // Get function-specific insights - check for AEBU1 specific callouts first
  const getInsightsForFunction = useMemo(() => {
    return (functionType: 'procurement' | 'manufacturing' | 'rnd'): string[] => {
      // Check if AEBU1 is selected (either as a single selection or part of multiple)
      const isDEGroupSelected = selectedBus.some(
        (bu) => bu.toLowerCase().includes('d/e group') || bu.toLowerCase().includes('de group')
      );

      if (isDEGroupSelected) {
        const deGroupCallouts = KEY_CALLOUTS_BY_BG['PCBG']?.['AEBU1']?.functionalPerformance?.[functionType];
        if (deGroupCallouts && deGroupCallouts.length > 0) {
          return deGroupCallouts;
        }
      }

      // Fall back to generic insights
      const defaultInsights = {
        procurement: [
          'Procurement is tracking above budget on key spend categories driven by mix and higher input costs.',
          'L3 initiatives are behind target in IDS, while EMS shows stronger pipeline conversion.',
          'FX and part price variance explain most of the delta versus budget for the selected BUs.',
        ],
        manufacturing: [
          'MVA cost is above budget as DL efficiency gains trail plan in Site B and C.',
          'IDL hourly rate pressure is partially offset by favorable fixed MOH absorption.',
          'Variable MOH efficiency gaps remain the largest adverse driver vs budget.',
        ],
        rnd: [
          'R&D spend is tracking above target driven by new project intake and timing shifts.',
          'Personnel delta remains the largest driver against plan, with HC mix changes in core programs.',
          'Central and cross-BU support is stable, while prototype/testing costs trend higher.',
        ],
      };

      return defaultInsights[functionType];
    };
  }, [selectedBus]);

  const aiSummaryInsights = getInsightsForFunction('procurement');
  const manufacturingInsights = getInsightsForFunction('manufacturing');
  const rndInsights = getInsightsForFunction('rnd');

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
        const procurement = unit.functionalPerformance.procurement;
        // Check if this unit has YTM-adjusted procurement values (should not be scaled)
        const isYtmValue = (procurement as any).isYtm === true;

        if (isYtmValue) {
          // These are already YTM values from P&L breakdown, use directly
          acc.budget += procurement.budget;
          acc.actual += procurement.actual;
        } else {
          // Scale full year budget to YTM, actual is already YTM
          const opBudgetScale =
            unit.operatingProfitBudget === 0
              ? 1
              : unit.ytmOperatingProfitBudget / unit.operatingProfitBudget;
          acc.budget += procurement.budget * opBudgetScale;
          acc.actual += procurement.actual;
        }
        return acc;
      },
      { budget: 0, actual: 0 }
    );

    return {
      budget: roundToOne(toMillions(totals.budget)),
      actual: roundToOne(toMillions(totals.actual)),
    };
  }, [selectedFunctionalUnits]);

  const procurementDeviationData = useMemo(() => {
    if (isProcurement) {
      return PROCUREMENT_DEVIATION_BY_CATEGORY.slice(1);
    }
    const selectionKey = [
      ...selectedBgs.map(normalizeBu),
      ...selectedBus.map(normalizeBu),
    ]
      .filter(Boolean)
      .sort()
      .join('|') || 'overall';
    return generateDeviationDataset(
      Math.abs(procurementOverallTotals.budget),
      Math.abs(procurementOverallTotals.actual),
      selectionKey
    );
  }, [isProcurement, procurementOverallTotals, selectedBgs, selectedBus]);

  const procurementDeviationTotals = useMemo(() => {
    if (isProcurement) {
      return PROCUREMENT_DEVIATION_BY_CATEGORY[0];
    }
    const totals = procurementDeviationData.reduce(
      (acc, row) => {
        acc.baselineSpend += row.baselineSpend;
        acc.targetSpend += row.targetSpend;
        acc.volumeChange += row.volumeChange;
        acc.fxImpact += row.fxImpact;
        acc.l3GapVsTarget += row.l3GapVsTarget;
        acc.l4GapVsTarget += row.l4GapVsTarget;
        acc.l5GapVsTarget += row.l5GapVsTarget;
        acc.actualSpend += row.actualSpend;
        return acc;
      },
      {
        baselineSpend: 0,
        targetSpend: 0,
        volumeChange: 0,
        fxImpact: 0,
        l3GapVsTarget: 0,
        l4GapVsTarget: 0,
        l5GapVsTarget: 0,
        actualSpend: 0,
      }
    );
    return {
      category: 'Total',
      ...Object.fromEntries(
        Object.entries(totals).map(([key, value]) => [key, roundToOne(value)])
      ),
    } as DeviationDataset;
  }, [isProcurement, procurementDeviationData]);

  const procurementFilteredTotals = useMemo(() => {
    if (!isProcurement) {
      return procurementDeviationTotals;
    }
    const allRows = [procurementDeviationTotals, ...procurementDeviationData];
    const selectedRows = allRows.filter((row) =>
      selectedProcurementCategoryIds.includes(categoryToId(row.category))
    );
    if (selectedRows.length === 0) {
      return procurementDeviationTotals;
    }
    const totals = selectedRows.reduce(
      (acc, row) => {
        acc.baselineSpend += row.baselineSpend;
        acc.targetSpend += row.targetSpend;
        acc.volumeChange += row.volumeChange;
        acc.fxImpact += row.fxImpact;
        acc.l3GapVsTarget += row.l3GapVsTarget;
        acc.l4GapVsTarget += row.l4GapVsTarget;
        acc.l5GapVsTarget += row.l5GapVsTarget;
        acc.actualSpend += row.actualSpend;
        if (row.otherFactors !== undefined) {
          acc.otherFactors = (acc.otherFactors ?? 0) + row.otherFactors;
        }
        if (row.inventoryDelay !== undefined) {
          acc.inventoryDelay = (acc.inventoryDelay ?? 0) + row.inventoryDelay;
        }
        return acc;
      },
      {
        baselineSpend: 0,
        targetSpend: 0,
        volumeChange: 0,
        fxImpact: 0,
        l3GapVsTarget: 0,
        l4GapVsTarget: 0,
        l5GapVsTarget: 0,
        actualSpend: 0,
        otherFactors: 0 as number | undefined,
        inventoryDelay: 0 as number | undefined,
      }
    );
    const baselineSpend = roundToOne(totals.baselineSpend);
    const targetSpend = roundToOne(totals.targetSpend);
    const actualSpend = roundToOne(totals.actualSpend);
    const result: DeviationDataset = {
      category: 'Total',
      baselineSpend,
      targetSpend,
      volumeChange: roundToOne(totals.volumeChange),
      fxImpact: roundToOne(totals.fxImpact),
      l3GapVsTarget: roundToOne(totals.l3GapVsTarget),
      l4GapVsTarget: roundToOne(totals.l4GapVsTarget),
      l5GapVsTarget: roundToOne(totals.l5GapVsTarget),
      actualSpend,
    };
    if (totals.otherFactors !== undefined) {
      result.otherFactors = roundToOne(totals.otherFactors);
    }
    if (totals.inventoryDelay !== undefined) {
      result.inventoryDelay = roundToOne(totals.inventoryDelay);
    }
    if (baselineSpend > 0) {
      result.targetPctReduction = roundToOne(
        (1 - targetSpend / baselineSpend) * 100
      );
      result.actualPctReduction = roundToOne(
        (1 - actualSpend / baselineSpend) * 100
      );
    }
    return result;
  }, [
    isProcurement,
    selectedProcurementCategoryIds,
    procurementDeviationTotals,
    procurementDeviationData,
  ]);

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

  const procurementWaterfallStages = useMemo<FunctionalPerformanceStage[]>(() => {
    const totals = isProcurement
      ? procurementFilteredTotals
      : procurementDeviationTotals;
    const baselineSpend = Math.abs(totals.baselineSpend);
    const targetSpend = Math.abs(totals.targetSpend);
    const actualSpend = Math.abs(totals.actualSpend);

    let running = roundToOne(targetSpend);
    const nextValue = (delta: number) => {
      running = roundToOne(running + delta);
      return running;
    };
    const getCostStageType = (delta: number): 'positive' | 'negative' =>
      delta <= 0 ? 'positive' : 'negative';

    const useStaticTotals = totals.otherFactors !== undefined;

    if (useStaticTotals) {
      // Use L3, L4, L5; other factors merged into inventory delay
      const otherFactorsDelta = roundToOne(totals.otherFactors ?? 0);
      const inventoryDelayDelta = roundToOne(totals.inventoryDelay ?? 0);
      const inventoryDelayCombinedDelta = roundToOne(otherFactorsDelta + inventoryDelayDelta);
      return [
        {
          id: 'target-spend',
          label: 'Target spend',
          value: roundToOne(baselineSpend),
          delta: roundToOne(baselineSpend),
          type: 'baseline',
          referenceValue: roundToOne(targetSpend),
        },
        {
          id: 'volume-change',
          label: 'Volume change',
          value: nextValue(totals.volumeChange),
          delta: roundToOne(totals.volumeChange),
          type: 'neutral', // Volume change is not a positive/negative "impact" in procurement; show grey
          isClickable: true,
        },
        {
          id: 'fx-impact',
          label: 'FX impact',
          value: nextValue(totals.fxImpact),
          delta: roundToOne(totals.fxImpact),
          type: getCostStageType(totals.fxImpact),
        },
        {
          id: 'inventory-delay',
          label: 'Inventory delay',
          value: nextValue(inventoryDelayCombinedDelta),
          delta: inventoryDelayCombinedDelta,
          type: getCostStageType(inventoryDelayCombinedDelta),
        },
        {
          id: 'l3-deviation',
          label: 'L3 vs budget',
          value: nextValue(totals.l3GapVsTarget),
          delta: roundToOne(totals.l3GapVsTarget),
          type: getCostStageType(totals.l3GapVsTarget),
          isClickable: true,
        },
        {
          id: 'l4-deviation',
          label: 'L4 vs L3 planned',
          value: nextValue(totals.l4GapVsTarget),
          delta: roundToOne(totals.l4GapVsTarget),
          type: getCostStageType(totals.l4GapVsTarget),
          isClickable: true,
        },
        {
          id: 'l5-deviation',
          label: 'L5 vs L4 implemented',
          value: nextValue(totals.l5GapVsTarget),
          delta: roundToOne(totals.l5GapVsTarget),
          type: getCostStageType(totals.l5GapVsTarget),
        },
        {
          id: 'actual-spend',
          label: 'Actual spend',
          value: roundToOne(actualSpend),
          delta: roundToOne(actualSpend),
          type: 'baseline',
        },
      ];
    }

    // Generated data: merge other factors into inventory delay, then derive L3+L4+L5
    const inventoryDelayDelta = roundToOne(Math.abs(targetSpend) * 0.03);
    const otherFactorsDelta = roundToOne(Math.abs(targetSpend) * 0.02);
    const inventoryDelayCombinedDelta = roundToOne(inventoryDelayDelta + otherFactorsDelta);

    const neededGapsSum = roundToOne(
      actualSpend - targetSpend - totals.volumeChange - totals.fxImpact - inventoryDelayCombinedDelta
    );

    const adjustedL3 = roundToOne(neededGapsSum * 0.4);
    const adjustedL4 = roundToOne(neededGapsSum * 0.35);
    const adjustedL5 = roundToOne(neededGapsSum - adjustedL3 - adjustedL4);

    return [
      {
        id: 'target-spend',
        label: 'Target spend',
        value: roundToOne(baselineSpend),
        delta: roundToOne(baselineSpend),
        type: 'baseline',
        referenceValue: roundToOne(targetSpend),
      },
      {
        id: 'volume-change',
        label: 'Volume change',
        value: nextValue(totals.volumeChange),
        delta: roundToOne(totals.volumeChange),
        type: 'neutral', // Volume change is not a positive/negative "impact" in procurement; show light grey
        isClickable: true,
      },
      {
        id: 'fx-impact',
        label: 'FX impact',
        value: nextValue(totals.fxImpact),
        delta: roundToOne(totals.fxImpact),
        type: getCostStageType(totals.fxImpact),
      },
      {
        id: 'inventory-delay',
        label: 'Inventory delay',
        value: nextValue(inventoryDelayCombinedDelta),
        delta: inventoryDelayCombinedDelta,
        type: getCostStageType(inventoryDelayCombinedDelta),
      },
      {
        id: 'l3-deviation',
        label: 'L3 vs budget',
        value: nextValue(adjustedL3),
        delta: roundToOne(adjustedL3),
        type: getCostStageType(adjustedL3),
        isClickable: true,
      },
      {
        id: 'l4-deviation',
        label: 'L4 vs L3 planned',
        value: nextValue(adjustedL4),
        delta: roundToOne(adjustedL4),
        type: getCostStageType(adjustedL4),
        isClickable: true,
      },
      {
        id: 'l5-deviation',
        label: 'L5 vs L4 implemented',
        value: nextValue(adjustedL5),
        delta: roundToOne(adjustedL5),
        type: getCostStageType(adjustedL5),
      },
      {
        id: 'actual-spend',
        label: 'Actual spend',
        value: roundToOne(actualSpend),
        delta: roundToOne(actualSpend),
        type: 'baseline',
      },
    ];
  }, [isProcurement, procurementFilteredTotals, procurementDeviationTotals]);

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
      {
        targetMva: number;
        volumeMixChange: number;
        laborRateChange: number;
        dl: number;
        idl: number;
        gaVar: number;
        gaFixed: number;
        fxImpact: number;
        actualMva: number;
      }
    >();
    for (const entry of entries) {
      const current = siteTotals.get(entry.site) ?? {
        targetMva: 0,
        volumeMixChange: 0,
        laborRateChange: 0,
        dl: 0,
        idl: 0,
        gaVar: 0,
        gaFixed: 0,
        fxImpact: 0,
        actualMva: 0,
      };
      current.targetMva += entry.budgetMvaCost;
      current.volumeMixChange += entry.volMixChange;
      current.laborRateChange += entry.laborRateImpact;
      current.dl += entry.dlEfficiencyGap;
      current.idl += entry.idlHcGap;
      current.gaVar += entry.gaVariableEfficiency;
      current.gaFixed += entry.gaFixedCostGap;
      current.fxImpact += entry.fxImpact;
      current.actualMva += entry.actualMvaCost;
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
    // Only validate site selections when on manufacturing page
    if (!isManufacturing) return;
    
    const availableIds = new Set(['overall', 'site-a', 'site-b', 'site-c']);
    const hasValidSelection = selectedCategoryIds.some((id) =>
      availableIds.has(id)
    );
    if (!hasValidSelection) {
      setSelectedCategoryIds(['overall']);
    }
  }, [isManufacturing, manufacturingSites, selectedCategoryIds]);

  useEffect(() => {
    if (!isProcurement) return;
    if (selectedProcurementCategoryIds.length === 0) {
      setSelectedProcurementCategoryIds(['total']);
    }
  }, [isProcurement, selectedProcurementCategoryIds]);

  const manufacturingWaterfallStages = useMemo<FunctionalPerformanceStage[]>(() => {
    // Only DL efficiency gap bar should be clickable
    const manufacturingClickableIds = new Set(['dl-efficiency']);
    const targetValue = manufacturingMvaTotals.budgetMvaCost;
    const actualValue = manufacturingMvaTotals.actualMvaCost;
    const volMixDelta = manufacturingMvaTotals.volMixChange;
    const fxDelta = manufacturingMvaTotals.fxImpact;
    const laborRateDelta = manufacturingMvaTotals.laborRateImpact;
    const dlEfficiencyDelta = manufacturingMvaTotals.dlEfficiencyGap;
    const idlHcDelta = manufacturingMvaTotals.idlHcGap;
    const gaVariableDelta = manufacturingMvaTotals.gaVariableEfficiency;
    const gaFixedDelta = manufacturingMvaTotals.gaFixedCostGap;
    let running = targetValue;
    const nextValue = (delta: number) => {
      running = Number((running + delta).toFixed(1));
      return running;
    };
    const getCostStageType = (delta: number): 'positive' | 'negative' =>
      delta <= 0 ? 'positive' : 'negative';

    return [
      {
        id: 'target-mva',
        label: 'Target MVA',
        value: 2542,
        delta: 2542,
        type: 'baseline',
        referenceValue: Number(targetValue.toFixed(1)),
      },
      {
        id: 'vol-mix-change',
        label: 'Volume / mix change',
        value: nextValue(volMixDelta),
        delta: volMixDelta,
        type: 'neutral',
        isClickable: manufacturingClickableIds.has('vol-mix-change'),
      },
      {
        id: 'fx-impact',
        label: 'FX impact',
        value: nextValue(fxDelta),
        delta: fxDelta,
        type: getCostStageType(fxDelta),
        isClickable: manufacturingClickableIds.has('fx-impact'),
      },
      {
        id: 'labor-rate-impact',
        label: 'Labor rate change',
        value: nextValue(laborRateDelta),
        delta: laborRateDelta,
        type: getCostStageType(laborRateDelta),
        isClickable: manufacturingClickableIds.has('labor-rate-impact'),
      },
      {
        id: 'dl-efficiency',
        label: 'DL',
        value: nextValue(dlEfficiencyDelta),
        delta: dlEfficiencyDelta,
        type: getCostStageType(dlEfficiencyDelta),
        isClickable: manufacturingClickableIds.has('dl-efficiency'),
      },
      {
        id: 'idl-hc-gap',
        label: 'IDL',
        value: nextValue(idlHcDelta),
        delta: idlHcDelta,
        type: getCostStageType(idlHcDelta),
        isClickable: manufacturingClickableIds.has('idl-hc-gap'),
      },
      {
        id: 'ga-variable-gap',
        label: 'G&A Var',
        value: nextValue(gaVariableDelta),
        delta: gaVariableDelta,
        type: getCostStageType(gaVariableDelta),
        isClickable: manufacturingClickableIds.has('ga-variable-gap'),
      },
      {
        id: 'ga-fixed-gap',
        label: 'G&A Fixed',
        value: nextValue(gaFixedDelta),
        delta: gaFixedDelta,
        type: getCostStageType(gaFixedDelta),
        isClickable: manufacturingClickableIds.has('ga-fixed-gap'),
      },
      {
        id: 'actual-mva',
        label: 'Actual MVA',
        value: Number(actualValue.toFixed(1)),
        delta: Number(actualValue.toFixed(1)),
        type: 'baseline',
      },
    ];
  }, [manufacturingMvaTotals]);

  const manufacturingGroupings = useMemo<FunctionalPerformanceGrouping[]>(
    () => [
      {
        label: 'Uncontrollable',
        stageIds: ['vol-mix-change', 'fx-impact', 'labor-rate-impact'],
      },
      {
        label: 'Controllable (Initiative improvement)',
        stageIds: [
          'dl-efficiency',
          'idl-hc-gap',
          'ga-variable-gap',
          'ga-fixed-gap',
        ],
      },
    ],
    []
  );

  const procurementGroupings = useMemo<FunctionalPerformanceGrouping[]>(
    () => [
      {
        label: 'Uncontrollable',
        stageIds: ['volume-change', 'fx-impact', 'inventory-delay'],
      },
      {
        label: 'Controllable (initiative performance)',
        stageIds: ['l3-deviation', 'l4-deviation', 'l5-deviation'],
      },
    ],
    []
  );

  const rndWaterfallStages = useMemo<FunctionalPerformanceStage[]>(() => {
    // Fixed bar data per spec: 185, 5, -67, 3, -8, 118, -2, -3, -2, -1, 4, 3, -11, 106
    const specValues = [185, 5, -67, 3, -8, 118, -2, -3, -2, -1, 4, 3, -11, 106];
    const getCostStageType = (delta: number): 'positive' | 'negative' =>
      delta <= 0 ? 'positive' : 'negative';

    let running = specValues[0];
    return [
      {
        id: 'target-spend',
        label: 'R&D Expense Target',
        value: 204,
        delta: 204,
        type: 'baseline',
        referenceValue: 185,
      },
      {
        id: 'project-newly-added',
        label: 'Project newly added',
        value: (running += specValues[1]),
        delta: specValues[1],
        type: getCostStageType(specValues[1]),
      },
      {
        id: 'project-cancelled',
        label: 'Project cancelled',
        value: (running += specValues[2]),
        delta: specValues[2],
        type: getCostStageType(specValues[2]),
      },
      {
        id: 'customer-request-item',
        label: 'Customer request item',
        value: (running += specValues[3]),
        delta: specValues[3],
        type: getCostStageType(specValues[3]),
      },
      {
        id: 'timeline-change',
        label: 'Timeline change',
        value: (running += specValues[4]),
        delta: specValues[4],
        type: getCostStageType(specValues[4]),
      },
      {
        id: 'rnd-budget-controlled',
        label: 'R&D budget controlled by R&D',
        value: 118,
        delta: 118,
        type: 'baseline',
      },
      {
        id: 'rnd-personnel',
        label: 'Personnel (61) delta',
        value: (running = 118 + specValues[6]),
        delta: specValues[6],
        type: getCostStageType(specValues[6]),
        isClickable: true,
      },
      {
        id: 'rnd-rental-dep',
        label: 'Rental & Dep. (62) delta',
        value: (running += specValues[7]),
        delta: specValues[7],
        type: getCostStageType(specValues[7]),
      },
      {
        id: 'rnd-travel',
        label: 'Travel (63) delta',
        value: (running += specValues[8]),
        delta: specValues[8],
        type: getCostStageType(specValues[8]),
      },
      {
        id: 'rnd-prototype-testing',
        label: 'Prototype & Testing (64) delta',
        value: (running += specValues[9]),
        delta: specValues[9],
        type: getCostStageType(specValues[9]),
      },
      {
        id: 'rnd-logistics',
        label: 'Logistics (65) delta',
        value: (running += specValues[10]),
        delta: specValues[10],
        type: getCostStageType(specValues[10]),
      },
      {
        id: 'rnd-central-support',
        label: 'Central and cross BU support',
        value: (running += specValues[11]),
        delta: specValues[11],
        type: getCostStageType(specValues[11]),
      },
      {
        id: 'fx-impact',
        label: 'FX Impact',
        value: (running += specValues[12]),
        delta: specValues[12],
        type: getCostStageType(specValues[12]),
      },
      {
        id: 'rnd-expense-actual',
        label: 'R&D expense actual',
        value: 106,
        delta: 106,
        type: 'baseline',
      },
    ];
  }, []);

  // Disable broken axis for R&D since we're scaling deltas directly
  const rndBrokenAxis = undefined;

  const rndGroupings = useMemo<FunctionalPerformanceGrouping[]>(
    () => [
      {
        label: 'FTE',
        stageIds: ['rnd-personnel'],
      },
      {
        label: 'Non FTE',
        stageIds: [
          'rnd-rental-dep',
          'rnd-travel',
          'rnd-prototype-testing',
          'rnd-logistics',
          'rnd-central-support',
        ],
      },
    ],
    []
  );

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
                {displayBgs.length > 0
                  ? displayBgs.join(', ')
                  : 'All BGs'}
              </span>
              {displayBus.length > 0 && (
                <span className='px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600 font-semibold'>
                  {displayBus.join(', ')}
                </span>
              )}
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
                  Total spend, {currencyLabel} Mn
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
                        Baseline spend
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Target spend
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Target % reduction
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Volume change
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        FX impact
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Other factors
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Inventory delay
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        L3 gap vs. target
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        L4 gap vs. target
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        L5 gap vs. target
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Actual spend
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Actual % reduction
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[procurementDeviationTotals, ...procurementDeviationData].map(
                      (row, index) => {
                        const rowId = categoryToId(row.category);
                        const targetReductionDisplay =
                          row.targetPctReduction !== undefined
                            ? row.targetPctReduction
                            : row.baselineSpend === 0
                              ? 0
                              : (row.targetSpend / row.baselineSpend - 1) * 100;
                        const actualReductionDisplay =
                          row.actualPctReduction !== undefined
                            ? row.actualPctReduction
                            : row.baselineSpend === 0
                              ? 0
                              : (row.actualSpend / row.baselineSpend - 1) * 100;
                        return (
                          <tr
                            key={`${row.category}-${index}`}
                            className='border-b border-gray-200 last:border-b-0'>
                            <td className='px-4 py-3'>
                              <label className='flex items-center gap-3 text-gray-700'>
                                <input
                                  type='checkbox'
                                  checked={selectedProcurementCategoryIds.includes(
                                    rowId
                                  )}
                                  onChange={() => {
                                    setSelectedProcurementCategoryIds(
                                      (prev) => {
                                        if (prev.includes(rowId)) {
                                          const filtered = prev.filter(
                                            (id) => id !== rowId
                                          );
                                          return filtered.length === 0
                                            ? ['total']
                                            : filtered;
                                        }
                                        // When selecting any non-Total row, unselect Total
                                        const next = rowId === 'total'
                                          ? [...prev, rowId]
                                          : [...prev.filter((id) => id !== 'total'), rowId];
                                        return next;
                                      }
                                    );
                                  }}
                                />
                                <span className='font-semibold text-gray-900'>
                                  {row.category}
                                </span>
                              </label>
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {formatMn(row.baselineSpend)}
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {formatMn(row.targetSpend)}
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {formatPercent(targetReductionDisplay)}
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {formatMn(row.volumeChange)}
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {formatMn(row.fxImpact)}
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {row.otherFactors !== undefined
                                ? formatMn(row.otherFactors)
                                : '—'}
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {row.inventoryDelay !== undefined
                                ? formatMn(row.inventoryDelay)
                                : '—'}
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {formatMn(row.l3GapVsTarget)}
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {formatMn(row.l4GapVsTarget)}
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {formatMn(row.l5GapVsTarget)}
                            </td>
                            <td className='px-4 py-3 text-right font-semibold text-gray-900'>
                              {formatMn(row.actualSpend)}
                            </td>
                            <td className='px-4 py-3 text-right text-gray-700'>
                              {formatPercent(actualReductionDisplay)}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <FunctionalPerformanceWaterfall
              stages={procurementWaterfallStages}
              title='Deviation waterfall of functional performance - Procurement'
              description={`Procurement cost, ${currencyLabel} Mn`}
              brokenAxis={undefined}
              groupings={procurementGroupings}
              onStageClick={(stage) => {
                if (
                  stage.id === 'volume-change' ||
                  stage.id === 'l3-deviation' ||
                  stage.id === 'l4-deviation'
                ) {
                  setActiveBucketId(stage.id);
                }
              }}
              footerContent={
                <div className='flex items-center justify-between text-sm text-gray-600 px-2'>
                  <div className='flex flex-col gap-0.5'>
                    <span>
                      Target % of reduction{' '}
                      <span className='font-semibold text-gray-900'>
                        {formatPercent(
                          procurementFilteredTotals.targetPctReduction ??
                            (procurementFilteredTotals.baselineSpend === 0
                              ? 0
                              : (1 -
                                  procurementFilteredTotals.targetSpend /
                                    procurementFilteredTotals.baselineSpend) *
                                100)
                        )}
                      </span>
                    </span>
                    <span>
                      Target value of reduction{' '}
                      <span className='font-semibold text-gray-900'>
                        {formatMn(
                          roundToOne(
                            procurementFilteredTotals.baselineSpend -
                              procurementFilteredTotals.targetSpend
                          )
                        )}
                      </span>
                    </span>
                  </div>
                  <div className='flex flex-col gap-0.5 text-right'>
                    <span>
                      Actual % of reduction (Initiatives only){' '}
                      <span className='font-semibold text-gray-900'>
                        {formatPercent(
                          procurementFilteredTotals.actualPctReduction ??
                            (procurementFilteredTotals.baselineSpend === 0
                              ? 0
                              : (1 -
                                  procurementFilteredTotals.actualSpend /
                                    procurementFilteredTotals.baselineSpend) *
                                100)
                        )}
                      </span>
                    </span>
                    <span>
                      Actual value of reduction (Initiatives only){' '}
                      <span className='font-semibold text-gray-900'>
                        {formatMn(
                          roundToOne(
                            procurementFilteredTotals.baselineSpend -
                              procurementFilteredTotals.actualSpend
                          )
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              }
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
                  Total MVA cost, {currencyLabel} Mn
                </p>
              </div>
              <div className='overflow-hidden rounded-lg border border-gray-200'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50 border-b border-gray-200'>
                    <tr>
                      <th className='px-4 py-3 text-left font-semibold text-gray-700'>
                        Site
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Target MVA
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Volume / mix change
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Labor rate change
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        DL
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        IDL
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        G&A Var
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        G&A Fixed
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        FX impact
                      </th>
                      <th className='px-4 py-3 text-right font-semibold text-gray-700'>
                        Actual MVA
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {manufacturingSites.flatMap((row) => {
                      const isSelected = selectedCategoryIds.includes(row.id);
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
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatMn(row.targetMva)}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatMn(row.volumeMixChange)}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatMn(row.laborRateChange)}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatMn(row.dl)}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatMn(row.idl)}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatMn(row.gaVar)}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatMn(row.gaFixed)}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatMn(row.fxImpact)}
                          </td>
                          <td className='px-4 py-3 text-right text-gray-700'>
                            {formatMn(row.actualMva)}
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
                          <td className='px-4 py-2 text-right text-gray-700'>
                            {formatMn(child.targetMva)}
                          </td>
                          <td className='px-4 py-2 text-right text-gray-700'>
                            {formatMn(child.volumeMixChange)}
                          </td>
                          <td className='px-4 py-2 text-right text-gray-700'>
                            {formatMn(child.laborRateChange)}
                          </td>
                          <td className='px-4 py-2 text-right text-gray-700'>
                            {formatMn(child.dl)}
                          </td>
                          <td className='px-4 py-2 text-right text-gray-700'>
                            {formatMn(child.idl)}
                          </td>
                          <td className='px-4 py-2 text-right text-gray-700'>
                            {formatMn(child.gaVar)}
                          </td>
                          <td className='px-4 py-2 text-right text-gray-700'>
                            {formatMn(child.gaFixed)}
                          </td>
                          <td className='px-4 py-2 text-right text-gray-700'>
                            {formatMn(child.fxImpact)}
                          </td>
                          <td className='px-4 py-2 text-right text-gray-700'>
                            {formatMn(child.actualMva)}
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
              description={`MVA cost, ${currencyLabel} Mn`}
              barSize={32}
              brokenAxis={undefined}
              groupings={manufacturingGroupings}
              onStageClick={(stage) => {
                if (stage.isClickable) {
                  setActiveBucketId(stage.id);
                }
              }}
              footerContent={
                <div className='flex items-center justify-between text-sm text-gray-600 px-2'>
                  <div className='flex flex-col gap-0.5'>
                    <span>
                      Target % of reduction{' '}
                      <span className='font-semibold text-gray-900'>
                        {formatPercent(9)}
                      </span>
                    </span>
                    <span>
                      Target value of reduction{' '}
                      <span className='font-semibold text-gray-900'>
                        {formatMn(231)}
                      </span>
                    </span>
                  </div>
                  <div className='flex flex-col gap-0.5 text-right'>
                    <span>
                      Actual % of reduction (Initiatives only){' '}
                      <span className='font-semibold text-gray-900'>
                        {formatPercent(10.2)}
                      </span>
                    </span>
                    <span>
                      Actual value of reduction (Initiatives only){' '}
                      <span className='font-semibold text-gray-900'>
                        {formatMn(188)}
                      </span>
                    </span>
                  </div>
                </div>
              }
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
              description={`R&D cost, ${currencyLabel} Mn`}
              barSize={32}
              brokenAxis={rndBrokenAxis}
              groupings={rndGroupings}
              onStageClick={(stage) => {
                if (stage.id === 'rnd-personnel') {
                  setActiveBucketId(stage.id);
                }
              }}
              footerContent={
                <div className='flex items-center justify-between text-sm text-gray-600 px-2'>
                  <div className='flex flex-col gap-0.5'>
                    <span>
                      Target % of reduction{' '}
                      <span className='font-semibold text-gray-900'>
                        {formatPercent(9)}
                      </span>
                    </span>
                    <span>
                      Target value of reduction{' '}
                      <span className='font-semibold text-gray-900'>
                        {formatMn(19)}
                      </span>
                    </span>
                  </div>
                  <div className='flex flex-col gap-0.5 text-right'>
                    <span>
                      Actual % of reduction (Initiatives only){' '}
                      <span className='font-semibold text-gray-900'>
                        {formatPercent(10)}
                      </span>
                    </span>
                    <span>
                      Actual value of reduction (Initiatives only){' '}
                      <span className='font-semibold text-gray-900'>
                        {formatMn(12)}
                      </span>
                    </span>
                  </div>
                </div>
              }
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
                    {displayBgs.length > 0 || displayBus.length > 0
                      ? [
                          displayBgs.length > 0 ? displayBgs.join(', ') : null,
                          displayBus.length > 0 ? displayBus.join(', ') : null,
                        ].filter(Boolean).join(' | ')
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
            {(activeBucketId === 'l3-deviation' || activeBucketId === 'l4-deviation') ? (
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
                          KPI impacted
                        </th>
                        <th className='text-right font-semibold text-gray-700 pb-2'>
                          KPI target
                        </th>
                        <th className='text-right font-semibold text-gray-700 pb-2'>
                          KPI actual
                        </th>
                        <th className='text-right font-semibold text-gray-700 pb-2'>
                          Gap to target
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { kpi: 'Unit price', target: 2.3, actual: 3.5, gap: -65 },
                        { kpi: 'Unit price', target: 41.6, actual: 42.1, gap: -74 },
                      ].map((row, i) => (
                        <tr key={i} className='border-t border-gray-200'>
                          <td className='py-2'>{row.kpi}</td>
                          <td className='py-2 text-right'>{row.target}</td>
                          <td className='py-2 text-right'>{row.actual}</td>
                          <td className='py-2 text-right'>{row.gap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <table className='w-full text-sm'>
                    <thead>
                      <tr>
                        <th className='text-left font-semibold text-gray-700 pb-2'>
                          Initiative #
                        </th>
                        <th className='text-right font-semibold text-gray-700 pb-2'>
                          Gap to target
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { initiativeNo: 45233, gap: -65 },
                        { initiativeNo: 58966, gap: -74 },
                      ].map((row) => (
                        <tr key={row.initiativeNo} className='border-t border-gray-200'>
                          <td className='py-2'>{row.initiativeNo}</td>
                          <td className='py-2 text-right'>{row.gap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div>
                    <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                      Key Performance Foundation
                    </h4>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr>
                          <th className='text-left font-semibold text-gray-700 pb-2'>
                            Performance foundation
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
                        <tr className='border-t border-gray-200'>
                          <td className='py-2'>Category % spend optimization</td>
                          <td className='py-2'>Unit price</td>
                          <td className='py-2'>2025.2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : activeBucketId === 'dl-efficiency' ? (
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
                          KPI impacted
                        </th>
                        <th className='text-right font-semibold text-gray-700 pb-2'>
                          KPI target
                        </th>
                        <th className='text-right font-semibold text-gray-700 pb-2'>
                          KPI actual
                        </th>
                        <th className='text-right font-semibold text-gray-700 pb-2'>
                          Gap to target
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { kpi: 'UPPH', target: '3.7', actual: '3.1', gap: -54 },
                        { kpi: 'OEE', target: '95%', actual: '92%', gap: -55 },
                      ].map((row, i) => (
                        <tr key={i} className='border-t border-gray-200'>
                          <td className='py-2'>{row.kpi}</td>
                          <td className='py-2 text-right'>{row.target}</td>
                          <td className='py-2 text-right'>{row.actual}</td>
                          <td className='py-2 text-right'>{row.gap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <table className='w-full text-sm'>
                    <thead>
                      <tr>
                        <th className='text-left font-semibold text-gray-700 pb-2'>
                          Initiative #
                        </th>
                        <th className='text-right font-semibold text-gray-700 pb-2'>
                          Gap to target
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { initiativeNo: 15667, gap: -54 },
                        { initiativeNo: 54778, gap: -55 },
                      ].map((row) => (
                        <tr key={row.initiativeNo} className='border-t border-gray-200'>
                          <td className='py-2'>{row.initiativeNo}</td>
                          <td className='py-2 text-right'>{row.gap}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div>
                    <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                      Key Performance Foundation
                    </h4>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr>
                          <th className='text-left font-semibold text-gray-700 pb-2'>
                            Performance foundation
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
                            name: 'Performance mgmt.',
                            kpi: 'UPPH',
                            date: '2025.1',
                          },
                          {
                            name: 'Frontline capabilities',
                            kpi: 'UPPH',
                            date: '2024.4',
                          },
                          {
                            name: 'Asset / labor productivity',
                            kpi: 'UPPH, OEE',
                            date: '2024.9',
                          },
                          {
                            name: 'Automation',
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
            ) : activeBucketId === 'rnd-personnel' ? (
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
                          gap: '-1.5Mn',
                          kpi: 'Utilization',
                        },
                        {
                          name: 'Initiative 2',
                          gap: '-2.2Mn',
                          kpi: 'Utilization',
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
                            Performance foundation
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
                            name: 'Resourcing and project management',
                            kpi: 'Utilization',
                            date: '2025.1',
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
                            Performance foundation
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
                            Performance foundation
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
