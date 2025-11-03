import { useState } from 'react';
import BusinessAssumptions from './BusinessAssumptions';
import ActionTrackerSidebar from '../components/ActionTrackerSidebar';
import {
  mockForecastDrivers,
  mockBusinessEvents,
  forecastIncomeStatement,
  mockScenarios,
} from '../data/mockForecast';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
  ArrowPathIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { ActionProposal, ForecastDriver, Scenario } from '../types';

export default function WeeklyFinancialForecast() {
  const [activeTab, setActiveTab] = useState<
    'assumptions' | 'forecast' | 'actions'
  >('forecast');
  const [simulationMode, setSimulationMode] = useState(false);
  const [drivers, setDrivers] = useState<ForecastDriver[]>(mockForecastDrivers);
  const [originalDrivers] = useState<ForecastDriver[]>(mockForecastDrivers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionProposal | null>(
    null
  );
  const [readyInWaveActions, setReadyInWaveActions] = useState<Set<string>>(
    new Set()
  );
  const [actionTrackerOpen, setActionTrackerOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(mockScenarios[0]);
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

  const handleResetSimulation = () => {
    setDrivers(originalDrivers.map((d) => ({ ...d })));
    setSimulationMode(false);
  };

  const handleRecalculate = () => {
    alert('Forecast recalculated with updated drivers!');
    setSimulationMode(false);
  };

  // Prepare waterfall data
  const waterfallData = mockBusinessEvents.map((event) => ({
    name: event.name,
    value: Math.abs(event.impact),
    displayValue: event.impact,
    type: event.type,
  }));

  // Calculate simulated forecast (simplified - in real app would be more complex)
  const simulatedForecast = simulationMode
    ? {
        revenue: forecastIncomeStatement.revenue * 1.02, // Example calculation
        operatingProfit: forecastIncomeStatement.operatingProfit * 0.98,
        netProfit: forecastIncomeStatement.netProfit * 0.98,
        grossProfit: forecastIncomeStatement.grossProfit * 0.99,
      }
    : {
        revenue: forecastIncomeStatement.revenue,
        operatingProfit: forecastIncomeStatement.operatingProfit,
        netProfit: forecastIncomeStatement.netProfit,
        grossProfit: forecastIncomeStatement.grossProfit,
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
    <div className='min-h-screen bg-gray-50 relative'>
      {/* Main Content */}
      <div>
        {/* Header */}
        <div className='bg-white border-b border-gray-200'>
          <div className='px-8 py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  Weekly Financial Forecast
                </h1>
                <p className='mt-1 text-sm text-gray-500'>
                  Manage business assumptions, validate financial performance
                  forecasts, and simulate scenarios
                </p>
              </div>
              {activeTab === 'actions' && (
                <button
                  onClick={() => setActionTrackerOpen(!actionTrackerOpen)}
                  className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center'>
                  <ClipboardDocumentListIcon className='w-4 h-4 mr-2' />
                  {actionTrackerOpen ? 'Close' : 'Open'} Action Tracker
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className='px-8'>
            <nav
              className='flex space-x-8'
              aria-label='Tabs'>
              <button
                onClick={() => setActiveTab('assumptions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'assumptions'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                A. Business Assumption Management
              </button>
              <button
                onClick={() => setActiveTab('forecast')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'forecast'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                B. Financial Performance Review
              </button>
              <button
                onClick={() => {
                  setActiveTab('actions');
                  setActionTrackerOpen(true);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'actions'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                C. Action Tracker
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className='p-8'>
          {activeTab === 'assumptions' && <BusinessAssumptions />}

          {activeTab === 'forecast' && (
            <FinancialPerformanceReview
              simulationMode={simulationMode}
              onToggleSimulation={() => setSimulationMode(!simulationMode)}
              drivers={drivers}
              onDriverChange={handleDriverChange}
              onReset={handleResetSimulation}
              onRecalculate={handleRecalculate}
              forecast={simulatedForecast}
              waterfallData={waterfallData}
              mockBusinessEvents={mockBusinessEvents}
              readyInWaveActions={readyInWaveActions}
              onActionSelect={setSelectedAction}
              onModalOpen={setIsModalOpen}
              compareMode={compareMode}
              onToggleCompare={() => setCompareMode(!compareMode)}
              scenarios={mockScenarios}
              selectedScenarios={scenariosToCompare}
              onToggleScenario={toggleCompareScenario}
              selectedScenario={selectedScenario}
              onSelectScenario={setSelectedScenario}
            />
          )}

          {activeTab === 'actions' && (
            <div className='bg-white rounded-lg border border-gray-200 p-8 text-center'>
              <ClipboardDocumentListIcon className='w-12 h-12 mx-auto mb-4 text-gray-400' />
              <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                Action Tracker
              </h2>
              <p className='text-gray-600 mb-4'>
                Use the Action Tracker button in the header or click the toggle
                on the right side to open the action tracker sidebar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Tracker Sidebar */}
      <ActionTrackerSidebar
        isOpen={actionTrackerOpen}
        onToggle={() => setActionTrackerOpen(!actionTrackerOpen)}
        hasPendingActions={true}
      />

      {/* Modal */}
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

interface FinancialPerformanceReviewProps {
  simulationMode: boolean;
  onToggleSimulation: () => void;
  drivers: ForecastDriver[];
  onDriverChange: (driverId: string, newValue: number) => void;
  onReset: () => void;
  onRecalculate: () => void;
  forecast: {
    revenue: number;
    operatingProfit: number;
    netProfit: number;
    grossProfit: number;
  };
  waterfallData: Array<{
    name: string;
    value: number;
    displayValue: number;
    type: string;
  }>;
  mockBusinessEvents: any[];
  readyInWaveActions: Set<string>;
  onActionSelect: (action: ActionProposal | null) => void;
  onModalOpen: (open: boolean) => void;
  compareMode: boolean;
  onToggleCompare: () => void;
  scenarios: Scenario[];
  selectedScenarios: string[];
  onToggleScenario: (id: string) => void;
  selectedScenario: Scenario;
  onSelectScenario: (scenario: Scenario) => void;
}

function FinancialPerformanceReview({
  simulationMode,
  onToggleSimulation,
  drivers,
  onDriverChange,
  onReset,
  onRecalculate,
  forecast,
  waterfallData,
  mockBusinessEvents,
  readyInWaveActions,
  onActionSelect,
  onModalOpen,
  compareMode,
  onToggleCompare,
  scenarios,
  selectedScenarios,
  onToggleScenario,
  selectedScenario,
  onSelectScenario,
}: FinancialPerformanceReviewProps) {
  return (
    <div className='space-y-8'>
      {/* Simulation Mode Banner */}
      {simulationMode && (
        <div className='bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <BeakerIcon className='w-5 h-5 text-yellow-600 mr-2' />
              <span className='text-sm font-semibold text-yellow-800'>
                Simulation Mode Active
              </span>
              <span className='ml-3 text-xs text-yellow-700'>
                Changes to forecast drivers are simulated and will not affect
                the base forecast until you apply them.
              </span>
            </div>
            <button
              onClick={onToggleSimulation}
              className='text-xs text-yellow-800 hover:text-yellow-900 font-medium underline'>
              Exit Simulation
            </button>
          </div>
        </div>
      )}

      {/* Income Statement Summary */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-6'>
          Income Statement Forecast
        </h2>
        <div className='grid grid-cols-4 gap-6'>
          <div className='p-4 bg-blue-50 rounded-lg'>
            <p className='text-sm text-gray-600 mb-1'>Revenue</p>
            <p className='text-3xl font-bold text-gray-900'>
              ${forecast.revenue.toFixed(1)}M
            </p>
          </div>
          <div className='p-4 bg-blue-50 rounded-lg'>
            <p className='text-sm text-gray-600 mb-1'>Operating Profit</p>
            <p className='text-3xl font-bold text-gray-900'>
              ${forecast.operatingProfit.toFixed(1)}M
            </p>
            <p className='text-sm text-gray-500 mt-1'>
              Margin:{' '}
              {((forecast.operatingProfit / forecast.revenue) * 100).toFixed(1)}
              %
            </p>
          </div>
          <div className='p-4 bg-blue-50 rounded-lg'>
            <p className='text-sm text-gray-600 mb-1'>Net Profit</p>
            <p className='text-3xl font-bold text-gray-900'>
              ${forecast.netProfit.toFixed(1)}M
            </p>
            <p className='text-sm text-gray-500 mt-1'>
              Margin:{' '}
              {((forecast.netProfit / forecast.revenue) * 100).toFixed(1)}%
            </p>
          </div>
          <div className='p-4 bg-blue-50 rounded-lg'>
            <p className='text-sm text-gray-600 mb-1'>Gross Profit</p>
            <p className='text-3xl font-bold text-gray-900'>
              ${forecast.grossProfit.toFixed(1)}M
            </p>
          </div>
        </div>
      </div>

      {/* Forecast Drivers */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Key Forecast Drivers
          </h2>
          <div className='flex items-center space-x-3'>
            {simulationMode ? (
              <>
                <button
                  onClick={onReset}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200'>
                  Reset
                </button>
                <button
                  onClick={onRecalculate}
                  className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center'>
                  <ArrowPathIcon className='w-4 h-4 mr-2' />
                  Apply Simulation
                </button>
              </>
            ) : (
              <button
                onClick={onToggleSimulation}
                className='px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 flex items-center'>
                <BeakerIcon className='w-4 h-4 mr-2' />
                Enable Simulation
              </button>
            )}
          </div>
        </div>

        {simulationMode ? (
          // Editable Simulation View
          <div className='space-y-4'>
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className='p-4 rounded-lg border-2 border-primary-200 bg-primary-50'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex-1'>
                    <h4 className='font-medium text-gray-900'>{driver.name}</h4>
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
                        onDriverChange(
                          driver.id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      step='0.1'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
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
                    Related assumptions: {driver.relatedAssumptions.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Read-only Table View
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Driver
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Category
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    Latest Actual
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    Forecast
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    Change
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    P&L Impact
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {drivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className='hover:bg-gray-50'>
                    <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                      {driver.name}
                    </td>
                    <td className='px-6 py-4'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize'>
                        {driver.category}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-right text-gray-700'>
                      {driver.latestActual} {driver.unit}
                    </td>
                    <td className='px-6 py-4 text-sm text-right font-medium text-gray-900'>
                      {driver.forecastValue} {driver.unit}
                    </td>
                    <td className='px-6 py-4 text-sm text-right'>
                      <span
                        className={`font-medium ${
                          driver.changePercent >= 0
                            ? 'text-opportunity-600'
                            : 'text-risk-600'
                        }`}>
                        {driver.changePercent > 0 ? '+' : ''}
                        {driver.changePercent}%
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-right'>
                      <span
                        className={`font-bold ${
                          driver.impactOnPL >= 0
                            ? 'text-opportunity-600'
                            : 'text-risk-600'
                        }`}>
                        {driver.impactOnPL > 0 ? '+' : ''}$
                        {driver.impactOnPL.toFixed(1)}M
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Waterfall Chart */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-6'>
          Revenue Waterfall Analysis
        </h2>
        <div className='h-96'>
          <ResponsiveContainer
            width='100%'
            height='100%'>
            <BarChart data={waterfallData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='name'
                angle={-15}
                textAnchor='end'
                height={120}
                style={{ fontSize: '12px' }}
              />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip
                formatter={(
                  _value: number,
                  _name: string,
                  props: { payload?: { displayValue: number } }
                ) => [
                  `$${props.payload?.displayValue.toFixed(1) ?? '0.0'}M`,
                  'Impact',
                ]}
              />
              <Bar dataKey='value'>
                {waterfallData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.type === 'baseline'
                        ? '#3b82f6'
                        : entry.type === 'opportunity' ||
                          entry.type === 'initiative'
                        ? '#16a34a'
                        : '#dc2626'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Business Events with Action Proposals */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-6'>
          Key Business Events & Action Proposals
        </h2>
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
                    {event.implications.map((impl: string, index: number) => (
                      <li
                        key={index}
                        className='text-sm text-gray-600'>
                        {impl}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Proposals */}
                {event.actionProposals && event.actionProposals.length > 0 && (
                  <div className='mt-4 p-4 bg-white rounded-lg border border-gray-200'>
                    <p className='text-sm font-medium text-gray-900 mb-3'>
                      Recommended Actions:
                    </p>
                    <div className='space-y-2'>
                      {event.actionProposals.map((action: ActionProposal) => {
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
                                    onActionSelect(action);
                                    onModalOpen(true);
                                  }}
                                  className='px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors'>
                                  Create Wave initiative
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
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
