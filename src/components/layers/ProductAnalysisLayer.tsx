import {
  ArrowLeftIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import {
  mockProductFamilyData,
  mockProductFamilyTotals,
} from '../../data/mockForecast';
import type { BreadcrumbItem } from '../../types';

interface ProductAnalysisLayerProps {
  breadcrumbs: BreadcrumbItem[];
  onBack: () => void;
  onCostImpactClick: () => void;
}

export default function ProductAnalysisLayer({
  breadcrumbs,
  onBack,
  onCostImpactClick,
}: ProductAnalysisLayerProps) {
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
      onClick: onCostImpactClick,
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
            onClick={onBack}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <ArrowLeftIcon className='w-6 h-6 text-gray-600' />
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>Product Analysis</h1>
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
            <div key={index} className='flex items-center gap-2'>
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
          Gross Profit (GP) actuals exceeded budget by 2,350.0 (actual: 35,459.2
          vs. budget: 33,109.2). Revenue actuals also surpassed budget by 25.5
          (actual: 150.1 vs. budget: 124.5). Volume impact (+8,807.7) and price
          impact (+3,662.22) were the main positive drivers, while cost impact
          (-7,323.21) and mix impact (-2,796.6) were negative contributors.
          Product Fam 12 and 26 contributed most to positive GP gap to budget.
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
              <div className='text-sm text-gray-600 mb-2'>{card.label}</div>
              <div
                className={`text-3xl font-bold ${
                  card.color === 'green' ? 'text-green-600' : 'text-red-600'
                }`}>
                {card.value > 0 ? '+' : ''}
                {card.value.toFixed(1)}
              </div>
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
                  Vol Impact
                </th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                  Price Impact
                </th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                  Cost Impact
                </th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                  Mix Impact
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
                      row.gpGapToBudget >= 0 ? 'text-green-600' : 'text-red-600'
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
                    className={`py-3 px-4 text-sm text-right ${
                      row.costImpact >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {row.costImpact >= 0 ? '+' : ''}
                    {row.costImpact.toFixed(2)}
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
}

