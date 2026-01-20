import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeaderFilters from '../components/HeaderFilters';
import TimeframePicker, {
  type TimeframeOption,
  type TimeframeOptionItem,
} from '../components/TimeframePicker';
import { getMainBusinessGroupOptions } from '../data/mockBusinessGroupPerformance';
import {
  getStoredTimeframe,
  setStoredTimeframe,
} from '../utils/timeframeStorage';

type TabId = 'plans' | 'execution';

const TAB_CONFIG: Array<{ id: TabId; label: string }> = [
  { id: 'plans', label: 'Ideation Dashboard' },
  { id: 'execution', label: 'Implementation dashboard' },
];

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

const EXECUTION_TABLE_ROWS: ExecutionRow[] = [
  {
    id: 'topline',
    label: 'Topline VS',
    pipeline: 6.0,
    l4Target: 3.9,
    l4Impact: 3.0,
    l4Pct: 77,
    lateInitiatives: 2,
    lateValue: 0.6,
    milestonesDue: 29,
    milestonesCompletePct: 76,
    postponed: 0,
    isGroup: true,
  },
  {
    id: 'topline-sub-1',
    label: 'Sub-VS1A',
    sponsor: 'Mr. A',
    pipeline: 3.0,
    l4Target: 2.1,
    l4Impact: 2.0,
    l4Pct: 98,
    lateInitiatives: 0,
    lateValue: 0.0,
    milestonesDue: 7,
    milestonesCompletePct: 100,
    postponed: 0,
    isSub: true,
  },
  {
    id: 'topline-sub-2',
    label: 'Sub-VS1B',
    sponsor: 'Mr. B',
    pipeline: 1.5,
    l4Target: 1.8,
    l4Impact: 1.0,
    l4Pct: 53,
    lateInitiatives: 2,
    lateValue: 0.6,
    milestonesDue: 7,
    milestonesCompletePct: 86,
    postponed: 0,
    isSub: true,
  },
  {
    id: 'topline-sub-3',
    label: 'Sub-VS1C',
    sponsor: 'Mr. C',
    pipeline: 1.5,
    l4Target: 0.0,
    l4Impact: 0.0,
    l4Pct: null,
    lateInitiatives: 0,
    lateValue: 0.0,
    milestonesDue: 15,
    milestonesCompletePct: 60,
    postponed: 0,
    isSub: true,
  },
  {
    id: 'mfg',
    label: 'MFG VS',
    pipeline: 8.0,
    l4Target: 6.0,
    l4Impact: 4.0,
    l4Pct: 66,
    lateInitiatives: 5,
    lateValue: 0.6,
    milestonesDue: 463,
    milestonesCompletePct: 116,
    postponed: 1,
    isGroup: true,
  },
  {
    id: 'mfg-sub-1',
    label: 'Sub-VS2A',
    sponsor: 'Mr. D',
    pipeline: 5.0,
    l4Target: 4.0,
    l4Impact: 3.1,
    l4Pct: 78,
    lateInitiatives: 4,
    lateValue: 0.6,
    milestonesDue: 297,
    milestonesCompletePct: 90,
    postponed: 1,
    isSub: true,
  },
  {
    id: 'mfg-sub-2',
    label: 'Sub-VS2B',
    sponsor: 'Mr. E',
    pipeline: 3.0,
    l4Target: 2.0,
    l4Impact: 0.8,
    l4Pct: 41,
    lateInitiatives: 1,
    lateValue: 0.1,
    milestonesDue: 164,
    milestonesCompletePct: 94,
    postponed: 0,
    isSub: true,
  },
  {
    id: 'mfg-sub-3',
    label: 'Sub-VS2C',
    sponsor: 'Mr. F',
    pipeline: 0.0,
    l4Target: 0.0,
    l4Impact: 0.0,
    l4Pct: 100,
    lateInitiatives: 0,
    lateValue: 0.0,
    milestonesDue: 2,
    milestonesCompletePct: 100,
    postponed: 0,
    isSub: true,
  },
  {
    id: 'rd',
    label: 'R&D',
    pipeline: 4.1,
    l4Target: 1.4,
    l4Impact: 1.0,
    l4Pct: 71,
    lateInitiatives: 9,
    lateValue: 1.4,
    milestonesDue: 57,
    milestonesCompletePct: 95,
    postponed: 0,
    isGroup: true,
  },
  {
    id: 'rd-sub-1',
    label: 'Sub-VS3A',
    sponsor: 'Mr. G',
    pipeline: 1.0,
    l4Target: 0.3,
    l4Impact: 0.4,
    l4Pct: 133,
    lateInitiatives: 1,
    lateValue: 0.3,
    milestonesDue: 4,
    milestonesCompletePct: 100,
    postponed: 0,
    isSub: true,
  },
  {
    id: 'rd-sub-2',
    label: 'Sub-VS3B',
    sponsor: 'Mr. H',
    pipeline: 1.0,
    l4Target: 0.3,
    l4Impact: 0.3,
    l4Pct: 111,
    lateInitiatives: 1,
    lateValue: 0.2,
    milestonesDue: 2,
    milestonesCompletePct: 100,
    postponed: 0,
    isSub: true,
  },
  {
    id: 'rd-sub-3',
    label: 'Sub-VS3C',
    sponsor: 'Mr. I',
    pipeline: 1.0,
    l4Target: 0.2,
    l4Impact: 0.2,
    l4Pct: 75,
    lateInitiatives: 2,
    lateValue: 0.6,
    milestonesDue: 4,
    milestonesCompletePct: 100,
    postponed: 0,
    isSub: true,
  },
  {
    id: 'rd-sub-4',
    label: 'Sub-VS34',
    sponsor: 'Mr. J',
    pipeline: 0.9,
    l4Target: 0.5,
    l4Impact: 0.0,
    l4Pct: 9,
    lateInitiatives: 2,
    lateValue: 0.3,
    milestonesDue: 9,
    milestonesCompletePct: 100,
    postponed: 0,
    isSub: true,
  },
  {
    id: 'procurement',
    label: 'Procurement/BOM',
    sponsor: 'Mr. K',
    pipeline: 73.9,
    l4Target: 7.2,
    l4Impact: 0.0,
    l4Pct: 0,
    lateInitiatives: 11,
    lateValue: 5.0,
    milestonesDue: 143,
    milestonesCompletePct: 91,
    postponed: 0,
    isGroup: true,
  },
  {
    id: 'total',
    label: 'Total',
    pipeline: 116.3,
    l4Target: 24.3,
    l4Impact: 14.5,
    l4Pct: 59,
    lateInitiatives: 29,
    lateValue: 7.6,
    milestonesDue: 825,
    milestonesCompletePct: 106,
    postponed: 4,
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

export default function IdeationProgressPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = useMemo<TabId>(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'execution' ? 'execution' : 'plans';
  }, [searchParams]);
  const [activeTimeframe, setActiveTimeframe] = useState<TimeframeOption>(() => {
    const stored = getStoredTimeframe();
    return stored === 'ytm' || stored === 'full-year' ? stored : 'full-year';
  });
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [selectedBu, setSelectedBu] = useState<string>('all');
  const todayLabel = useMemo(() => format(new Date(), 'MMM d'), []);
  const mainBuOptions = getMainBusinessGroupOptions();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
    return PLAN_TABLE_ROWS.map((row) => ({
      ...row,
      total: round(row.total * scale),
      l1: round(row.l1 * scale),
      l2: round(row.l2 * scale),
      l3: round(row.l3 * scale),
      countL1: Math.max(0, Math.round(row.countL1 * scale)),
      owners: Math.max(0, Math.round(row.owners * scale)),
      avgPerIo: row.avgPerIo,
    }));
  }, [timeframeScale]);

  const scaledExecutionRows = useMemo(() => {
    const scale = timeframeScale;
    const round = (value: number) => Math.round(value * 10) / 10;
    return EXECUTION_TABLE_ROWS.map((row) => ({
      ...row,
      pipeline: round(row.pipeline * scale),
      l4Target: round(row.l4Target * scale),
      l4Impact: round(row.l4Impact * scale),
      lateInitiatives: Math.max(0, Math.round(row.lateInitiatives * scale)),
      lateValue: round(row.lateValue * scale),
      milestonesDue: Math.max(0, Math.round(row.milestonesDue * scale)),
      postponed: Math.max(0, Math.round(row.postponed * scale)),
    }));
  }, [timeframeScale]);

  useEffect(() => {
    setStoredTimeframe(activeTimeframe);
  }, [activeTimeframe]);

  useEffect(() => {
    const buParam = searchParams.get('bu');
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
  }, [mainBuOptions, searchParams]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const handleBuChange = (buId: string) => {
    setSelectedBu(buId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('bu', buId);
      return next;
    });
  };

  const timeframeOptions: TimeframeOptionItem[] = [
    { value: 'full-year', label: 'Full year forecast' },
    { value: 'ytm', label: 'YTM actuals' },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50'>
      <div className='p-8 max-w-[1440px] mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Initiative Performance
          </h1>
          <p className='text-sm text-gray-600 mt-2'>
            Track ideation maturity from robust planning to bottom-line
            execution.
          </p>
        </div>

        <div className='mb-6'>
          <HeaderFilters
            timeframeContent={
              <TimeframePicker
                selectedTimeframe={activeTimeframe}
                onTimeframeChange={setActiveTimeframe}
                options={timeframeOptions}
              />
            }
            buOptions={mainBuOptions}
            selectedBu={selectedBu}
            onBuChange={handleBuChange}
            showBu
          />
        </div>

        <div className='flex items-center gap-2 bg-gray-100/80 backdrop-blur-sm rounded-xl p-1.5 pr-3 border border-gray-200/50 shadow-sm mb-6 w-fit'>
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-md shadow-gray-200/50 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
          {activeTab === 'plans' ? (
            <div className='space-y-6'>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <span className='font-semibold text-gray-700'>From</span>
                <span>{todayLabel}</span>
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
                      const pctClass = (value: number) =>
                        value >= 100
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-50 text-red-700';

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
                                row.pctL1
                              )}`}>
                              {row.pctL1}%
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                row.pctL2
                              )}`}>
                              {row.pctL2}%
                            </span>
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${pctClass(
                                row.pctL3
                              )}`}>
                              {row.pctL3}%
                            </span>
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
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <span className='font-semibold text-gray-700'>From</span>
                <span>{todayLabel}</span>
              </div>

              <div className='overflow-x-auto rounded-lg border border-gray-200'>
                <table className='w-full text-sm border-collapse'>
                  <thead>
                    <tr>
                      <th
                        className='bg-gray-50 text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-r border-gray-200 last:border-r-0'
                        colSpan={3}>
                        Mn USD
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
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-50 text-red-700';

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
                            {row.pipeline.toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.l4Target.toFixed(1)}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.l4Impact.toFixed(1)}
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
                            {row.lateInitiatives === 0
                              ? '-'
                              : row.lateInitiatives}
                          </td>
                          <td className='px-4 py-3 text-center border-r border-gray-200 last:border-r-0'>
                            {row.lateValue === 0
                              ? '-'
                              : row.lateValue.toFixed(1)}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
