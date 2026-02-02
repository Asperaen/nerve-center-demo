import { CogIcon } from '@heroicons/react/16/solid';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeaderFilters from '../components/HeaderFilters';
import { type TimeframeOption, type TimeframeOptionItem } from '../components/TimeframePicker';
import { WAVE_LINK } from '../constants';
import { useBudgets } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';
import type { BgInitiativePerformanceRow, BudgetWaterfallRow } from '../data/mockBgData';
import {
  BG_INITIATIVE_PERFORMANCE,
  BUDGET_WATERFALL_DATA,
  KEY_CALLOUTS_BY_BG,
} from '../data/mockBgData';
import { getMainBusinessGroupOptions } from '../data/mockBusinessGroupPerformance';
import {
  getStoredTimeframe,
  setStoredTimeframe,
} from '../utils/timeframeStorage';

type PlanRow = {
  id: string;
  label: string;
  sponsor?: string;
  total: number;
  l1: number;
  l2: number;
  l3: number;
  pctL1: number;
  pctL2: number;
  pctL3: number;
  runRateTarget?: number;
  runRateImpact?: number;
  countL1: number;
  owners: number;
  avgPerIo: number;
  isGroup?: boolean;
  isSub?: boolean;
  isTotal?: boolean;
};

const PLAN_TABLE_ROWS: PlanRow[] = [
  {
    id: 'topline',
    label: 'Topline VS',
    total: 35.0,
    l1: 12.0,
    l2: 12.0,
    l3: 6.0,
    pctL1: 34,
    pctL2: 34,
    pctL3: 17,
    countL1: 47,
    owners: 24,
    avgPerIo: 2.0,
    isGroup: true,
  },
  {
    id: 'topline-sub-1',
    label: 'Sub-VS1A',
    sponsor: 'Mr. A',
    total: 10.0,
    l1: 6.0,
    l2: 6.0,
    l3: 3.0,
    pctL1: 60,
    pctL2: 60,
    pctL3: 30,
    countL1: 11,
    owners: 7,
    avgPerIo: 1.6,
    isSub: true,
  },
  {
    id: 'topline-sub-2',
    label: 'Sub-VS2B',
    sponsor: 'Mr. B',
    total: 20.0,
    l1: 3.0,
    l2: 3.0,
    l3: 1.5,
    pctL1: 15,
    pctL2: 15,
    pctL3: 8,
    countL1: 35,
    owners: 16,
    avgPerIo: 2.2,
    isSub: true,
  },
  {
    id: 'topline-sub-3',
    label: 'Sub-VS3C',
    sponsor: 'Mr. C',
    total: 5.0,
    l1: 3.0,
    l2: 3.0,
    l3: 1.5,
    pctL1: 60,
    pctL2: 60,
    pctL3: 30,
    countL1: 1,
    owners: 1,
    avgPerIo: 1.0,
    isSub: true,
  },
  {
    id: 'mfg',
    label: 'MFG VS',
    total: 40.0,
    l1: 19.0,
    l2: 18.6,
    l3: 8.0,
    pctL1: 48,
    pctL2: 46,
    pctL3: 20,
    countL1: 496,
    owners: 139,
    avgPerIo: 3.6,
    isGroup: true,
  },
  {
    id: 'mfg-sub-1',
    label: 'Sub-VS2A',
    sponsor: 'Mr. D',
    total: 20.0,
    l1: 10.0,
    l2: 10.2,
    l3: 5.0,
    pctL1: 50,
    pctL2: 51,
    pctL3: 25,
    countL1: 219,
    owners: 55,
    avgPerIo: 4.0,
    isSub: true,
  },
  {
    id: 'mfg-sub-2',
    label: 'Sub-VS2B',
    sponsor: 'Mr. E',
    total: 15.0,
    l1: 7.0,
    l2: 6.4,
    l3: 3.0,
    pctL1: 47,
    pctL2: 43,
    pctL3: 20,
    countL1: 273,
    owners: 81,
    avgPerIo: 3.4,
    isSub: true,
  },
  {
    id: 'mfg-sub-3',
    label: 'Sub-VS2C',
    sponsor: 'Mr. F',
    total: 5.0,
    l1: 2.0,
    l2: 2.0,
    l3: 0.0,
    pctL1: 40,
    pctL2: 40,
    pctL3: 0,
    countL1: 4,
    owners: 3,
    avgPerIo: 1.3,
    isSub: true,
  },
  {
    id: 'rd',
    label: 'R&D',
    total: 8.0,
    l1: 5.5,
    l2: 5.7,
    l3: 4.1,
    pctL1: 69,
    pctL2: 71,
    pctL3: 51,
    countL1: 72,
    owners: 39,
    avgPerIo: 1.8,
    isGroup: true,
  },
  {
    id: 'rd-sub-1',
    label: 'Sub-VS3A',
    sponsor: 'Mr. G',
    total: 2.0,
    l1: 2.0,
    l2: 2.0,
    l3: 1.0,
    pctL1: 100,
    pctL2: 100,
    pctL3: 50,
    countL1: 16,
    owners: 9,
    avgPerIo: 1.8,
    isSub: true,
  },
  {
    id: 'rd-sub-2',
    label: 'Sub-VS3B',
    sponsor: 'Mr. H',
    total: 3.0,
    l1: 1.5,
    l2: 1.6,
    l3: 1.0,
    pctL1: 50,
    pctL2: 52,
    pctL3: 33,
    countL1: 13,
    owners: 3,
    avgPerIo: 4.3,
    isSub: true,
  },
  {
    id: 'rd-sub-3',
    label: 'Sub-VS3C',
    sponsor: 'Mr. I',
    total: 1.0,
    l1: 1.0,
    l2: 1.0,
    l3: 1.0,
    pctL1: 100,
    pctL2: 100,
    pctL3: 100,
    countL1: 15,
    owners: 7,
    avgPerIo: 2.1,
    isSub: true,
  },
  {
    id: 'rd-sub-4',
    label: 'Sub-VS34',
    sponsor: 'Mr. J',
    total: 1.0,
    l1: 0.8,
    l2: 0.9,
    l3: 0.9,
    pctL1: 80,
    pctL2: 90,
    pctL3: 90,
    countL1: 13,
    owners: 10,
    avgPerIo: 1.3,
    isSub: true,
  },
  {
    id: 'procurement',
    label: 'Procurement/BOM',
    sponsor: 'Mr. K',
    total: 60.0,
    l1: 62.0,
    l2: 62.0,
    l3: 30.0,
    pctL1: 103,
    pctL2: 103,
    pctL3: 50,
    countL1: 347,
    owners: 49,
    avgPerIo: 7.1,
    isGroup: true,
  },
  {
    id: 'total',
    label: 'Total',
    total: 143.0,
    l1: 98.5,
    l2: 98.2,
    l3: 48.1,
    pctL1: 69,
    pctL2: 69,
    pctL3: 34,
    countL1: 962,
    owners: 251,
    avgPerIo: 3.8,
    isTotal: true,
  },
];


