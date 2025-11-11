import { Link } from 'react-router-dom';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  ChartBarIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { mockNews } from '../data/mockNews';
import { mockActions } from '../data/mockActions';
import { internalPulseColumns } from '../data/mockInternalPulse';
import { mockKPIs } from '../data/mockKPIs';
import type { PulseMetric } from '../types';

export default function ExecutiveSummaryPage() {
  // Get Operation metrics from Internal Pulse (UPPH, OEE, Gold price)
  const operationColumn = internalPulseColumns.find(
    (col) => col.type === 'operation'
  );

  const getOperationMetrics = (): PulseMetric[] => {
    if (!operationColumn) return [];

    const metrics: PulseMetric[] = [];

    // Get COPQ from Quality section
    const qualitySection = operationColumn.sections.find(
      (s) => s.title === 'Quality'
    );
    if (qualitySection) {
      const copq = qualitySection.metrics.find((m) => m.id === 'copq');
      if (copq) metrics.push(copq);
    }

    // Get UPPH and OEE from MFG section
    const mfgSection = operationColumn.sections.find((s) => s.title === 'MFG');
    if (mfgSection) {
      const upph = mfgSection.metrics.find((m) => m.id === 'upph');
      const oee = mfgSection.metrics.find((m) => m.id === 'oee');
      if (upph) metrics.push(upph);
      if (oee) metrics.push(oee);
    }

    // Get Gold price from Procurement section
    const procurementSection = operationColumn.sections.find(
      (s) => s.title === 'Procurement'
    );
    if (procurementSection) {
      const gold = procurementSection.metrics.find(
        (m) => m.id === 'gold-material'
      );
      if (gold) metrics.push(gold);
    }

    // Get Inventory Turnover rate from Supply Chain section
    const supplyChainSection = operationColumn.sections.find(
      (s) => s.title === 'Supply Chain'
    );
    if (supplyChainSection) {
      const inventoryTurnover = supplyChainSection.metrics.find(
        (m) => m.id === 'inventory-turnover'
      );
      if (inventoryTurnover) metrics.push(inventoryTurnover);
    }

    return metrics;
  };

  const keyOperationMetrics = getOperationMetrics();

  // Get Financial and Topline KPIs from Internal Pulse
  const getFinancialAndToplineKPIs = (): PulseMetric[] => {
    const metrics: PulseMetric[] = [];

    // Get Financial column KPIs
    const financialColumn = internalPulseColumns.find(
      (col) => col.type === 'financial'
    );
    if (financialColumn) {
      // Get P&L metrics (Net Profit, Operating Profit)
      const plSection = financialColumn.sections.find((s) => s.title === 'P&L');
      if (plSection) {
        const netProfit = plSection.metrics.find((m) => m.id === 'net-profit');
        const operatingProfit = plSection.metrics.find(
          (m) => m.id === 'operating-profit'
        );
        if (netProfit) metrics.push(netProfit);
        if (operatingProfit) metrics.push(operatingProfit);
      }

      // Get Working Capital metrics
      const workingCapitalSection = financialColumn.sections.find(
        (s) => s.title === 'Working Capital'
      );
      if (workingCapitalSection) {
        const workingCapital = workingCapitalSection.metrics.find(
          (m) => m.id === 'working-capital'
        );
        if (workingCapital) metrics.push(workingCapital);
      }
    }

    // Get Topline column KPIs (Total Revenue)
    const toplineColumn = internalPulseColumns.find(
      (col) => col.type === 'topline'
    );
    if (toplineColumn) {
      const revenueSection = toplineColumn.sections.find(
        (s) => s.title === 'Revenue'
      );
      if (revenueSection) {
        const totalRevenue = revenueSection.metrics.find(
          (m) => m.id === 'total-revenue'
        );
        if (totalRevenue) metrics.push(totalRevenue);
      }
    }

    return metrics;
  };

  const financialAndToplineKPIs = getFinancialAndToplineKPIs();

  // Filter critical external news (urgent + high impact)
  const criticalNews = mockNews
    .filter(
      (news) => news.urgencyLevel === 'urgent' && news.impactLevel === 'high'
    )
    .slice(0, 5)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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

  // Helper to format metric value
  const formatMetricValue = (metric: PulseMetric): string => {
    // For UPPH and OEE, try to get actual value from mockKPIs as fallback
    if (
      metric.value === undefined &&
      (metric.id === 'upph' || metric.id === 'oee')
    ) {
      const kpiData = mockKPIs.find((kpi) => kpi.id === metric.id);
      if (kpiData) {
        if (metric.id === 'oee') {
          return `${kpiData.value.toFixed(1)}%`;
        }
        return `${kpiData.value.toFixed(1)} ${kpiData.unit}`;
      }
    }

    // For Inventory Turnover, use valuePercent as the actual rate value
    if (
      metric.id === 'inventory-turnover' &&
      metric.valuePercent !== undefined
    ) {
      return `${metric.valuePercent.toFixed(1)} times/year`;
    }

    if (metric.value !== undefined) {
      if (metric.valuePercent !== undefined) {
        return `$${metric.value.toFixed(1)}M (${metric.valuePercent}%)`;
      }
      // Format with comma for thousands
      return `${metric.value.toLocaleString('en-US')} ${metric.unit || ''}`;
    }
    if (metric.valuePercent !== undefined) {
      return `${metric.valuePercent}%`;
    }
    // For metrics without value, show comparison if available
    if (metric.comparisons?.vsLastYear) {
      const percent = metric.comparisons.vsLastYear.percent;
      return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}% vs last year`;
    }
    return 'N/A';
  };

  // Helper to determine status from comparisons
  const getMetricStatus = (
    metric: PulseMetric
  ): 'good' | 'warning' | 'concern' => {
    if (!metric.comparisons) return 'good';

    // Check if any comparison shows negative trend
    const hasNegative = Object.values(metric.comparisons).some(
      (comp) => comp.percent < 0
    );

    if (hasNegative) {
      // Check severity
      const worstComparison = Math.min(
        ...Object.values(metric.comparisons).map((c) => c.percent)
      );
      if (worstComparison < -5) return 'concern';
      return 'warning';
    }

    return 'good';
  };

  // Helper to determine trend from comparisons
  const getMetricTrend = (metric: PulseMetric): 'up' | 'down' | 'flat' => {
    if (metric.comparisons?.vsLastRefresh) {
      return metric.comparisons.vsLastRefresh.percent >= 0 ? 'up' : 'down';
    }
    if (metric.comparisons?.vsLastYear) {
      return metric.comparisons.vsLastYear.percent >= 0 ? 'up' : 'down';
    }
    return 'flat';
  };

  // Helper to get comparison text for display
  const getComparisonText = (metric: PulseMetric): string => {
    if (metric.comparisons?.vsLastYear) {
      const percent = metric.comparisons.vsLastYear.percent;
      return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}% vs last year`;
    }
    if (metric.comparisons?.vsLastRefresh) {
      const percent = metric.comparisons.vsLastRefresh.percent;
      return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}% vs last refresh`;
    }
    return 'No comparison data';
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

        {/* Key Leading parameter Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <ChartBarIcon className='w-6 h-6 text-primary-600' />
              Operational Leading Parameters
            </h2>
            <Link
              to='/internal-pulse'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              Internal Pulse
              <ArrowRightIcon className='w-4 h-4' />
            </Link>
          </div>
          <p className='text-gray-600 mb-4'>
            Critical leading operational parameters directly impact operational
            performance and profitability.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
            {keyOperationMetrics.map((metric) => {
              const status = getMetricStatus(metric);
              const trend = getMetricTrend(metric);
              const valueText = formatMetricValue(metric);
              const comparisonText = getComparisonText(metric);

              return (
                <div
                  key={metric.id}
                  className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-4 hover:shadow-xl transition-shadow duration-300 min-w-0 relative'>
                  <div className='flex items-start justify-between mb-3 gap-2'>
                    <h3 className='text-xs font-medium text-gray-600 break-words flex-1 min-w-0'>
                      {metric.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border whitespace-nowrap flex-shrink-0 ${getStatusColor(
                        status
                      )}`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                  <div className='mb-3 min-w-0'>
                    <div className='break-words'>
                      <span className='text-2xl xl:text-xl 2xl:text-2xl font-bold text-gray-900 leading-tight'>
                        {valueText}
                      </span>
                    </div>
                    {metric.subMetrics && metric.id === 'gold-material' && (
                      <div className='mt-2 text-xs text-gray-500 break-words'>
                        Market: $
                        {metric.subMetrics
                          .find((m) => m.name.includes('Market price'))
                          ?.value.toLocaleString('en-US') || 'N/A'}
                        /oz
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-1.5 min-w-0'>
                    {getTrendIcon(trend)}
                    <span
                      className={`text-xs font-semibold truncate ${
                        metric.comparisons?.vsLastYear?.percent !== undefined
                          ? metric.comparisons.vsLastYear.percent >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                          : 'text-gray-600'
                      }`}
                      title={comparisonText}>
                      {comparisonText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical External News Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <SparklesIcon className='w-6 h-6 text-primary-600' />
              Critical News
            </h2>
            <Link
              to='/external-pulse'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              External Pulse
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

        {/* Financial & Topline KPIs Section */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
              <ChartBarIcon className='w-6 h-6 text-primary-600' />
              Financial & Topline KPIs
            </h2>
            <Link
              to='/internal-pulse'
              className='text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm'>
              Internal Pulse
              <ArrowRightIcon className='w-4 h-4' />
            </Link>
          </div>
          <p className='text-gray-600 mb-4'>
            Key financial and topline KPIs updated after monthly review
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {financialAndToplineKPIs.map((metric) => {
              const status = getMetricStatus(metric);
              const trend = getMetricTrend(metric);
              const valueText = formatMetricValue(metric);
              const comparisonText = getComparisonText(metric);

              return (
                <div
                  key={metric.id}
                  className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300'>
                  <div className='flex items-start justify-between mb-3 gap-2'>
                    <h3 className='text-sm font-medium text-gray-600 flex-1 min-w-0'>
                      {metric.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium border whitespace-nowrap flex-shrink-0 ${getStatusColor(
                        status
                      )}`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                  <div className='mb-4 min-w-0'>
                    <div className='break-words'>
                      <span className='text-3xl font-bold text-gray-900 leading-tight'>
                        {valueText}
                      </span>
                    </div>
                    {metric.valuePercent !== undefined &&
                      metric.id !== 'working-capital' && (
                        <div className='mt-1 text-xs text-gray-500'>
                          {metric.valuePercent.toFixed(1)}% of revenue
                        </div>
                      )}
                  </div>
                  <div className='flex items-center gap-1.5 min-w-0 mb-3'>
                    {getTrendIcon(trend)}
                    <span
                      className={`text-xs font-semibold truncate ${
                        metric.comparisons?.vsLastYear?.percent !== undefined
                          ? metric.comparisons.vsLastYear.percent >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                          : metric.comparisons?.vsLastRefresh?.percent !==
                            undefined
                          ? metric.comparisons.vsLastRefresh.percent >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                          : 'text-gray-600'
                      }`}
                      title={comparisonText}>
                      {comparisonText}
                    </span>
                  </div>
                </div>
              );
            })}
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
              Action Tracker
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
