import { useState } from 'react';
import { mockScenarios, mockForecastDrivers } from '../data/mockForecast';
import type { Scenario, ForecastDriver } from '../types';
import {
  BeakerIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ScenarioSimulation() {
  const [scenarios, setScenarios] = useState(mockScenarios);
  const [selectedScenario, setSelectedScenario] = useState(mockScenarios[0]);
  const [drivers, setDrivers] = useState<ForecastDriver[]>(mockForecastDrivers);
  const [isEditing, setIsEditing] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [scenariosToCompare, setScenariosToCompare] = useState<string[]>([]);

  const handleDriverChange = (driverId: string, newValue: number) => {
    const updatedDrivers = drivers.map((d) =>
      d.id === driverId
        ? {
            ...d,
            forecastValue: newValue,
            changePercent: ((newValue - d.latestActual) / d.latestActual) * 100,
          }
        : d
    );
    setDrivers(updatedDrivers);
  };

  const handleRecalculate = () => {
    alert('Forecast recalculated with updated drivers!');
    setIsEditing(false);
  };

  const handleSaveScenario = () => {
    const name = prompt('Enter scenario name:');
    if (name) {
      const newScenario: Scenario = {
        id: `scenario-${Date.now()}`,
        name,
        createdDate: new Date(),
        createdBy: 'CEO',
        drivers: [...drivers],
        forecast: selectedScenario.forecast,
        isBaseline: false,
      };
      setScenarios([...scenarios, newScenario]);
      alert('Scenario saved successfully!');
    }
  };

  const toggleCompareScenario = (scenarioId: string) => {
    if (scenariosToCompare.includes(scenarioId)) {
      setScenariosToCompare(
        scenariosToCompare.filter((id) => id !== scenarioId)
      );
    } else if (scenariosToCompare.length < 3) {
      setScenariosToCompare([...scenariosToCompare, scenarioId]);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 flex items-center'>
                <BeakerIcon className='w-8 h-8 mr-3 text-primary-600' />
                Scenario Simulation
              </h1>
              <p className='mt-1 text-sm text-gray-500'>
                Test what-if scenarios by adjusting forecast drivers and
                business assumptions
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  compareMode
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                Compare Scenarios
              </button>
              <button
                onClick={handleSaveScenario}
                className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center'>
                <PlusIcon className='w-4 h-4 mr-2' />
                Save Scenario
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-8'>
        {compareMode ? (
          <ScenarioComparison
            scenarios={scenarios}
            selectedScenarios={scenariosToCompare}
            onToggleScenario={toggleCompareScenario}
          />
        ) : (
          <div className='space-y-8'>
            {/* Scenario Selector */}
            <div className='bg-white rounded-lg border border-gray-200 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Select Scenario
              </h2>
              <div className='grid grid-cols-3 gap-4'>
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedScenario.id === scenario.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='font-semibold text-gray-900'>
                          {scenario.name}
                        </h3>
                        <p className='text-xs text-gray-500 mt-1'>
                          Created by {scenario.createdBy}
                        </p>
                      </div>
                      {scenario.isBaseline && (
                        <span className='px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded'>
                          Baseline
                        </span>
                      )}
                    </div>
                    <div className='mt-3 text-sm font-medium text-gray-700'>
                      Net Profit: ${scenario.forecast.netProfit.toFixed(1)}M
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Driver Parameters */}
            <div className='bg-white rounded-lg border border-gray-200 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Forecast Drivers
                </h2>
                <div className='flex items-center space-x-3'>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setDrivers(mockForecastDrivers);
                          setIsEditing(false);
                        }}
                        className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800'>
                        Cancel
                      </button>
                      <button
                        onClick={handleRecalculate}
                        className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center'>
                        <ArrowPathIcon className='w-4 h-4 mr-2' />
                        Recalculate
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className='px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100'>
                      Edit Drivers
                    </button>
                  )}
                </div>
              </div>

              <div className='space-y-4'>
                {drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className={`p-4 rounded-lg border ${
                      isEditing
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-200'
                    }`}>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex-1'>
                        <h4 className='font-medium text-gray-900'>
                          {driver.name}
                        </h4>
                        <p className='text-sm text-gray-500'>
                          Latest Actual: {driver.latestActual} {driver.unit}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p
                          className={`text-lg font-bold ${
                            driver.impactOnPL >= 0
                              ? 'text-opportunity-600'
                              : 'text-risk-600'
                          }`}>
                          {driver.impactOnPL > 0 ? '+' : ''}$
                          {driver.impactOnPL.toFixed(1)}M
                        </p>
                        <p className='text-xs text-gray-500'>P&L Impact</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='flex-1'>
                        <label className='block text-xs text-gray-500 mb-1'>
                          Forecast Value
                        </label>
                        <input
                          type='number'
                          value={driver.forecastValue}
                          onChange={(e) =>
                            handleDriverChange(
                              driver.id,
                              parseFloat(e.target.value)
                            )
                          }
                          disabled={!isEditing}
                          step='0.1'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500'
                        />
                      </div>
                      <div className='w-32'>
                        <label className='block text-xs text-gray-500 mb-1'>
                          Change %
                        </label>
                        <div
                          className={`px-3 py-2 rounded-lg font-medium text-center ${
                            driver.changePercent >= 0
                              ? 'bg-opportunity-100 text-opportunity-700'
                              : 'bg-risk-100 text-risk-700'
                          }`}>
                          {driver.changePercent > 0 ? '+' : ''}
                          {driver.changePercent.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    {driver.relatedAssumptions.length > 0 && (
                      <div className='mt-2 text-xs text-gray-500'>
                        Related assumptions:{' '}
                        {driver.relatedAssumptions.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast Summary */}
            <div className='bg-white rounded-lg border border-gray-200 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-6'>
                Forecast Summary
              </h2>
              <div className='grid grid-cols-4 gap-6'>
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <p className='text-sm text-gray-600 mb-1'>Revenue</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    ${selectedScenario.forecast.revenue.toFixed(1)}M
                  </p>
                </div>
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <p className='text-sm text-gray-600 mb-1'>Gross Profit</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    ${selectedScenario.forecast.grossProfit.toFixed(1)}M
                  </p>
                </div>
                <div className='p-4 bg-blue-50 rounded-lg'>
                  <p className='text-sm text-gray-600 mb-1'>Operating Profit</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    ${selectedScenario.forecast.operatingProfit.toFixed(1)}M
                  </p>
                </div>
                <div className='p-4 bg-primary-50 rounded-lg border-2 border-primary-200'>
                  <p className='text-sm text-gray-600 mb-1'>Net Profit</p>
                  <p className='text-2xl font-bold text-primary-700'>
                    ${selectedScenario.forecast.netProfit.toFixed(1)}M
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ScenarioComparisonProps {
  scenarios: Scenario[];
  selectedScenarios: string[];
  onToggleScenario: (id: string) => void;
}

function ScenarioComparison({
  scenarios,
  selectedScenarios,
  onToggleScenario,
}: ScenarioComparisonProps) {
  const selectedScenarioData = scenarios.filter((s) =>
    selectedScenarios.includes(s.id)
  );

  const comparisonData = [
    {
      metric: 'Revenue',
      ...Object.fromEntries(
        selectedScenarioData.map((s) => [s.name, s.forecast.revenue])
      ),
    },
    {
      metric: 'Gross Profit',
      ...Object.fromEntries(
        selectedScenarioData.map((s) => [s.name, s.forecast.grossProfit])
      ),
    },
    {
      metric: 'Operating Profit',
      ...Object.fromEntries(
        selectedScenarioData.map((s) => [s.name, s.forecast.operatingProfit])
      ),
    },
    {
      metric: 'Net Profit',
      ...Object.fromEntries(
        selectedScenarioData.map((s) => [s.name, s.forecast.netProfit])
      ),
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Scenario Selection */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Select Scenarios to Compare (up to 3)
        </h2>
        <div className='grid grid-cols-3 gap-4'>
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onToggleScenario(scenario.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedScenarios.includes(scenario.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
              <h3 className='font-semibold text-gray-900'>{scenario.name}</h3>
              <p className='text-sm text-gray-500 mt-1'>
                Net Profit: ${scenario.forecast.netProfit.toFixed(1)}M
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Chart */}
      {selectedScenarioData.length >= 2 && (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-6'>
            Financial Metrics Comparison
          </h2>
          <div className='h-96'>
            <ResponsiveContainer
              width='100%'
              height='100%'>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='metric' />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedScenarioData.map((scenario, index) => (
                  <Bar
                    key={scenario.id}
                    dataKey={scenario.name}
                    fill={['#3b82f6', '#16a34a', '#f59e0b'][index]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selectedScenarioData.length >= 2 && (
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Metric
                </th>
                {selectedScenarioData.map((scenario) => (
                  <th
                    key={scenario.id}
                    className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    {scenario.name}
                  </th>
                ))}
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                  Variance
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {comparisonData.map((row, index) => {
                const values = selectedScenarioData.map(
                  (s) => row[s.name] as number
                );
                const variance = Math.max(...values) - Math.min(...values);
                return (
                  <tr key={index}>
                    <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                      {row.metric}
                    </td>
                    {selectedScenarioData.map((scenario) => (
                      <td
                        key={scenario.id}
                        className='px-6 py-4 text-sm text-right text-gray-700'>
                        ${(row[scenario.name] as number).toFixed(1)}M
                      </td>
                    ))}
                    <td className='px-6 py-4 text-sm text-right font-medium text-gray-900'>
                      ${variance.toFixed(1)}M
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
