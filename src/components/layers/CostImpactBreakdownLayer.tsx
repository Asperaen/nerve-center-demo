import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  mockFactoryInitiatives,
} from '../../data/mockForecast';
import type { BreadcrumbItem, FactoryInitiative } from '../../types';

// Aggregated factory data type
interface FactoryAggregatedData {
  factory: string;
  costImpact: number;
  volActual: number;
  totalCostActual: number; // weighted sum for average calculation
  totalCostBudget: number; // weighted sum for average calculation
  materialGapTotal: number;
  laborGapTotal: number;
  mohGapTotal: number;
  outsourceGapTotal: number;
}

interface CostImpactBreakdownLayerProps {
  breadcrumbs: BreadcrumbItem[];
  onBack: () => void;
  onLaborMOHClick: () => void;
}

// Stage badge color mapping
const getStageColor = (stage: string): string => {
  switch (stage) {
    case 'L0':
      return 'bg-gray-500 text-white';
    case 'L1':
      return 'bg-blue-500 text-white';
    case 'L2':
      return 'bg-indigo-500 text-white';
    case 'L3':
      return 'bg-yellow-500 text-white';
    case 'L4':
      return 'bg-orange-500 text-white';
    case 'L5':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

// Factory Initiative Tooltip Component
interface FactoryInitiativeTooltipProps {
  factoryName: string;
  initiatives: FactoryInitiative[];
  onViewWave: () => void;
}

function FactoryInitiativeTooltip({
  factoryName,
  initiatives,
  onViewWave,
}: FactoryInitiativeTooltipProps) {
  const delayedCount = initiatives.filter((i) => i.isDelayed).length;
  const totalImpact = initiatives.reduce((sum, i) => sum + i.expectedImpact, 0);

  return (
    <div className='absolute left-full top-0 ml-2 z-50 w-80 bg-white rounded-xl border border-gray-200 shadow-xl p-4 animate-in fade-in slide-in-from-left-2 duration-200'>
      {/* Header */}
      <div className='mb-3 pb-3 border-b border-gray-200'>
        <h4 className='text-sm font-bold text-gray-900'>{factoryName}</h4>
        <div className='flex items-center gap-2 mt-1'>
          <span className='text-xs text-gray-600'>
            {initiatives.length} initiative{initiatives.length !== 1 ? 's' : ''}
          </span>
          {delayedCount > 0 && (
            <>
              <span className='text-xs text-gray-400'>•</span>
              <span className='text-xs text-red-600 font-medium'>
                {delayedCount} delayed
              </span>
            </>
          )}
          <span className='text-xs text-gray-400'>•</span>
          <span className='text-xs text-gray-600'>
            ${(totalImpact / 1000).toFixed(1)}M total impact
          </span>
        </div>
      </div>

      {/* Initiative List */}
      <div className='space-y-2 max-h-48 overflow-y-auto'>
        {initiatives.map((initiative) => (
          <div
            key={initiative.id}
            className={`p-2 rounded-lg border ${
              initiative.isDelayed
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
            <div className='flex items-start justify-between gap-2'>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <span
                    className={`px-1.5 py-0.5 text-xs font-bold rounded ${getStageColor(
                      initiative.stage
                    )}`}>
                    {initiative.stage}
                  </span>
                  {initiative.isDelayed && (
                    <span className='flex items-center gap-1 text-xs text-red-600 font-medium'>
                      <span className='w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse' />
                      Delayed
                    </span>
                  )}
                </div>
                <p className='text-xs font-medium text-gray-900 mt-1 truncate'>
                  {initiative.name}
                </p>
                <p className='text-xs text-gray-500 mt-0.5'>
                  Owner: {initiative.owner} • ${initiative.expectedImpact}K
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Wave Button */}
      <div className='mt-3 pt-3 border-t border-gray-200'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewWave();
          }}
          className='w-full px-3 py-2 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2'>
          <span>View in Wave Dashboard</span>
          <ArrowRightIcon className='w-3.5 h-3.5' />
        </button>
      </div>
    </div>
  );
}

export default function CostImpactBreakdownLayer({
  breadcrumbs,
  onBack,
  onLaborMOHClick,
}: CostImpactBreakdownLayerProps) {
  const navigate = useNavigate();
  const [hoveredFactory, setHoveredFactory] = useState<string | null>(null);

  // Aggregate data by factory
  const aggregatedByFactory = useMemo(() => {
    const factoryMap = new Map<string, FactoryAggregatedData>();

    mockCostImpactData.forEach((item) => {
      const existing = factoryMap.get(item.factory);
      if (existing) {
        existing.costImpact += item.costImpact;
        existing.volActual += item.volActual;
        existing.totalCostActual += item.unitCostActual * item.volActual;
        existing.totalCostBudget += item.unitCostBudget * item.volActual;
        existing.materialGapTotal += item.unitCostMaterialGap * item.volActual;
        existing.laborGapTotal += item.unitCostLaborGap * item.volActual;
        existing.mohGapTotal += item.unitCostMOHGap * item.volActual;
        existing.outsourceGapTotal +=
          item.unitCostOutsourceGap * item.volActual;
      } else {
        factoryMap.set(item.factory, {
          factory: item.factory,
          costImpact: item.costImpact,
          volActual: item.volActual,
          totalCostActual: item.unitCostActual * item.volActual,
          totalCostBudget: item.unitCostBudget * item.volActual,
          materialGapTotal: item.unitCostMaterialGap * item.volActual,
          laborGapTotal: item.unitCostLaborGap * item.volActual,
          mohGapTotal: item.unitCostMOHGap * item.volActual,
          outsourceGapTotal: item.unitCostOutsourceGap * item.volActual,
        });
      }
    });

    return Array.from(factoryMap.values());
  }, []);

  const sortedData = [...aggregatedByFactory].sort(
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
                  Factory
                </th>
                <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                  MVA cost impact (K)
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
              {sortedData.map((row, index) => {
                // Calculate weighted averages for this factory
                const unitCostActual =
                  row.volActual > 0 ? row.totalCostActual / row.volActual : 0;
                const unitCostBudget =
                  row.volActual > 0 ? row.totalCostBudget / row.volActual : 0;
                const unitCostGap = unitCostActual - unitCostBudget;
                const unitMaterialGap =
                  row.volActual > 0 ? row.materialGapTotal / row.volActual : 0;
                const unitLaborGap =
                  row.volActual > 0 ? row.laborGapTotal / row.volActual : 0;
                const unitMOHGap =
                  row.volActual > 0 ? row.mohGapTotal / row.volActual : 0;
                const unitOutsourceGap =
                  row.volActual > 0 ? row.outsourceGapTotal / row.volActual : 0;

                // First row is the most negative (sorted ascending)
                const isMostNegative = index === 0 && row.costImpact < 0;

                // Drag handler for factory
                const handleDragStart = (e: React.DragEvent) => {
                  e.dataTransfer.setData('materialType', 'cost-impact-factory');
                  e.dataTransfer.setData('itemId', row.factory);
                  e.dataTransfer.setData(
                    'itemTitle',
                    `${row.factory} Cost Review`
                  );
                  e.dataTransfer.setData(
                    'itemDescription',
                    `MVA Cost Impact: ${
                      row.costImpact >= 0 ? '+' : ''
                    }${row.costImpact.toFixed(2)}K`
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                };

                // Get factory initiatives for tooltip
                const factoryInitiatives =
                  mockFactoryInitiatives[row.factory] || [];
                const isHovered = hoveredFactory === row.factory;

                return (
                  <tr
                    key={row.factory}
                    draggable
                    onDragStart={handleDragStart}
                    onMouseEnter={() => setHoveredFactory(row.factory)}
                    onMouseLeave={() => setHoveredFactory(null)}
                    className={`transition-colors cursor-grab active:cursor-grabbing ${
                      isMostNegative
                        ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500'
                        : 'hover:bg-gray-50'
                    }`}>
                    <td className='py-3 px-4 text-sm font-medium text-gray-900 relative'>
                      <div className='flex items-center gap-2'>
                        {isMostNegative && (
                          <span className='flex-shrink-0 w-2 h-2 bg-red-500 rounded-full animate-pulse' />
                        )}
                        <span>{row.factory}</span>
                        <span className='text-xs text-gray-400'>⋮⋮</span>
                        {factoryInitiatives.length > 0 && (
                          <span className='text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded'>
                            {factoryInitiatives.length} initiatives
                          </span>
                        )}
                      </div>
                      {/* Factory Initiative Tooltip */}
                      {isHovered && factoryInitiatives.length > 0 && (
                        <FactoryInitiativeTooltip
                          factoryName={row.factory}
                          initiatives={factoryInitiatives}
                          onViewWave={() =>
                            navigate('/internal-pulse?tab=wave')
                          }
                        />
                      )}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        row.costImpact >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {row.costImpact >= 0 ? '+' : ''}
                      {row.costImpact.toFixed(2)}
                    </td>
                    <td className='py-3 px-4 text-sm text-right text-gray-700'>
                      {row.volActual.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className='py-3 px-4 text-sm text-right text-gray-700'>
                      {unitCostActual.toFixed(3)}
                    </td>
                    <td className='py-3 px-4 text-sm text-right text-gray-700'>
                      {unitCostBudget.toFixed(3)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        unitCostGap >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {unitCostGap >= 0 ? '+' : ''}
                      {unitCostGap.toFixed(4)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right border-l-2 border-gray-300 ${
                        unitMaterialGap >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {unitMaterialGap >= 0 ? '+' : ''}
                      {unitMaterialGap.toFixed(4)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right ${
                        unitLaborGap >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {unitLaborGap >= 0 ? '+' : ''}
                      {unitLaborGap.toFixed(4)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right ${
                        unitMOHGap >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {unitMOHGap >= 0 ? '+' : ''}
                      {unitMOHGap.toFixed(4)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right ${
                        unitOutsourceGap >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                      {unitOutsourceGap >= 0 ? '+' : ''}
                      {unitOutsourceGap.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
              {(() => {
                // Calculate grand totals from aggregated factory data
                const totalVol = aggregatedByFactory.reduce(
                  (sum, row) => sum + row.volActual,
                  0
                );
                const totalCostActual = aggregatedByFactory.reduce(
                  (sum, row) => sum + row.totalCostActual,
                  0
                );
                const totalCostBudget = aggregatedByFactory.reduce(
                  (sum, row) => sum + row.totalCostBudget,
                  0
                );
                const avgActual = totalVol > 0 ? totalCostActual / totalVol : 0;
                const avgBudget = totalVol > 0 ? totalCostBudget / totalVol : 0;
                const avgDelta = avgActual - avgBudget;
                const unitMaterialGap =
                  totalVol > 0
                    ? mockCostComponentTotals.material / totalVol
                    : 0;
                const unitLaborGap =
                  totalVol > 0 ? mockCostComponentTotals.labor / totalVol : 0;
                const unitMOHGap =
                  totalVol > 0 ? mockCostComponentTotals.moh / totalVol : 0;
                const unitOutsourceGap =
                  totalVol > 0
                    ? mockCostComponentTotals.outsource / totalVol
                    : 0;

                return (
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
                      {totalVol.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className='py-3 px-4 text-sm text-right text-gray-700'>
                      {avgActual.toFixed(3)}
                    </td>
                    <td className='py-3 px-4 text-sm text-right text-gray-700'>
                      {avgBudget.toFixed(3)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        avgDelta >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {avgDelta >= 0 ? '+' : ''}
                      {avgDelta.toFixed(4)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold border-l-2 border-gray-300 ${
                        unitMaterialGap >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {unitMaterialGap >= 0 ? '+' : ''}
                      {unitMaterialGap.toFixed(4)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        unitLaborGap >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {unitLaborGap >= 0 ? '+' : ''}
                      {unitLaborGap.toFixed(4)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        unitMOHGap >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {unitMOHGap >= 0 ? '+' : ''}
                      {unitMOHGap.toFixed(4)}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        unitOutsourceGap >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                      {unitOutsourceGap >= 0 ? '+' : ''}
                      {unitOutsourceGap.toFixed(4)}
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
