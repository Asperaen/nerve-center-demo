import {
  ArrowLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import {
  mockCostImpactData,
  mockCostComponentTotals,
  mockTotalCostImpact,
  mockCostImpactKeyCallOut,
} from '../../data/mockForecast';
import type { BreadcrumbItem } from '../../types';

interface CostImpactBreakdownLayerProps {
  breadcrumbs: BreadcrumbItem[];
  onBack: () => void;
  onLaborMOHClick: () => void;
}

export default function CostImpactBreakdownLayer({
  breadcrumbs,
  onBack,
  onLaborMOHClick,
}: CostImpactBreakdownLayerProps) {
  const sortedData = [...mockCostImpactData].sort(
    (a, b) => a.costImpact - b.costImpact
  );

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

      {/* Cost Component Totals Section */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-lg p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Cost Component Gaps (Grouped)
        </h3>
        <div className='grid grid-cols-4 gap-4'>
          <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <div className='text-sm font-medium text-gray-700 mb-2 text-left'>
              Material
            </div>
            <div
              className={`text-2xl font-bold text-center ${
                mockCostComponentTotals.material >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
              {mockCostComponentTotals.material >= 0 ? '+' : ''}
              {mockCostComponentTotals.material.toLocaleString()}
            </div>
          </div>
          <div
            className='p-4 bg-blue-50/50 rounded-lg border-2 border-blue-400 cursor-pointer hover:bg-blue-100 hover:border-blue-500 hover:shadow-lg hover:scale-105 transition-all relative group'
            onClick={onLaborMOHClick}>
            <div className='absolute top-2 right-2 flex items-center gap-2'>
              <span className='text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 rounded-full shadow-lg border-2 border-blue-400 flex items-center gap-1.5 group-hover:shadow-xl group-hover:scale-105 transition-all'>
                <span>Deep Dive</span>
                <ArrowRightIcon className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
              </span>
            </div>
            <div className='text-sm font-medium text-gray-700 mb-2 text-left'>
              <span className='group-hover:text-blue-600 transition-colors font-semibold'>
                Labor
              </span>
            </div>
            <div
              className={`text-2xl font-bold text-center ${
                mockCostComponentTotals.labor >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
              {mockCostComponentTotals.labor >= 0 ? '+' : ''}
              {mockCostComponentTotals.labor.toLocaleString()}
            </div>
          </div>
          <div
            className='p-4 bg-blue-50/50 rounded-lg border-2 border-blue-400 cursor-pointer hover:bg-blue-100 hover:border-blue-500 hover:shadow-lg hover:scale-105 transition-all relative group'
            onClick={onLaborMOHClick}>
            <div className='absolute top-2 right-2 flex items-center gap-2'>
              <span className='text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 rounded-full shadow-lg border-2 border-blue-400 flex items-center gap-1.5 group-hover:shadow-xl group-hover:scale-105 transition-all'>
                <span>Deep Dive</span>
                <ArrowRightIcon className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
              </span>
            </div>
            <div className='text-sm font-medium text-gray-700 mb-2 text-left'>
              <span className='group-hover:text-blue-600 transition-colors font-semibold'>
                MOH
              </span>
            </div>
            <div
              className={`text-2xl font-bold text-center ${
                mockCostComponentTotals.moh >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
              {mockCostComponentTotals.moh >= 0 ? '+' : ''}
              {mockCostComponentTotals.moh.toLocaleString()}
            </div>
          </div>
          <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <div className='text-sm font-medium text-gray-700 mb-2 text-left'>
              Outsource
            </div>
            <div
              className={`text-2xl font-bold text-center ${
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

      {/* Key Call Out Panel */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-lg p-6'>
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

      {/* Main Table */}
      <div className='bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                  {' '}
                </th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                  U/C Impact
                </th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                  Vol_Actual (KPCS)
                </th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                  U/C_Actual (USD)
                </th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                  U/C_Budget (USD)
                </th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                  U/C_Delta
                </th>
                <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700 border-l-2 border-gray-300'>
                  Unit PAC Material Gap
                </th>
                <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                  Unit PAC Labor Gap
                </th>
                <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                  Unit PAC MOH Gap
                </th>
                <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                  Unit PAC Outsourcing Gap
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
                      row.costImpact >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {row.costImpact >= 0 ? '+' : ''}
                    {row.costImpact.toFixed(2)}
                  </td>
                  <td className='py-3 px-4 text-sm text-right text-gray-700'>
                    {row.volActual.toLocaleString()}
                  </td>
                  <td className='py-3 px-4 text-sm text-right text-gray-700'>
                    {row.unitCostActual.toFixed(3)}
                  </td>
                  <td className='py-3 px-4 text-sm text-right text-gray-700'>
                    {row.unitCostBudget.toFixed(3)}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right font-semibold ${
                      row.unitCostGap >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {row.unitCostGap >= 0 ? '+' : ''}
                    {row.unitCostGap.toFixed(4)}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right border-l-2 border-gray-300 ${
                      row.unitCostMaterialGap >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    {row.unitCostMaterialGap >= 0 ? '+' : ''}
                    {row.unitCostMaterialGap.toFixed(4)}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right ${
                      row.unitCostLaborGap >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    {row.unitCostLaborGap >= 0 ? '+' : ''}
                    {row.unitCostLaborGap.toFixed(4)}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right ${
                      row.unitCostMOHGap >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    {row.unitCostMOHGap >= 0 ? '+' : ''}
                    {row.unitCostMOHGap.toFixed(4)}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm text-right ${
                      row.unitCostOutsourceGap >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                    {row.unitCostOutsourceGap >= 0 ? '+' : ''}
                    {row.unitCostOutsourceGap.toFixed(4)}
                  </td>
                </tr>
              ))}
              <tr className='bg-gray-50 font-semibold'>
                <td className='py-3 px-4 text-sm font-bold text-gray-900'>
                  Grand Total
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
                      (sum, row) => sum + row.unitCostActual * row.volActual,
                      0
                    ) /
                    mockCostImpactData.reduce(
                      (sum, row) => sum + row.volActual,
                      0
                    )
                  ).toFixed(3)}
                </td>
                <td className='py-3 px-4 text-sm text-right text-gray-700'>
                  {(
                    mockCostImpactData.reduce(
                      (sum, row) => sum + row.unitCostBudget * row.volActual,
                      0
                    ) /
                    mockCostImpactData.reduce(
                      (sum, row) => sum + row.volActual,
                      0
                    )
                  ).toFixed(3)}
                </td>
                <td
                  className={`py-3 px-4 text-sm text-right font-semibold ${(() => {
                    const totalVol = mockCostImpactData.reduce(
                      (sum, row) => sum + row.volActual,
                      0
                    );
                    const avgActual =
                      mockCostImpactData.reduce(
                        (sum, row) => sum + row.unitCostActual * row.volActual,
                        0
                      ) / totalVol;
                    const avgBudget =
                      mockCostImpactData.reduce(
                        (sum, row) => sum + row.unitCostBudget * row.volActual,
                        0
                      ) / totalVol;
                    return avgActual - avgBudget >= 0
                      ? 'text-green-600'
                      : 'text-red-600';
                  })()}`}>
                  {(() => {
                    const totalVol = mockCostImpactData.reduce(
                      (sum, row) => sum + row.volActual,
                      0
                    );
                    const avgActual =
                      mockCostImpactData.reduce(
                        (sum, row) => sum + row.unitCostActual * row.volActual,
                        0
                      ) / totalVol;
                    const avgBudget =
                      mockCostImpactData.reduce(
                        (sum, row) => sum + row.unitCostBudget * row.volActual,
                        0
                      ) / totalVol;
                    const delta = avgActual - avgBudget;
                    return `${delta >= 0 ? '+' : ''}${delta.toFixed(4)}`;
                  })()}
                </td>
                <td
                  className={`py-3 px-4 text-sm text-right font-semibold border-l-2 border-gray-300 ${
                    mockCostComponentTotals.material >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                  {(() => {
                    const totalVol = mockCostImpactData.reduce(
                      (sum, row) => sum + row.volActual,
                      0
                    );
                    const unitGap = mockCostComponentTotals.material / totalVol;
                    return `${unitGap >= 0 ? '+' : ''}${unitGap.toFixed(4)}`;
                  })()}
                </td>
                <td
                  className={`py-3 px-4 text-sm text-right font-semibold ${
                    mockCostComponentTotals.labor >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                  {(() => {
                    const totalVol = mockCostImpactData.reduce(
                      (sum, row) => sum + row.volActual,
                      0
                    );
                    const unitGap = mockCostComponentTotals.labor / totalVol;
                    return `${unitGap >= 0 ? '+' : ''}${unitGap.toFixed(4)}`;
                  })()}
                </td>
                <td
                  className={`py-3 px-4 text-sm text-right font-semibold ${
                    mockCostComponentTotals.moh >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                  {(() => {
                    const totalVol = mockCostImpactData.reduce(
                      (sum, row) => sum + row.volActual,
                      0
                    );
                    const unitGap = mockCostComponentTotals.moh / totalVol;
                    return `${unitGap >= 0 ? '+' : ''}${unitGap.toFixed(4)}`;
                  })()}
                </td>
                <td
                  className={`py-3 px-4 text-sm text-right font-semibold ${
                    mockCostComponentTotals.outsource >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                  {(() => {
                    const totalVol = mockCostImpactData.reduce(
                      (sum, row) => sum + row.volActual,
                      0
                    );
                    const unitGap =
                      mockCostComponentTotals.outsource / totalVol;
                    return `${unitGap >= 0 ? '+' : ''}${unitGap.toFixed(4)}`;
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

