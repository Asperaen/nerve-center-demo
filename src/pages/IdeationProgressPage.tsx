import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeaderFilters from '../components/HeaderFilters';
import TimeframePicker, {
  type TimeframeOption,
  type TimeframeOptionItem,
} from '../components/TimeframePicker';
import { useBudgets } from '../contexts/BudgetContext';
import type { BgMonthlyImpactRow } from '../data/mockBgData';
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

const getStagePercent = (label: string, offset: number) => {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) % 1000;
  }
  const base = 70 + (hash % 71);
  return clamp(base + offset, 70, 140);
};

const getStagePercents = (label: string) => {
  const lowerLabel = label.toLowerCase();
  const pctL1 = getStagePercent(label, 6);
  const pctL2 = getStagePercent(label, 0);
  const pctL3 = getStagePercent(label, -6);

  return {
    pctL1: clamp(
      lowerLabel === 'mfg total' ? Math.max(pctL1, 115) : pctL1,
      70,
      140
    ),
    pctL2: clamp(
      lowerLabel === 'topline vs' ? Math.max(pctL2, 125) : pctL2,
      70,
      140
    ),
    pctL3: clamp(
      lowerLabel === 'total' ? Math.max(pctL3, 132) : pctL3,
      70,
      140
    ),
  };
};

export default function IdeationProgressPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { businessGroups } = useBudgets();
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
  const todayLabel = useMemo(() => format(new Date(), 'MMM d'), []);

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

    const aggregated = new Map<
      string,
      { total: number; months: BgMonthlyImpactRow['months'] }
    >();

    activeGroups.forEach((group) => {
      group.monthlyImpact.forEach((row) => {
        const existing =
          aggregated.get(row.vs) ?? {
            total: 0,
            months: {
              jan: 0,
              feb: 0,
              mar: 0,
              apr: 0,
              may: 0,
              jun: 0,
              jul: 0,
              aug: 0,
              sep: 0,
              oct: 0,
              nov: 0,
              dec: 0,
            },
          };
        existing.total += row.total;
        (Object.keys(existing.months) as Array<keyof BgMonthlyImpactRow['months']>).forEach(
          (month) => {
            existing.months[month] += row.months[month];
          }
        );
        aggregated.set(row.vs, existing);
      });
    });

    const l2ToL3Ratio = 1.05;
    const l1ToL2Ratio = 1.05;
    const toRow = (
      label: string,
      entry: { total: number; months: Record<string, number> }
    ) => {
      const total = entry.total;
      const base = total / (1 + l2ToL3Ratio + l1ToL2Ratio * l2ToL3Ratio);
      const l3 = base;
      const l2 = l3 * l2ToL3Ratio;
      const l1 = l2 * l1ToL2Ratio;
      const countL1 = Math.max(0, Math.round(total / 5));
      const owners = Math.max(0, Math.round(total / 10));
      const avgPerIo = total === 0 ? 0 : total / Math.max(1, countL1);
      const lowerLabel = label.toLowerCase();
      const isTotal = lowerLabel === 'total';
      const isGroup =
        lowerLabel === 'topline vs' ||
        lowerLabel === 'mfg total' ||
        lowerLabel === 'rd vs' ||
        lowerLabel === 'procurement / bom' ||
        isTotal;
      const isSub =
        lowerLabel.startsWith('product category') ||
        lowerLabel.startsWith('site ') ||
        lowerLabel.startsWith('bu ');
      const { pctL1, pctL2, pctL3 } = getStagePercents(label);

      return {
        id: label.toLowerCase().replace(/\s+/g, '-'),
        label,
        total,
        l1,
        l2,
        l3,
        pctL1,
        pctL2,
        pctL3,
        runRateTarget: total * (pctL2 / 100),
        runRateImpact: total * (pctL3 / 100),
        countL1,
        owners,
        avgPerIo,
        isGroup,
        isTotal,
        isSub,
      } satisfies PlanRow;
    };

    if (aggregated.size === 0) {
      return PLAN_TABLE_ROWS;
    }

    return Array.from(aggregated.entries()).map(([label, entry]) =>
      toRow(label, entry)
    );
  }, [businessGroups, selectedBu]);

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

  const timeframeScale = useMemo(
    () => getTimeframeScale(activeTimeframe),
    [activeTimeframe]
  );

  const scaledPlanRows = useMemo(() => {
    const scale = timeframeScale;
    const round = (value: number) => Math.round(value * 10) / 10;
    return monthlyImpactPlanRows.map((row) => {
      const { pctL1, pctL2, pctL3 } = getStagePercents(row.label);
      return {
      ...row,
      total: round(row.total),
      l1: round(row.l1 * scale),
      l2: round(row.l2 * scale),
      l3: round(row.l3 * scale),
      pctL1,
      pctL2,
      pctL3,
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
    setSelectedGroupIds(new Set([overallId]));
  }, [selectedGroupInfo, searchParams]);

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

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Initiative Performance
          </h1>
          <p className='text-sm text-gray-600 mt-2'>
            Track ideation maturity from robust planning to in-year targets.
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
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <span className='font-semibold text-gray-700'>From</span>
                <span>{todayLabel}</span>
              </div>
              <div className='flex text-xs text-gray-600'>
                <div className='flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-semibold text-gray-700'>L1+</span>
                  <span className='flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-red-400' />
                    <span>&lt;100%</span>
                  </span>
                  <span className='flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-yellow-400' />
                    <span>100-130%</span>
                  </span>
                  <span className='flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-green-500' />
                    <span>≥130%</span>
                  </span>
                </div>
                <span className='h-4 w-px bg-gray-300' />
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-semibold text-gray-700'>L2+</span>
                  <span className='flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-red-400' />
                    <span>&lt;100%</span>
                  </span>
                  <span className='flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-yellow-400' />
                    <span>100-120%</span>
                  </span>
                  <span className='flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-green-500' />
                    <span>≥120%</span>
                  </span>
                </div>
                <span className='h-4 w-px bg-gray-300' />
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-semibold text-gray-700'>L3+</span>
                  <span className='flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-red-400' />
                    <span>&lt;100%</span>
                  </span>
                  <span className='flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-yellow-400' />
                    <span>100-110%</span>
                  </span>
                  <span className='flex items-center gap-1'>
                    <span className='h-2 w-2 rounded-full bg-green-500' />
                    <span>≥110%</span>
                  </span>
                </div>
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
                        Mn USD
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
                      <th
                        className='bg-gray-50 text-center px-4 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                        colSpan={3}>
                        Indicat.
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
                        Run rate target
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        Run rate impact
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        # of L1+ init
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        # of init. owners
                      </th>
                      <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'>
                        avg. init per IO
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
                            {row.label}
                          </td>
                          <td className='px-6 py-3 border-r border-gray-200 last:border-r-0'>
                            {row.sponsor ?? '-'}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.total.toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.l1.toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.l2.toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.l3.toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                row.pctL1,
                                { warn: 100, good: 130 }
                              )}`}>
                              {row.pctL1}%
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                row.pctL2,
                                { warn: 100, good: 120 }
                              )}`}>
                              {row.pctL2}%
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                row.pctL3,
                                { warn: 100, good: 110 }
                              )}`}>
                              {row.pctL3}%
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.runRateTarget?.toFixed(1) ?? '-'}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.runRateImpact?.toFixed(1) ?? '-'}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.countL1}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.owners}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.avgPerIo.toFixed(1)}
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
