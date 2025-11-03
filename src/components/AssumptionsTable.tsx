import { useState } from 'react';
import { mockAssumptions } from '../data/mockAssumptions';
import type { BusinessAssumption, AssumptionCategory } from '../types';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AssumptionsTable() {
  const [assumptions, setAssumptions] = useState(mockAssumptions);
  const [selectedCategory, setSelectedCategory] = useState<
    AssumptionCategory | 'all'
  >('all');
  const [expandedAssumption, setExpandedAssumption] = useState<string | null>(
    null
  );
  const [showTimelineFor, setShowTimelineFor] = useState<string | null>(null);

  const categories: { value: AssumptionCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'revenue', label: 'Revenue Trend' },
    { value: 'volume', label: 'Volume Trend' },
    { value: 'labor_rate', label: 'Labor Rate' },
    { value: 'fx_rate', label: 'FX Rate' },
    { value: 'material_price', label: 'Material Price' },
  ];

  const filteredAssumptions =
    selectedCategory === 'all'
      ? assumptions
      : assumptions.filter((a) => a.category === selectedCategory);

  const handleApprove = (assumptionId: string) => {
    const updatedAssumptions = assumptions.map((a) =>
      a.id === assumptionId
        ? { ...a, approvalStatus: 'approved' as const, approver: 'CEO' }
        : a
    );
    setAssumptions(updatedAssumptions);
    alert('Assumption approved successfully!');
  };

  const handleReject = (assumptionId: string) => {
    const updatedAssumptions = assumptions.map((a) =>
      a.id === assumptionId
        ? { ...a, approvalStatus: 'rejected' as const, approver: 'CEO' }
        : a
    );
    setAssumptions(updatedAssumptions);
    alert('Assumption rejected. Owner has been notified.');
  };

  return (
    <div className='space-y-6'>
      {/* Category Filter */}
      <div className='bg-white rounded-lg border border-gray-200 p-4'>
        <div className='flex items-center space-x-2 overflow-x-auto'>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assumptions Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Category
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Assumption
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Value
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Source
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Owner
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredAssumptions.map((assumption) => (
                <>
                  <tr
                    key={assumption.id}
                    className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize'>
                        {assumption.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <button
                        onClick={() =>
                          setExpandedAssumption(
                            expandedAssumption === assumption.id
                              ? null
                              : assumption.id
                          )
                        }
                        className='text-sm font-medium text-gray-900 hover:text-primary-600 text-left'>
                        {assumption.description}
                      </button>
                      {assumption.annotations.length > 0 && (
                        <span className='ml-2 text-xs text-gray-500'>
                          ({assumption.annotations.length} notes)
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-sm font-semibold text-gray-900'>
                        {assumption.value} {assumption.unit}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize'>
                        {assumption.source}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-700'>
                      {assumption.owner}
                    </td>
                    <td className='px-6 py-4'>
                      {assumption.approvalStatus === 'approved' ? (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-opportunity-100 text-opportunity-800'>
                          <CheckCircleIcon className='w-4 h-4 mr-1' />
                          Approved
                        </span>
                      ) : assumption.approvalStatus === 'rejected' ? (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-risk-100 text-risk-800'>
                          <XCircleIcon className='w-4 h-4 mr-1' />
                          Rejected
                        </span>
                      ) : (
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                          <ClockIcon className='w-4 h-4 mr-1' />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center space-x-2'>
                        {assumption.approvalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(assumption.id)}
                              className='text-sm text-opportunity-600 hover:text-opportunity-700 font-medium'>
                              Approve
                            </button>
                            <span className='text-gray-300'>|</span>
                            <button
                              onClick={() => handleReject(assumption.id)}
                              className='text-sm text-risk-600 hover:text-risk-700 font-medium'>
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() =>
                            setShowTimelineFor(
                              showTimelineFor === assumption.id
                                ? null
                                : assumption.id
                            )
                          }
                          className='text-sm text-primary-600 hover:text-primary-700'>
                          <ChartBarIcon className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedAssumption === assumption.id && (
                    <tr>
                      <td
                        colSpan={7}
                        className='px-6 py-4 bg-gray-50'>
                        <AssumptionDetails assumption={assumption} />
                      </td>
                    </tr>
                  )}
                  {showTimelineFor === assumption.id && (
                    <tr>
                      <td
                        colSpan={7}
                        className='px-6 py-4 bg-blue-50'>
                        <AssumptionTimeline assumption={assumption} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AssumptionDetails({ assumption }: { assumption: BusinessAssumption }) {
  return (
    <div className='space-y-4'>
      <div>
        <p className='text-sm font-medium text-gray-700 mb-1'>Description:</p>
        <p className='text-sm text-gray-600'>{assumption.description}</p>
      </div>

      {assumption.approver && (
        <div>
          <p className='text-sm font-medium text-gray-700 mb-1'>Approved By:</p>
          <p className='text-sm text-gray-600'>{assumption.approver}</p>
        </div>
      )}

      <div>
        <p className='text-sm font-medium text-gray-700 mb-1'>Last Updated:</p>
        <p className='text-sm text-gray-600'>
          {format(assumption.lastUpdated, 'PPp')}
        </p>
      </div>

      {assumption.history.length > 0 && (
        <div>
          <p className='text-sm font-medium text-gray-700 mb-2'>
            Change History:
          </p>
          <div className='space-y-2'>
            {assumption.history.slice(0, 3).map((h, index) => (
              <div
                key={index}
                className='text-sm text-gray-600 flex items-start space-x-2'>
                <span className='text-gray-400'>•</span>
                <div>
                  <span className='font-medium'>
                    {h.value} {assumption.unit}
                  </span>
                  {' - '}
                  {format(h.date, 'MMM d, yyyy')} by {h.changedBy}
                  {h.reason && (
                    <span className='text-gray-500'> ({h.reason})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssumptionTimeline({
  assumption,
}: {
  assumption: BusinessAssumption;
}) {
  const chartData = assumption.history.map((h) => ({
    date: format(h.date, 'MMM yy'),
    value: h.value,
  }));

  return (
    <div className='space-y-2'>
      <p className='text-sm font-medium text-gray-900'>Historical Trend</p>
      <div className='h-48'>
        <ResponsiveContainer
          width='100%'
          height='100%'>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis
              dataKey='date'
              style={{ fontSize: '12px' }}
            />
            <YAxis style={{ fontSize: '12px' }} />
            <Tooltip />
            <Line
              type='monotone'
              dataKey='value'
              stroke='#2563eb'
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
