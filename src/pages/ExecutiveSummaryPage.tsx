import { Link } from 'react-router-dom';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { mockKPIs } from '../data/mockKPIs';
import { mockNews } from '../data/mockNews';
import {
  mockOPWaterfallStages,
  mockBusinessEvents,
} from '../data/mockForecast';
import { mockActions } from '../data/mockActions';
import type { KPI, NewsItem, BusinessEvent, Action } from '../types';

export default function ExecutiveSummaryPage() {
  // Get key financial metrics
  const keyKPIs = mockKPIs.filter(
    (kpi) =>
      kpi.id === 'net-profit' ||
      kpi.id === 'operating-profit' ||
      kpi.id === 'revenue' ||
      kpi.id === 'gross-profit'
  );

  // Filter critical external news (urgent + high impact)
  const criticalNews = mockNews
    .filter(
      (news) => news.urgencyLevel === 'urgent' && news.impactLevel === 'high'
    )
    .slice(0, 5)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Get Full Year OP Forecast (last stage of waterfall)
  const fullYearOPForecast =
    mockOPWaterfallStages[mockOPWaterfallStages.length - 1];

  // Get critical business events (>$0.5M impact, exclude baseline)
  const criticalEvents = mockBusinessEvents
    .filter(
      (event) => event.type !== 'baseline' && Math.abs(event.impact) >= 0.5
    )
    .slice(0, 3);

  // Count high-priority actions
  const highPriorityActions = mockActions.filter(
    (action) => action.priority === 'high'
  );
  const urgentActions = highPriorityActions.filter(
    (action) =>
      action.status === 'todo' ||
      action.status === 'in-progress' ||
      action.status === 'reopen'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'concern':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircleIcon className='w-5 h-5 text-green-600' />;
      case 'warning':
        return <ExclamationTriangleIcon className='w-5 h-5 text-yellow-600' />;
      case 'concern':
        return <XCircleIcon className='w-5 h-5 text-red-600' />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className='w-5 h-5 text-green-600' />;
      case 'down':
        return <ArrowTrendingDownIcon className='w-5 h-5 text-red-600' />;
      default:
        return null;
    }
  };

  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>
            Executive Summary
          </h1>
          <p className='text-gray-600 text-lg'>
            Key business insights at a glance
          </p>
        </div>

        {/* Key Financial Metrics Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <ChartBarIcon className='w-6 h-6 text-primary-600' />
              Key Financial Metrics
            </h2>
            <Link
              to='/internal-pulse'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              View Details
              <ArrowRightIcon className='w-4 h-4' />
            </Link>
          </div>
          <p className='text-gray-600 mb-4'>
            Revenue at $2,305M (1.9% below budget), Net Profit at $156.3M (2.3%
            below budget), and Operating Profit at $198.5M (3.2% below budget).
            All metrics trending upward but below targets, with Gross Profit
            performing best at only 1.0% below budget.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {keyKPIs.map((kpi) => (
              <div
                key={kpi.id}
                className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300'>
                <div className='flex items-start justify-between mb-4'>
                  <h3 className='text-sm font-medium text-gray-600'>
                    {kpi.name}
                  </h3>
                  {getStatusIcon(kpi.status)}
                </div>
                <div className='mb-3'>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-3xl font-bold text-gray-900'>
                      ${kpi.value.toFixed(1)}
                    </span>
                    <span className='text-sm text-gray-500'>{kpi.unit}</span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {getTrendIcon(kpi.trend)}
                    <span
                      className={`text-sm font-semibold ${
                        kpi.variancePercent >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                      {kpi.variancePercent > 0 ? '+' : ''}
                      {kpi.variancePercent.toFixed(1)}% vs budget
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(
                      kpi.status
                    )}`}>
                    {kpi.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical External News Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <SparklesIcon className='w-6 h-6 text-primary-600' />
              Critical External News
            </h2>
            <Link
              to='/external-pulse'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              View All News
              <ArrowRightIcon className='w-4 h-4' />
            </Link>
          </div>
          <p className='text-gray-600 mb-4'>
            US tariff on Chinese-made EV connectors threatens $10M revenue
            impact, while China's rare earth export restrictions could increase
            costs by $5M. These urgent, high-impact developments require
            immediate supply chain adjustments and production shifts.
          </p>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {criticalNews.length > 0 ? (
              criticalNews.map((news) => (
                <div
                  key={news.id}
                  className={`bg-white rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-200 p-6 ${
                    news.riskOrOpportunity === 'risk'
                      ? 'border-red-200 bg-gradient-to-br from-red-50/50 to-white'
                      : 'border-green-200 bg-gradient-to-br from-green-50/50 to-white'
                  }`}>
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${
                            news.riskOrOpportunity === 'risk'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                          {news.riskOrOpportunity === 'risk'
                            ? 'RISK'
                            : 'OPPORTUNITY'}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${
                            news.impactLevel === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : news.impactLevel === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                          {news.impactLevel.toUpperCase()} IMPACT
                        </span>
                        <span className='px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 capitalize'>
                          {news.category}
                        </span>
                      </div>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        {news.headline}
                      </h3>
                      <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                        {news.summary}
                      </p>
                      {news.analyzingBy && (
                        <div className='flex items-center gap-2 mt-2 mb-2'>
                          <span className='text-xs text-gray-500'>
                            Analyzing:
                          </span>
                          <span className='text-xs font-medium text-primary-600'>
                            {news.analyzingBy}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <span>{formatRelativeTime(news.timestamp)}</span>
                    <span>{news.source}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className='col-span-2 bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500'>
                No critical external news at this time
              </div>
            )}
          </div>
        </div>

        {/* Financial Forecast Summary Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <CurrencyDollarIcon className='w-6 h-6 text-primary-600' />
              Financial Forecast Summary
            </h2>
            <Link
              to='/finance'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              View Full Forecast
              <ArrowRightIcon className='w-4 h-4' />
            </Link>
          </div>
          <p className='text-gray-600 mb-4'>
            Full-year OP forecast at $237.0M. Key drivers include AI Data Center
            acceleration (+$220M opportunity), 5G infrastructure growth (+$150M
            opportunity), and US EV connector tariff (-$120M risk) requiring
            production shift to Vietnam.
          </p>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Full Year OP Forecast Card */}
            <div className='bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200 shadow-lg p-6'>
              <h3 className='text-sm font-medium text-primary-800 mb-2'>
                Full Year OP Forecast
              </h3>
              <div className='mb-4'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-4xl font-bold text-primary-900'>
                    ${fullYearOPForecast.value.toFixed(1)}
                  </span>
                  <span className='text-lg text-primary-700'>M USD</span>
                </div>
                <p className='text-sm text-primary-700 mt-2'>
                  {fullYearOPForecast.label}
                </p>
              </div>
              <div className='text-xs text-primary-600'>
                Last updated: {formatRelativeTime(new Date())}
              </div>
            </div>

            {/* Critical Business Events */}
            {criticalEvents.map((event) => (
              <div
                key={event.id}
                className={`bg-white rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-200 p-6 ${
                  event.type === 'risk'
                    ? 'border-red-200'
                    : event.type === 'opportunity'
                    ? 'border-green-200'
                    : 'border-blue-200'
                }`}>
                <div className='flex items-center gap-2 mb-3'>
                  {event.impact >= 0 ? (
                    <ArrowTrendingUpIcon className='w-5 h-5 text-green-600' />
                  ) : (
                    <ArrowTrendingDownIcon className='w-5 h-5 text-red-600' />
                  )}
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {event.name}
                  </h3>
                </div>
                <div className='mb-3'>
                  <span
                    className={`text-2xl font-bold ${
                      event.impact >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {event.impact > 0 ? '+' : ''}$
                    {Math.abs(event.impact).toFixed(1)}M
                  </span>
                  <span className='text-sm text-gray-600 ml-2'>impact</span>
                </div>
                <ul className='text-sm text-gray-600 space-y-1'>
                  {event.implications.slice(0, 2).map((impl, idx) => (
                    <li
                      key={idx}
                      className='flex items-start gap-2'>
                      <span className='text-primary-600 mt-1'>•</span>
                      <span>{impl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Summary Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <ClipboardDocumentListIcon className='w-6 h-6 text-primary-600' />
              Action Items Requiring Attention
            </h2>
            <Link
              to='/action-tracker'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              View All Actions
              <ArrowRightIcon className='w-4 h-4' />
            </Link>
          </div>
          <p className='text-gray-600 mb-4'>
            {urgentActions.length} urgent high-priority actions requiring
            immediate attention, including Vietnam production shift for EV
            connectors, securing alternative rare earth suppliers, and
            accelerating Nvidia GB300 program engagement to capture data center
            growth.
          </p>
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
              <div className='text-center p-4 bg-red-50 rounded-lg border border-red-200'>
                <div className='text-3xl font-bold text-red-600 mb-1'>
                  {urgentActions.length}
                </div>
                <div className='text-sm font-medium text-red-800'>
                  Urgent High-Priority Actions
                </div>
              </div>
              <div className='text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
                <div className='text-3xl font-bold text-yellow-600 mb-1'>
                  {highPriorityActions.length}
                </div>
                <div className='text-sm font-medium text-yellow-800'>
                  Total High-Priority Actions
                </div>
              </div>
              <div className='text-center p-4 bg-blue-50 rounded-lg border border-blue-200'>
                <div className='text-3xl font-bold text-blue-600 mb-1'>
                  {mockActions.length}
                </div>
                <div className='text-sm font-medium text-blue-800'>
                  Total Actions
                </div>
              </div>
            </div>
            {urgentActions.length > 0 && (
              <div className='space-y-3'>
                <h4 className='text-sm font-semibold text-gray-700 mb-2'>
                  Top Urgent Actions:
                </h4>
                {urgentActions.slice(0, 3).map((action) => (
                  <div
                    key={action.id}
                    className='flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${
                            action.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : action.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                          {action.priority.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${
                            action.status === 'todo'
                              ? 'bg-blue-100 text-blue-800'
                              : action.status === 'in-progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : action.status === 'reopen'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                          {action.status.replace('-', ' ')}
                        </span>
                      </div>
                      <h5 className='text-sm font-medium text-gray-900'>
                        {action.title}
                      </h5>
                      <p className='text-xs text-gray-600 mt-1'>
                        Owner: {action.owner}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
