import {
  ArrowRightIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import CreateActionModal from '../components/CreateActionModal';
import { ProductAnalysisLayer } from '../components/layers';
import {
  mockLeakageRecoveryProposal,
  mockNPDeviationKeyCallOut,
  mockNPDeviationStages,
} from '../data/mockForecast';
import type {
  ActionProposal,
  BreadcrumbItem,
  NPDeviationStageType,
  Proposal,
} from '../types';
import { calculateBrokenAxis, type BrokenAxisConfig } from '../utils/brokenAxisUtils';

// Custom Y-axis tick component with break indicator
const BrokenAxisTick = ({
  x,
  y,
  payload,
  brokenAxis,
  index,
}: {
  x?: number;
  y?: number;
  payload?: { value: number };
  brokenAxis: BrokenAxisConfig;
  index?: number;
}) => {
  if (x === undefined || y === undefined || !payload) return null;
  const { value } = payload;
  const { skipRangeStart, skipRangeEnd } = brokenAxis;
  const skipAmount = skipRangeEnd - skipRangeStart;

  const actualValue = value > skipRangeStart ? value + skipAmount : value;
  const isFirstTickAboveBreak = value > skipRangeStart && index !== undefined && index > 0;
  const shouldShowBreak = isFirstTickAboveBreak && value <= skipRangeStart + 300;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor='end' fill='#666' fontSize={12}>
        {actualValue.toFixed(0)}
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

  const breakY = y + height - breakIndicatorHeight - 4;
  const gapHeight = breakIndicatorHeight + 4;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height - breakIndicatorHeight - 6} fill={fill} rx={2} ry={2} />
      <rect x={x - 1} y={breakY - 2} width={width + 2} height={gapHeight} fill='white' />
      <line x1={x} y1={breakY - 1} x2={x + width} y2={breakY - 1} stroke='#4b5563' strokeWidth={3} />
      <line x1={x} y1={breakY + gapHeight - 3} x2={x + width} y2={breakY + gapHeight - 3} stroke='#4b5563' strokeWidth={3} />
      <rect x={x} y={breakY + breakIndicatorHeight} width={width} height={4} fill={fill} rx={2} ry={2} />
    </g>
  );
};

type NavigationLayer = 1 | 2;

export default function FinanceReviewPage() {
  const [currentLayer, setCurrentLayer] = useState<NavigationLayer>(1);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);
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

  // Navigation handlers
  const navigateToLayer = (
    layer: NavigationLayer,
    breadcrumbLabel?: string
  ) => {
    if (breadcrumbLabel) {
      setBreadcrumbs((prev) => [
        ...prev,
        {
          label: breadcrumbLabel,
          layer,
          onClick: () => navigateToBreadcrumb(layer),
        },
      ]);
    }
    setCurrentLayer(layer);
  };

  // Navigate to a specific breadcrumb (used when clicking breadcrumb links)
  const navigateToBreadcrumb = (targetLayer: NavigationLayer) => {
    // Use functional update to access current breadcrumbs state
    setBreadcrumbs((prevBreadcrumbs) => {
      // Find the breadcrumb index for this layer
      const breadcrumbIndex = prevBreadcrumbs.findIndex(
        (crumb) => crumb.layer === targetLayer
      );

      if (breadcrumbIndex !== -1) {
        // Trim breadcrumbs to only include up to this point
        return prevBreadcrumbs.slice(0, breadcrumbIndex + 1);
      }
      return prevBreadcrumbs;
    });
    setCurrentLayer(targetLayer);
  };

  const navigateBack = () => {
    setBreadcrumbs((prevBreadcrumbs) => {
      if (prevBreadcrumbs.length > 0) {
        const newBreadcrumbs = [...prevBreadcrumbs];
        newBreadcrumbs.pop();
        setCurrentLayer(1);
        return newBreadcrumbs;
      } else {
        setCurrentLayer(1);
        return [];
      }
    });
  };

  const handleStageClick = (stageType: NPDeviationStageType) => {
    const stageLabels: Partial<Record<NPDeviationStageType, string>> = {
      'budget-np': 'COGS Analysis',
      'vol-impact': 'COGS Analysis',
      'price-impact': 'COGS Analysis',
      'cost-impact': 'COGS Analysis',
    };
    navigateToLayer(2, stageLabels[stageType] || 'COGS Analysis');
  };

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
    const result = calculateBrokenAxis(mockNPDeviationStages);
    return result.brokenAxis;
  }, []);

  // Prepare chart data for Layer 1 (NP Deviation)
  const npDeviationChartData = useMemo(() => {
    return mockNPDeviationStages.map((stage, index) => {
      const prevValue = index > 0 ? mockNPDeviationStages[index - 1].value : 0;
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
  }, [brokenAxis]);

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
              <span className='text-sm text-gray-700'>Favourable</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-red-500'></div>
              <span className='text-sm text-gray-700'>Adverse</span>
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
                  tick={(props) => <BrokenAxisTick {...props} brokenAxis={brokenAxis} />}
                  domain={[
                    0,
                    Math.max(...mockNPDeviationStages.map((s) => s.value)) - brokenAxis.skipRangeEnd + 50,
                  ]}
                  label={{
                    value: 'Net Profit (Mn USD)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '12px' },
                  }}
                />
              ) : (
                <YAxis
                  style={{ fontSize: '12px' }}
                  label={{
                    value: 'Net Profit (Mn USD)',
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
                      }
                    | undefined;
                  const numericValue =
                    typeof value === 'number'
                      ? value
                      : Number(Array.isArray(value) ? value[0] : value ?? 0);
                  const cumulative = payload?.cumulativeValue ?? numericValue;
                  const delta = payload?.delta;
                  const isClickable = payload?.isClickable;

                  const tooltipLines: string[] = [
                    `${payload?.label ?? 'Stage'}: $${cumulative.toFixed(1)}M`,
                  ];

                  if (delta !== undefined && delta !== cumulative) {
                    tooltipLines.push(
                      `Change: ${delta > 0 ? '+' : ''}$${delta.toFixed(1)}M`
                    );
                  }

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
                    
                    const stage = mockNPDeviationStages[index];
                    const isBaseline = stage?.type === 'baseline';
                    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                    const displayValue = numericValue.toFixed(0);
                    
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
                {mockNPDeviationStages.map((stage, index) => {
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
                          handleStageClick(stage.stage);
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
            {mockNPDeviationKeyCallOut.bulletPoints.map((point, index) => (
              <li
                key={index}
                className='text-sm'>
                {point}
              </li>
            ))}
          </ul>
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <p className='text-sm text-gray-700 leading-relaxed'>
              {mockNPDeviationKeyCallOut.rootCauseAnalysis}
            </p>
          </div>
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
                                  Expected Impact: $
                                  {action.expectedImpact.toFixed(1)}M
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
      <div className='p-8 max-w-[1920px] mx-auto'>
        {currentLayer === 1 && renderLayer1()}
        {currentLayer === 2 && (
          <ProductAnalysisLayer
            breadcrumbs={breadcrumbs}
            onBack={navigateBack}
          />
        )}
      </div>

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
                Expected Impact (M USD) *
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
