import { useState } from 'react';
import {
  XMarkIcon,
  ChartBarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { ValueDriverScenario } from '../types';
import {
  compareScenarios,
  sortScenariosByImpact,
} from '../utils/scenarioComparison';

interface ScenarioComparisonPanelProps {
  scenarios: ValueDriverScenario[];
  visibleScenarioIds: Set<string>;
  onToggleScenario: (scenarioId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ScenarioComparisonPanel({
  scenarios,
  visibleScenarioIds,
  onToggleScenario,
  onSelectAll,
  onDeselectAll,
  isOpen,
  onClose,
}: ScenarioComparisonPanelProps) {
  const [sortOrder, setSortOrder] = useState<'impact' | 'name' | 'date'>(
    'impact'
  );

  if (!isOpen) return null;

  const comparison = compareScenarios(scenarios);
  const sortedScenarios =
    sortOrder === 'impact'
      ? sortScenariosByImpact(scenarios)
      : sortOrder === 'name'
      ? [...scenarios].sort((a, b) => a.name.localeCompare(b.name))
      : [...scenarios].sort(
          (a, b) =>
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime()
        );

  const bestScenario = comparison.best;
  const worstScenario = comparison.worst;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity'
        onClick={onClose}
      />

      {/* Panel */}
      <div className='fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-40 flex flex-col border-l border-gray-200'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50'>
          <div className='flex items-center gap-2'>
            <ChartBarIcon className='w-5 h-5 text-primary-600' />
            <h2 className='text-lg font-semibold text-gray-900'>
              Scenario Comparison
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors'>
            <XMarkIcon className='w-5 h-5' />
          </button>
        </div>

        {/* Comparison Summary */}
        {comparison.count > 0 && (
          <div className='p-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white'>
            <div className='grid grid-cols-2 gap-3 mb-4'>
              {/* Best Scenario */}
              {bestScenario && (
                <div className='bg-opportunity-50 border border-opportunity-200 rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <TrophyIcon className='w-4 h-4 text-opportunity-600' />
                    <span className='text-xs font-semibold text-opportunity-900'>
                      Best
                    </span>
                  </div>
                  <div className='text-sm font-bold text-opportunity-900 truncate'>
                    {bestScenario.name}
                  </div>
                  <div className='text-xs text-opportunity-700 mt-1'>
                    +${(bestScenario.totalOPImpact ?? 0).toFixed(1)}M
                  </div>
                </div>
              )}

              {/* Worst Scenario */}
              {worstScenario && (
                <div className='bg-risk-50 border border-risk-200 rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <ExclamationTriangleIcon className='w-4 h-4 text-risk-600' />
                    <span className='text-xs font-semibold text-risk-900'>
                      Worst
                    </span>
                  </div>
                  <div className='text-sm font-bold text-risk-900 truncate'>
                    {worstScenario.name}
                  </div>
                  <div className='text-xs text-risk-700 mt-1'>
                    {(worstScenario.totalOPImpact ?? 0).toFixed(1)}M
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className='grid grid-cols-3 gap-2 text-xs'>
              <div className='text-center'>
                <div className='text-gray-500'>Average</div>
                <div className='font-semibold text-gray-900'>
                  ${comparison.average.toFixed(1)}M
                </div>
              </div>
              <div className='text-center'>
                <div className='text-gray-500'>Median</div>
                <div className='font-semibold text-gray-900'>
                  ${comparison.median.toFixed(1)}M
                </div>
              </div>
              <div className='text-center'>
                <div className='text-gray-500'>Range</div>
                <div className='font-semibold text-gray-900'>
                  ${comparison.range.toFixed(1)}M
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className='p-4 border-b border-gray-200 bg-white'>
          <div className='flex items-center justify-between mb-3'>
            <span className='text-sm font-medium text-gray-700'>
              {visibleScenarioIds.size} of {scenarios.length} selected
            </span>
            <div className='flex gap-2'>
              <button
                onClick={onSelectAll}
                className='text-xs px-2 py-1 text-primary-600 hover:bg-primary-50 rounded'>
                Select All
              </button>
              <button
                onClick={onDeselectAll}
                className='text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded'>
                Clear
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className='flex gap-2'>
            <button
              onClick={() => setSortOrder('impact')}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                sortOrder === 'impact'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              Impact
            </button>
            <button
              onClick={() => setSortOrder('name')}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                sortOrder === 'name'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              Name
            </button>
            <button
              onClick={() => setSortOrder('date')}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                sortOrder === 'date'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              Date
            </button>
          </div>
        </div>

        {/* Scenario List */}
        <div className='flex-1 overflow-y-auto p-4'>
          {sortedScenarios.length === 0 ? (
            <div className='text-center text-gray-500 py-8'>
              <p className='text-sm'>No scenarios created yet</p>
              <p className='text-xs mt-1'>Create scenarios to compare them</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {sortedScenarios.map((scenario, index) => {
                const isVisible = visibleScenarioIds.has(scenario.id);
                const impact = scenario.totalOPImpact ?? 0;
                const isBest = bestScenario?.id === scenario.id;
                const isWorst = worstScenario?.id === scenario.id;
                const simulated = scenario.simulatedWaterfall;
                const finalValue = simulated
                  ? simulated[simulated.length - 1].simulatedValue
                  : null;

                return (
                  <div
                    key={scenario.id}
                    className={`relative p-3 rounded-lg border-2 transition-all ${
                      isVisible
                        ? 'bg-white border-primary-300 shadow-sm'
                        : 'bg-gray-50 border-gray-200'
                    } ${isBest ? 'ring-2 ring-opportunity-300' : ''} ${
                      isWorst ? 'ring-2 ring-risk-300' : ''
                    }`}>
                    {/* Rank Badge */}
                    {sortOrder === 'impact' && (
                      <div className='absolute top-2 right-2'>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 && isBest
                              ? 'bg-opportunity-100 text-opportunity-700'
                              : index === sortedScenarios.length - 1 && isWorst
                              ? 'bg-risk-100 text-risk-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                          {index + 1}
                        </div>
                      </div>
                    )}

                    {/* Best/Worst Badges */}
                    {isBest && (
                      <div className='absolute top-2 left-2'>
                        <div className='bg-opportunity-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1'>
                          <TrophyIcon className='w-3 h-3' />
                          Best
                        </div>
                      </div>
                    )}
                    {isWorst && (
                      <div className='absolute top-2 left-2'>
                        <div className='bg-risk-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1'>
                          <ExclamationTriangleIcon className='w-3 h-3' />
                          Worst
                        </div>
                      </div>
                    )}

                    <div className='pr-8'>
                      {/* Checkbox and Color */}
                      <div className='flex items-center gap-2 mb-2'>
                        <input
                          type='checkbox'
                          checked={isVisible}
                          onChange={() => onToggleScenario(scenario.id)}
                          className='w-4 h-4 text-primary-600 rounded focus:ring-primary-500'
                        />
                        <div
                          className='w-4 h-4 rounded-full border-2 border-white shadow-sm'
                          style={{
                            backgroundColor: scenario.color || '#3b82f6',
                          }}
                        />
                        <span className='text-sm font-medium text-gray-900 flex-1 truncate'>
                          {scenario.name}
                        </span>
                      </div>

                      {/* Impact Info */}
                      {finalValue !== null && (
                        <div className='space-y-1'>
                          <div className='text-xs text-gray-600'>
                            Final OP:{' '}
                            <span className='font-semibold'>
                              ${finalValue.toFixed(1)}M
                            </span>
                          </div>
                          {impact !== 0 && (
                            <div
                              className={`text-xs font-semibold ${
                                impact >= 0
                                  ? 'text-opportunity-600'
                                  : 'text-risk-600'
                              }`}>
                              Impact: {impact > 0 ? '+' : ''}
                              {impact.toFixed(1)}M
                            </div>
                          )}
                        </div>
                      )}

                      {/* Created Date */}
                      <div className='text-xs text-gray-400 mt-2'>
                        {new Date(scenario.createdDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
