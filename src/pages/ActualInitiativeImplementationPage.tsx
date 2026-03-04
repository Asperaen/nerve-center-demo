import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import HeaderFilters from '../components/HeaderFilters';
import {
  type TimeframeOption,
  type TimeframeOptionItem,
} from '../components/TimeframePicker';
import { WAVE_LINK, MONTHS } from '../constants';
import { useBudgets } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';
import {
  INITIATIVE_IMPLEMENTATION_DATA,
  INITIATIVE_IMPLEMENTATION_ROW_DEFS,
  KEY_CALLOUTS_BY_BG,
  HH_DE_GROUP_EXECUTION_ROWS,
} from '../data/mockBgData';
import { getMainBusinessGroupOptions } from '../data/mockBusinessGroupPerformance';
import {
  setStoredTimeframe,
} from '../utils/timeframeStorage';

const normalizeGroupId = (groupName: string) => {
  const key = groupName.trim().toLowerCase().replace(/\s*\(parent\)\s*$/i, '');
  return key === 'other' ? 'others' : key;
};

const normalizeLabel = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const getUnitId = (groupId: string, unitName: string) =>
  `${groupId}-${unitName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

type ExecutionRow = {
  id: string;
  label: string;
  sponsor?: string;
  pipeline: number;
  l4Target: number;
  l4Impact: number;
  l4Pct: number | null;
  lateInitiatives: number;
  lateValue: number;
  milestonesDue: number;
  milestonesCompletePct: number;
  postponed: number;
  isGroup?: boolean;
  isSub?: boolean;
  isTotal?: boolean;
};

const EXECUTION_ROW_DEFS: Array<
  Pick<ExecutionRow, 'id' | 'label' | 'isGroup' | 'isSub' | 'isTotal'>
> = INITIATIVE_IMPLEMENTATION_ROW_DEFS;

const getSponsorForLabel = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('account')) {
    return 'Commercial lead';
  }
  if (lowerLabel.includes('services')) {
    return 'Customer success';
  }
  if (lowerLabel.startsWith('wh') || lowerLabel.startsWith('fsj')) {
    return 'Plant ops';
  }
  if (lowerLabel.includes('product platform')) {
    return 'R&D lead';
  }
  if (lowerLabel.includes('topline')) {
    return 'Commercial lead';
  }
  if (lowerLabel.includes('mfg')) {
    return 'Operations lead';
  }
  if (lowerLabel.includes('r&d')) {
    return 'R&D lead';
  }
  if (lowerLabel.includes('procurement')) {
    return 'Sourcing lead';
  }
  return 'Program lead';
};

const parseUsDate = (value: string) => {
  const [month, day, year] = value.split('/').map((part) => Number(part));
  if (!month || !day || !year) {
    return null;
  }
  return new Date(year, month - 1, day);
};

const diffDays = (from: Date, to: Date) =>
  Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

const getRowIdForInitiative = (
  initiativeId: number,
  rowIds: string[]
) => {
  if (rowIds.length === 0) {
    return 'total';
  }
  const index = Math.abs(initiativeId) % rowIds.length;
  return rowIds[index];
};

const isLateInitiative = (targetDate: string, actualDate: string) => {
  const target = parseUsDate(targetDate);
  const actual = parseUsDate(actualDate);
  if (!target || !actual) {
    return false;
  }
  return diffDays(target, actual) > 0;
};

const buildExecutionRows = (
  initiatives: Array<{
    initiativeId: number;
    plannedImpact: number;
    targetL4Date: string;
    actualL4Date: string;
  }>,
  meetTargetOverride: boolean
) => {
  const rowDefs = EXECUTION_ROW_DEFS.filter((row) => !row.isTotal);
  const childMap = new Map<string, string[]>();
  for (let i = 0; i < rowDefs.length; i += 1) {
    const row = rowDefs[i];
    if (!row.isGroup) {
      continue;
    }
    const children: string[] = [];
    for (let j = i + 1; j < rowDefs.length; j += 1) {
      const next = rowDefs[j];
      if (next.isGroup) {
        break;
      }
      if (next.isSub) {
        children.push(next.id);
      }
    }
    childMap.set(row.id, children);
  }
  const rowIds = rowDefs
    .filter(
      (row) => row.isSub || (row.isGroup && (childMap.get(row.id) ?? []).length === 0)
    )
    .map((row) => row.id);
  const buckets = new Map(
    rowDefs.map((row) => [
      row.id,
      {
        pipeline: 0,
        lateValue: 0,
        lateInitiatives: 0,
        milestonesDue: 0,
        milestonesComplete: 0,
        postponed: 0,
      },
    ])
  );

  initiatives.forEach((initiative) => {
    const rowId = getRowIdForInitiative(initiative.initiativeId, rowIds);
    const bucket = buckets.get(rowId);
    if (!bucket) {
      return;
    }
    bucket.pipeline += initiative.plannedImpact;
    bucket.milestonesDue += 1;

    const targetDate = parseUsDate(initiative.targetL4Date);
    const actualDate = parseUsDate(initiative.actualL4Date);
    if (targetDate && actualDate) {
      const delta = diffDays(targetDate, actualDate);
      if (delta > 0) {
        bucket.lateInitiatives += 1;
        bucket.lateValue += initiative.plannedImpact;
      } else {
        bucket.milestonesComplete += 1;
      }
      if (delta > 30) {
        bucket.postponed += 1;
      }
    }
  });

  const sumBuckets = (ids: string[]) =>
    ids.reduce(
      (acc, id) => {
        const bucket = buckets.get(id);
        if (!bucket) {
          return acc;
        }
        acc.pipeline += bucket.pipeline;
        acc.lateValue += bucket.lateValue;
        acc.lateInitiatives += bucket.lateInitiatives;
        acc.milestonesDue += bucket.milestonesDue;
        acc.milestonesComplete += bucket.milestonesComplete;
        acc.postponed += bucket.postponed;
        return acc;
      },
      {
        pipeline: 0,
        lateValue: 0,
        lateInitiatives: 0,
        milestonesDue: 0,
        milestonesComplete: 0,
        postponed: 0,
      }
    );

  const buildRow = (row: typeof EXECUTION_ROW_DEFS[number]) => {
    if (row.isTotal) {
      const totalIds = rowDefs
        .filter(
          (definition) =>
            definition.isSub ||
            (definition.isGroup &&
              (childMap.get(definition.id) ?? []).length === 0)
        )
        .map((definition) => definition.id);
      const total = sumBuckets(totalIds);
      const l4Target = total.pipeline * 0.9;
      const l4Impact = total.pipeline * (meetTargetOverride ? 0.95 : 0.8);
      const l4Pct =
        l4Target === 0 ? null : Math.round((l4Impact / l4Target) * 100);
      const milestonesCompletePct =
        total.milestonesDue === 0
          ? 0
          : Math.round(
              (total.milestonesComplete / total.milestonesDue) * 100
            );

      return {
        id: row.id,
        label: row.label,
        sponsor: undefined,
        pipeline: total.pipeline,
        l4Target,
        l4Impact,
        l4Pct,
        lateInitiatives: total.lateInitiatives,
        lateValue: total.lateValue,
        milestonesDue: total.milestonesDue,
        milestonesCompletePct,
        postponed: total.postponed,
        isTotal: true,
      } satisfies ExecutionRow;
    }

    const childIds = childMap.get(row.id) ?? [];
    const bucket = row.isGroup && childIds.length > 0
      ? sumBuckets(childIds)
      : buckets.get(row.id) ?? {
          pipeline: 0,
          lateValue: 0,
          lateInitiatives: 0,
          milestonesDue: 0,
          milestonesComplete: 0,
          postponed: 0,
        };
    const l4Target = bucket.pipeline * 0.9;
    const l4Impact = bucket.pipeline * (meetTargetOverride ? 0.95 : 0.8);
    const l4Pct =
      l4Target === 0 ? null : Math.round((l4Impact / l4Target) * 100);
    const milestonesCompletePct =
      bucket.milestonesDue === 0
        ? 0
        : Math.round(
            (bucket.milestonesComplete / bucket.milestonesDue) * 100
          );

    return {
      id: row.id,
      label: row.label,
      sponsor: row.isGroup ? undefined : getSponsorForLabel(row.label),
      pipeline: bucket.pipeline,
      l4Target,
      l4Impact,
      l4Pct,
      lateInitiatives: bucket.lateInitiatives,
      lateValue: bucket.lateValue,
      milestonesDue: bucket.milestonesDue,
      milestonesCompletePct,
      postponed: bucket.postponed,
      isGroup: row.isGroup,
      isSub: row.isSub,
    } satisfies ExecutionRow;
  };

  return EXECUTION_ROW_DEFS.map((row) => buildRow(row));
};

const getTimeframeScale = (timeframe: TimeframeOption) => {
  switch (timeframe) {
    case 'full-year':
      return 1.0;
    case 'ytm':
      return 0.72;
    case 'rolling-3m':
      return 0.3;
    case 'in-month':
      return 0.1;
    default:
      return 1.0;
  }
};

export default function ActualInitiativeImplementationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { businessGroups } = useBudgets();
  const { currencyLabel, formatAmount } = useCurrency();
  const formatMnValue = (value: number, digits: number = 1) =>
    formatAmount(value, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeOption>('ytm');
  
  // Year selection state
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const availableYears = [2026, 2025, 2024];

  const [monthRange, setMonthRange] = useState<[number, number]>([0, 1]);
  const [monthAnchor, setMonthAnchor] = useState<number | null>(null);
  const [isMonthRangeCustom, setIsMonthRangeCustom] =
    useState<boolean>(false);
  const [selectedBu, setSelectedBu] = useState<string>('all');
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );
  const mainBuOptions = useMemo(() => getMainBusinessGroupOptions(), []);

  const timeframeScale = useMemo(() => {
    if (isMonthRangeCustom) {
      return (monthRange[1] - monthRange[0] + 1) / 12;
    }
    return getTimeframeScale(activeTimeframe);
  }, [activeTimeframe, isMonthRangeCustom, monthRange]);

  useEffect(() => {
    const timeframeParam =
      searchParams.get('timeframe') ?? searchParams.get('toggle');
    if (timeframeParam && timeframeParam !== 'ytm') {
      setActiveTimeframe('ytm');
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('timeframe', 'ytm');
        next.set('months', '0-1');
        return next;
      });
    }
  }, [searchParams, setSearchParams]);

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

  useEffect(() => {
    if (isMonthRangeCustom) {
      return;
    }
    setMonthRange(activeTimeframe === 'ytm' ? [0, 1] : [0, 11]);
  }, [activeTimeframe, isMonthRangeCustom]);

  useEffect(() => {
    setStoredTimeframe(activeTimeframe);
  }, [activeTimeframe]);

  useEffect(() => {
    const bgParam = searchParams.get('bg') ?? searchParams.get('bgs');
    const buParam = searchParams.get('bu');
    if (bgParam) {
      const bgList = bgParam
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      if (bgList.length !== 1 || bgList[0] === 'all') {
        setSelectedBu('all');
        return;
      }
      const normalizedBg = normalizeGroupId(bgList[0]);
      const validBg = mainBuOptions.find((bu) => normalizeGroupId(bu.id) === normalizedBg);
      if (validBg) {
        setSelectedBu(validBg.id);
        return;
      }
      setSelectedBu(bgList[0]);
      return;
    }
    if (!buParam) {
      return;
    }
    if (buParam === 'all') {
      setSelectedBu('all');
      return;
    }
    const normalizedBuParam = normalizeGroupId(buParam);
    const validBu = mainBuOptions.find((bu) => normalizeGroupId(bu.id) === normalizedBuParam);
    if (validBu) {
      setSelectedBu(validBu.id);
      return;
    }
    setSelectedBu(buParam);
  }, [mainBuOptions, searchParams]);

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
  }, [selectedBu]);

  useEffect(() => {
    const bgParam = searchParams.get('bg') ?? searchParams.get('bgs');
    if (selectedBu === 'all' && bgParam) {
      const bgIds = bgParam
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value && value !== 'all');
      if (bgIds.length > 0) {
        setSelectedGroupIds(new Set(bgIds));
        return;
      }
    }
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
    const unitsParam = searchParams.get('bg')
      ? searchParams.get('bu')
      : searchParams.get('units');
    if (unitsParam) {
      const requestedUnits = unitsParam
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      if (requestedUnits.length === 0) {
        setSelectedGroupIds(new Set([overallId]));
        return;
      }
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
    
    // Default to D group when HH is selected and no BU parameter is provided
    if (groupId.toLowerCase() === 'hh' && !unitsParam) {
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

  const selectedUnits = useMemo(() => {
    if (selectedBu === 'all') {
      const filteredGroups =
        selectedGroupIds.size > 0
          ? businessGroups.filter((group) =>
              selectedGroupIds.has(normalizeGroupId(group.group))
            )
          : businessGroups;
      return filteredGroups.flatMap((group) =>
        group.businessUnits.map((unit) => ({
          group: group.group,
          unit: unit.name,
        }))
      );
    }
    if (!selectedGroupInfo) {
      return [];
    }
    const groupId = normalizeGroupId(selectedGroupInfo.group.group);
    const overallId = `${groupId}-overall`;
    const isAllSelected =
      selectedGroupIds.size === 0 || selectedGroupIds.has(overallId);
    const units = isAllSelected
      ? selectedGroupInfo.group.businessUnits
      : selectedGroupInfo.group.businessUnits.filter((unit) =>
          selectedGroupIds.has(getUnitId(groupId, unit.name))
        );
    return units.map((unit) => ({
      group: selectedGroupInfo.group.group,
      unit: unit.name,
    }));
  }, [businessGroups, selectedBu, selectedGroupIds, selectedGroupInfo]);

  const selectedInitiatives = useMemo(() => {
    return selectedUnits.flatMap(({ group, unit }) =>
      (INITIATIVE_IMPLEMENTATION_DATA[`${group}|${unit}`] ?? []).map(
        (detail) => ({
          ...detail,
          bg: group,
          bu: unit,
        })
      )
    );
  }, [selectedUnits]);

  const rowInitiatives = useMemo(() => {
    const rowDefs = EXECUTION_ROW_DEFS.filter((row) => !row.isTotal);
    const childMap = new Map<string, string[]>();
    for (let i = 0; i < rowDefs.length; i += 1) {
      const row = rowDefs[i];
      if (!row.isGroup) {
        continue;
      }
      const children: string[] = [];
      for (let j = i + 1; j < rowDefs.length; j += 1) {
        const next = rowDefs[j];
        if (next.isGroup) {
          break;
        }
        if (next.isSub) {
          children.push(next.id);
        }
      }
      childMap.set(row.id, children);
    }
    const rowIds = rowDefs
      .filter(
        (row) =>
          row.isSub || (row.isGroup && (childMap.get(row.id) ?? []).length === 0)
      )
      .map((row) => row.id);
    const allRows = new Map<string, typeof selectedInitiatives>();
    const lateRows = new Map<string, typeof selectedInitiatives>();
    rowIds.forEach((rowId) => {
      allRows.set(rowId, []);
      lateRows.set(rowId, []);
    });

    selectedInitiatives.forEach((initiative) => {
      const rowId = getRowIdForInitiative(initiative.initiativeId, rowIds);
      const rowItems = allRows.get(rowId);
      if (rowItems) {
        rowItems.push(initiative);
      }
      if (
        isLateInitiative(initiative.targetL4Date, initiative.actualL4Date)
      ) {
        const lateItems = lateRows.get(rowId);
        if (lateItems) {
          lateItems.push(initiative);
        }
      }
    });

    return { all: allRows, late: lateRows };
  }, [selectedInitiatives]);

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

  const scaledExecutionRows = useMemo(() => {
    const scale = timeframeScale;
    const round = (value: number) => Math.round(value * 10) / 10;
    const meetsTargetOverride =
      selectedGroupInfo?.group.group === 'HH (Parent)' &&
      selectedGroupInfo?.unit?.name?.toLowerCase().includes('d/e');

    // Use hardcoded data for HH D/E Group (already YTM values, no scaling needed)
    if (isDeGroupSelected) {
      return HH_DE_GROUP_EXECUTION_ROWS;
    }

    return buildExecutionRows(selectedInitiatives, Boolean(meetsTargetOverride)).map((row) => ({
      ...row,
      pipeline: round(row.pipeline * scale),
      l4Target: round(row.l4Target * scale),
      l4Impact: round(row.l4Impact * scale),
      lateValue: round(row.lateValue * scale),
    }));
  }, [selectedInitiatives, timeframeScale, selectedGroupInfo, isDeGroupSelected]);

  const keyCallOut = useMemo(() => {
    if (isDeGroupSelected) {
      const callouts = KEY_CALLOUTS_BY_BG.HH?.['D/E Group'];
      if (callouts?.actualImplementation?.length) {
        return {
          bulletPoints: callouts.actualImplementation,
          rootCauseAnalysis: '',
        };
      }
    }
    if (scaledExecutionRows.length === 0) {
      return null;
    }
    const totalRow =
      scaledExecutionRows.find((row) => row.isTotal) ??
      scaledExecutionRows[0];
    const totalPipeline = totalRow.pipeline;
    const l4Target = totalRow.l4Target ?? 0;
    const l4Impact = totalRow.l4Impact ?? 0;
    const pct = totalRow.l4Pct ?? 0;
    const late = totalRow.lateValue ?? 0;

    return {
      bulletPoints: [
        `Pipeline ${formatMnValue(totalPipeline)} Mn ${currencyLabel} with L4 target ${formatMnValue(l4Target)} Mn.`,
        `L4 impact tracking at ${formatMnValue(l4Impact)} Mn (${pct}%).`,
        `Late value exposure ${formatMnValue(late)} Mn.`,
      ],
      rootCauseAnalysis:
        'Execution is concentrated in the highest-impact programs. Focus on clearing late milestones to protect L4 delivery and reduce slippage risk.',
    };
  }, [scaledExecutionRows, formatMnValue, currencyLabel, isDeGroupSelected]);

  const icebergData = useMemo(() => {
    const totalRow =
      scaledExecutionRows.find((row) => row.isTotal) ??
      scaledExecutionRows[0];
    const pipeline = Math.max(0, totalRow?.pipeline ?? 0);
    const l4Executed = Math.max(0, totalRow?.l4Impact ?? 0);
    // Use a more visible projected value (15% of executed to show remaining work)
    const l4Projected = Math.max(0, l4Executed * 0.15);
    const l1 = pipeline * 0.3;
    const l2 = pipeline * 0.35;
    const l3 = pipeline * 0.35;
    const round = (value: number) => Math.round(value * 10) / 10;
    const months = [
      'Jan-2026',
      'Feb-2026',
      'Mar-2026',
      'Apr-2026',
      'May-2026',
      'Jun-2026',
      'Jul-2026',
      'Aug-2026',
      'Sep-2026',
      'Oct-2026',
      'Nov-2026',
      'Dec-2026',
    ];
    const l4ExecutedPerMonth =
      months.length === 0 ? 0 : l4Executed / months.length;
    const l4ProjectedPerMonth =
      months.length === 0 ? 0 : l4Projected / months.length;

    return MONTHS.map((month, index) => ({
      label: month,
      l1: index === 0 ? -round(l1) : 0,
      l2: index === 0 ? -round(l2) : 0,
      l3: index === 0 ? -round(l3) : 0,
      l4Executed: round(l4ExecutedPerMonth),
      l4Projected: round(l4ProjectedPerMonth),
    }));
  }, [scaledExecutionRows]);

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    setActiveTimeframe(timeframe);
    setIsMonthRangeCustom(false);
    setMonthAnchor(null);
    setMonthRange(timeframe === 'ytm' ? [0, 1] : [0, 11]);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('timeframe', timeframe);
      next.set('toggle', timeframe);
      next.set(
        'months',
        timeframe === 'ytm' ? '0-2' : '0-11'
      );
      return next;
    });
  };

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

  const handleBuChange = (buId: string) => {
    setSelectedBu(buId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('bg', buId);
      next.delete('bu');
      next.delete('units');
      if (buId === 'all') {
        next.delete('bu');
        setSelectedGroupIds(new Set());
      }
      return next;
    });
  };

  const timeframeOptions: TimeframeOptionItem[] = [
    { value: 'full-year', label: 'Full year forecast' },
    { value: 'ytm', label: 'YTM actuals' },
  ];
  const impactVsTargetLegend = [
    {
      id: 'behind',
      label: '< 100%',
      swatchClass: 'bg-red-400',
      cellClass: 'bg-red-50 text-red-700',
    },
    {
      id: 'ahead',
      label: '≥ 100%',
      swatchClass: 'bg-green-500',
      cellClass: 'bg-green-100 text-green-700',
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Actual (Implementation)
            </h1>
            <p className='text-sm text-gray-600 mt-2'>
              Review in-year initiative execution against L4 targets and milestone
              completion.
            </p>
          </div>
          <a
            href={WAVE_LINK}
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors'>
            Go to Wave
          </a>
        </div>

        <div className='mb-6'>
          <HeaderFilters
            timeframeContent={
              <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-1 w-28'>
                    <span className='text-sm font-medium text-gray-600'>Timeframe</span>
                    <div className='relative'>
                      <button
                        onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                        className='text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-primary-50 transition-colors'>
                        ({selectedYear})
                        <ChevronDownIcon className={`w-3 h-3 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isYearDropdownOpen && (
                        <>
                          <div className='fixed inset-0 z-10' onClick={() => setIsYearDropdownOpen(false)} />
                          <div className='absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[80px]'>
                            {availableYears.map((year) => (
                              <button
                                key={year}
                                onClick={() => { setSelectedYear(year); setIsYearDropdownOpen(false); }}
                                className={`w-full px-3 py-1.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                                  selectedYear === year ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'
                                }`}>
                                {year}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className='flex bg-gray-100 rounded-lg p-1'>
                    {timeframeOptions.map((option) => {
                      const isDisabled = option.value === 'full-year';
                      return (
                        <button
                          key={option.value}
                          onClick={isDisabled ? undefined : () => handleTimeframeChange(option.value)}
                          disabled={isDisabled}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeTimeframe === option.value
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          } ${isDisabled ? 'cursor-not-allowed opacity-40 pointer-events-none bg-gray-50' : ''}`}>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <span className='text-sm font-medium text-gray-600 w-28'>
                    Months <span className='text-gray-400'>({selectedYear})</span>
                  </span>
                  <div className='flex flex-wrap gap-1'>
                    {MONTHS.map((month, index) => {
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
            <div className='flex justify-end text-xs text-gray-600'>
              <div className='flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2'>
                <span className='text-xs font-semibold text-gray-700'>
                  Impact vs target
                </span>
                {impactVsTargetLegend.map((item) => (
                  <span key={item.id} className='flex items-center gap-2'>
                    <span
                      className={`h-2 w-2 rounded-full ${item.swatchClass}`}
                    />
                    <span>{item.label}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className='overflow-x-auto rounded-lg border border-gray-200'>
              <table className='w-full text-sm border-collapse'>
                <thead>
                  <tr>
                    <th
                      className='bg-gray-50 text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                      colSpan={3}>
                      Mn {currencyLabel}
                    </th>
                    <th
                      className='bg-gray-50 text-center px-4 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                      colSpan={1}>
                      In-year (YTM)
                    </th>
                    <th
                      className='bg-gray-50 text-center px-4 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                      colSpan={1}>
                      Impact
                    </th>
                    <th
                      className='bg-gray-50 text-center px-4 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                      colSpan={1}>
                      Impact vs. target
                    </th>
                    <th
                      className='bg-gray-50 text-center px-4 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                      colSpan={2}>
                      Late Initiatives
                    </th>
                    <th
                      className='bg-gray-50 text-center px-4 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                      colSpan={2}>
                      Milestone Completion (rolling 30 days)
                    </th>
                    <th
                      className='bg-gray-50 text-center px-4 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                      colSpan={1}>
                      Milestone (vs LW)
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
                      L3+ Pipeline
                    </th>
                    <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                      Feb L4 target
                    </th>
                    <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                      L4+
                    </th>
                    <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                      L4+ (%)
                    </th>
                    <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                      # initiatives late for L4
                    </th>
                    <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                      Value late for L4
                    </th>
                    <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                      Total # milestones due
                    </th>
                    <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                      % completed
                    </th>
                    <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                      # postponed milestone
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scaledExecutionRows.map((row) => {
                    const rowClass = row.isGroup
                      ? 'bg-blue-100 font-semibold'
                      : row.isTotal
                      ? 'bg-blue-200 font-semibold'
                      : '';
                    const labelClass = row.isSub ? 'pl-8' : '';
                    const pctClass = (value: number) =>
                      value >= 100
                        ? impactVsTargetLegend[1].cellClass
                        : impactVsTargetLegend[0].cellClass;

                    // For hardcoded HH D/E Group data, use the values from the row directly
                    const lateInitiativeRows = isDeGroupSelected
                      ? []
                      : row.isTotal
                      ? selectedInitiatives.filter((initiative) =>
                          isLateInitiative(
                            initiative.targetL4Date,
                            initiative.actualL4Date
                          )
                        )
                      : rowInitiatives.late.get(row.id) ?? [];
                    const lateCount = isDeGroupSelected ? row.lateInitiatives : lateInitiativeRows.length;

                    return (
                      <>
                        <tr
                          key={row.id}
                          className={`border-b border-gray-200 ${rowClass}`}>
                          <td
                            className={`px-6 py-3 border-r border-gray-200 last:border-r-0 ${labelClass}`}>
                            {row.label}
                          </td>
                          <td className='px-6 py-3 border-r border-gray-200 last:border-r-0'>
                            {row.sponsor ?? '-'}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {formatMnValue(row.pipeline)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {formatMnValue(row.l4Target ?? 0)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {formatMnValue(row.l4Impact ?? 0)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.l4Pct === null || row.l4Pct === undefined ? (
                              'n/a'
                            ) : (
                              <span
                                className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                  row.l4Pct ?? 0
                                )}`}>
                                {row.l4Pct}%
                              </span>
                            )}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {lateCount === 0 ? (
                              <span className='text-gray-500'>-</span>
                            ) : (
                              <a
                                href={WAVE_LINK}
                                target='_blank'
                                rel='noreferrer'
                                className='inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50 hover:text-primary-700 cursor-pointer'>
                                {lateCount}
                              </a>
                            )}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {(row.lateValue ?? 0) === 0
                              ? '-'
                              : formatMnValue(row.lateValue ?? 0)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.milestonesDue ?? '-'}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                row.milestonesCompletePct ?? 0
                              )}`}>
                              {row.milestonesCompletePct ?? 0}%
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.postponed}
                          </td>
                        </tr>
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className='mt-6 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>Iceberg chart</h2>
              <p className='text-xs text-gray-500'>
                Past and projected vs bankable plan, recurring annualized impact by month (Mn {currencyLabel})
              </p>
            </div>
          </div>
          <div className='mb-4 flex flex-wrap items-center justify-end gap-3 px-4 py-2 text-xs text-gray-600'>
            <div className='flex flex-wrap items-center gap-3'>
              <span className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-sm bg-orange-400' />
                <span>L1</span>
              </span>
              <span className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-sm bg-amber-400' />
                <span>L2</span>
              </span>
              <span className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-sm bg-yellow-500' />
                <span>L3</span>
              </span>
              <span className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-sm bg-emerald-500' />
                <span>L4+ (Executed)</span>
              </span>
              <span className='flex items-center gap-2'>
                <span className='h-2.5 w-2.5 rounded-sm bg-emerald-200' />
                <span>L4+ (Projected)</span>
              </span>
            </div>
          </div>
          <div className='h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={icebergData} stackOffset='sign'>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='label' tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) =>
                    `${formatMnValue(Math.abs(Number(value ?? 0)))} ${currencyLabel}`
                  }
                />
                <ReferenceLine y={0} stroke='#9ca3af' />
                <Bar
                  dataKey='l1'
                  name='L1'
                  stackId='a'
                  fill='#fb923c'
                />
                <Bar
                  dataKey='l2'
                  name='L2'
                  stackId='a'
                  fill='#fbbf24'
                />
                <Bar
                  dataKey='l3'
                  name='L3'
                  stackId='a'
                  fill='#eab308'
                />
                <Bar
                  dataKey='l4Executed'
                  name='L4+ (Executed)'
                  stackId='a'
                  fill='#10b981'
                />
                <Bar
                  dataKey='l4Projected'
                  name='L4+ (Projected)'
                  stackId='a'
                  fill='#a7f3d0'
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
