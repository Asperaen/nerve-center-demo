import { useState, useMemo } from 'react';
import {
  mockNPDeviationStages,
  mockNPDeviationKeyCallOut,
  mockProductFamilyData,
  mockProductFamilyTotals,
  mockCostImpactData,
  mockCostComponentTotals,
  mockTotalCostImpact,
  mockCostImpactKeyCallOut,
  mockMVABreakdownStages,
  mockMVABreakdownKeyCallOut,
} from '../data/mockForecast';
import {
  ArrowLeftIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Legend,
} from 'recharts';
import CreateActionModal from '../components/CreateActionModal';
import type {
  NavigationLayer,
  BreadcrumbItem,
  NPDeviationStageType,
} from '../types';

export default function FinanceReviewPage() {
  const [currentLayer, setCurrentLayer] = useState<NavigationLayer>(1);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);

  // Navigation handlers
  const navigateToLayer = (
    layer: NavigationLayer,
    breadcrumbLabel?: string
  ) => {
    if (breadcrumbLabel) {
      setBreadcrumbs((prev) => [
        ...prev,
        {
          label: breadcrumbLabel,
          layer,
          onClick: () => navigateToBreadcrumb(layer),
        },
      ]);
    }
    setCurrentLayer(layer);
  };

  // Navigate to a specific breadcrumb (used when clicking breadcrumb links)
  const navigateToBreadcrumb = (targetLayer: NavigationLayer) => {
    // Use functional update to access current breadcrumbs state
    setBreadcrumbs((prevBreadcrumbs) => {
      // Find the breadcrumb index for this layer
      const breadcrumbIndex = prevBreadcrumbs.findIndex(
        (crumb) => crumb.layer === targetLayer
      );

      if (breadcrumbIndex !== -1) {
        // Trim breadcrumbs to only include up to this point
        return prevBreadcrumbs.slice(0, breadcrumbIndex + 1);
      }
      return prevBreadcrumbs;
    });
    setCurrentLayer(targetLayer);
  };

  const navigateBack = () => {
    setBreadcrumbs((prevBreadcrumbs) => {
      if (prevBreadcrumbs.length > 0) {
        const newBreadcrumbs = [...prevBreadcrumbs];
        newBreadcrumbs.pop();
        // Navigate to previous layer (currentLayer - 1)
        setCurrentLayer((prevLayer) => {
          const previousLayer = (prevLayer - 1) as NavigationLayer;
          return previousLayer >= 1 ? previousLayer : 1;
        });
        return newBreadcrumbs;
      } else {
        setCurrentLayer(1);
        return [];
      }
    });
  };

  const handleStageClick = (stageType: NPDeviationStageType) => {
    const stageLabels: Partial<Record<NPDeviationStageType, string>> = {
      'budget-np': 'Budget NP',
      'vol-impact': 'Product Analysis',
      'price-impact': 'Product Analysis',
      'cost-impact': 'Product Analysis',
    };
    navigateToLayer(2, stageLabels[stageType] || 'Product Analysis');
  };

  const handleCostImpactClick = () => {
    navigateToLayer(3, 'Cost Impact Breakdown');
  };

  const handleLaborMOHClick = () => {
    navigateToLayer(4, 'MVA Breakdown');
  };

  // Prepare chart data for Layer 1 (NP Deviation)
  const npDeviationChartData = useMemo(() => {
    return mockNPDeviationStages.map((stage, index) => {
      const prevValue = index > 0 ? mockNPDeviationStages[index - 1].value : 0;
      const currentValue = stage.value;
      const delta =
        stage.delta ?? (index === 0 ? currentValue : currentValue - prevValue);

      const isBaseline = stage.type === 'baseline';
      const barValue = isBaseline ? currentValue : delta;
      const baselineValue = isBaseline ? 0 : prevValue;

      return {
        ...stage,
        name: stage.label,
        label: stage.label,
        cumulativeValue: currentValue,
        delta,
        baselineValue,
        barValue,
        isPositive: delta >= 0,
        isClickable: stage.isClickable,
      };
    });
  }, []);

  // Prepare chart data for Layer 4 (MVA Breakdown)
  const mvaChartData = useMemo(() => {
    return mockMVABreakdownStages.map((stage, index) => {
      const prevValue = index > 0 ? mockMVABreakdownStages[index - 1].value : 0;
      const currentValue = stage.value;
      const delta =
        stage.delta ?? (index === 0 ? currentValue : currentValue - prevValue);

      const isBaseline = stage.type === 'baseline';
      const barValue = isBaseline ? currentValue : delta;
      const baselineValue = isBaseline ? 0 : prevValue;

      return {
        ...stage,
        name: stage.label,
        label: stage.label,
        cumulativeValue: currentValue,
        delta,
        baselineValue,
        barValue,
        isPositive: delta >= 0,
      };
    });
  }, []);

  // Render Layer 1: NP Deviation Breakdown
  const renderLayer1 = () => (
    <div className='space-y-8'>
      {/* Page Title */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-2'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Finance Review - Q4 2025
          </h1>
          <button
            onClick={() => setIsCreateActionModalOpen(true)}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
            <PlusIcon className='w-5 h-5' />
            Create Action
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* NP Deviation Waterfall Chart */}
        <div className='lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-8 hover:shadow-xl transition-shadow duration-300'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                NP Deviation Breakdown
              </h2>
              <p className='text-sm text-gray-500 mt-1 flex items-center gap-1'>
                <ArrowRightIcon className='w-4 h-4 text-blue-500' />
                <span>
                  Click on Budget NP, Vol. impact, Price impact, or Cost impact
                  to drill down
                </span>
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-green-500'></div>
                <span className='text-sm text-gray-700'>Favourable</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-red-500'></div>
                <span className='text-sm text-gray-700'>Adverse</span>
              </div>
            </div>
          </div>

          <div className='h-96'>
            <ResponsiveContainer
              width='100%'
              height='100%'>
              <ComposedChart data={npDeviationChartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='label'
                  angle={-15}
                  textAnchor='end'
                  height={120}
                  style={{ fontSize: '11px' }}
                />
                <YAxis
                  style={{ fontSize: '12px' }}
                  label={{
                    value: 'Net Profit (Mn USD)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '12px' },
                  }}
                />
                <Tooltip
                  formatter={(
                    value: number,
                    _name: string,
                    props: {
                      payload?: {
                        [key: string]: string | number | boolean | undefined;
                        cumulativeValue?: number;
                        delta?: number;
                        label?: string;
                        isClickable?: boolean;
                      };
                    }
                  ) => {
                    const payload = props.payload;
                    const cumulative = payload?.cumulativeValue ?? value;
                    const delta = payload?.delta;
                    const isClickable = payload?.isClickable;

                    const tooltipLines: string[] = [
                      `${payload?.label ?? 'Stage'}: $${cumulative.toFixed(
                        1
                      )}M`,
                    ];

                    if (delta !== undefined && delta !== cumulative) {
                      tooltipLines.push(
                        `Change: ${delta > 0 ? '+' : ''}$${delta.toFixed(1)}M`
                      );
                    }

                    if (isClickable) {
                      tooltipLines.push('Deep dive →');
                    }

                    return tooltipLines.join('\n');
                  }}
                />
                <Legend />
                <Bar
                  dataKey='baselineValue'
                  stackId='a'
                  fill='transparent'
                />
                <Bar
                  dataKey='barValue'
                  stackId='a'
                  name='NP Deviation'>
                  {mockNPDeviationStages.map((stage, index) => {
                    const isBaseline = stage.type === 'baseline';
                    const isPositive = stage.type === 'positive';

                    let fillColor = '#6b7280'; // grey for baseline
                    if (!isBaseline) {
                      fillColor = isPositive ? '#10b981' : '#ef4444'; // green for positive, red for negative
                    }

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fillColor}
                        style={{
                          cursor: stage.isClickable ? 'pointer' : 'default',
                          stroke: stage.isClickable ? '#3b82f6' : 'none',
                          strokeWidth: stage.isClickable ? 2 : 0,
                          opacity: stage.isClickable ? 1 : 0.9,
                        }}
                        onClick={() => {
                          if (stage.isClickable) {
                            handleStageClick(stage.stage);
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (stage.isClickable) {
                            e.currentTarget.style.opacity = '0.8';
                            e.currentTarget.style.strokeWidth = '3';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (stage.isClickable) {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.strokeWidth = '2';
                          }
                        }}
                      />
                    );
                  })}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Call Out Section */}
        <div className='lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-shadow duration-300'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-bold text-gray-900'>Key Call Out</h2>
            <span className='px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border-2 border-purple-400 shadow-md shadow-purple-200/50 flex items-center gap-1.5'>
              <span className='text-sm'>✨</span>
              <span>AI</span>
            </span>
          </div>
          <div className='space-y-3'>
            <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
              {mockNPDeviationKeyCallOut.bulletPoints.map((point, index) => (
                <li
                  key={index}
                  className='text-sm'>
                  {point}
                </li>
              ))}
            </ul>
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <p className='text-sm text-gray-700 leading-relaxed'>
                {mockNPDeviationKeyCallOut.rootCauseAnalysis}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Layer 2: Product Analysis
  const renderLayer2 = () => {
    const sortedData = [...mockProductFamilyData].sort(
      (a, b) => b.gpGapToBudget - a.gpGapToBudget
    );
    const impactCards = [
      {
        label: 'Volume Impact',
        value: mockProductFamilyTotals.volImpact,
        number: 1,
        color: 'green',
      },
      {
        label: 'Price Impact',
        value: mockProductFamilyTotals.priceImpact,
        number: 2,
        color: 'green',
      },
      {
        label: 'Cost Impact',
        value: mockProductFamilyTotals.costImpact,
        number: 3,
        color: 'red',
        onClick: handleCostImpactClick,
      },
      {
        label: 'Mix Impact',
        value: mockProductFamilyTotals.mixImpact,
        number: 4,
        color: 'red',
      },
    ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

    return (
      <div className='space-y-6 animate-in slide-in-from-right duration-300'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              onClick={navigateBack}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <ArrowLeftIcon className='w-6 h-6 text-gray-600' />
            </button>
            <h1 className='text-3xl font-bold text-gray-900'>
              Product Analysis
            </h1>
          </div>
          <div className='flex items-center gap-2'>
            <InformationCircleIcon className='w-5 h-5 text-gray-400' />
            <span className='text-sm text-gray-600'>2025 Jan to May</span>
          </div>
        </div>

        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <span>NP Deviation</span>
            {breadcrumbs.map((crumb, index) => (
              <div
                key={index}
                className='flex items-center gap-2'>
                <ChevronRightIcon className='w-4 h-4' />
                <button
                  onClick={crumb.onClick}
                  className='hover:text-gray-900 transition-colors'>
                  {crumb.label}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Overall Performance Summary */}
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200'>
          <p className='text-gray-700 leading-relaxed'>
            Gross Profit (GP) actuals exceeded budget by 2,350.0 (actual:
            35,459.2 vs. budget: 33,109.2). Revenue actuals also surpassed
            budget by 25.5 (actual: 150.1 vs. budget: 124.5). Volume impact
            (+8,807.7) and price impact (+3,662.22) were the main positive
            drivers, while cost impact (-7,323.21) and mix impact (-2,796.6)
            were negative contributors. Product Fam 12 and 26 contributed most
            to positive GP gap to budget.
          </p>
        </div>

        {/* OP Impact Overview Cards */}
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            OP Impact Overview (K, USD) Sorted by GP Gap to Budget
          </h3>
          <div className='grid grid-cols-4 gap-4'>
            {impactCards.map((card, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl border-2 p-6 shadow-md hover:shadow-lg transition-all duration-200 relative ${
                  card.onClick
                    ? 'cursor-pointer border-blue-400 hover:border-blue-500 hover:shadow-xl hover:scale-105 bg-blue-50/30 group'
                    : 'border-gray-200'
                }`}
                onClick={card.onClick}>
                {card.onClick && (
                  <div className='absolute top-2 right-2 flex items-center gap-2'>
                    <span className='text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 rounded-full shadow-lg border-2 border-blue-400 flex items-center gap-1.5 hover:shadow-xl hover:scale-105 transition-all'>
                      <span>Deep Dive</span>
                      <ArrowRightIcon className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                    </span>
                  </div>
                )}
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-xs font-semibold text-gray-500'>
                    {card.number}
                  </span>
                  {!card.onClick && (
                    <button className='text-xs text-gray-500 hover:text-gray-700'>
                      Sort
                    </button>
                  )}
                </div>
                <div
                  className={`text-3xl font-bold mb-2 ${
                    card.color === 'green' ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {card.value > 0 ? '+' : ''}
                  {card.value.toFixed(1)}
                </div>
                <div className='text-sm text-gray-600'>{card.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Table */}
        <div className='bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                    Product Family
                  </th>
                  <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                    GP Actual
                  </th>
                  <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                    GP Budget
                  </th>
                  <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                    GP Gap to Budget
                  </th>
                  <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                    <span className='text-xs'>1</span> Vol Impact
                  </th>
                  <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                    <span className='text-xs'>2</span> Price Impact
                  </th>
                  <th
                    className='text-right py-3 px-4 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-blue-50 transition-colors border-2 border-blue-300 bg-blue-50/50 relative group'
                    onClick={handleCostImpactClick}>
                    <div className='flex items-center justify-end gap-1'>
                      <span className='text-xs'>3</span>
                      <span>Cost Impact</span>
                      <ArrowRightIcon className='w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform' />
                    </div>
                    <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500'></span>
                  </th>
                  <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                    <span className='text-xs'>4</span> Mix Impact
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {sortedData.map((row) => (
                  <tr
                    key={row.id}
                    className='hover:bg-gray-50 transition-colors'>
                    <td className='py-3 px-4 text-sm font-medium text-gray-900'>
                      {row.productFamily}
                    </td>
                    <td className='py-3 px-4 text-sm text-right text-gray-700'>
                      {row.gpActual.toFixed(1)}
                    </td>
                    <td className='py-3 px-4 text-sm text-right text-gray-700'>
                      {row.gpBudget.toFixed(1)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        row.gpGapToBudget >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                      {row.gpGapToBudget >= 0 ? '+' : ''}
                      {row.gpGapToBudget.toFixed(1)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right ${
                        row.volImpact >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {row.volImpact >= 0 ? '+' : ''}
                      {row.volImpact.toFixed(1)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right ${
                        row.priceImpact >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {row.priceImpact >= 0 ? '+' : ''}
                      {row.priceImpact.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right cursor-pointer hover:bg-blue-50 transition-colors border-l-2 border-blue-300 bg-blue-50/30 relative group ${
                        row.costImpact >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                      onClick={handleCostImpactClick}>
                      <div className='flex items-center justify-end gap-1'>
                        <span>
                          {row.costImpact >= 0 ? '+' : ''}
                          {row.costImpact.toFixed(2)}
                        </span>
                        <ArrowRightIcon className='w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity' />
                      </div>
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right ${
                        row.mixImpact >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {row.mixImpact >= 0 ? '+' : ''}
                      {row.mixImpact.toFixed(1)}
                    </td>
                  </tr>
                ))}
                <tr className='bg-gray-50 font-semibold'>
                  <td className='py-3 px-4 text-sm font-bold text-gray-900'>
                    {mockProductFamilyTotals.productFamily}
                  </td>
                  <td className='py-3 px-4 text-sm text-right text-gray-900'>
                    {mockProductFamilyTotals.gpActual.toFixed(1)}
                  </td>
                  <td className='py-3 px-4 text-sm text-right text-gray-900'>
                    {mockProductFamilyTotals.gpBudget.toFixed(1)}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right ${
                      mockProductFamilyTotals.gpGapToBudget >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    {mockProductFamilyTotals.gpGapToBudget >= 0 ? '+' : ''}
                    {mockProductFamilyTotals.gpGapToBudget.toFixed(1)}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right ${
                      mockProductFamilyTotals.volImpact >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    {mockProductFamilyTotals.volImpact >= 0 ? '+' : ''}
                    {mockProductFamilyTotals.volImpact.toFixed(1)}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right ${
                      mockProductFamilyTotals.priceImpact >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    {mockProductFamilyTotals.priceImpact >= 0 ? '+' : ''}
                    {mockProductFamilyTotals.priceImpact.toFixed(2)}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right ${
                      mockProductFamilyTotals.costImpact >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    {mockProductFamilyTotals.costImpact >= 0 ? '+' : ''}
                    {mockProductFamilyTotals.costImpact.toFixed(2)}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right ${
                      mockProductFamilyTotals.mixImpact >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    {mockProductFamilyTotals.mixImpact >= 0 ? '+' : ''}
                    {mockProductFamilyTotals.mixImpact.toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Layer 3: Cost Impact Breakdown
  const renderLayer3 = () => {
    const sortedData = [...mockCostImpactData].sort(
      (a, b) => a.costImpact - b.costImpact
    );

    return (
      <div className='space-y-6 animate-in slide-in-from-right duration-300'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              onClick={navigateBack}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <ArrowLeftIcon className='w-6 h-6 text-gray-600' />
            </button>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Cost Impact Breakdown (USD)
              </h1>
              <p className='text-sm text-gray-600 mt-1'>
                Pilot demo with SBU1 YTM Financials
              </p>
            </div>
          </div>
          <div className='text-sm text-gray-600'>
            Sorted by: <span className='font-semibold'>Cost Impact (K)</span>
          </div>
        </div>

        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <span>NP Deviation</span>
            {breadcrumbs.map((crumb, index) => (
              <div
                key={index}
                className='flex items-center gap-2'>
                <ChevronRightIcon className='w-4 h-4' />
                <button
                  onClick={crumb.onClick}
                  className='hover:text-gray-900 transition-colors'>
                  {crumb.label}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Cost Component Totals Section */}
        <div className='bg-white rounded-xl border border-gray-200 shadow-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Cost Component Gaps (Grouped)
          </h3>
          <div className='grid grid-cols-4 gap-4'>
            <div className='text-center p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <div className='text-sm font-medium text-gray-700 mb-2'>
                Material
              </div>
              <div
                className={`text-2xl font-bold ${
                  mockCostComponentTotals.material >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                {mockCostComponentTotals.material >= 0 ? '+' : ''}
                {mockCostComponentTotals.material.toLocaleString()}
              </div>
            </div>
            <div
              className='text-center p-4 bg-blue-50/50 rounded-lg border-2 border-blue-400 cursor-pointer hover:bg-blue-100 hover:border-blue-500 hover:shadow-lg hover:scale-105 transition-all relative group'
              onClick={handleLaborMOHClick}>
              <div className='absolute top-2 right-2 flex items-center gap-2'>
                <span className='text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 rounded-full shadow-lg border-2 border-blue-400 flex items-center gap-1.5 group-hover:shadow-xl group-hover:scale-105 transition-all'>
                  <span>Deep Dive</span>
                  <ArrowRightIcon className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                </span>
              </div>
              <div className='text-sm font-medium text-gray-700 mb-2'>
                <span className='group-hover:text-blue-600 transition-colors font-semibold'>
                  Labor
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  mockCostComponentTotals.labor >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                {mockCostComponentTotals.labor >= 0 ? '+' : ''}
                {mockCostComponentTotals.labor.toLocaleString()}
              </div>
            </div>
            <div
              className='text-center p-4 bg-blue-50/50 rounded-lg border-2 border-blue-400 cursor-pointer hover:bg-blue-100 hover:border-blue-500 hover:shadow-lg hover:scale-105 transition-all relative group'
              onClick={handleLaborMOHClick}>
              <div className='absolute top-2 right-2 flex items-center gap-2'>
                <span className='text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 rounded-full shadow-lg border-2 border-blue-400 flex items-center gap-1.5 group-hover:shadow-xl group-hover:scale-105 transition-all'>
                  <span>Deep Dive</span>
                  <ArrowRightIcon className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                </span>
              </div>
              <div className='text-sm font-medium text-gray-700 mb-2'>
                <span className='group-hover:text-blue-600 transition-colors font-semibold'>
                  MOH
                </span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  mockCostComponentTotals.moh >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                {mockCostComponentTotals.moh >= 0 ? '+' : ''}
                {mockCostComponentTotals.moh.toLocaleString()}
              </div>
            </div>
            <div className='text-center p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <div className='text-sm font-medium text-gray-700 mb-2'>
                Outsource
              </div>
              <div
                className={`text-2xl font-bold ${
                  mockCostComponentTotals.outsource >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                {mockCostComponentTotals.outsource >= 0 ? '+' : ''}
                {mockCostComponentTotals.outsource.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Main Table */}
          <div className='lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Product Family
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                      Cost Impact (K)
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                      Vol Actual (K, pcs)
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                      Unit Cost Actual
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                      Unit Cost Budget
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                      Unit Cost Gap
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700 border-l-2 border-gray-300'>
                      Unit Cost Material Gap
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                      Unit Cost Labor Gap
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                      Unit Cost MOH Gap
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                      Unit Cost Outsource Gap
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {sortedData.map((row) => (
                    <tr
                      key={row.id}
                      className='hover:bg-gray-50 transition-colors'>
                      <td className='py-3 px-4 text-sm font-medium text-gray-900'>
                        {row.productFamily}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right font-semibold ${
                          row.costImpact >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                        {row.costImpact >= 0 ? '+' : ''}
                        {row.costImpact.toFixed(2)}
                      </td>
                      <td className='py-3 px-4 text-sm text-right text-gray-700'>
                        {row.volActual.toLocaleString()}
                      </td>
                      <td className='py-3 px-4 text-sm text-right text-gray-700'>
                        {row.unitCostActual.toFixed(2)}
                      </td>
                      <td className='py-3 px-4 text-sm text-right text-gray-700'>
                        {row.unitCostBudget.toFixed(2)}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right font-semibold ${
                          row.unitCostGap >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                        {row.unitCostGap >= 0 ? '+' : ''}
                        {row.unitCostGap.toFixed(2)}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right border-l-2 border-gray-300 ${
                          row.unitCostMaterialGap >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                        {row.unitCostMaterialGap >= 0 ? '+' : ''}
                        {row.unitCostMaterialGap.toFixed(2)}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right ${
                          row.unitCostLaborGap >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                        {row.unitCostLaborGap >= 0 ? '+' : ''}
                        {row.unitCostLaborGap.toFixed(2)}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right ${
                          row.unitCostMOHGap >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                        {row.unitCostMOHGap >= 0 ? '+' : ''}
                        {row.unitCostMOHGap.toFixed(2)}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right ${
                          row.unitCostOutsourceGap >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                        {row.unitCostOutsourceGap >= 0 ? '+' : ''}
                        {row.unitCostOutsourceGap.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className='bg-gray-50 font-semibold'>
                    <td className='py-3 px-4 text-sm font-bold text-gray-900'>
                      Total
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right ${
                        mockTotalCostImpact >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                      {mockTotalCostImpact >= 0 ? '+' : ''}
                      {mockTotalCostImpact.toFixed(2)}
                    </td>
                    <td className='py-3 px-4 text-sm text-right text-gray-700'>
                      {mockCostImpactData
                        .reduce((sum, row) => sum + row.volActual, 0)
                        .toLocaleString()}
                    </td>
                    <td className='py-3 px-4 text-sm text-right text-gray-700'>
                      {(
                        mockCostImpactData.reduce(
                          (sum, row) =>
                            sum + row.unitCostActual * row.volActual,
                          0
                        ) /
                        mockCostImpactData.reduce(
                          (sum, row) => sum + row.volActual,
                          0
                        )
                      ).toFixed(2)}
                    </td>
                    <td className='py-3 px-4 text-sm text-right text-gray-700'>
                      {(
                        mockCostImpactData.reduce(
                          (sum, row) =>
                            sum + row.unitCostBudget * row.volActual,
                          0
                        ) /
                        mockCostImpactData.reduce(
                          (sum, row) => sum + row.volActual,
                          0
                        )
                      ).toFixed(2)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        mockCostImpactData.reduce(
                          (sum, row) =>
                            sum + row.unitCostActual * row.volActual,
                          0
                        ) /
                          mockCostImpactData.reduce(
                            (sum, row) => sum + row.volActual,
                            0
                          ) -
                          mockCostImpactData.reduce(
                            (sum, row) =>
                              sum + row.unitCostBudget * row.volActual,
                            0
                          ) /
                            mockCostImpactData.reduce(
                              (sum, row) => sum + row.volActual,
                              0
                            ) >=
                        0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                      {mockCostImpactData.reduce(
                        (sum, row) => sum + row.unitCostActual * row.volActual,
                        0
                      ) /
                        mockCostImpactData.reduce(
                          (sum, row) => sum + row.volActual,
                          0
                        ) -
                        mockCostImpactData.reduce(
                          (sum, row) =>
                            sum + row.unitCostBudget * row.volActual,
                          0
                        ) /
                          mockCostImpactData.reduce(
                            (sum, row) => sum + row.volActual,
                            0
                          ) >=
                      0
                        ? '+'
                        : ''}
                      {(
                        mockCostImpactData.reduce(
                          (sum, row) =>
                            sum + row.unitCostActual * row.volActual,
                          0
                        ) /
                          mockCostImpactData.reduce(
                            (sum, row) => sum + row.volActual,
                            0
                          ) -
                        mockCostImpactData.reduce(
                          (sum, row) =>
                            sum + row.unitCostBudget * row.volActual,
                          0
                        ) /
                          mockCostImpactData.reduce(
                            (sum, row) => sum + row.volActual,
                            0
                          )
                      ).toFixed(2)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold border-l-2 border-gray-300 ${
                        mockCostComponentTotals.material >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                      {mockCostComponentTotals.material >= 0 ? '+' : ''}
                      {mockCostComponentTotals.material.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        mockCostComponentTotals.labor >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                      {mockCostComponentTotals.labor >= 0 ? '+' : ''}
                      {mockCostComponentTotals.labor.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        mockCostComponentTotals.moh >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                      {mockCostComponentTotals.moh >= 0 ? '+' : ''}
                      {mockCostComponentTotals.moh.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        mockCostComponentTotals.outsource >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                      {mockCostComponentTotals.outsource >= 0 ? '+' : ''}
                      {mockCostComponentTotals.outsource.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Call Out Panel */}
          <div className='lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-lg p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>Key Call Out</h3>
              <span className='px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border-2 border-purple-400 shadow-md shadow-purple-200/50 flex items-center gap-1.5'>
                <span className='text-sm'>✨</span>
                <span>AI</span>
              </span>
            </div>
            <div className='space-y-3'>
              <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
                {mockCostImpactKeyCallOut.bulletPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Layer 4: MVA Breakdown
  const renderLayer4 = () => (
    <div className='space-y-6 animate-in slide-in-from-right duration-300'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
            onClick={navigateBack}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <ArrowLeftIcon className='w-6 h-6 text-gray-600' />
          </button>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>MVA Breakdown</h1>
            <p className='text-sm text-gray-600 mt-1'>
              Pilot Demo with SBU 1 YTM Financials
            </p>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-green-500'></div>
            <span className='text-sm text-gray-700'>Favourable</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-red-500'></div>
            <span className='text-sm text-gray-700'>Adverse</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <span>NP Deviation</span>
          {breadcrumbs.map((crumb, index) => (
            <div
              key={index}
              className='flex items-center gap-2'>
              <ChevronRightIcon className='w-4 h-4' />
              <button
                onClick={crumb.onClick}
                className='hover:text-gray-900 transition-colors'>
                {crumb.label}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Waterfall Chart */}
        <div className='lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-lg p-8'>
          <div className='h-96'>
            <ResponsiveContainer
              width='100%'
              height='100%'>
              <ComposedChart data={mvaChartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='label'
                  angle={-15}
                  textAnchor='end'
                  height={120}
                  style={{ fontSize: '11px' }}
                />
                <YAxis
                  style={{ fontSize: '12px' }}
                  label={{
                    value: 'MVA Cost',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '12px' },
                  }}
                />
                <Tooltip
                  formatter={(
                    value: number,
                    _name: string,
                    props: {
                      payload?: {
                        [key: string]: string | number | undefined;
                        cumulativeValue?: number;
                        delta?: number;
                        label?: string;
                      };
                    }
                  ) => {
                    const payload = props.payload;
                    const cumulative = payload?.cumulativeValue ?? value;
                    const delta = payload?.delta;

                    const tooltipLines: string[] = [
                      `${payload?.label ?? 'Stage'}: ${cumulative.toFixed(1)}`,
                    ];

                    if (delta !== undefined && delta !== cumulative) {
                      tooltipLines.push(
                        `Change: ${delta > 0 ? '+' : ''}${delta.toFixed(1)}`
                      );
                    }

                    return tooltipLines.join('\n');
                  }}
                />
                <Legend />
                <Bar
                  dataKey='baselineValue'
                  stackId='a'
                  fill='transparent'
                />
                <Bar
                  dataKey='barValue'
                  stackId='a'
                  name='MVA Breakdown'>
                  {mockMVABreakdownStages.map((stage, index) => {
                    const isBaseline = stage.type === 'baseline';
                    const isPositive = stage.type === 'positive';

                    let fillColor = '#3b82f6'; // blue for baseline
                    if (!isBaseline) {
                      fillColor = isPositive ? '#10b981' : '#ef4444'; // green for positive, red for negative
                    }

                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fillColor}
                      />
                    );
                  })}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Call Out Panel */}
        <div className='lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-lg p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-bold text-gray-900'>Key Call Out</h3>
            <span className='px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border-2 border-purple-400 shadow-md shadow-purple-200/50 flex items-center gap-1.5'>
              <span className='text-sm'>✨</span>
              <span>AI</span>
            </span>
          </div>
          <div className='space-y-3'>
            <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
              {mockMVABreakdownKeyCallOut.bulletPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <p className='text-sm text-gray-700 leading-relaxed'>
                {mockMVABreakdownKeyCallOut.rootCauseAnalysis}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        {currentLayer === 1 && renderLayer1()}
        {currentLayer === 2 && renderLayer2()}
        {currentLayer === 3 && renderLayer3()}
        {currentLayer === 4 && renderLayer4()}
      </div>

      {/* Create Action Modal */}
      <CreateActionModal
        isOpen={isCreateActionModalOpen}
        onClose={() => setIsCreateActionModalOpen(false)}
      />
    </div>
  );
}
