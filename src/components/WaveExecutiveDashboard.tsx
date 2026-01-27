import { useState } from 'react';
import {
  mockExecutiveInitiatives,
  mockMilestones,
  groupInitiativesByWorkflow,
  calculateSummaryStatistics,
  mockValueProgressData,
  mockValueDeliveryTrackingData,
  mockVarianceAnalysisData,
  mockWorkflowValueDeliveryData,
} from '../data/mockExecutiveDashboard';
import { format } from 'date-fns';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Cell,
  Legend,
} from 'recharts';
import { useCurrency } from '../contexts/CurrencyContext';

export default function WaveExecutiveDashboard() {
  const workflowGroups = groupInitiativesByWorkflow(mockExecutiveInitiatives);
  const { formatAmount, currencyLabel } = useCurrency();
  // Expand all workflows by default
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(
    new Set(workflowGroups.map((g) => g.workflow))
  );
  const summary = calculateSummaryStatistics(
    mockExecutiveInitiatives,
    mockMilestones
  );

  const toggleWorkflow = (workflow: string) => {
    setExpandedWorkflows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workflow)) {
        newSet.delete(workflow);
      } else {
        newSet.add(workflow);
      }
      return newSet;
    });
  };

  const formatDate = (date: Date): string => {
    return format(date, 'yyyy年M月d日');
  };

  const formatNetBenefit = (value: number): string => {
    return `Million ${currencyLabel} ${formatAmount(value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}`;
  };

  const getStatusIndicator = (status: string) => {
    if (status === 'progressing-smoothly') {
      return (
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 rounded bg-green-500'></div>
          <span className='text-sm text-gray-700'>Progressing Smoothly</span>
        </div>
      );
    } else {
      return (
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 rounded bg-red-500'></div>
          <span className='text-sm text-gray-700'>Leadership Attention</span>
        </div>
      );
    }
  };

  const getAssetLabel = (assetType: string): string => {
    switch (assetType) {
      case 'yes-original':
        return 'Yes - Original';
      case 'yes-new':
        return 'Yes - New';
      case 'no':
        return 'No';
      default:
        return 'No';
    }
  };

  return (
    <div className='bg-white rounded-2xl border border-gray-200/80 shadow-xl shadow-gray-200/40 hover:shadow-2xl transition-all duration-300 overflow-hidden'>
      {/* Charts Section - 2x2 Grid */}
      <div className='p-8 border-b border-gray-200/60 bg-gradient-to-b from-gray-50/50 to-white'>
        <div className='grid grid-cols-2 gap-6 mb-8'>
          {/* Top Left: Value Progress Chart */}
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <h3 className='text-sm font-bold text-gray-900'>
                Value Progress - Net Recurring Revenue (Annualized, Million {currencyLabel})
                vs. Top-Down Target
              </h3>
              <InformationCircleIcon className='w-4 h-4 text-gray-400' />
            </div>
            <div className='h-64'>
              <ResponsiveContainer
                width='100%'
                height='100%'>
                <BarChart
                  data={[
                    {
                      name: 'Past/Current',
                      value1: mockValueProgressData.current.value1,
                      value2: mockValueProgressData.current.value2,
                    },
                    {
                      name: 'Target',
                      ...mockValueProgressData.target.segments.reduce(
                        (acc, seg, idx) => {
                          acc[`segment${idx}`] = seg.value;
                          return acc;
                        },
                        {} as Record<string, number>
                      ),
                    },
                  ]}
                  layout='vertical'>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis type='number' />
                  <YAxis
                    dataKey='name'
                    type='category'
                    width={100}
                  />
                  <Tooltip />
                  <Bar
                    dataKey='value1'
                    stackId='current'
                    fill='#3b82f6'
                  />
                  <Bar
                    dataKey='value2'
                    stackId='current'
                    fill='#2563eb'
                  />
                  {mockValueProgressData.target.segments.map((seg, idx) => (
                    <Bar
                      key={idx}
                      dataKey={`segment${idx}`}
                      stackId='target'
                      fill={seg.color}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className='mt-4 flex justify-between text-xs text-gray-600'>
              <span>{mockValueProgressData.current.date}</span>
              <span>Current Date</span>
            </div>
          </div>

          {/* Top Right: Value Delivery Tracking Chart */}
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <h3 className='text-sm font-bold text-gray-900'>
                Value Delivery Tracking - Net Recurring Revenue (Annualized,
                Million {currencyLabel}) vs. Bottom-Up Plan
              </h3>
              <InformationCircleIcon className='w-4 h-4 text-gray-400' />
            </div>
            <div className='h-64'>
              <ResponsiveContainer
                width='100%'
                height='100%'>
                <ComposedChart
                  data={mockValueDeliveryTrackingData.map((item) => ({
                    month: item.month,
                    target: item.target,
                    segment0: item.segments[0]?.value || 0,
                    segment1: item.segments[1]?.value || 0,
                    segment2: item.segments[2]?.value || 0,
                    segment3: item.segments[3]?.value || 0,
                  }))}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey='segment0'
                    stackId='a'
                    fill='#3b82f6'
                  />
                  <Bar
                    dataKey='segment1'
                    stackId='a'
                    fill='#2563eb'
                  />
                  <Bar
                    dataKey='segment2'
                    stackId='a'
                    fill='#10b981'
                  />
                  <Bar
                    dataKey='segment3'
                    stackId='a'
                    fill='#9333ea'
                  />
                  <Line
                    type='monotone'
                    dataKey='target'
                    stroke='#ef4444'
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Left: Variance Analysis Chart */}
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <h3 className='text-sm font-bold text-gray-900'>
                Variance Analysis - L4+ Actual Net Recurring Revenue
                (Annualized, Million {currencyLabel}) vs. Bottom-Up Plan
              </h3>
              <InformationCircleIcon className='w-4 h-4 text-gray-400' />
            </div>
            <div className='h-64'>
              <ResponsiveContainer
                width='100%'
                height='100%'>
                <BarChart data={mockVarianceAnalysisData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='category'
                    angle={-45}
                    textAnchor='end'
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='value'>
                    {mockVarianceAnalysisData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.type === 'positive'
                            ? '#10b981'
                            : entry.type === 'negative'
                            ? '#ef4444'
                            : '#60a5fa'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Right: Workflow Value Delivery Chart */}
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm p-6'>
            <div className='flex items-center gap-2 mb-4'>
              <h3 className='text-sm font-bold text-gray-900'>
                每个工作流的价值交付-对比自下而上计划的净经常性收益(年化,
                百万美元)
              </h3>
              <InformationCircleIcon className='w-4 h-4 text-gray-400' />
            </div>
            <div className='h-64'>
              <ResponsiveContainer
                width='100%'
                height='100%'>
                <BarChart data={mockWorkflowValueDeliveryData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='workflow'
                    angle={-45}
                    textAnchor='end'
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey='value1'
                    stackId='a'
                    fill='#10b981'
                  />
                  <Bar
                    dataKey='value2'
                    stackId='a'
                    fill='#86efac'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className='p-8'>
        <div className='overflow-hidden rounded-xl border border-gray-200/60 shadow-sm'>
          <table className='w-full'>
            <thead>
              <tr className='bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200'>
                <th className='text-left py-4 px-5 text-xs font-bold text-gray-700 uppercase tracking-wider'>
                  Exception
                </th>
                <th className='text-left py-4 px-5 text-xs font-bold text-gray-700 uppercase tracking-wider'>
                  #
                </th>
                <th className='text-left py-4 px-5 text-xs font-bold text-gray-700 uppercase tracking-wider'>
                  Name
                </th>
                <th className='text-left py-4 px-5 text-xs font-bold text-gray-700 uppercase tracking-wider'>
                  Phase
                </th>
                <th className='text-left py-4 px-5 text-xs font-bold text-gray-700 uppercase tracking-wider'>
                  Weekly Status
                </th>
                <th className='text-left py-4 px-5 text-xs font-bold text-gray-700 uppercase tracking-wider'>
                  Initiative Owner
                </th>
                <th className='text-left py-4 px-5 text-xs font-bold text-gray-700 uppercase tracking-wider'>
                  Responsible Workflow
                </th>
                <th className='text-left py-4 px-5 text-xs font-bold text-gray-700 uppercase tracking-wider'>
                  L4 Latest Estimated Date
                </th>
                <th className='text-left py-4 px-5 text-xs font-bold text-gray-700 uppercase tracking-wider'>
                  Recurring Net Benefit...
                </th>
                <th className='text-left py-4 px-5 text-xs font-bold text-gray-700 uppercase tracking-wider'>
                  Is it an Asset...
                </th>
                <th className='text-left py-4 px-5 text-xs font-bold text-gray-700 uppercase tracking-wider'>
                  Compare BP
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100/60'>
              {workflowGroups.map((group) => {
                const isExpanded = expandedWorkflows.has(group.workflow);
                return (
                  <>
                    {/* Workflow Group Header Row */}
                    <tr
                      key={`group-${group.workflow}`}
                      className='bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors'
                      onClick={() => toggleWorkflow(group.workflow)}>
                      <td
                        colSpan={11}
                        className='py-3 px-5'>
                        <div className='flex items-center gap-2'>
                          {isExpanded ? (
                            <ChevronDownIcon className='w-4 h-4 text-gray-600' />
                          ) : (
                            <ChevronRightIcon className='w-4 h-4 text-gray-600' />
                          )}
                          <span className='font-semibold text-gray-900'>
                            {isExpanded ? '▼' : '▶'} {group.workflow} (
                            {group.count})
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* Initiative Rows */}
                    {isExpanded &&
                      group.initiatives.map((initiative, index) => (
                        <tr
                          key={initiative.id}
                          className={`transition-colors duration-150 ${
                            index % 2 === 0
                              ? 'bg-white hover:bg-gray-50/80'
                              : 'bg-gray-50/30 hover:bg-gray-100/50'
                          }`}>
                          <td className='py-4 px-5 text-sm text-gray-500'>
                            {initiative.exception ? '...' : ''}
                          </td>
                          <td className='py-4 px-5 text-sm font-semibold text-gray-900'>
                            {initiative.id}
                          </td>
                          <td className='py-4 px-5 text-sm font-semibold text-gray-900'>
                            {initiative.name}
                          </td>
                          <td className='py-4 px-5 text-sm text-gray-700'>
                            {initiative.phaseLabel}
                          </td>
                          <td className='py-4 px-5 text-sm'>
                            {getStatusIndicator(initiative.weeklyStatus)}
                          </td>
                          <td className='py-4 px-5 text-sm text-gray-700'>
                            {initiative.owner}
                          </td>
                          <td className='py-4 px-5 text-sm text-gray-700'>
                            {initiative.responsibleWorkflow}
                          </td>
                          <td className='py-4 px-5 text-sm text-gray-700'>
                            {initiative.l4LatestEstimatedDate
                              ? formatDate(initiative.l4LatestEstimatedDate)
                              : ''}
                          </td>
                          <td className='py-4 px-5 text-sm font-semibold text-gray-900'>
                            {formatNetBenefit(initiative.recurringNetBenefit)}
                          </td>
                          <td className='py-4 px-5 text-sm text-gray-700'>
                            {getAssetLabel(initiative.isAsset)}
                          </td>
                          <td className='py-4 px-5 text-sm text-gray-500'>
                            {initiative.compareBP || '...'}
                          </td>
                        </tr>
                      ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards Section */}
      <div className='border-t border-gray-200/60 bg-gradient-to-b from-gray-50/50 to-white p-8'>
        <div className='grid grid-cols-3 gap-6'>
          {/* Row 1: Initiatives */}
          {/* Card 1: Overdue Initiatives */}
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 hover:shadow-md transition-shadow'>
            <h3 className='text-sm font-bold text-gray-900 mb-4'>
              Overdue Initiatives (Next Phase Date Passed)
            </h3>
            <div className='space-y-3'>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Initiative Count
                </div>
                <div className='text-2xl font-bold text-gray-900'>
                  {summary.overdueInitiatives.count}
                </div>
              </div>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Recurring Net Benefit(...)
                </div>
                <div className='text-lg font-semibold text-gray-900'>
                  {summary.overdueInitiatives.netBenefit > 0
                    ? formatNetBenefit(summary.overdueInitiatives.netBenefit)
                    : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Initiatives Due in 7 Days */}
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 hover:shadow-md transition-shadow'>
            <h3 className='text-sm font-bold text-gray-900 mb-4'>
              Initiatives Due Soon (Reaching L4 in Next 7 Days)
            </h3>
            <div className='space-y-3'>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Initiative Count
                </div>
                <div className='text-2xl font-bold text-gray-900'>
                  {summary.initiativesDueIn7Days.count}
                </div>
              </div>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Recurring Net Benefit(...)
                </div>
                <div className='text-lg font-semibold text-gray-900'>
                  {summary.initiativesDueIn7Days.netBenefit > 0
                    ? formatNetBenefit(summary.initiativesDueIn7Days.netBenefit)
                    : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Initiatives Due in 30 Days */}
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 hover:shadow-md transition-shadow'>
            <h3 className='text-sm font-bold text-gray-900 mb-4'>
              Initiatives Due Soon (Reaching L4 in Next 30 Days)
            </h3>
            <div className='space-y-3'>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Initiative Count
                </div>
                <div className='text-2xl font-bold text-gray-900'>
                  {summary.initiativesDueIn30Days.count}
                </div>
              </div>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Recurring Net Benefit(...)
                </div>
                <div className='text-lg font-semibold text-gray-900'>
                  {summary.initiativesDueIn30Days.netBenefit > 0
                    ? formatNetBenefit(
                        summary.initiativesDueIn30Days.netBenefit
                      )
                    : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Milestones */}
          {/* Card 4: Overdue Milestones */}
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 hover:shadow-md transition-shadow'>
            <h3 className='text-sm font-bold text-gray-900 mb-4'>
              Overdue Milestones (Next Phase Date Passed)
            </h3>
            <div className='space-y-3'>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Milestone Count
                </div>
                <div className='text-2xl font-bold text-gray-900'>
                  {summary.overdueMilestones.count}
                </div>
              </div>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Number of Milestone Owners
                </div>
                <div className='text-lg font-semibold text-gray-900'>
                  {summary.overdueMilestones.ownerCount}
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Milestones Due in 7 Days */}
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 hover:shadow-md transition-shadow'>
            <h3 className='text-sm font-bold text-gray-900 mb-4'>
              Milestones Due Soon (End Date in Next 7 Days)
            </h3>
            <div className='space-y-3'>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Milestone Count
                </div>
                <div className='text-2xl font-bold text-gray-900'>
                  {summary.milestonesDueIn7Days.count}
                </div>
              </div>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Number of Milestone Owners
                </div>
                <div className='text-lg font-semibold text-gray-900'>
                  {summary.milestonesDueIn7Days.ownerCount}
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Milestones Due in 30 Days */}
          <div className='bg-white rounded-xl border border-gray-200/60 shadow-sm p-6 hover:shadow-md transition-shadow'>
            <h3 className='text-sm font-bold text-gray-900 mb-4'>
              Milestones Due Soon (End Date in Next 30 Days)
            </h3>
            <div className='space-y-3'>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Milestone Count
                </div>
                <div className='text-2xl font-bold text-gray-900'>
                  {summary.milestonesDueIn30Days.count}
                </div>
              </div>
              <div>
                <div className='text-xs text-gray-500 mb-1'>
                  Number of Milestone Owners
                </div>
                <div className='text-lg font-semibold text-gray-900'>
                  {summary.milestonesDueIn30Days.ownerCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
