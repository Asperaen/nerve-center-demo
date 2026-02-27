import {
  ArrowRightIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import CreateActionModal from '../components/CreateActionModal';
import { useCurrency } from '../contexts/CurrencyContext';
import { KEY_CALLOUTS_BY_BG, OP_IMPACT_DATA } from '../data/mockBgData';
import {
  mockLeakageRecoveryProposal,
  mockNPDeviationKeyCallOut,
  mockNPDeviationStages,
} from '../data/mockForecast';
import type { ActionProposal, NPDeviationStageType, Proposal } from '../types';
import { calculateBrokenAxis, type BrokenAxisConfig } from '../utils/brokenAxisUtils';

// Custom Y-axis tick component with break indicator
const BrokenAxisTick = ({
  x,
  y,
  payload,
  brokenAxis,
  index,
  formatValue,
}: {
  x?: number;
  y?: number;
  payload?: { value: number };
  brokenAxis: BrokenAxisConfig;
  index?: number;
  formatValue?: (value: number) => string;
}) => {
  if (x === undefined || y === undefined || !payload) return null;
  const { value } = payload;
  const { skipRangeStart, skipRangeEnd } = brokenAxis;
  const skipAmount = skipRangeEnd - skipRangeStart;

  const actualValue = value > skipRangeStart ? value + skipAmount : value;
  const isFirstTickAboveBreak = value > skipRangeStart && index !== undefined && index > 0;
  const shouldShowBreak = isFirstTickAboveBreak && value <= skipRangeStart + 300;

  const displayValue = formatValue
    ? formatValue(actualValue)
    : actualValue.toFixed(0);

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor='end' fill='#666' fontSize={12}>
        {displayValue}
      </text>
      {shouldShowBreak && (
        <g transform='translate(8, 12)'>
          <rect x={-10} y={-2} width={18} height={14} fill='white' />
          <line x1={-8} y1={0} x2={6} y2={0} stroke='#4b5563' strokeWidth={3} />
          <line x1={-8} y1={8} x2={6} y2={8} stroke='#4b5563' strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

// Custom bar shape with break indicator for baseline bars
const BrokenBarShape = (props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: { type?: string };
  brokenAxis: BrokenAxisConfig;
}) => {
  const { x = 0, y = 0, width = 0, height = 0, fill, payload } = props;
  const isBaseline = payload?.type === 'baseline';
  const breakIndicatorHeight = 10;

  if (!isBaseline) {
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={2} ry={2} />;
  }

  const minHeightForBreak = breakIndicatorHeight + 6;
  if (height < minHeightForBreak) {
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={2} ry={2} />;
  }

  const topHeight = Math.max(0, height - breakIndicatorHeight - 6);
  const breakY = y + height - breakIndicatorHeight - 4;
  const gapHeight = breakIndicatorHeight + 4;

  return (
    <g>
      <rect x={x} y={y} width={width} height={topHeight} fill={fill} rx={2} ry={2} />
      <rect x={x - 1} y={breakY - 2} width={width + 2} height={gapHeight} fill='white' />
      <line x1={x} y1={breakY - 1} x2={x + width} y2={breakY - 1} stroke='#4b5563' strokeWidth={3} />
      <line x1={x} y1={breakY + gapHeight - 3} x2={x + width} y2={breakY + gapHeight - 3} stroke='#4b5563' strokeWidth={3} />
      <rect x={x} y={breakY + breakIndicatorHeight} width={width} height={4} fill={fill} rx={2} ry={2} />
    </g>
  );
};

const normalizeLabel = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

export default function FinanceReviewPage() {
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { formatAmount, currencyLabel } = useCurrency();
  const formatAmountM = (value: number) =>
    `${formatAmount(value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}M`;
  const formatAxisValue = (value: number) =>
    formatAmount(value, { maximumFractionDigits: 0 });

  const isDeGroupSelected = useMemo(() => {
    const buParam = searchParams.get('bu') ?? searchParams.get('bg');
    if (!buParam || buParam === 'all') {
      return false;
    }
    const normalized = normalizeLabel(buParam);
    return normalized === 'degroup' || buParam.toLowerCase().includes('d/e');
  }, [searchParams]);

  const keyCallOut = useMemo(() => {
    if (isDeGroupSelected) {
      const callouts = KEY_CALLOUTS_BY_BG.HH?.['D/E Group'];
      if (callouts?.actualReconciliation?.length) {
        return {
          bulletPoints: callouts.actualReconciliation,
          rootCauseAnalysis: '',
        };
      }
    }
    return mockNPDeviationKeyCallOut;
  }, [isDeGroupSelected]);

  const selectedImpactItems = useMemo(() => {
    const entries = Object.entries(OP_IMPACT_DATA) as [
      string,
      typeof OP_IMPACT_DATA[string]
    ][];
    const bgParam = searchParams.get('bg') ?? searchParams.get('bu') ?? 'all';
    const buParam = searchParams.get('bu');
    if (bgParam === 'all') {
      return entries.flatMap(([key, items]) => {
        const [bg, bu] = key.split('|');
        return items.map((item) => ({ ...item, bg, bu }));
      });
    }
    const normalizedBg = normalizeLabel(bgParam);
    const buSet = new Set(
      (buParam ?? '')
        .split(',')
        .map((value) => normalizeLabel(value))
        .filter(Boolean)
    );
    return entries.flatMap(([key, items]) => {
      const [bg, bu] = key.split('|');
      if (normalizeLabel(bg) !== normalizedBg) {
        return [];
      }
      if (buSet.size > 0 && !buSet.has(normalizeLabel(bu))) {
        return [];
      }
      return items.map((item) => ({ ...item, bg, bu }));
    });
  }, [searchParams]);

  const isOneOffItem = useMemo(
    () => (item: (typeof selectedImpactItems)[number]) =>
      item.category.toLowerCase().includes('one-off'),
    []
  );
  const isHeadwindItem = useMemo(
    () => (item: (typeof selectedImpactItems)[number]) => {
      const category = item.category.toLowerCase();
      return category.includes('headwind') || category.includes('tailwind');
    },
    []
  );

  const opImpactBuckets = useMemo(() => {
    const oneOffItems = selectedImpactItems.filter(isOneOffItem);
    const headwindItems = selectedImpactItems.filter(isHeadwindItem);
    const sum = (items: typeof selectedImpactItems) =>
      items.reduce((total, item) => total + item.opImpact, 0);
    return {
      oneOffItems,
      headwindItems,
      oneOffTotal: sum(oneOffItems),
      headwindTotal: sum(headwindItems),
    };
  }, [selectedImpactItems, isOneOffItem, isHeadwindItem]);

  const npDeviationStages = useMemo(() => {
    const budgetStage = mockNPDeviationStages.find(
      (stage) => stage.stage === 'budget-np'
    );
    const budgetValue = budgetStage?.value ?? 0;
    const headwindDelta = opImpactBuckets.headwindTotal;
    const oneOffDelta = opImpactBuckets.oneOffTotal;
    const afterHeadwind = budgetValue + headwindDelta;
    const afterOneOff = afterHeadwind + oneOffDelta;

    return [
      {
        stage: 'budget-np' as const,
        label: 'Budget NP',
        value: budgetValue,
        delta: budgetValue,
        type: 'baseline' as const,
        description: 'Budget Net Profit baseline',
        isClickable: false,
      },
      {
        stage: 'vol-impact' as const,
        label: 'Headwind / tailwind',
        value: afterHeadwind,
        delta: headwindDelta,
        type: headwindDelta >= 0 ? ('positive' as const) : ('negative' as const),
        description: 'Headwind/tailwind impact',
        isClickable: true,
      },
      {
        stage: 'price-impact' as const,
        label: 'One-off items',
        value: afterOneOff,
        delta: oneOffDelta,
        type: oneOffDelta >= 0 ? ('positive' as const) : ('negative' as const),
        description: 'One-off impact',
        isClickable: true,
      },
      {
        stage: 'actual-np' as const,
        label: 'Actual NP',
        value: afterOneOff,
        delta: afterOneOff,
        type: 'baseline' as const,
        description: 'Actual Net Profit',
        isClickable: false,
      },
    ];
  }, [opImpactBuckets, mockNPDeviationStages]);

  // Proposals state - Map for leakage recovery proposal
  const [proposals, setProposals] = useState<Map<string, Proposal>>(() => {
    const initialProposals = new Map<string, Proposal>();
    // Initialize with mockLeakageRecoveryProposal using a special key
    initialProposals.set('leakage-recovery', mockLeakageRecoveryProposal);
    return initialProposals;
  });
  const [selectedProposalForAction, setSelectedProposalForAction] =
    useState<Proposal | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionProposal | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImpactStage, setActiveImpactStage] =
    useState<NPDeviationStageType | null>(null);

  const activeImpactItems = useMemo(() => {
    if (!activeImpactStage) {
      return [];
    }
    if (activeImpactStage === 'vol-impact') {
      return selectedImpactItems.filter(isHeadwindItem);
    }
    if (activeImpactStage === 'price-impact') {
      return selectedImpactItems.filter(isOneOffItem);
    }
    return [];
  }, [activeImpactStage, selectedImpactItems, isHeadwindItem, isOneOffItem]);

  // Handler functions for Initiative Proposals
  const handleCreateAction = (proposal: Proposal) => {
    setSelectedProposalForAction(proposal);
    setIsCreateActionModalOpen(true);
  };

  const handleSaveAction = (proposalId: string, action: ActionProposal) => {
    setProposals((prev) => {
      const next = new Map(prev);
      const proposal = next.get(proposalId);
      if (proposal) {
        const updatedProposal: Proposal = {
          ...proposal,
          actions: [...proposal.actions, action],
          lastUpdated: new Date(),
        };
        next.set(proposalId, updatedProposal);
      }
      return next;
    });
    setIsCreateActionModalOpen(false);
    setSelectedProposalForAction(null);
  };

  // Auto-calculate broken axis for NP Deviation chart
  const brokenAxis = useMemo(() => {
    const result = calculateBrokenAxis(npDeviationStages);
    return result.brokenAxis;
  }, [npDeviationStages]);

  // Prepare chart data for Layer 1 (NP Deviation)
  const npDeviationChartData = useMemo(() => {
    return npDeviationStages.map((stage, index) => {
      const prevValue = index > 0 ? npDeviationStages[index - 1].value : 0;
      const currentValue = stage.value;
      const delta =
        stage.delta ?? (index === 0 ? currentValue : currentValue - prevValue);

      const isBaseline = stage.type === 'baseline';
      let barValue: number;
      let baselineValue: number;

      if (brokenAxis) {
        const { skipRangeStart, skipRangeEnd } = brokenAxis;
        const skipAmount = skipRangeEnd - skipRangeStart;
        const transformValue = (v: number) =>
          v > skipRangeEnd ? v - skipAmount : v > skipRangeStart ? skipRangeStart : v;

        if (isBaseline) {
          baselineValue = 0;
          barValue = transformValue(currentValue);
        } else {
          const transformedPrev = transformValue(prevValue);
          const transformedCurrent = transformValue(currentValue);
          if (delta < 0) {
            baselineValue = transformedCurrent;
            barValue = Math.abs(delta);
          } else {
            baselineValue = transformedPrev;
            barValue = delta;
          }
        }
      } else {
        barValue = isBaseline ? currentValue : delta;
        baselineValue = isBaseline ? 0 : prevValue;
      }

      return {
        ...stage,
        name: stage.label,
        label: stage.label,
        cumulativeValue: currentValue,
        delta,
        baselineValue,
        barValue,
        isPositive: delta >= 0,
        isClickable: stage.isClickable,
        originalValue: currentValue,
      };
    });
  }, [brokenAxis, npDeviationStages]);

  // Render Layer 1: NP Deviation Breakdown
  const renderLayer1 = () => (
    <div className='space-y-8'>
      {/* Page Title */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-2'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Finance Review - Q4 2025
          </h1>
          <button
            onClick={() => setIsCreateActionModalOpen(true)}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
            <PlusIcon className='w-5 h-5' />
            Create Action
          </button>
        </div>
      </div>

      {/* NP Deviation Waterfall Chart */}
      <div className='lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-8 hover:shadow-xl transition-shadow duration-300'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              NP Deviation Breakdown
            </h2>
            <p className='text-sm text-gray-500 mt-1 flex items-center gap-1'>
              <ArrowRightIcon className='w-4 h-4 text-blue-500' />
              <span>
                Click on Budget NP, Vol. impact, Price impact, or Cost impact to
                drill down
              </span>
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-green-500'></div>
              <span className='text-sm text-gray-700'>Positive Impact</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-red-500'></div>
              <span className='text-sm text-gray-700'>Negative Impact</span>
            </div>
          </div>
        </div>

        <div className='h-96'>
          <ResponsiveContainer
            width='100%'
            height='100%'>
            <ComposedChart data={npDeviationChartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='label'
                angle={-15}
                textAnchor='end'
                height={120}
                style={{ fontSize: '11px' }}
              />
              {brokenAxis ? (
                <YAxis
                  tick={(props) => (
                    <BrokenAxisTick
                      {...props}
                      brokenAxis={brokenAxis}
                      formatValue={formatAxisValue}
                    />
                  )}
                  domain={[
                    0,
                    Math.max(...npDeviationStages.map((s) => s.value)) -
                      brokenAxis.skipRangeEnd +
                      50,
                  ]}
                  label={{
                    value: `Net Profit (Mn ${currencyLabel})`,
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '12px' },
                  }}
                />
              ) : (
                <YAxis
                  style={{ fontSize: '12px' }}
                  label={{
                    value: `Net Profit (Mn ${currencyLabel})`,
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '12px' },
                  }}
                />
              )}
              <Tooltip
                formatter={(value, _name, props) => {
                  const payload = props.payload as
                    | {
                        cumulativeValue?: number;
                        delta?: number;
                        label?: string;
                        isClickable?: boolean;
                        stage?: NPDeviationStageType;
                      }
                    | undefined;
                  const numericValue =
                    typeof value === 'number'
                      ? value
                      : Number(Array.isArray(value) ? value[0] : value ?? 0);
                  const stage = payload?.stage
                    ? npDeviationStages.find((item) => item.stage === payload.stage)
                    : undefined;
                  const delta = payload?.delta ?? stage?.delta;
                  const bucketValue =
                    delta !== undefined ? delta : numericValue;
                  const isClickable = payload?.isClickable;

                  const tooltipLines: string[] = [
                    `${stage?.label ?? payload?.label ?? 'Stage'}: ${
                      bucketValue > 0 ? '+' : ''
                    }${formatAmountM(bucketValue)} ${currencyLabel}`,
                  ];

                  if (isClickable) {
                    tooltipLines.push('Deep dive →');
                  }

                  return tooltipLines.join('\n');
                }}
              />
              <Legend />
              <Bar
                dataKey='baselineValue'
                stackId='a'
                fill='transparent'
              />
              <Bar
                dataKey='barValue'
                stackId='a'
                name='NP Deviation'
                shape={
                  brokenAxis
                    ? (props: unknown) => <BrokenBarShape {...(props as Record<string, unknown>)} brokenAxis={brokenAxis} />
                    : undefined
                }
              >
                <LabelList
                  dataKey='delta'
                  position='middle'
                  content={(props) => {
                    const { x, y, width, height, value, index } = props as {
                      x?: number;
                      y?: number;
                      width?: number;
                      height?: number;
                      value?: number;
                      index?: number;
                    };
                    if (x === undefined || y === undefined || width === undefined || index === undefined) return null;
                    
                    const stage = npDeviationStages[index];
                    const isBaseline = stage?.type === 'baseline';
                    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                    const displayValue = formatAxisValue(numericValue);
                    
                    if (brokenAxis && isBaseline) {
                      return (
                        <text
                          x={x + (width ?? 0) / 2}
                          y={(y ?? 0) - 8}
                          textAnchor='middle'
                          fill='#4b5563'
                          fontSize={11}
                          fontWeight='bold'
                        >
                          {displayValue}
                        </text>
                      );
                    }
                    
                    return (
                      <text
                        x={x + (width ?? 0) / 2}
                        y={(y ?? 0) + (height ?? 0) / 2 + 4}
                        textAnchor='middle'
                        fill='white'
                        fontSize={11}
                        fontWeight='bold'
                      >
                        {displayValue}
                      </text>
                    );
                  }}
                />
                {npDeviationStages.map((stage, index) => {
                  const isBaseline = stage.type === 'baseline';
                  const isPositive = stage.type === 'positive';

                  let fillColor = '#6b7280'; // grey for baseline
                  if (!isBaseline) {
                    fillColor = isPositive ? '#10b981' : '#ef4444'; // green for positive, red for negative
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fillColor}
                      style={{
                        cursor: stage.isClickable ? 'pointer' : 'default',
                        stroke: stage.isClickable ? '#3b82f6' : 'none',
                        strokeWidth: stage.isClickable ? 2 : 0,
                        opacity: stage.isClickable ? 1 : 0.9,
                      }}
                      onClick={() => {
                        if (stage.isClickable) {
                          setActiveImpactStage(stage.stage);
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (stage.isClickable) {
                          e.currentTarget.style.opacity = '0.8';
                          e.currentTarget.style.strokeWidth = '3';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (stage.isClickable) {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.strokeWidth = '2';
                        }
                      }}
                    />
                  );
                })}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Call Out Section */}
      <div className='lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300'>
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
          {keyCallOut.rootCauseAnalysis && (
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <p className='text-sm text-gray-700 leading-relaxed'>
                {keyCallOut.rootCauseAnalysis}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Initiative Proposals Section */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-8 hover:shadow-xl transition-shadow duration-300'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-1'>
              Initiative Proposals
            </h2>
            <p className='text-sm text-gray-500'>
              Proposals and initiatives for leakage recovery
            </p>
          </div>
        </div>
        <div className='space-y-6'>
          {(() => {
            const proposal = proposals.get('leakage-recovery');
            if (!proposal) return null;

            return (
              <div className='p-6 rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-300'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 rounded-full bg-gray-100'>
                      <PlusIcon className='w-5 h-5 text-gray-600' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Leakage Recovery
                      </h3>
                      {proposal.description && (
                        <p className='text-sm text-gray-600 mt-1'>
                          {proposal.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Proposal Section */}
                <div className='mt-5 p-5 bg-white rounded-xl border border-gray-200 shadow-sm'>
                  <div className='flex items-center justify-between mb-3'>
                    <p className='text-sm font-medium text-gray-700'>
                      Initiatives ({proposal.actions.length}):
                    </p>
                    <button
                      onClick={() => handleCreateAction(proposal)}
                      className='px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors flex items-center'>
                      <PlusIcon className='w-3 h-3 mr-1' />
                      Add Initiative
                    </button>
                  </div>
                  <div className='space-y-2'>
                    {proposal.actions.map((action: ActionProposal) => {
                      const isReadyInWave = action.stage !== undefined;

                      // Get L-gate stage color
                      const getStageColor = (stage?: string) => {
                        switch (stage) {
                          case 'L0':
                            return 'bg-gray-500 text-white';
                          case 'L1':
                            return 'bg-blue-500 text-white';
                          case 'L2':
                            return 'bg-green-500 text-white';
                          case 'L3':
                            return 'bg-yellow-500 text-white';
                          case 'L4':
                            return 'bg-orange-500 text-white';
                          case 'L5':
                            return 'bg-red-500 text-white';
                          default:
                            return 'bg-gray-400 text-white';
                        }
                      };

                      return (
                        <div
                          key={action.id}
                          className={`flex items-start justify-between p-4 rounded-lg transition-all duration-200 ${
                            isReadyInWave
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-sm'
                              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}>
                          <div className='flex-1'>
                            <div className='mb-1'>
                              <p className='text-sm font-medium text-gray-900 whitespace-pre-line'>
                                {action.description}
                              </p>
                            </div>
                            <div className='mt-2 flex items-center flex-wrap gap-2'>
                              {action.expectedImpact > 0 ? (
                                <span className='text-xs text-gray-500'>
                                  Expected Impact:{' '}
                                  {formatAmountM(action.expectedImpact)}{' '}
                                  {currencyLabel}
                                </span>
                              ) : (
                                <span className='text-xs text-gray-500'>
                                  Expected Impact: Restore run-rate savings
                                </span>
                              )}
                              <span className='text-xs text-gray-400'>•</span>
                              {action.feasibility === 'high' ? (
                                <span className='px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full border border-green-300'>
                                  High Feasibility
                                </span>
                              ) : (
                                <span className='text-xs text-gray-500 capitalize'>
                                  Feasibility: {action.feasibility}
                                </span>
                              )}
                              <span className='text-xs text-gray-400'>•</span>
                              {action.priority === 'high' ? (
                                <span className='px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full border border-red-300'>
                                  High Priority
                                </span>
                              ) : (
                                <span className='text-xs text-gray-500 capitalize'>
                                  Priority: {action.priority}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className='ml-4 flex flex-col items-end gap-2'>
                            {isReadyInWave && action.stage ? (
                              <div
                                className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getStageColor(
                                  action.stage
                                )}`}>
                                {action.stage}
                              </div>
                            ) : isReadyInWave ? (
                              <div className='px-3 py-1 text-xs font-medium text-yellow-800 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-full border border-yellow-400 shadow-sm'>
                                ✨ Ready in Wave
                              </div>
                            ) : null}
                            {!isReadyInWave && (
                              <button
                                onClick={() => {
                                  setSelectedAction(action);
                                  setIsModalOpen(true);
                                }}
                                className='px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 rounded-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:via-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-1.5 border-2 border-orange-400'>
                                <span>✨</span>
                                <span>Wave It!</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>{renderLayer1()}</div>

      {activeImpactStage && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6'
          onClick={() => setActiveImpactStage(null)}>
          <div
            className='flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200 max-h-[80vh]'
            onClick={(event: React.MouseEvent<HTMLDivElement>) =>
              event.stopPropagation()
            }>
            <div className='flex items-start justify-between gap-4 border-b border-gray-200 p-6'>
              <div>
                <p className='text-xs uppercase tracking-wide text-gray-500'>
                  Bucket details
                </p>
                <h3 className='text-xl font-bold text-gray-900'>
                  {activeImpactStage === 'vol-impact'
                    ? 'Headwind / tailwind'
                    : 'One-off items'}
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  Mn {currencyLabel}
                </p>
              </div>
              <button
                type='button'
                className='rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-gray-700 hover:border-gray-300'
                onClick={() => setActiveImpactStage(null)}>
                <XMarkIcon className='h-4 w-4' />
              </button>
            </div>
            <div className='flex-1 overflow-y-auto p-6 space-y-5'>
              <div className='overflow-hidden rounded-lg border border-gray-200'>
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
                        OP impact (Mn {currencyLabel})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeImpactItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className='px-4 py-6 text-center text-sm text-gray-500'>
                          No op-impact items available.
                        </td>
                      </tr>
                    ) : (
                      activeImpactItems.map((row, index) => (
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
                            {formatAmountM(row.opImpact)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Action Modal (Global) */}
      <CreateActionModal
        isOpen={isCreateActionModalOpen && !selectedProposalForAction}
        onClose={() => {
          setIsCreateActionModalOpen(false);
          setSelectedProposalForAction(null);
        }}
      />

      {/* Create Action Modal (for Proposals) */}
      {isCreateActionModalOpen && selectedProposalForAction && (
        <CreateActionModalForProposal
          proposal={selectedProposalForAction}
          onClose={() => {
            setIsCreateActionModalOpen(false);
            setSelectedProposalForAction(null);
          }}
          onSave={handleSaveAction}
        />
      )}

      {/* Wave Initiative Modal */}
      {isModalOpen && selectedAction && (
        <WaveInitiativeModal
          action={selectedAction}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAction(null);
          }}
          onSuccess={() => {
            if (selectedAction) {
              // Find the proposal containing this action and update it to L0
              setProposals((prev) => {
                const next = new Map(prev);
                for (const [proposalId, proposal] of next.entries()) {
                  const actionIndex = proposal.actions.findIndex(
                    (a) => a.id === selectedAction.id
                  );
                  if (actionIndex !== -1) {
                    const updatedActions = [...proposal.actions];
                    updatedActions[actionIndex] = {
                      ...updatedActions[actionIndex],
                      stage: 'L0',
                    };
                    next.set(proposalId, {
                      ...proposal,
                      actions: updatedActions,
                      lastUpdated: new Date(),
                    });
                    break;
                  }
                }
                return next;
              });
            }
            setIsModalOpen(false);
            setSelectedAction(null);
          }}
        />
      )}
    </div>
  );
}

// Wave Initiative Modal Component
interface WaveInitiativeModalProps {
  action: ActionProposal;
  onClose: () => void;
  onSuccess: () => void;
}

function WaveInitiativeModal({
  action,
  onClose,
  onSuccess,
}: WaveInitiativeModalProps) {
  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}></div>

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>Wave It!</h3>
              <p className='mt-1 text-sm text-gray-500'>{action.description}</p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          <div className='flex-1 p-6 overflow-y-auto'>
            <p className='text-gray-600'>
              Wave initiative creation form would go here...
            </p>
          </div>

          <div className='flex items-center justify-center gap-3 p-6 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={onSuccess}
              className='px-8 py-3 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors'>
              Create
            </button>
            <button
              onClick={onClose}
              className='px-8 py-3 text-sm font-medium text-white bg-blue-400 rounded-lg hover:bg-blue-500 transition-colors'>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Action Modal for Proposals
interface CreateActionModalForProposalProps {
  proposal: Proposal;
  onClose: () => void;
  onSave: (proposalId: string, action: ActionProposal) => void;
}

function CreateActionModalForProposal({
  proposal,
  onClose,
  onSave,
}: CreateActionModalForProposalProps) {
  const { currencyLabel } = useCurrency();
  const [description, setDescription] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  const [feasibility, setFeasibility] = useState<'high' | 'medium' | 'low'>(
    'medium'
  );
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleSubmit = () => {
    if (!description.trim() || !expectedImpact) return;

    const impact = parseFloat(expectedImpact);
    if (isNaN(impact)) return;

    const newAction: ActionProposal = {
      id: `action-${Date.now()}`,
      description: description.trim(),
      expectedImpact: impact,
      feasibility,
      priority,
    };
    onSave(proposal.id, newAction);
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}></div>

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='relative bg-white rounded-lg shadow-xl w-full max-w-2xl'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                Add Initiative
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                Add a new initiative to this proposal
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Initiative Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Describe the initiative...'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                rows={3}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Expected Impact (M {currencyLabel}) *
              </label>
              <input
                type='number'
                step='0.1'
                value={expectedImpact}
                onChange={(e) => setExpectedImpact(e.target.value)}
                placeholder='e.g., 2.5'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Feasibility
                </label>
                <select
                  value={feasibility}
                  onChange={(e) =>
                    setFeasibility(e.target.value as 'high' | 'medium' | 'low')
                  }
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'>
                  <option value='high'>High</option>
                  <option value='medium'>Medium</option>
                  <option value='low'>Low</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as 'high' | 'medium' | 'low')
                  }
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'>
                  <option value='high'>High</option>
                  <option value='medium'>Medium</option>
                  <option value='low'>Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={onClose}
              className='px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!description.trim() || !expectedImpact}
              className='px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'>
              Add Initiative
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
