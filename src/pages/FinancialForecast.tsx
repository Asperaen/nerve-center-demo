import { useState } from 'react';
import {
  mockForecastDrivers,
  mockBusinessEvents,
  forecastIncomeStatement,
} from '../data/mockForecast';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
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
import type { ActionProposal } from '../types';

export default function FinancialForecast() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionProposal | null>(
    null
  );
  const [readyInWaveActions, setReadyInWaveActions] = useState<Set<string>>(
    new Set()
  );
  // Prepare waterfall data
  const waterfallData = mockBusinessEvents.map((event) => ({
    name: event.name,
    value: Math.abs(event.impact),
    displayValue: event.impact,
    type: event.type,
  }));

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='px-8 py-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Financial Forecast
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Driver-based forecast with actionable insights and business event
            analysis
          </p>
        </div>
      </div>

      {/* Content */}
      <div className='p-8 space-y-8'>
        {/* Income Statement Summary */}
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>
            Income Statement Forecast
          </h2>
          <div className='grid grid-cols-3 gap-6'>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <p className='text-sm text-gray-600 mb-1'>Revenue</p>
              <p className='text-3xl font-bold text-gray-900'>
                ${forecastIncomeStatement.revenue.toFixed(1)}M
              </p>
              <p className='text-sm text-gray-500 mt-1'>
                Momentum: $
                {forecastIncomeStatement.breakdown.momentum.toFixed(1)}M
              </p>
            </div>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <p className='text-sm text-gray-600 mb-1'>Operating Profit</p>
              <p className='text-3xl font-bold text-gray-900'>
                ${forecastIncomeStatement.operatingProfit.toFixed(1)}M
              </p>
              <p className='text-sm text-gray-500 mt-1'>
                Margin:{' '}
                {(
                  (forecastIncomeStatement.operatingProfit /
                    forecastIncomeStatement.revenue) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <p className='text-sm text-gray-600 mb-1'>Net Profit</p>
              <p className='text-3xl font-bold text-gray-900'>
                ${forecastIncomeStatement.netProfit.toFixed(1)}M
              </p>
              <p className='text-sm text-gray-500 mt-1'>
                Margin:{' '}
                {(
                  (forecastIncomeStatement.netProfit /
                    forecastIncomeStatement.revenue) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className='mt-6 grid grid-cols-4 gap-4'>
            <div className='p-3 bg-gray-50 rounded'>
              <p className='text-xs text-gray-500'>Momentum</p>
              <p className='text-lg font-semibold text-gray-900'>
                ${forecastIncomeStatement.breakdown.momentum.toFixed(1)}M
              </p>
            </div>
            <div className='p-3 bg-opportunity-50 rounded'>
              <p className='text-xs text-gray-500'>Pipeline</p>
              <p className='text-lg font-semibold text-opportunity-700'>
                +${forecastIncomeStatement.breakdown.pipeline.toFixed(1)}M
              </p>
            </div>
            <div className='p-3 bg-risk-50 rounded'>
              <p className='text-xs text-gray-500'>Risk</p>
              <p className='text-lg font-semibold text-risk-700'>
                ${forecastIncomeStatement.breakdown.risk.toFixed(1)}M
              </p>
            </div>
            <div className='p-3 bg-gray-50 rounded'>
              <p className='text-xs text-gray-500'>Opportunity</p>
              <p className='text-lg font-semibold text-gray-900'>
                ${forecastIncomeStatement.breakdown.opportunity.toFixed(1)}M
              </p>
            </div>
          </div>
        </div>

        {/* Forecast Drivers */}
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>
            Key Forecast Drivers
          </h2>
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
                {mockForecastDrivers.map((driver) => (
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
        <div clazssName='bg-white rounded-lg border border-gray-200 p-6'>
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
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                        event.type === 'risk'
                          ? 'bg-risk-100 text-risk-800'
                          : event.type === 'opportunity'
                          ? 'bg-opportunity-100 text-opportunity-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                      {event.type}
                    </span>
                  </div>

                  {/* Implications */}
                  <div className='mb-3'>
                    <p className='text-sm font-medium text-gray-700 mb-2'>
                      Key Implications:
                    </p>
                    <ul className='list-disc list-inside space-y-1'>
                      {event.implications.map((impl, index) => (
                        <li
                          key={index}
                          className='text-sm text-gray-600'>
                          {impl}
                        </li>
                      ))}
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
                          {event.actionProposals.map((action) => {
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
                                  {/* Stage, Progress, and Status for Ready-in-Wave Actions */}
                                  {action.stage !== undefined && (
                                    <div className='mt-2 space-y-2'>
                                      {/* Stage and Status Row */}
                                      <div className='flex items-center space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                          <span className='text-xs text-gray-600'>
                                            Stage:
                                          </span>
                                          <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                                              action.stage === 'L0'
                                                ? 'bg-gray-100 text-gray-800'
                                                : action.stage === 'L1'
                                                ? 'bg-blue-100 text-blue-800'
                                                : action.stage === 'L2'
                                                ? 'bg-indigo-100 text-indigo-800'
                                                : action.stage === 'L3'
                                                ? 'bg-purple-100 text-purple-800'
                                                : action.stage === 'L4'
                                                ? 'bg-pink-100 text-pink-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {action.stage}
                                          </span>
                                        </div>
                                        {action.status && (
                                          <div className='flex items-center space-x-2'>
                                            <span className='text-xs text-gray-600'>
                                              Status:
                                            </span>
                                            <span
                                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                action.status === 'On Track'
                                                  ? 'bg-green-100 text-green-800'
                                                  : action.status === 'At Risk'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : action.status === 'On Hold'
                                                  ? 'bg-orange-100 text-orange-800'
                                                  : action.status ===
                                                    'Completed'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : action.status === 'Delayed'
                                                  ? 'bg-red-100 text-red-800'
                                                  : action.status ===
                                                    'Suspended'
                                                  ? 'bg-gray-100 text-gray-800'
                                                  : 'bg-gray-100 text-gray-800'
                                              }`}>
                                              {action.status}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      {/* Progress Bar */}
                                      {action.progress !== undefined && (
                                        <div>
                                          <div className='flex items-center justify-between text-xs text-gray-600 mb-1'>
                                            <span>Progress</span>
                                            <span>{action.progress}%</span>
                                          </div>
                                          <div className='w-full bg-gray-200 rounded-full h-2'>
                                            <div
                                              className='bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300'
                                              style={{
                                                width: `${action.progress}%`,
                                              }}></div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
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
                          })}
                        </div>
                      </div>
                    )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
            onClick={() => setIsModalOpen(false)}></div>

          {/* Modal Content */}
          <div className='flex items-center justify-center min-h-screen p-4'>
            <div className='relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col'>
              {/* Modal Header */}
              <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                <div>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Create Wave Initiative
                  </h3>
                  {selectedAction && (
                    <p className='mt-1 text-sm text-gray-500'>
                      {selectedAction.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
                  <XMarkIcon className='w-6 h-6' />
                </button>
              </div>

              {/* Modal Body with Form */}
              <div className='flex-1 p-6 overflow-y-auto'>
                <form className='space-y-6'>
                  {/* Initiative Name */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Initiative Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                      placeholder='Enter initiative name'
                      defaultValue={selectedAction?.description || ''}
                    />
                  </div>

                  {/* Form Grid - Row 1 */}
                  <div className='grid grid-cols-4 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Stage
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>LO (Ideation)</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Weekly Status
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>On Track</option>
                        <option>At Risk</option>
                        <option>On Hold</option>
                        <option>Completed</option>
                        <option>Delayed</option>
                        <option>Suspended</option>
                        <option>Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Stream <span className='text-red-500'>*</span>
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>Business</option>
                        <option>Technology</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Access Control
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>General</option>
                      </select>
                    </div>
                  </div>

                  {/* Form Grid - Row 2 */}
                  <div className='grid grid-cols-4 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Initiative Owner <span className='text-red-500'>*</span>
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>Not Set</option>
                        <option>John Doe</option>
                        <option>Jane Doe</option>
                        <option>Jim Doe</option>
                        <option>Jill Doe</option>
                        <option>Jack Doe</option>
                        <option>Jill Doe</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Backup IO
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>Not Set</option>
                        <option>John Doe</option>
                        <option>Jane Doe</option>
                        <option>Jim Doe</option>
                        <option>Jill Doe</option>
                        <option>Jack Doe</option>
                        <option>Jill Doe</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Is CAPEX Required?
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>No</option>
                        <option>Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Is an Enabler?
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>No</option>
                        <option>Yes</option>
                      </select>
                    </div>
                  </div>

                  {/* Form Grid - Row 3 */}
                  <div className='grid grid-cols-4 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Department
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>Finance & Accounting</option>
                        <option>Human Resources</option>
                        <option>Information Technology</option>
                        <option>Marketing & Sales</option>
                        <option>Operations & Manufacturing</option>
                        <option>Research & Development</option>
                        <option>Customer Service</option>
                        <option>Legal & Compliance</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Factory
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>Shanghai Manufacturing Plant</option>
                        <option>Beijing Production Facility</option>
                        <option>Guangzhou Assembly Plant</option>
                        <option>Shenzhen Electronics Factory</option>
                        <option>Chengdu R&D Center</option>
                        <option>Wuhan Logistics Hub</option>
                        <option>Nanjing Quality Control Center</option>
                        <option>Hangzhou Innovation Lab</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Customer Code
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>Apple Inc.</option>
                        <option>Samsung Electronics</option>
                        <option>Microsoft Corporation</option>
                        <option>Amazon Web Services</option>
                        <option>Google Cloud Platform</option>
                        <option>Tesla Motors</option>
                        <option>Meta Platforms</option>
                        <option>Intel Corporation</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Product
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>Prod_1</option>
                        <option>Prod_2</option>
                        <option>Prod_3</option>
                        <option>Prod_4</option>
                        <option>Prod_5</option>
                        <option>Prod_6</option>
                        <option>Prod_7</option>
                        <option>Prod_8</option>
                      </select>
                    </div>
                  </div>

                  {/* Form Grid - Row 5 */}
                  <div className='grid grid-cols-5 gap-2'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Initiative Category
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>Cost Reduction</option>
                        <option>Revenue Growth</option>
                        <option>Operational Efficiency</option>
                        <option>Digital Transformation</option>
                        <option>Market Expansion</option>
                        <option>Product Innovation</option>
                        <option>Customer Experience</option>
                        <option>Risk Management</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Impact Digital Cost Category
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>IT Infrastructure</option>
                        <option>Software Development</option>
                        <option>Data Analytics</option>
                        <option>Cloud Services</option>
                        <option>Cybersecurity</option>
                        <option>Automation Tools</option>
                        <option>Digital Marketing</option>
                        <option>E-commerce Platform</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        KPI
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option value='revenue'>Revenue</option>
                        <option value='gross-profit'>Gross Profit</option>
                        <option value='operating-profit'>
                          Operating Profit
                        </option>
                        <option value='net-profit'>Net Profit</option>
                        <option value='working-capital'>Working Capital</option>
                        <option value='oee'>
                          OEE (Overall Equipment Effectiveness)
                        </option>
                        <option value='upph'>
                          UPPH (Units per Person per Hour)
                        </option>
                        <option value='inventory-turnover'>
                          Inventory Turnover Rate
                        </option>
                        <option value='copq'>Cost of Poor Quality</option>
                        <option value='customer-complaints'>
                          Open Customer Complaint Cases
                        </option>
                        <option value='rd-cost'>
                          R&D Cost as % of Revenue
                        </option>
                        <option value='procurement-cost-down'>
                          Procurement Cost Down
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Responsible Department
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>HR</option>
                        <option>Finance</option>
                        <option>IT</option>
                        <option>Marketing</option>
                        <option>Sales</option>
                        <option>Customer Service</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Workshop
                      </label>
                      <select className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'>
                        <option>Case assembly</option>
                        <option>QA testing</option>
                        <option>Packaging</option>
                        <option>Shipping</option>
                        <option>Receiving</option>
                        <option>Storage</option>
                        <option>Disposal</option>
                      </select>
                    </div>
                  </div>
                  {/* Description Text Area */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Describe the initiative - Please provide a detailed
                      description of the initiative and how it creates value
                    </label>
                    <textarea
                      rows={4}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary-500'
                      placeholder='Hint: Describe the initiative - Please provide a detailed description of the initiative and how it creates value'
                      defaultValue={
                        selectedAction
                          ? `Key Implications: ${selectedAction.description}
Expected Impact: $${selectedAction.expectedImpact.toFixed(1)}M
Feasibility: ${selectedAction.feasibility}
Priority: ${selectedAction.priority}`
                          : ''
                      }
                    />
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className='flex items-center justify-center gap-3 p-6 border-t border-gray-200 bg-gray-50'>
                <button
                  onClick={() => {
                    // Handle create action here
                    if (selectedAction) {
                      setReadyInWaveActions((prev) =>
                        new Set(prev).add(selectedAction.id)
                      );
                    }
                    console.log('Creating Wave initiative:', selectedAction);
                    setIsModalOpen(false);
                  }}
                  className='px-8 py-3 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors'>
                  Create
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='px-8 py-3 text-sm font-medium text-white bg-blue-400 rounded-lg hover:bg-blue-500 transition-colors'>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
