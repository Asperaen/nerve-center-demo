import { Link } from 'react-router-dom';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { mockKPIs } from '../data/mockKPIs';
import { mockNews } from '../data/mockNews';
import { mockActions } from '../data/mockActions';
import { format } from 'date-fns';

export default function DashboardOverview() {
  // Get top KPIs to display
  const topKPIs = mockKPIs.slice(0, 4);

  // Get urgent news
  const urgentNews = mockNews
    .filter((n) => n.urgencyLevel === 'urgent')
    .slice(0, 3);

  // Get high priority actions
  const priorityActions = mockActions
    .filter((a) => a.priority === 'high' && a.status !== 'completed')
    .slice(0, 5);

  return (
    <div className='p-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Executive Dashboard
        </h1>
        <p className='mt-1 text-sm text-gray-500'>
          Last updated: {format(new Date(), 'PPpp')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-4 gap-6 mb-8'>
        {topKPIs.map((kpi) => (
          <div
            key={kpi.id}
            className='bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-500'>{kpi.name}</p>
                <p className='mt-2 text-3xl font-semibold text-gray-900'>
                  {kpi.value.toLocaleString()}
                  <span className='text-lg text-gray-500 ml-1'>{kpi.unit}</span>
                </p>
              </div>
              <div
                className={`ml-4 p-2 rounded-full ${
                  kpi.status === 'good'
                    ? 'bg-opportunity-100'
                    : kpi.status === 'warning'
                    ? 'bg-yellow-100'
                    : 'bg-risk-100'
                }`}>
                {kpi.trend === 'up' ? (
                  <ArrowTrendingUpIcon
                    className={`w-6 h-6 ${
                      kpi.status === 'good'
                        ? 'text-opportunity-600'
                        : 'text-gray-600'
                    }`}
                  />
                ) : (
                  <ArrowTrendingDownIcon
                    className={`w-6 h-6 ${
                      kpi.status === 'good'
                        ? 'text-opportunity-600'
                        : 'text-risk-600'
                    }`}
                  />
                )}
              </div>
            </div>
            <div className='mt-4'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-500'>vs Budget</span>
                <span
                  className={`font-medium ${
                    kpi.variance >= 0 && kpi.status === 'good'
                      ? 'text-opportunity-600'
                      : kpi.variance < 0
                      ? 'text-risk-600'
                      : 'text-gray-600'
                  }`}>
                  {kpi.variancePercent > 0 ? '+' : ''}
                  {kpi.variancePercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className='grid grid-cols-2 gap-6'>
        {/* Urgent News */}
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Urgent News & Alerts
            </h2>
            <Link
              to='/market-pulse'
              className='text-sm text-primary-600 hover:text-primary-700 font-medium'>
              View All →
            </Link>
          </div>
          <div className='space-y-4'>
            {urgentNews.map((news) => (
              <div
                key={news.id}
                className='flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                <div
                  className={`mt-0.5 p-1 rounded-full ${
                    news.riskOrOpportunity === 'risk'
                      ? 'bg-risk-100'
                      : 'bg-opportunity-100'
                  }`}>
                  {news.riskOrOpportunity === 'risk' ? (
                    <ExclamationTriangleIcon className='w-4 h-4 text-risk-600' />
                  ) : (
                    <CheckCircleIcon className='w-4 h-4 text-opportunity-600' />
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900'>
                    {news.headline}
                  </p>
                  <p className='mt-1 text-xs text-gray-500 line-clamp-2'>
                    {news.summary}
                  </p>
                  <div className='mt-2 flex items-center space-x-2'>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        news.impactLevel === 'high'
                          ? 'bg-red-100 text-red-800'
                          : news.impactLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                      {news.impactLevel.toUpperCase()} IMPACT
                    </span>
                    <span className='text-xs text-gray-400'>
                      {format(news.timestamp, 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Actions */}
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Priority Actions
            </h2>
            <Link
              to='/market-pulse'
              className='text-sm text-primary-600 hover:text-primary-700 font-medium'>
              View All →
            </Link>
          </div>
          <div className='space-y-3'>
            {priorityActions.map((action) => (
              <div
                key={action.id}
                className='flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900'>
                    {action.title}
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>{action.owner}</p>
                  <div className='mt-2 flex items-center space-x-2'>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        action.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : action.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                      {action.status.toUpperCase()}
                    </span>
                    <span className='text-xs text-gray-400'>
                      Due: {format(action.dueDate, 'MMM d')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
