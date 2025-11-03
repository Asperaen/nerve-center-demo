import { useState } from 'react';
import { mockKPIs } from '../data/mockKPIs';
import type { KPI } from '../types';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function InternalPulseCheck() {
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);

  return (
    <>
      <div className='bg-white rounded-lg border border-gray-200'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                <ChartBarIcon className='w-6 h-6 mr-2 text-primary-600' />
                Internal Pulse Check
              </h2>
              <p className='mt-1 text-sm text-gray-500'>
                Real-time view of key performance indicators
              </p>
            </div>
            <div className='text-sm text-gray-500'>
              Last updated: {format(new Date(), 'PPp')}
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className='p-6'>
          <div className='grid grid-cols-3 gap-6'>
            {mockKPIs.map((kpi) => (
              <KPICard
                key={kpi.id}
                kpi={kpi}
                onClick={() => setSelectedKPI(kpi)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* KPI Detail Modal */}
      {selectedKPI && (
        <KPIDetailModal
          kpi={selectedKPI}
          onClose={() => setSelectedKPI(null)}
        />
      )}
    </>
  );
}

interface KPICardProps {
  kpi: KPI;
  onClick: () => void;
}

function KPICard({ kpi, onClick }: KPICardProps) {
  const getTrendIcon = () => {
    if (kpi.trend === 'up') {
      return <ArrowTrendingUpIcon className='w-5 h-5' />;
    } else if (kpi.trend === 'down') {
      return <ArrowTrendingDownIcon className='w-5 h-5' />;
    } else {
      return <MinusIcon className='w-5 h-5' />;
    }
  };

  const getStatusColor = () => {
    switch (kpi.status) {
      case 'good':
        return 'bg-opportunity-50 border-opportunity-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'concern':
        return 'bg-risk-50 border-risk-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTrendColor = () => {
    if (kpi.status === 'good') {
      return 'text-opportunity-600';
    } else if (kpi.variancePercent < 0) {
      return 'text-risk-600';
    } else {
      return 'text-gray-600';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-lg border-2 cursor-pointer hover:shadow-lg transition-all ${getStatusColor()}`}>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-600'>{kpi.name}</p>
          <div className='mt-2 flex items-baseline'>
            <p className='text-3xl font-bold text-gray-900'>
              {kpi.value.toLocaleString()}
            </p>
            <span className='ml-2 text-sm text-gray-500'>{kpi.unit}</span>
          </div>
        </div>
        <div className={`p-2 rounded-full ${getTrendColor()}`}>
          {getTrendIcon()}
        </div>
      </div>

      {/* Variance */}
      <div className='mt-4 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <span className='text-xs text-gray-500'>vs Budget:</span>
          <span className={`text-sm font-semibold ${getTrendColor()}`}>
            {kpi.variancePercent > 0 ? '+' : ''}
            {kpi.variancePercent.toFixed(1)}%
          </span>
        </div>
        <div className='text-xs text-gray-400'>
          {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'}{' '}
          {Math.abs(
            ((kpi.value - kpi.previousValue) / kpi.previousValue) * 100
          ).toFixed(1)}
          % vs prev
        </div>
      </div>

      {/* Mini Sparkline */}
      <div className='mt-3 h-8'>
        <ResponsiveContainer
          width='100%'
          height='100%'>
          <LineChart data={kpi.history.slice(-6)}>
            <Line
              type='monotone'
              dataKey='value'
              stroke={
                kpi.status === 'good'
                  ? '#16a34a'
                  : kpi.status === 'warning'
                  ? '#ca8a04'
                  : '#dc2626'
              }
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface KPIDetailModalProps {
  kpi: KPI;
  onClose: () => void;
}

function KPIDetailModal({ kpi, onClose }: KPIDetailModalProps) {
  const chartData = kpi.history.map((h) => ({
    date: format(h.date, 'MMM yy'),
    Actual: h.value,
    Budget: h.budget,
  }));

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
        <div
          className='fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75'
          onClick={onClose}></div>

        <div className='inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg'>
          {/* Header */}
          <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                {kpi.name}
              </h3>
              <p className='mt-1 text-sm text-gray-500'>{kpi.description}</p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          {/* Content */}
          <div className='px-6 py-4'>
            {/* Current Value & Variance */}
            <div className='grid grid-cols-4 gap-4 mb-6'>
              <div className='p-4 bg-gray-50 rounded-lg'>
                <p className='text-xs text-gray-500'>Current Value</p>
                <p className='mt-1 text-2xl font-bold text-gray-900'>
                  {kpi.value.toLocaleString()}{' '}
                  <span className='text-sm text-gray-500'>{kpi.unit}</span>
                </p>
              </div>
              <div className='p-4 bg-gray-50 rounded-lg'>
                <p className='text-xs text-gray-500'>Budget</p>
                <p className='mt-1 text-2xl font-bold text-gray-900'>
                  {kpi.budget.toLocaleString()}{' '}
                  <span className='text-sm text-gray-500'>{kpi.unit}</span>
                </p>
              </div>
              <div className='p-4 bg-gray-50 rounded-lg'>
                <p className='text-xs text-gray-500'>Variance</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    kpi.variance >= 0 ? 'text-opportunity-600' : 'text-risk-600'
                  }`}>
                  {kpi.variance > 0 ? '+' : ''}
                  {kpi.variance.toLocaleString()}{' '}
                  <span className='text-sm'>{kpi.unit}</span>
                </p>
              </div>
              <div className='p-4 bg-gray-50 rounded-lg'>
                <p className='text-xs text-gray-500'>Variance %</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    kpi.variancePercent >= 0 && kpi.status === 'good'
                      ? 'text-opportunity-600'
                      : 'text-risk-600'
                  }`}>
                  {kpi.variancePercent > 0 ? '+' : ''}
                  {kpi.variancePercent.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Trend Chart */}
            <div className='mb-6'>
              <h4 className='text-sm font-medium text-gray-900 mb-3'>
                12-Month Trend
              </h4>
              <div className='h-64'>
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
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='Actual'
                      stroke='#2563eb'
                      strokeWidth={2}
                    />
                    <Line
                      type='monotone'
                      dataKey='Budget'
                      stroke='#94a3b8'
                      strokeWidth={2}
                      strokeDasharray='5 5'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Info */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='p-4 bg-blue-50 rounded-lg border border-blue-100'>
                <p className='text-sm font-medium text-blue-900'>Status</p>
                <p className='mt-1 text-lg capitalize text-blue-700'>
                  {kpi.status}
                </p>
              </div>
              <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                <p className='text-sm font-medium text-gray-900'>
                  Last Updated
                </p>
                <p className='mt-1 text-lg text-gray-700'>
                  {format(kpi.lastUpdated, 'PPp')}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700'>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
