import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  ChevronDownIcon,
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
import {
  mockProductFamilyData,
  mockProductFamilyTotals,
  mockCostImpactData,
  mockCostComponentTotals,
  mockCostImpactKeyCallOut,
  mockMVABreakdownStages,
  mockFactoryInitiatives,
  mockTotalCostImpact,
} from '../../data/mockForecast';
import type { BreadcrumbItem, FactoryInitiative } from '../../types';

// Aggregated factory data type
interface FactoryAggregatedData {
  factory: string;
  costImpact: number;
  volActual: number;
  totalCostActual: number;
  totalCostBudget: number;
  materialGapTotal: number;
  laborGapTotal: number;
  mohGapTotal: number;
  outsourceGapTotal: number;
}

interface ProductAnalysisLayerProps {
  breadcrumbs: BreadcrumbItem[];
  onBack: () => void;
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
  const totalExpected = initiatives.reduce(
    (sum, i) => sum + i.expectedImpact,
    0
  );
  const totalActual = initiatives.reduce((sum, i) => sum + i.actualImpact, 0);

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
        </div>
        <div className='flex items-center gap-3 mt-2 text-xs'>
          <span className='text-blue-600'>
            Expected: ${(totalExpected / 1000).toFixed(2)}M
          </span>
          <span className='text-green-600'>
            Actual: ${(totalActual / 1000).toFixed(2)}M
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
                  Owner: {initiative.owner}
                </p>
                <p className='text-xs mt-0.5'>
                  <span className='text-blue-600'>
                    Exp: ${initiative.expectedImpact}K
                  </span>
                  <span className='text-gray-400 mx-1'>→</span>
                  <span
                    className={
                      initiative.actualImpact < initiative.expectedImpact
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }>
                    Act: ${initiative.actualImpact}K
                  </span>
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

export default function ProductAnalysisLayer({
  breadcrumbs,
  onBack,
}: ProductAnalysisLayerProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sites' | 'products'>('sites');
  const [selectedSites, setSelectedSites] = useState<string[]>([]); // Empty means all sites
  const [isSiteFilterOpen, setIsSiteFilterOpen] = useState(false);
  const [hoveredFactory, setHoveredFactory] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get unique sites from cost impact data
  const uniqueSites = useMemo(() => {
    const sites = new Set<string>();
    mockCostImpactData.forEach((item) => sites.add(item.factory));
    return Array.from(sites).sort();
  }, []);

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

  // Filter and sort site data based on selection
  const filteredSiteData = useMemo(() => {
    let data = [...aggregatedByFactory];
    if (selectedSites.length > 0) {
      data = data.filter((row) => selectedSites.includes(row.factory));
    }
    return data.sort((a, b) => a.costImpact - b.costImpact);
  }, [aggregatedByFactory, selectedSites]);

  // Toggle site selection
  const toggleSiteSelection = (site: string) => {
    setSelectedSites((prev) => {
      // If currently showing all sites (empty array), deselecting means select all EXCEPT this one
      if (prev.length === 0) {
        return uniqueSites.filter((s) => s !== site);
      }

      // If site is already selected, remove it
      if (prev.includes(site)) {
        const newSelection = prev.filter((s) => s !== site);
        // If removing this site would leave no sites selected, select the first site
        if (newSelection.length === 0) {
          return [uniqueSites[0]];
        }
        return newSelection;
      } else {
        // Add site to selection
        const newSelection = [...prev, site];
        // If all sites are now selected, switch to "All Sites" mode (empty array)
        if (newSelection.length === uniqueSites.length) {
          return [];
        }
        return newSelection;
      }
    });
  };

  // Select/deselect all sites
  const toggleAllSites = () => {
    if (selectedSites.length === 0) {
      // Currently "All Sites" - deselecting means select only the first site
      setSelectedSites([uniqueSites[0]]);
    } else {
      // Select all sites (switch to empty array = all sites mode)
      setSelectedSites([]);
    }
  };

  // Get display text for filter button
  const getFilterDisplayText = () => {
    if (selectedSites.length === 0) {
      return 'All Sites';
    } else if (selectedSites.length === 1) {
      return selectedSites[0];
    } else if (selectedSites.length === uniqueSites.length) {
      return 'All Sites';
    } else {
      return `${selectedSites.length} Sites Selected`;
    }
  };

  // Prepare MVA chart data
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

  // Product data sorting
  const sortedProductData = [...mockProductFamilyData].sort(
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
        {/* Left: Back button + Title */}
        <div className='flex items-center gap-4 flex-1'>
          <button
            onClick={onBack}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <ArrowLeftIcon className='w-6 h-6 text-gray-600' />
          </button>
          <h1 className='text-3xl font-bold text-gray-900'>COGS Analysis</h1>
        </div>

        {/* Center: Tab Switch */}
        <div className='flex items-center justify-center flex-1'>
          <div className='flex items-center bg-gray-100 rounded-lg p-1'>
            <button
              onClick={() => setActiveTab('sites')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'sites'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
              Sites
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'products'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
              Products
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div className='flex items-center gap-2 flex-1 justify-end'>
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

      {/* Sites Tab Content */}
      {activeTab === 'sites' && (
        <div className='space-y-6'>
          {/* Site Filter */}
          <div className='flex items-center gap-4'>
            <label className='text-sm font-medium text-gray-700'>
              Filter by Site:
            </label>
            <div className='relative'>
              <button
                onClick={() => setIsSiteFilterOpen(!isSiteFilterOpen)}
                className='flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer min-w-[220px]'>
                <span>{getFilterDisplayText()}</span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-500 ml-2 transition-transform ${
                    isSiteFilterOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isSiteFilterOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div
                    className='fixed inset-0 z-10'
                    onClick={() => setIsSiteFilterOpen(false)}
                  />
                  <div className='absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto'>
                    {/* Select All Option */}
                    <div
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200'
                      onClick={toggleAllSites}>
                      <input
                        type='checkbox'
                        checked={
                          selectedSites.length === 0 ||
                          selectedSites.length === uniqueSites.length
                        }
                        onChange={toggleAllSites}
                        className='w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500'
                      />
                      <span className='text-sm font-medium text-gray-900'>
                        All Sites
                      </span>
                    </div>

                    {/* Individual Sites */}
                    {uniqueSites.map((site) => (
                      <div
                        key={site}
                        className='flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer'
                        onClick={() => toggleSiteSelection(site)}>
                        <input
                          type='checkbox'
                          checked={
                            selectedSites.length === 0 ||
                            selectedSites.includes(site)
                          }
                          onChange={() => toggleSiteSelection(site)}
                          className='w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500'
                        />
                        <span className='text-sm text-gray-700'>{site}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Selected sites count badge */}
            {selectedSites.length > 0 &&
              selectedSites.length < uniqueSites.length && (
                <button
                  onClick={() => setSelectedSites([])}
                  className='text-xs text-primary-600 hover:text-primary-700 font-medium'>
                  Clear filter
                </button>
              )}
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

          {/* MVA Waterfall Chart */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg p-8'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h3 className='text-xl font-bold text-gray-900'>
                  MVA Breakdown
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  Manufacturing Value Add Cost Analysis
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
            <div className='h-80'>
              <ResponsiveContainer
                width='100%'
                height='100%'>
                <ComposedChart data={mvaChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='label'
                    angle={-15}
                    textAnchor='end'
                    height={100}
                    style={{ fontSize: '10px' }}
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
                        `${payload?.label ?? 'Stage'}: ${cumulative.toFixed(
                          1
                        )}`,
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
                        fillColor = isPositive ? '#10b981' : '#ef4444';
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
              <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                <div className='text-sm font-medium text-gray-700 mb-2 text-left'>
                  Labor
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
              <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                <div className='text-sm font-medium text-gray-700 mb-2 text-left'>
                  MOH
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

          {/* Site Table */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden'>
            <div className='p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Site Cost Impact Details
              </h3>
              <p className='text-sm text-gray-500 mt-1'>
                {selectedSites.length === 0
                  ? 'Showing all sites'
                  : selectedSites.length === 1
                  ? `Filtered by: ${selectedSites[0]}`
                  : `Filtered by: ${selectedSites.length} sites`}{' '}
                | Sorted by: Cost Impact (K)
              </p>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='text-left py-3 px-4 text-sm font-semibold text-gray-700'>
                      Factory
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                      MVA Impact (K)
                    </th>
                    <th className='text-center py-3 px-4 text-sm font-semibold text-gray-700'>
                      # of Initiatives
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                      Expected Initiative Impact (K)
                    </th>
                    <th className='text-right py-3 px-4 text-sm font-semibold text-gray-700'>
                      Actual Initiative Impact (K)
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {filteredSiteData.map((row, index) => {
                    const isMostNegative = index === 0 && row.costImpact < 0;

                    const handleDragStart = (e: React.DragEvent) => {
                      setHoveredFactory(null);
                      setIsDragging(true);

                      const dragImage = document.createElement('div');
                      dragImage.className =
                        'bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-2 text-sm font-medium';
                      dragImage.style.position = 'absolute';
                      dragImage.style.top = '-1000px';
                      dragImage.style.left = '-1000px';
                      dragImage.style.zIndex = '9999';
                      dragImage.style.maxWidth = '250px';
                      dragImage.innerHTML = `
                        <div class="flex items-center gap-2">
                          <span class="text-gray-900 font-semibold">${
                            row.factory
                          }</span>
                          <span class="${
                            row.costImpact >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }">
                            ${
                              row.costImpact >= 0 ? '+' : ''
                            }${row.costImpact.toFixed(2)}K
                          </span>
                        </div>
                      `;
                      document.body.appendChild(dragImage);
                      e.dataTransfer.setDragImage(dragImage, 125, 20);

                      setTimeout(() => {
                        document.body.removeChild(dragImage);
                      }, 0);

                      e.dataTransfer.setData(
                        'materialType',
                        'cost-impact-factory'
                      );
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

                    const handleDragEnd = () => {
                      setIsDragging(false);
                    };

                    const factoryInitiatives =
                      mockFactoryInitiatives[row.factory] || [];
                    const isHovered = hoveredFactory === row.factory;

                    return (
                      <tr
                        key={row.factory}
                        draggable
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onMouseEnter={() =>
                          !isDragging && setHoveredFactory(row.factory)
                        }
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
                          </div>
                          {isHovered &&
                            !isDragging &&
                            factoryInitiatives.length > 0 && (
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
                            row.costImpact >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                          {row.costImpact >= 0 ? '+' : ''}
                          {row.costImpact.toFixed(2)}
                        </td>
                        <td className='py-3 px-4 text-sm text-center text-gray-700'>
                          {factoryInitiatives.length > 0 ? (
                            <span className='inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 bg-gray-100 rounded font-medium'>
                              {factoryInitiatives.length}
                            </span>
                          ) : (
                            <span className='text-gray-400'>-</span>
                          )}
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-right font-semibold ${
                            factoryInitiatives.length > 0
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}>
                          {factoryInitiatives.length > 0 ? (
                            <>
                              +
                              {(
                                factoryInitiatives.reduce(
                                  (sum, i) => sum + i.expectedImpact,
                                  0
                                ) / 1000
                              ).toFixed(2)}
                              M
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-right font-semibold ${
                            factoryInitiatives.length > 0
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}>
                          {factoryInitiatives.length > 0 ? (
                            <>
                              +
                              {(
                                factoryInitiatives.reduce(
                                  (sum, i) => sum + i.actualImpact,
                                  0
                                ) / 1000
                              ).toFixed(2)}
                              M
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Grand Total Row - only show when all sites */}
                  {selectedSites.length === 0 &&
                    (() => {
                      const totalInitiatives = Object.values(
                        mockFactoryInitiatives
                      ).flat().length;
                      const totalExpectedImpact = Object.values(
                        mockFactoryInitiatives
                      )
                        .flat()
                        .reduce((sum, i) => sum + i.expectedImpact, 0);
                      const totalActualImpact = Object.values(
                        mockFactoryInitiatives
                      )
                        .flat()
                        .reduce((sum, i) => sum + i.actualImpact, 0);

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
                          <td className='py-3 px-4 text-sm text-center font-bold text-gray-700'>
                            <span className='inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 bg-gray-200 rounded'>
                              {totalInitiatives}
                            </span>
                          </td>
                          <td className='py-3 px-4 text-sm text-right font-bold text-blue-600'>
                            +{(totalExpectedImpact / 1000).toFixed(2)}M
                          </td>
                          <td className='py-3 px-4 text-sm text-right font-bold text-green-600'>
                            +{(totalActualImpact / 1000).toFixed(2)}M
                          </td>
                        </tr>
                      );
                    })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab Content */}
      {activeTab === 'products' && (
        <div className='space-y-6'>
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
                  className='bg-white rounded-xl border-2 p-6 shadow-md hover:shadow-lg transition-all duration-200 border-gray-200'>
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
                  {sortedProductData.map((row) => (
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
                          row.priceImpact >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                        {row.priceImpact >= 0 ? '+' : ''}
                        {row.priceImpact.toFixed(2)}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-right ${
                          row.costImpact >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
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
      )}
    </div>
  );
}