const getTimeframeScale = (monthsSelected: number) => {
  const safeMonths = Math.max(1, Math.min(12, monthsSelected));
  return safeMonths / 12;
};

const normalizeGroupId = (groupName: string) => {
  const key = groupName.trim().toLowerCase();
  return key === 'other' ? 'others' : key;
};

const normalizeLabel = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const getUnitId = (groupId: string, unitName: string) =>
  `${groupId}-${unitName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toMillions = (value: number) => value / 1_000;

 

export default function IdeationProgressPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { businessGroups } = useBudgets();
  const { currencyLabel, formatAmount } = useCurrency();
  const formatMnValue = (value: number, digits: number = 1) =>
    formatAmount(value, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  const mainBuOptions = getMainBusinessGroupOptions();
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeOption>(() => {
    const stored = getStoredTimeframe();
    return stored === 'ytm' || stored === 'full-year' ? stored : 'full-year';
  });
  const [selectedBu, setSelectedBu] = useState<string>(() => {
    const bgParam = searchParams.get('bg') ?? searchParams.get('bu');
    if (!bgParam || bgParam === 'all') {
      return 'all';
    }
    const buOptions = getMainBusinessGroupOptions();
    const validBu = buOptions.find((bu) => bu.id === bgParam);
    return validBu ? validBu.id : bgParam;
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );

  const selectedGroupInfo = useMemo(() => {
    if (selectedBu === 'all') {
      return null;
    }
    const normalizedSelected = normalizeLabel(selectedBu);
    const groupMatch = businessGroups.find(
      (group) =>
        normalizeLabel(normalizeGroupId(group.group)) === normalizedSelected
    );
    if (groupMatch) {
      return { group: groupMatch, unit: null };
    }
    for (const group of businessGroups) {
      const unitMatch = group.businessUnits.find(
        (unit) => normalizeLabel(unit.name) === normalizedSelected
      );
      if (unitMatch) {
        return { group, unit: unitMatch };
      }
    }
    return null;
  }, [businessGroups, selectedBu]);

  const monthlyImpactPlanRows = useMemo<PlanRow[]>(() => {
    const normalizedSelected = normalizeLabel(selectedBu);
    const selectedGroups =
      selectedBu === 'all'
        ? businessGroups
        : businessGroups.filter(
            (group) =>
              normalizeLabel(normalizeGroupId(group.group)) === normalizedSelected
          );
    const resolvedGroups =
      selectedGroups.length > 0
        ? selectedGroups
        : businessGroups.filter((group) =>
            group.businessUnits.some(
              (unit) => normalizeLabel(unit.name) === normalizedSelected
            )
          );
    const activeGroups =
      resolvedGroups.length > 0 ? resolvedGroups : businessGroups;

    const selectedUnitNames = (() => {
      if (!selectedGroupInfo) {
        return null as string[] | null;
      }
      const groupId = normalizeGroupId(selectedGroupInfo.group.group);
      const overallId = `${groupId}-overall`;
      const selectedUnitIds = Array.from(selectedGroupIds).filter(
        (id) => id !== overallId
      );
      if (selectedUnitIds.length === 0) {
        return null;
      }
      return selectedGroupInfo.group.businessUnits
        .filter((unit) => selectedUnitIds.includes(getUnitId(groupId, unit.name)))
        .map((unit) => unit.name);
    })();

    const initiativeRows: BgInitiativePerformanceRow[] = [];
    activeGroups.forEach((group) => {
      const buEntries = BG_INITIATIVE_PERFORMANCE[group.group] ?? [];
      buEntries.forEach((buEntry) => {
        if (
          selectedGroupInfo &&
          group.group === selectedGroupInfo.group.group &&
          selectedUnitNames &&
          !selectedUnitNames.includes(buEntry.bu)
        ) {
          return;
        }
        if (
          selectedGroupInfo &&
          selectedGroupInfo.unit &&
          buEntry.bu !== selectedGroupInfo.unit.name
        ) {
          return;
        }
        initiativeRows.push(...buEntry.initiatives);
      });
    });

    const selectedBudgetRows = (() => {
      if (BUDGET_WATERFALL_DATA.length === 0) {
        return [] as BudgetWaterfallRow[];
      }
      if (selectedBu === 'all') {
        return BUDGET_WATERFALL_DATA;
      }
      const selectedBgName =
        selectedGroupInfo?.group.group ??
        mainBuOptions.find((bu) => bu.id === selectedBu)?.name ??
        selectedBu;
      const bgRows = BUDGET_WATERFALL_DATA.filter((row) => row.bg === selectedBgName);
      if (!selectedGroupInfo) {
        return bgRows;
      }
      const groupId = normalizeGroupId(selectedGroupInfo.group.group);
      const overallId = `${groupId}-overall`;
      const selectedUnitIds = Array.from(selectedGroupIds).filter(
        (id) => id !== overallId
      );
      if (selectedUnitIds.length === 0) {
        return bgRows;
      }
      const selectedUnitNames = selectedGroupInfo.group.businessUnits
        .filter((unit) => selectedUnitIds.includes(getUnitId(groupId, unit.name)))
        .map((unit) => unit.name);
      if (selectedUnitNames.length === 0) {
        return bgRows;
      }
      return bgRows.filter((row) => selectedUnitNames.includes(row.bu));
    })();
    const ideationTargetFullYearMn =
      selectedBudgetRows.length > 0
        ? selectedBudgetRows.reduce((sum, row) => sum + row.ideationTarget, 0)
        : toMillions(
            businessGroups
              .flatMap((group) => group.businessUnits)
              .reduce((sum, unit) => sum + unit.ideationTarget, 0)
          );
    const totalInitiativeTarget = initiativeRows.reduce(
      (sum, row) => sum + row.target,
      0
    );
    const scaleInitiativeValues =
      totalInitiativeTarget === 0 ? 0 : ideationTargetFullYearMn / totalInitiativeTarget;
    const scaledInitiativeRows =
      scaleInitiativeValues === 1
        ? initiativeRows
        : initiativeRows.map((row) => ({
            ...row,
            target: row.target * scaleInitiativeValues,
            l1ImpactYtm: row.l1ImpactYtm * scaleInitiativeValues,
            l2ImpactYtm: row.l2ImpactYtm * scaleInitiativeValues,
            l3ImpactYtm: row.l3ImpactYtm * scaleInitiativeValues,
          }));

    if (scaledInitiativeRows.length === 0) {
      const baseTotal =
        PLAN_TABLE_ROWS.find((row) => row.isTotal)?.total ??
        PLAN_TABLE_ROWS.reduce((sum, row) => sum + row.total, 0);
      const fallbackScale =
        baseTotal === 0 ? 0 : ideationTargetFullYearMn / baseTotal;
      const roundPct = (value: number) => Math.round(value * 10) / 10;
      return PLAN_TABLE_ROWS.map((row) => {
        const total = row.total * fallbackScale;
        const l1 = row.l1 * fallbackScale;
        const l2 = row.l2 * fallbackScale;
        const l3 = row.l3 * fallbackScale;
        const pctL1 = total === 0 ? 0 : roundPct((l1 / total) * 100);
        const pctL2 = total === 0 ? 0 : roundPct((l2 / total) * 100);
        const pctL3 = total === 0 ? 0 : roundPct((l3 / total) * 100);
        const countL1 = Math.max(0, Math.round(total / 5));
        const owners = Math.max(0, Math.round(total / 10));
        const avgPerIo = total === 0 ? 0 : total / Math.max(1, countL1);
        return {
          ...row,
          total,
          l1,
          l2,
          l3,
          pctL1: clamp(pctL1, 0, 140),
          pctL2: clamp(pctL2, 0, 140),
          pctL3: clamp(pctL3, 0, 140),
          runRateTarget: row.runRateTarget ? total : row.runRateTarget,
          runRateImpact: row.runRateImpact ? l3 : row.runRateImpact,
          countL1,
          owners,
          avgPerIo,
        };
      });
    }

    const aggregateByVs =
      selectedBu === 'all' ||
      activeGroups.length > 1 ||
      (selectedUnitNames ? selectedUnitNames.length > 1 : false);
    const parentOrder: string[] = [];
    const parentTotals = new Map<
      string,
      { target: number; l1: number; l2: number; l3: number }
    >();
    const lineItems = new Map<
      string,
      { parent: string; vs: string; target: number; l1: number; l2: number; l3: number; sponsor?: string }
    >();

    scaledInitiativeRows.forEach((row) => {
      const parent = row.parentVs ?? row.vs;
      if (!parentTotals.has(parent)) {
        parentTotals.set(parent, { target: 0, l1: 0, l2: 0, l3: 0 });
        parentOrder.push(parent);
      }
      const parentEntry = parentTotals.get(parent)!;
      parentEntry.target += row.target;
      parentEntry.l1 += row.l1ImpactYtm;
      parentEntry.l2 += row.l2ImpactYtm;
      parentEntry.l3 += row.l3ImpactYtm;

      if (row.parentVs) {
        const key = `${parent}||${row.vs}`;
        const line = lineItems.get(key) ?? {
          parent,
          vs: row.vs,
          target: 0,
          l1: 0,
          l2: 0,
          l3: 0,
          sponsor: row.sponsor,
        };
        line.target += row.target;
        line.l1 += row.l1ImpactYtm;
        line.l2 += row.l2ImpactYtm;
        line.l3 += row.l3ImpactYtm;
        lineItems.set(key, line);
      }
    });

    const toPlanRow = (
      label: string,
      target: number,
      l1: number,
      l2: number,
      l3: number,
      isGroup: boolean,
      isSub: boolean,
      sponsor?: string
    ): PlanRow => {
      const roundPct = (value: number) => Math.round(value * 10) / 10;
      const pctL1 = roundPct(target === 0 ? 0 : (l1 / target) * 100);
      const pctL2 = roundPct(target === 0 ? 0 : (l2 / target) * 100);
      const pctL3 = roundPct(target === 0 ? 0 : (l3 / target) * 100);
      const countL1 = Math.max(0, Math.round(target / 5));
      const owners = Math.max(0, Math.round(target / 10));
      const avgPerIo = target === 0 ? 0 : target / Math.max(1, countL1);
      return {
        id: label.toLowerCase().replace(/\s+/g, '-'),
        label,
        sponsor,
        total: target,
        l1,
        l2,
        l3,
        pctL1: clamp(pctL1, 0, 140),
        pctL2: clamp(pctL2, 0, 140),
        pctL3: clamp(pctL3, 0, 140),
        runRateTarget: target,
        runRateImpact: l3,
        countL1,
        owners,
        avgPerIo,
        isGroup,
        isSub,
      };
    };

    const rows: PlanRow[] = [];
    parentOrder.forEach((parentLabel) => {
      const parentEntry = parentTotals.get(parentLabel);
      if (!parentEntry) {
        return;
      }
      rows.push(
        toPlanRow(
          parentLabel,
          parentEntry.target,
          parentEntry.l1,
          parentEntry.l2,
          parentEntry.l3,
          true,
          false
        )
      );
      const childLines = new Map<string, typeof lineItems extends Map<string, infer V> ? V : never>();
      Array.from(lineItems.values())
        .filter((line) => line.parent === parentLabel)
        .forEach((line) => {
          const key = normalizeLabel(line.vs);
          const existing = childLines.get(key);
          if (!existing) {
            childLines.set(key, { ...line });
            return;
          }
          existing.target += line.target;
          existing.l1 += line.l1;
          existing.l2 += line.l2;
          existing.l3 += line.l3;
        });
      Array.from(childLines.values()).forEach((line) => {
        rows.push(
          toPlanRow(
            line.vs,
            line.target,
            line.l1,
            line.l2,
            line.l3,
            false,
            true,
            line.sponsor
          )
        );
      });
    });

    const totalTarget = Array.from(parentTotals.values()).reduce(
      (sum, entry) => sum + entry.target,
      0
    );
    const totalL1 = Array.from(parentTotals.values()).reduce(
      (sum, entry) => sum + entry.l1,
      0
    );
    const totalL2 = Array.from(parentTotals.values()).reduce(
      (sum, entry) => sum + entry.l2,
      0
    );
    const totalL3 = Array.from(parentTotals.values()).reduce(
      (sum, entry) => sum + entry.l3,
      0
    );
    if (rows.length > 0) {
      const roundPct = (value: number) => Math.round(value * 10) / 10;
      const pctL1 = totalTarget === 0 ? 0 : roundPct((totalL1 / totalTarget) * 100);
      const pctL2 = totalTarget === 0 ? 0 : roundPct((totalL2 / totalTarget) * 100);
      const pctL3 = totalTarget === 0 ? 0 : roundPct((totalL3 / totalTarget) * 100);
      const countL1 = Math.max(0, Math.round(totalTarget / 5));
      const owners = Math.max(0, Math.round(totalTarget / 10));
      const avgPerIo = totalTarget === 0 ? 0 : totalTarget / Math.max(1, countL1);
      rows.push({
        id: 'total',
        label: 'Total',
        total: totalTarget,
        l1: totalL1,
        l2: totalL2,
        l3: totalL3,
        pctL1,
        pctL2,
        pctL3,
        runRateTarget: totalTarget,
        runRateImpact: totalL3,
        countL1,
        owners,
        avgPerIo,
        isTotal: true,
      });
    }
    if (aggregateByVs && rows.length === 0) {
      scaledInitiativeRows.forEach((row) => {
        rows.push(
          toPlanRow(
            row.vs,
            row.target,
            row.l1ImpactYtm,
            row.l2ImpactYtm,
            row.l3ImpactYtm,
            false,
            Boolean(row.parentVs),
            row.sponsor
          )
        );
      });
    }

    const deduped = new Map<string, PlanRow>();
    rows.forEach((row) => {
      const key = normalizeLabel(row.label);
      const existing = deduped.get(key);
      if (!existing) {
        deduped.set(key, row);
        return;
      }
      const total = existing.total + row.total;
      const l1 = existing.l1 + row.l1;
      const l2 = existing.l2 + row.l2;
      const l3 = existing.l3 + row.l3;
      const roundPct = (value: number) => Math.round(value * 10) / 10;
      const pctL1 = total === 0 ? 0 : roundPct((l1 / total) * 100);
      const pctL2 = total === 0 ? 0 : roundPct((l2 / total) * 100);
      const pctL3 = total === 0 ? 0 : roundPct((l3 / total) * 100);
      deduped.set(key, {
        ...existing,
        total,
        l1,
        l2,
        l3,
        pctL1,
        pctL2,
        pctL3,
        runRateTarget: total,
        runRateImpact: l3,
      });
    });

    return Array.from(deduped.values());
  }, [
    businessGroups,
    mainBuOptions,
    selectedBu,
    selectedGroupIds,
    selectedGroupInfo,
  ]);

  useEffect(() => {
    const timeframeParam = searchParams.get('timeframe');
    if (timeframeParam === 'ytm' || timeframeParam === 'full-year') {
      setActiveTimeframe(timeframeParam);
    }
  }, [searchParams]);

  useEffect(() => {
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
      setMonthRange([startRaw, endRaw]);
      setIsMonthRangeCustom(true);
      setMonthAnchor(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTimeframe !== 'ytm' && activeTimeframe !== 'full-year') {
      setActiveTimeframe('full-year');
    }
  }, [activeTimeframe]);

  const [monthRange, setMonthRange] = useState<[number, number]>([0, 1]);
  const [monthAnchor, setMonthAnchor] = useState<number | null>(null);
  const [isMonthRangeCustom, setIsMonthRangeCustom] = useState(false);
  const months = [
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
    'Dec',
  ];

  useEffect(() => {
    if (isMonthRangeCustom) {
      return;
    }
    setMonthRange(activeTimeframe === 'ytm' ? [0, 1] : [0, 11]);
  }, [activeTimeframe, isMonthRangeCustom]);

  const timeframeScale = useMemo(() => {
    if (isMonthRangeCustom) {
      return (monthRange[1] - monthRange[0] + 1) / 12;
    }
    return getTimeframeScale(activeTimeframe === 'ytm' ? 2 : 12);
  }, [activeTimeframe, isMonthRangeCustom, monthRange]);

  const handleMonthClick = (monthIndex: number) => {
    if (activeTimeframe === 'ytm') {
      return;
    }
    if (monthAnchor === null || !isMonthRangeCustom) {
      setMonthAnchor(monthIndex);
      setMonthRange([monthIndex, monthIndex]);
      setIsMonthRangeCustom(true);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('months', `${monthIndex}-${monthIndex}`);
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
      return next;
    });
  };

  const scaledPlanRows = useMemo(() => {
    const scale = timeframeScale;
    const round = (value: number) => Math.round(value * 10) / 10;
    return monthlyImpactPlanRows.map((row) => {
      return {
        ...row,
        total: round(row.total * scale),
        l1: round(row.l1 * scale),
        l2: round(row.l2 * scale),
        l3: round(row.l3 * scale),
        pctL1: row.pctL1,
        pctL2: row.pctL2,
        pctL3: row.pctL3,
        runRateTarget: round(
          (row.runRateTarget ?? row.total * 0.9) * scale
        ),
        runRateImpact: round(
          (row.runRateImpact ?? row.total * 0.7) * scale
        ),
        countL1: Math.max(0, Math.round(row.countL1 * scale)),
        owners: Math.max(0, Math.round(row.owners * scale)),
        avgPerIo: row.avgPerIo,
      };
    });
  }, [monthlyImpactPlanRows, timeframeScale]);

  const isDeGroupSelected = useMemo(() => {
    if (selectedBu === 'all' || !selectedGroupInfo) {
      return false;
    }
    const groupId = normalizeGroupId(selectedGroupInfo.group.group);
    if (groupId !== 'hh') {
      return false;
    }
    const deGroupId = getUnitId(groupId, 'D/E Group');
    return selectedGroupIds.size === 1 && selectedGroupIds.has(deGroupId);
  }, [selectedBu, selectedGroupIds, selectedGroupInfo]);

  const keyCallOut = useMemo(() => {
    if (isDeGroupSelected) {
      const callouts = KEY_CALLOUTS_BY_BG.HH?.['D/E Group'];
      if (callouts?.initiative?.length) {
        return {
          bulletPoints: callouts.initiative,
          rootCauseAnalysis: '',
        };
      }
    }
    if (scaledPlanRows.length === 0) {
      return null;
    }
    const totalRow =
      scaledPlanRows.find((row) => row.isTotal) ?? scaledPlanRows[0];
    const totalLabel = totalRow.label;
    const total = totalRow.total;
    const l1 = totalRow.l1;
    const l2 = totalRow.l2;
    const l3 = totalRow.l3;
    const pctL2 = totalRow.pctL2;
    const pctL3 = totalRow.pctL3;

    return {
      bulletPoints: [
        `${totalLabel} pipeline at ${formatMnValue(total)} Mn ${currencyLabel}.`,
        `L1+: ${formatMnValue(l1)} Mn, L2+: ${formatMnValue(l2)} Mn, L3+: ${formatMnValue(l3)} Mn.`,
        `Conversion pace at ${pctL2}% (L2+) and ${pctL3}% (L3+).`,
      ],
      rootCauseAnalysis:
        'Momentum is driven by early-stage ideation. Focus areas include accelerating L1-to-L2 progression and tightening milestone ownership on the largest value buckets.',
    };
  }, [scaledPlanRows, formatMnValue, currencyLabel, isDeGroupSelected]);

  useEffect(() => {
    setStoredTimeframe(activeTimeframe);
  }, [activeTimeframe]);

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
      return;
    }
    setSelectedBu(buParam);
  }, [mainBuOptions, searchParams]);

  useEffect(() => {
    if (!selectedGroupInfo) {
      setSelectedGroupIds(new Set());
      return;
    }
    const groupId = normalizeGroupId(selectedGroupInfo.group.group);
    const overallId = `${groupId}-overall`;
    if (selectedGroupInfo.unit) {
      setSelectedGroupIds(
        new Set([getUnitId(groupId, selectedGroupInfo.unit.name)])
      );
      return;
    }
    // Check for bu parameter to pre-select specific units within a group
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
            selectedGroupInfo.group.businessUnits.some(
              (unit) => getUnitId(groupId, unit.name) === unitId
            )
          );
        if (unitIds.length > 0) {
          setSelectedGroupIds(new Set(unitIds));
          return;
        }
      }
    }
    
    // Default to D group when HH is selected and no BU parameter is provided
    if (groupId.toLowerCase() === 'hh' && !buParam) {
      const dGroupUnit = selectedGroupInfo.group.businessUnits.find(
        (unit) => {
          const normalized = normalizeLabel(unit.name);
          return normalized === 'dgroup' || 
                 normalized === 'd-group' ||
                 unit.name.toLowerCase().includes('d group') ||
                 unit.name.toLowerCase() === 'd group';
        }
      );
      if (dGroupUnit) {
        const dGroupId = getUnitId(groupId, dGroupUnit.name);
        setSelectedGroupIds(new Set([dGroupId]));
        return;
      }
    }
    
    setSelectedGroupIds(new Set([overallId]));
  }, [selectedGroupInfo, searchParams]);

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    setActiveTimeframe(timeframe);
    setIsMonthRangeCustom(false);
    setMonthAnchor(null);
    setMonthRange(timeframe === 'ytm' ? [0, 1] : [0, 11]);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('timeframe', timeframe);
      next.set('timeframe', timeframe);
      next.delete('toggle');
      next.set(
        'months',
        timeframe === 'ytm' ? '0-1' : '0-11'
      );
      return next;
    });
  };

  const handleBuChange = (buId: string) => {
    setSelectedBu(buId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('bg', buId);
      next.delete('bu');
      next.delete('units');
      return next;
    });
  };

  const timeframeOptions: TimeframeOptionItem[] = [
    { value: 'full-year', label: 'Full year' },
    { value: 'ytm', label: 'Year to Month' },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Initiative Performance
          </h1>
          <a
            href={WAVE_LINK}
            target='_blank'
            rel='noreferrer'
            className='inline-flex mt-5 items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors'>
            Go to Wave
          </a>
        </div>

        <div className='mb-6'>
          <HeaderFilters
            timeframeContent={
              <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-4'>
                  <span className='text-sm font-medium text-gray-600 w-28'>
                    Timeframe
                  </span>
                  <div
                    className={`flex bg-gray-100 rounded-lg p-1`}>
                    {timeframeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleTimeframeChange(option.value)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTimeframe === option.value
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <span className='text-sm font-medium text-gray-600 w-28'>
                    Months
                  </span>
                  <div className='flex flex-wrap gap-1'>
                    {months.map((month, index) => {
                      const [start, end] = monthRange;
                      const isSelected = index >= start && index <= end;
                      const isDisabled = activeTimeframe === 'ytm';
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
                      onClick={() => handleTimeframeChange(activeTimeframe)}
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
            showBu
          />
        </div>
        {selectedBu !== 'all' && selectedGroupInfo && (
          <div className='mb-6 flex items-center gap-4'>
            <span className='text-sm font-medium text-gray-600 w-32'>
              Select BU
            </span>
            <div className='flex flex-wrap bg-gray-100 rounded-lg p-1'>
              {(() => {
                const groupId = normalizeGroupId(selectedGroupInfo.group.group);
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
                      const unitNames = selectedGroupInfo.group.businessUnits
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
                    {selectedGroupInfo.group.businessUnits.map((unit) => {
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
        {keyCallOut && (
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
                  {keyCallOut.bulletPoints.map((point, index) => (
                    <li key={index} className='text-sm'>
                      {point}
                    </li>
                  ))}
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

        <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
          <div className='space-y-6'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div className='flex flex-col text-sm text-gray-600'>
                <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                  <CogIcon className='w-6 h-6 text-primary-600' />
                  Ideation Progress
                </h2>
                <p className='text-sm text-gray-600 mt-1'>Mn, {currencyLabel}</p>
              </div>
              <div className='flex text-xs text-gray-600'>
                <div className='flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2'>
                  <span className='text-xs font-semibold text-gray-700'>
                    Impact vs plan
                  </span>
                  <span className='flex items-center gap-2'>
                    <span className='h-2 w-2 rounded-full bg-red-400' />
                    <span>Behind plan</span>
                  </span>
                  <span className='flex items-center gap-2'>
                    <span className='h-2 w-2 rounded-full bg-yellow-400' />
                    <span>Progressing against plan</span>
                  </span>
                  <span className='flex items-center gap-2'>
                    <span className='h-2 w-2 rounded-full bg-green-500' />
                    <span>Ahead of plan</span>
                  </span>
                </div>
              </div>
            </div>

              <div className='overflow-x-auto rounded-lg border border-gray-200'>
                <table className='w-full text-sm border-collapse'>
                  <thead>
                    <tr>
                      <th
                        className='bg-gray-50 text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                        colSpan={2}>
                        Mn {currencyLabel}
                      </th>
                      <th
                        className='bg-gray-50 text-center px-4 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                        colSpan={1}>
                        In-year target
                      </th>
                      <th
                        className='bg-gray-50 text-center px-4 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                        colSpan={3}>
                        In-year impact (YTM)
                      </th>
                      <th
                        className='bg-gray-50 text-center px-4 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                        colSpan={3}>
                        % of in-year target
                      </th>
                      <th
                        className='bg-gray-50 text-center px-4 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                        colSpan={2}>
                        Run rate
                      </th>
                    </tr>
                    <tr className='bg-gray-50'>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        VS &amp; Sub-VS
                      </th>
                      <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        Sponsor
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        Total
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        L1+
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        L2+
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        L3+
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        L1+
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        L2+
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        L3+
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        Total
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        L3+
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scaledPlanRows.map((row) => {
                      const rowClass = row.isGroup
                        ? 'bg-blue-100 font-semibold'
                        : row.isTotal
                        ? 'bg-blue-200 font-semibold'
                        : '';
                      const labelClass = row.isSub ? 'pl-8' : '';
                      const pctClass = (
                        value: number,
                        thresholds: { warn: number; good: number }
                      ) => {
                        if (value >= thresholds.good) {
                          return 'bg-green-100 text-green-700';
                        }
                        if (value >= thresholds.warn) {
                          return 'bg-yellow-100 text-yellow-700';
                        }
                        return 'bg-red-50 text-red-700';
                      };

                      return (
                        <tr
                          key={row.id}
                          className={`border-b border-gray-200 ${rowClass}`}>
                          <td
                            className={`px-6 py-3 border-r border-gray-200 last:border-r-0 ${labelClass}`}>
                            <span>{row.label}</span>
                          </td>
                          <td className='px-6 py-3 border-r border-gray-200 last:border-r-0'>
                            {row.sponsor ?? '-'}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {formatMnValue(row.total)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {formatMnValue(row.l1)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {formatMnValue(row.l2)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {formatMnValue(row.l3)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                row.pctL1,
                                { warn: 100, good: 130 }
                              )}`}>
                              {row.pctL1.toFixed(1)}%
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                row.pctL2,
                                { warn: 100, good: 120 }
                              )}`}>
                              {row.pctL2.toFixed(1)}%
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                row.pctL3,
                                { warn: 100, good: 110 }
                              )}`}>
                              {row.pctL3.toFixed(1)}%
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.runRateTarget !== undefined
                              ? formatMnValue(row.runRateTarget)
                              : '-'}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.runRateImpact !== undefined
                              ? formatMnValue(row.runRateImpact)
                              : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className='text-xs text-gray-500'>
                <p className='font-semibold text-gray-700'>
                  Minimum target to be reached for each stage gate:
                </p>
                <p>L1+ &gt;=130% of target</p>
                <p>L2+ &gt;=120% of target</p>
                <p>L3+ &gt;=110% of target</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
