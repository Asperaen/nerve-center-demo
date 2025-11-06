import { useState, useEffect, useMemo } from 'react';
import ScenarioCreationModal from '../components/ScenarioCreationModal';
import {
  mockBusinessEvents,
  mockOPWaterfallStages,
  mockValueDriverHierarchy,
} from '../data/mockForecast';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Legend,
  Line,
} from 'recharts';
import type { ActionProposal, ValueDriverScenario } from '../types';
import {
  calculateScenarioWaterfall,
  getNextScenarioColor,
} from '../utils/scenarioUtils';
import ScenarioComparisonPanel from '../components/ScenarioComparisonPanel';
import {
  getBestScenario,
  getWorstScenario,
  sortScenariosByImpact,
} from '../utils/scenarioComparison';

export default function FinancePage() {
  const [scenarios, setScenarios] = useState<ValueDriverScenario[]>([]);
  const [visibleScenarioIds, setVisibleScenarioIds] = useState<Set<string>>(
    new Set()
  );
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] =
    useState<ValueDriverScenario | null>(null);
  const [isComparisonPanelOpen, setIsComparisonPanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionProposal | null>(
    null
  );
  const [readyInWaveActions, setReadyInWaveActions] = useState<Set<string>>(
    new Set()
  );

  // Calculate simulated waterfalls for visible scenarios and update scenarios
  useEffect(() => {
    const visibleScenarios = scenarios.filter((s) =>
      visibleScenarioIds.has(s.id)
    );

    visibleScenarios.forEach((scenario) => {
      if (!scenario.simulatedWaterfall) {
        const simulated = calculateScenarioWaterfall(
          scenario,
          mockOPWaterfallStages,
          mockValueDriverHierarchy
        );
        const totalOPImpact =
          simulated[simulated.length - 1].simulatedValue -
          mockOPWaterfallStages[mockOPWaterfallStages.length - 1].value;

        // Update scenario with calculated waterfall
        const updatedScenario = {
          ...scenario,
          simulatedWaterfall: simulated,
          totalOPImpact,
        };
        setScenarios((prev) =>
          prev.map((s) => (s.id === scenario.id ? updatedScenario : s))
        );
      }
    });
  }, [scenarios, visibleScenarioIds]);

  const handleCreateScenario = () => {
    setEditingScenario(null);
    setIsScenarioModalOpen(true);
  };

  const handleEditScenario = (scenario: ValueDriverScenario) => {
    setEditingScenario(scenario);
    setIsScenarioModalOpen(true);
  };

  const handleSaveScenario = (scenario: ValueDriverScenario) => {
    if (editingScenario) {
      // Update existing scenario
      setScenarios((prev) =>
        prev.map((s) => (s.id === scenario.id ? scenario : s))
      );
    } else {
      // Add new scenario
      if (!scenario.color) {
        scenario.color = getNextScenarioColor();
      }
      setScenarios((prev) => [...prev, scenario]);
      // Auto-show new scenario
      setVisibleScenarioIds((prev) => new Set(prev).add(scenario.id));
    }
    setIsScenarioModalOpen(false);
    setEditingScenario(null);
  };

  const handleDeleteScenario = (scenarioId: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== scenarioId));
    setVisibleScenarioIds((prev) => {
      const next = new Set(prev);
      next.delete(scenarioId);
      return next;
    });
  };

  const handleToggleScenario = (scenarioId: string) => {
    setVisibleScenarioIds((prev) => {
      const next = new Set(prev);
      if (next.has(scenarioId)) {
        next.delete(scenarioId);
      } else {
        next.add(scenarioId);
      }
      return next;
    });
  };

  const handleSelectAllScenarios = () => {
    setVisibleScenarioIds(new Set(scenarios.map((s) => s.id)));
  };

  const handleDeselectAllScenarios = () => {
    setVisibleScenarioIds(new Set());
  };

  const handleCompareBestWorst = () => {
    const best = getBestScenario(scenarios);
    const worst = getWorstScenario(scenarios);
    const ids = new Set<string>();
    if (best) ids.add(best.id);
    if (worst) ids.add(worst.id);
    setVisibleScenarioIds(ids);
    setIsComparisonPanelOpen(true);
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    const baselineData = mockOPWaterfallStages.map((stage, index) => {
      const prevValue = index > 0 ? mockOPWaterfallStages[index - 1].value : 0;
      const currentValue = stage.value;
      const delta =
        stage.delta ?? (index === 0 ? currentValue : currentValue - prevValue);

      const isBaseline = stage.type === 'baseline';
      const barValue = isBaseline ? currentValue : delta;
      const baselineValue = isBaseline ? 0 : prevValue;

      interface ChartDataPoint {
        [key: string]: string | number | boolean | undefined;
        name: string;
        label: string;
        cumulativeValue: number;
        delta: number;
        baselineValue: number;
        barValue: number;
        isPositive: boolean;
      }

      const dataPoint: ChartDataPoint = {
        ...stage,
        name: stage.label,
        label: stage.label,
        cumulativeValue: currentValue,
        delta,
        baselineValue,
        barValue,
        isPositive: delta >= 0,
      };

      // Add scenario simulated values
      const visibleScenarios = scenarios.filter((s) =>
        visibleScenarioIds.has(s.id)
      );
      visibleScenarios.forEach((scenario) => {
        const simulated = scenario.simulatedWaterfall;
        if (simulated && simulated[index]) {
          const simStage = simulated[index];
          dataPoint[`scenario_${scenario.id}_value`] = simStage.simulatedValue;
          dataPoint[`scenario_${scenario.id}_delta`] = simStage.simulatedDelta;
        }
      });

      return dataPoint;
    });

    return baselineData;
  }, [scenarios, visibleScenarioIds]);

  const visibleScenarios = scenarios.filter((s) =>
    visibleScenarioIds.has(s.id)
  );

  return (
    <div className='min-h-screen bg-gray-50 relative'>
      <div className='p-8'>
        <div className='space-y-8'>
          {/* OP Waterfall Chart */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Full Year OP Waterfall
              </h2>
              <div className='flex items-center gap-2'>
                {scenarios.length >= 2 && (
                  <button
                    onClick={handleCompareBestWorst}
                    className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center'>
                    <ChartBarIcon className='w-4 h-4 mr-2' />
                    Compare Best/Worst
                  </button>
                )}
                {scenarios.length > 0 && (
                  <button
                    onClick={() => setIsComparisonPanelOpen(true)}
                    className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center'>
                    <ChartBarIcon className='w-4 h-4 mr-2' />
                    Comparison Panel
                  </button>
                )}
                <button
                  onClick={handleCreateScenario}
                  className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center'>
                  <PlusIcon className='w-4 h-4 mr-2' />
                  Create Scenario
                </button>
              </div>
            </div>

            {/* Scenario Management Panel */}
            {scenarios.length > 0 &&
              (() => {
                const bestScenario = getBestScenario(scenarios);
                const worstScenario = getWorstScenario(scenarios);
                const sortedScenarios = sortScenariosByImpact(scenarios);

                return (
                  <div className='mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                    <div className='flex items-center justify-between mb-3'>
                      <h3 className='text-sm font-semibold text-gray-900'>
                        Scenarios ({scenarios.length})
                      </h3>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
                      {sortedScenarios.map((scenario, index) => {
                        const isVisible = visibleScenarioIds.has(scenario.id);
                        const impact = scenario.totalOPImpact ?? 0;
                        const simulated = scenario.simulatedWaterfall;
                        const finalValue = simulated
                          ? simulated[simulated.length - 1].simulatedValue
                          : null;
                        const isBest = bestScenario?.id === scenario.id;
                        const isWorst = worstScenario?.id === scenario.id;

                        return (
                          <div
                            key={scenario.id}
                            className={`relative flex items-center justify-between p-3 bg-white rounded border-2 transition-all ${
                              isVisible
                                ? 'border-primary-300 shadow-sm'
                                : 'border-gray-200'
                            } ${isBest ? 'ring-2 ring-opportunity-300' : ''} ${
                              isWorst ? 'ring-2 ring-risk-300' : ''
                            }`}>
                            {/* Rank Badge */}
                            <div className='absolute top-1 right-1'>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isBest
                                    ? 'bg-opportunity-100 text-opportunity-700'
                                    : isWorst
                                    ? 'bg-risk-100 text-risk-700'
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                {index + 1}
                              </div>
                            </div>

                            <div className='flex items-center gap-2 flex-1 pr-6'>
                              <input
                                type='checkbox'
                                checked={isVisible}
                                onChange={() =>
                                  handleToggleScenario(scenario.id)
                                }
                                className='w-4 h-4 text-primary-600 rounded focus:ring-primary-500'
                              />
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{
                                  backgroundColor: scenario.color || '#3b82f6',
                                }}
                              />
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2'>
                                  <div className='text-sm font-medium text-gray-900 truncate'>
                                    {scenario.name}
                                  </div>
                                  {isBest && (
                                    <span className='text-xs px-1.5 py-0.5 bg-opportunity-100 text-opportunity-700 rounded font-semibold'>
                                      Best
                                    </span>
                                  )}
                                  {isWorst && (
                                    <span className='text-xs px-1.5 py-0.5 bg-risk-100 text-risk-700 rounded font-semibold'>
                                      Worst
                                    </span>
                                  )}
                                </div>
                                {finalValue !== null && (
                                  <div className='text-xs text-gray-500'>
                                    Final OP: ${finalValue.toFixed(1)}M
                                    {impact !== 0 && (
                                      <span
                                        className={`ml-2 ${
                                          impact >= 0
                                            ? 'text-opportunity-600'
                                            : 'text-risk-600'
                                        }`}>
                                        ({impact > 0 ? '+' : ''}
                                        {impact.toFixed(1)}M)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className='flex items-center gap-1'>
                              <button
                                onClick={() => handleEditScenario(scenario)}
                                className='p-1 text-gray-400 hover:text-gray-600 transition-colors'>
                                <PencilIcon className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteScenario(scenario.id)
                                }
                                className='p-1 text-gray-400 hover:text-red-600 transition-colors'>
                                <TrashIcon className='w-4 h-4' />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            <div className='h-96'>
              <ResponsiveContainer
                width='100%'
                height='100%'>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='label'
                    angle={-15}
                    textAnchor='end'
                    height={120}
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis
                    style={{ fontSize: '12px' }}
                    label={{
                      value: 'Operating Profit (M USD)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: '12px' },
                    }}
                  />
                  <Tooltip
                    formatter={(
                      value: number,
                      _name: string,
                      props: {
                        payload?: {
                          [key: string]: string | number | undefined;
                          cumulativeValue?: number;
                          delta?: number;
                          label?: string;
                        };
                      }
                    ) => {
                      const payload = props.payload;
                      const cumulative = payload?.cumulativeValue ?? value;
                      const delta = payload?.delta;

                      const tooltipLines: string[] = [
                        `${payload?.label ?? 'Stage'}: $${cumulative.toFixed(
                          1
                        )}M`,
                      ];

                      if (delta !== undefined && delta !== cumulative) {
                        tooltipLines.push(
                          `Change: ${delta > 0 ? '+' : ''}$${delta.toFixed(1)}M`
                        );
                      }

                      // Add scenario values if present
                      visibleScenarios.forEach((scenario) => {
                        const scenarioValue = payload?.[
                          `scenario_${scenario.id}_value`
                        ] as number | undefined;
                        if (scenarioValue !== undefined) {
                          const scenarioDelta = payload?.[
                            `scenario_${scenario.id}_delta`
                          ] as number | undefined;
                          tooltipLines.push(
                            `${scenario.name}: $${scenarioValue.toFixed(1)}M` +
                              (scenarioDelta !== undefined
                                ? ` (${
                                    scenarioDelta > 0 ? '+' : ''
                                  }$${scenarioDelta.toFixed(1)}M)`
                                : '')
                          );
                        }
                      });

                      return tooltipLines.join('\n');
                    }}
                  />
                  <Legend />
                  {/* Baseline bars - transparent spacer to position subsequent bars */}
                  <Bar
                    dataKey='baselineValue'
                    stackId='a'
                    fill='transparent'
                  />
                  {/* Change bars - shows the delta/changes */}
                  <Bar
                    dataKey='barValue'
                    stackId='a'
                    name='Baseline'>
                    {mockOPWaterfallStages.map((stage, index) => {
                      const isBaseline = stage.type === 'baseline';
                      const isPositive = stage.type === 'positive';

                      let fillColor = '#6b7280'; // grey for baseline
                      if (!isBaseline) {
                        fillColor = isPositive
                          ? '#60a5fa' // light blue for positive
                          : '#fb923c'; // orange/pink for negative
                      }

                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={fillColor}
                        />
                      );
                    })}
                  </Bar>
                  {/* Scenario lines */}
                  {visibleScenarios.map((scenario) => {
                    const color = scenario.color || '#3b82f6';
                    return (
                      <Line
                        key={`scenario-line-${scenario.id}`}
                        type='monotone'
                        dataKey={`scenario_${scenario.id}_value`}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 4, fill: color }}
                        name={scenario.name}
                        connectNulls
                      />
                    );
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scenario Creation Modal */}
          {isScenarioModalOpen && (
            <ScenarioCreationModal
              isOpen={isScenarioModalOpen}
              onClose={() => {
                setIsScenarioModalOpen(false);
                setEditingScenario(null);
              }}
              onSave={handleSaveScenario}
              valueDriverHierarchy={mockValueDriverHierarchy}
              existingScenarios={scenarios}
              editingScenario={editingScenario}
            />
          )}

          {/* Value Drivers */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Value drivers
              </h2>
            </div>

            {/* Compact Grid Layout */}
            <div className='space-y-4'>
              {mockValueDriverHierarchy.map((financial) => (
                <div
                  key={financial.id}
                  className='border border-gray-200 rounded-lg overflow-hidden'>
                  {/* Financial Header */}
                  <div className='bg-gray-50 px-4 py-2 border-b border-gray-200'>
                    <h3 className='text-sm font-semibold text-gray-900'>
                      {financial.name}
                    </h3>
                  </div>

                  {/* Metrics */}
                  <div className='divide-y divide-gray-100'>
                    {financial.metrics.map((metric) => (
                      <div
                        key={metric.id}
                        className='bg-white'>
                        {/* Metric Header */}
                        {metric.name && (
                          <div className='px-4 py-2 bg-gray-50/50 border-b border-gray-100'>
                            <h4 className='text-xs font-medium text-gray-700'>
                              {metric.name}
                            </h4>
                          </div>
                        )}

                        {/* Value Drivers Grid */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3'>
                          {metric.valueDrivers.map((driver) => (
                            <div
                              key={driver.id}
                              className='bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors'>
                              <div className='flex items-start justify-between mb-2'>
                                <span className='text-xs font-medium text-gray-700 flex-1'>
                                  {driver.name}
                                </span>
                                {driver.changePercent !== undefined && (
                                  <span
                                    className={`text-xs font-semibold ml-2 ${
                                      driver.changePercent >= 0
                                        ? 'text-opportunity-600'
                                        : 'text-risk-600'
                                    }`}>
                                    {driver.changePercent > 0 ? '+' : ''}
                                    {driver.changePercent.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                              {driver.value !== undefined && (
                                <div className='text-sm'>
                                  <span className='font-semibold text-gray-900'>
                                    {driver.value.toLocaleString()}
                                  </span>
                                  {driver.unit && (
                                    <span className='text-gray-600 ml-1'>
                                      {driver.unit}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Events with Action Proposals */}
          <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Action Proposals
              </h2>
              <button
                onClick={() => {
                  // TODO: Implement create new proposal functionality
                  alert('Create new proposal functionality coming soon');
                }}
                className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center'>
                <PlusIcon className='w-4 h-4 mr-2' />
                Create a new Proposal
              </button>
            </div>
            <div className='space-y-6'>
              {mockBusinessEvents
                .filter((e) => Math.abs(e.impact) >= 0.5)
                .map((event) => (
                  <div
                    key={event.id}
                    className={`p-5 rounded-lg border-2 ${
                      event.type === 'risk'
                        ? 'bg-risk-50 border-risk-200'
                        : event.type === 'opportunity'
                        ? 'bg-opportunity-50 border-opportunity-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-center space-x-3'>
                        <div
                          className={`p-2 rounded-full ${
                            event.type === 'risk'
                              ? 'bg-risk-100'
                              : event.type === 'opportunity'
                              ? 'bg-opportunity-100'
                              : 'bg-blue-100'
                          }`}>
                          {event.impact >= 0 ? (
                            <ArrowTrendingUpIcon className='w-5 h-5 text-opportunity-600' />
                          ) : (
                            <ArrowTrendingDownIcon className='w-5 h-5 text-risk-600' />
                          )}
                        </div>
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {event.name}
                          </h3>
                          <p
                            className={`text-sm font-bold ${
                              event.impact >= 0
                                ? 'text-opportunity-700'
                                : 'text-risk-700'
                            }`}>
                            Impact: {event.impact > 0 ? '+' : ''}$
                            {event.impact.toFixed(1)}M
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Implications */}
                    <div className='mb-3'>
                      <p className='text-sm font-medium text-gray-700 mb-2'>
                        Key Implications:
                      </p>
                      <ul className='list-disc list-inside space-y-1'>
                        {event.implications.map(
                          (impl: string, index: number) => (
                            <li
                              key={index}
                              className='text-sm text-gray-600'>
                              {impl}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Action Proposals */}
                    {event.actionProposals &&
                      event.actionProposals.length > 0 && (
                        <div className='mt-4 p-4 bg-white rounded-lg border border-gray-200'>
                          <p className='text-sm font-medium text-gray-900 mb-3'>
                            Recommended Actions:
                          </p>
                          <div className='space-y-2'>
                            {event.actionProposals.map(
                              (action: ActionProposal) => {
                                const isReadyInWave =
                                  readyInWaveActions.has(action.id) ||
                                  action.stage !== undefined;
                                return (
                                  <div
                                    key={action.id}
                                    className={`flex items-start justify-between p-3 rounded ${
                                      isReadyInWave
                                        ? 'bg-blue-100 border border-blue-200'
                                        : 'bg-gray-50'
                                    }`}>
                                    <div className='flex-1'>
                                      <p className='text-sm font-medium text-gray-900'>
                                        {action.description}
                                      </p>
                                      <div className='mt-1 flex items-center space-x-3 text-xs text-gray-500'>
                                        <span>
                                          Expected Impact: $
                                          {action.expectedImpact.toFixed(1)}M
                                        </span>
                                        <span>•</span>
                                        <span className='capitalize'>
                                          Feasibility: {action.feasibility}
                                        </span>
                                        <span>•</span>
                                        <span className='capitalize'>
                                          Priority: {action.priority}
                                        </span>
                                      </div>
                                    </div>
                                    <div className='ml-4'>
                                      {isReadyInWave ? (
                                        <div className='px-3 py-1 text-xs font-medium text-yellow-800 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-full border border-yellow-400 shadow-sm'>
                                          ✨ Ready in Wave
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setSelectedAction(action);
                                            setIsModalOpen(true);
                                          }}
                                          className='px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors'>
                                          Create Wave initiative
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
            </div>
          </div>

          {/* Scenario Comparison Panel */}
          <ScenarioComparisonPanel
            scenarios={scenarios}
            visibleScenarioIds={visibleScenarioIds}
            onToggleScenario={handleToggleScenario}
            onSelectAll={handleSelectAllScenarios}
            onDeselectAll={handleDeselectAllScenarios}
            isOpen={isComparisonPanelOpen}
            onClose={() => setIsComparisonPanelOpen(false)}
          />
        </div>
      </div>

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
              setReadyInWaveActions((prev) =>
                new Set(prev).add(selectedAction.id)
              );
            }
            setIsModalOpen(false);
            setSelectedAction(null);
          }}
        />
      )}
    </div>
  );
}

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
              <h3 className='text-xl font-semibold text-gray-900'>
                Create Wave Initiative
              </h3>
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
