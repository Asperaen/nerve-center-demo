import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeaderFilters from '../components/HeaderFilters';
import TimeframePicker, {
  type TimeframeOption,
  type TimeframeOptionItem,
} from '../components/TimeframePicker';
import { useBudgets } from '../contexts/BudgetContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { INITIATIVE_IMPLEMENTATION_DATA } from '../data/mockBgData';
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
> = [
  { id: 'topline', label: 'Topline VS', isGroup: true },
  { id: 'topline-sub-1', label: 'Product category A', isSub: true },
  { id: 'topline-sub-2', label: 'Product category B', isSub: true },
  { id: 'topline-sub-3', label: 'Product category C', isSub: true },
  { id: 'mfg', label: 'MFG total', isGroup: true },
  { id: 'mfg-sub-1', label: 'Site A', isSub: true },
  { id: 'mfg-sub-2', label: 'Site B', isSub: true },
  { id: 'mfg-sub-3', label: 'Site C', isSub: true },
  { id: 'rd', label: 'R&D VS', isGroup: true },
  { id: 'rd-sub-1', label: 'BU A', isSub: true },
  { id: 'rd-sub-2', label: 'BU B', isSub: true },
  { id: 'rd-sub-3', label: 'BU C', isSub: true },
  { id: 'rd-sub-4', label: 'BU D', isSub: true },
  { id: 'procurement', label: 'Procurement / BOM', isGroup: true },
  { id: 'total', label: 'Total', isTotal: true },
];

const getSponsorForLabel = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('product category')) {
    return 'Category lead';
  }
  if (lowerLabel.startsWith('site')) {
    return 'Plant ops';
  }
  if (lowerLabel.startsWith('bu')) {
    return 'BU owner';
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
  }>
) => {
  const rowDefs = EXECUTION_ROW_DEFS.filter((row) => !row.isTotal);
  const rowIds = rowDefs.map((row) => row.id);
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

  const buildRow = (row: typeof EXECUTION_ROW_DEFS[number]) => {
    if (row.isTotal) {
      const total = Array.from(buckets.values()).reduce(
        (acc, entry) => {
          acc.pipeline += entry.pipeline;
          acc.lateValue += entry.lateValue;
          acc.lateInitiatives += entry.lateInitiatives;
          acc.milestonesDue += entry.milestonesDue;
          acc.milestonesComplete += entry.milestonesComplete;
          acc.postponed += entry.postponed;
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
      const l4Target = total.pipeline * 0.9;
      const l4Impact = total.pipeline * 0.8;
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
        sponsor: getSponsorForLabel(row.label),
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

    const bucket = buckets.get(row.id) ?? {
      pipeline: 0,
      lateValue: 0,
      lateInitiatives: 0,
      milestonesDue: 0,
      milestonesComplete: 0,
      postponed: 0,
    };
    const l4Target = bucket.pipeline * 0.9;
    const l4Impact = bucket.pipeline * 0.8;
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
      sponsor: getSponsorForLabel(row.label),
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
  const [selectedBu, setSelectedBu] = useState<string>('all');
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(
    new Set()
  );
  const [lateOnlyRowId, setLateOnlyRowId] = useState<string | null>(null);
  const mainBuOptions = getMainBusinessGroupOptions();

  const timeframeScale = useMemo(
    () => getTimeframeScale(activeTimeframe),
    [activeTimeframe]
  );

  useEffect(() => {
    const timeframeParam = searchParams.get('timeframe');
    if (timeframeParam === 'ytm' || timeframeParam === 'full-year') {
      setActiveTimeframe(timeframeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTimeframe !== 'ytm' && activeTimeframe !== 'full-year') {
      setActiveTimeframe('full-year');
    }
  }, [activeTimeframe]);

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
        .filter(Boolean);
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
    const rowIds = rowDefs.map((row) => row.id);
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
    return buildExecutionRows(selectedInitiatives).map((row) => ({
      ...row,
      pipeline: round(row.pipeline * scale),
      l4Target: round(row.l4Target * scale),
      l4Impact: round(row.l4Impact * scale),
      lateValue: round(row.lateValue * scale),
    }));
  }, [selectedInitiatives, timeframeScale]);

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    setActiveTimeframe(timeframe);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('timeframe', timeframe);
      return next;
    });
  };

  const handleBuChange = (buId: string) => {
    setSelectedBu(buId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('bg', buId);
      return next;
    });
  };

  const timeframeOptions: TimeframeOptionItem[] = [
    { value: 'full-year', label: 'Full year forecast' },
    { value: 'ytm', label: 'YTM actuals' },
  ];
  const impactVsTargetLegend = [
    {
      id: 'below',
      label: 'Underperforming (< 100%)',
      swatchClass: 'bg-red-400',
      cellClass: 'bg-red-50 text-red-700',
    },
    {
      id: 'meets',
      label: 'Performing (≥ 100%)',
      swatchClass: 'bg-green-500',
      cellClass: 'bg-green-100 text-green-700',
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Actual (Implementation)
          </h1>
          <p className='text-sm text-gray-600 mt-2'>
            Review in-year initiative execution against L4 targets and milestone
            completion.
          </p>
        </div>

        <div className='mb-6'>
          <HeaderFilters
            timeframeContent={
              <TimeframePicker
                selectedTimeframe={activeTimeframe}
                onTimeframeChange={handleTimeframeChange}
                options={timeframeOptions}
              />
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
      </div>
    </div>
  );
}
