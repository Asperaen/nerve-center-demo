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
import { WAVE_LINK } from '../constants';
import { useBudgets } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';
import {
  INITIATIVE_IMPLEMENTATION_DATA,
  INITIATIVE_IMPLEMENTATION_ROW_DEFS,
  KEY_CALLOUTS_BY_BG,
} from '../data/mockBgData';
import { getMainBusinessGroupOptions } from '../data/mockBusinessGroupPerformance';
import {
  getStoredTimeframe,
  setStoredTimeframe,
} from '../utils/timeframeStorage';

const normalizeGroupId = (groupName: string) => {
  const key = groupName.trim().toLowerCase();
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
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeOption>(() => {
    const stored = getStoredTimeframe();
    return stored === 'ytm' || stored === 'full-year' ? stored : 'full-year';
  });
  const [monthRange, setMonthRange] = useState<[number, number]>([0, 1]);
  const [monthAnchor, setMonthAnchor] = useState<number | null>(null);
  const [isMonthRangeCustom, setIsMonthRangeCustom] =
    useState<boolean>(false);
  const [selectedBu, setSelectedBu] = useState<string>('all');
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(
    new Set()
  );
  const [lateOnlyRowId, setLateOnlyRowId] = useState<string | null>(null);
  const mainBuOptions = getMainBusinessGroupOptions();

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

  const timeframeScale = useMemo(() => {
    if (isMonthRangeCustom) {
      return (monthRange[1] - monthRange[0] + 1) / 12;
    }
    return getTimeframeScale(activeTimeframe);
  }, [activeTimeframe, isMonthRangeCustom, monthRange]);

  useEffect(() => {
    const timeframeParam =
      searchParams.get('timeframe') ?? searchParams.get('toggle');
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
      const validBg = mainBuOptions.find((bu) => bu.id === bgList[0]);
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
    const validBu = mainBuOptions.find((bu) => bu.id === buParam);
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

  const scaledExecutionRows = useMemo(() => {
    const scale = timeframeScale;
    const round = (value: number) => Math.round(value * 10) / 10;
    const meetsTargetOverride =
      selectedGroupInfo?.group.group === 'HH' &&
      selectedGroupInfo?.unit?.name?.toLowerCase().includes('d/e');
    return buildExecutionRows(selectedInitiatives, Boolean(meetsTargetOverride)).map((row) => ({
      ...row,
      pipeline: round(row.pipeline * scale),
      l4Target: round(row.l4Target * scale),
      l4Impact: round(row.l4Impact * scale),
      lateValue: round(row.lateValue * scale),
    }));
  }, [selectedInitiatives, timeframeScale, selectedGroupInfo]);

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
    const l4Target = totalRow.l4Target;
    const l4Impact = totalRow.l4Impact;
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
    const l4Projected = Math.max(0, (totalRow?.l4Target ?? 0) - l4Executed);
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

    return months.map((month, index) => ({
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
                  <span className='text-sm font-medium text-gray-600 w-28'>
                    Timeframe
                  </span>
                  <div className='flex bg-gray-100 rounded-lg p-1'>
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
                      onClick={() => {
                        setIsMonthRangeCustom(false);
                        setMonthAnchor(null);
                        setMonthRange(activeTimeframe === 'ytm' ? [0, 1] : [0, 11]);
                      }}
                      className='text-xs text-primary-600 hover:text-primary-700 font-semibold'>
                      Reset range
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
                    const isExpanded = expandedRowIds.has(row.id);
                    const lateInitiativeRows = row.isTotal
                      ? selectedInitiatives.filter((initiative) =>
                          isLateInitiative(
                            initiative.targetL4Date,
                            initiative.actualL4Date
                          )
                        )
                      : rowInitiatives.late.get(row.id) ?? [];
                    const visibleInitiatives =
                      lateOnlyRowId === row.id
                        ? lateInitiativeRows
                        : row.isTotal
                        ? rowInitiatives.all.get(row.id) ?? []
                        : rowInitiatives.all.get(row.id) ?? [];
                    const lateCount = lateInitiativeRows.length;

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
                            {formatMnValue(row.l4Target)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {formatMnValue(row.l4Impact)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.l4Pct === null ? (
                              'n/a'
                            ) : (
                              <span
                                className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                  row.l4Pct
                                )}`}>
                                {row.l4Pct}%
                              </span>
                            )}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            <button
                              type='button'
                              className='inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100'
                              disabled={lateCount === 0}
                              onClick={(event) => {
                                event.stopPropagation();
                                setExpandedRowIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(row.id) && lateOnlyRowId === row.id) {
                                    next.delete(row.id);
                                    setLateOnlyRowId(null);
                                    return next;
                                  }
                                  next.add(row.id);
                                  return next;
                                });
                                setLateOnlyRowId((prev) =>
                                  prev === row.id ? null : row.id
                                );
                              }}>
                              {lateCount === 0 ? '-' : lateCount}
                            </button>
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.lateValue === 0
                              ? '-'
                              : formatMnValue(row.lateValue)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.milestonesDue}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                row.milestonesCompletePct
                              )}`}>
                              {row.milestonesCompletePct}%
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.postponed}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className='border-b border-gray-200'>
                            <td
                              colSpan={11}
                              className='bg-slate-50 px-6 py-4'>
                              <div className='text-xs text-gray-600'>
                                <div className='mb-3 font-semibold text-gray-700'>
                                  Initiative details
                                </div>
                                <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white'>
                                  <table className='w-full text-xs'>
                                    <thead className='bg-gray-50 border-b border-gray-200'>
                                      <tr>
                                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>
                                          BU
                                        </th>
                                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>
                                          Initiative ID
                                        </th>
                                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>
                                          Initiative name
                                        </th>
                                        <th className='px-3 py-2 text-right font-semibold text-gray-700'>
                                          Planned impact
                                        </th>
                                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>
                                          Target L4 date
                                        </th>
                                        <th className='px-3 py-2 text-left font-semibold text-gray-700'>
                                          Actual L4 date
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {visibleInitiatives.length === 0 ? (
                                        <tr>
                                          <td
                                            colSpan={6}
                                            className='px-3 py-3 text-center text-gray-500'>
                                            {lateOnlyRowId === row.id
                                              ? 'No late initiatives for this row.'
                                              : 'No initiatives available for this row.'}
                                          </td>
                                        </tr>
                                      ) : (
                                        visibleInitiatives.map((item, index) => (
                                          <tr
                                            key={`${item.bg}-${item.bu}-${item.initiativeId}-${index}`}
                                            className='border-b border-gray-200 last:border-b-0'>
                                            <td className='px-3 py-2 text-gray-700'>
                                              {item.bu}
                                            </td>
                                            <td className='px-3 py-2 text-gray-600'>
                                              {item.initiativeId}
                                            </td>
                                            <td className='px-3 py-2 text-gray-600'>
                                              {item.name}
                                            </td>
                                            <td className='px-3 py-2 text-right text-gray-700'>
                                              {formatMnValue(item.plannedImpact, 2)}
                                            </td>
                                            <td className='px-3 py-2 text-gray-600'>
                                              {item.targetL4Date}
                                            </td>
                                            <td className='px-3 py-2 text-gray-600'>
                                              {item.actualL4Date}
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
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
