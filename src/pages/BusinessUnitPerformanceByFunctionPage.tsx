import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { getStoredTimeframe } from '../utils/timeframeStorage';
import { mockFunctionDeviationRows } from '../data/mockForecast';
import { getAllBusinessGroupData } from '../data/mockBusinessGroupPerformance';

const normalizeFunction = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '');

const normalizeBu = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '');

const formatMn = (value: number) => {
  const sign = value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toFixed(1)}M`;
};

export default function BusinessUnitPerformanceByFunctionPage() {
  const [searchParams] = useSearchParams();
  const functionParam = searchParams.get('function') ?? 'TopLine';
  const buParam = searchParams.get('bu') ?? '';
  const selectedBus = buParam
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const scaledRows = useMemo(() => {
    const timeframe = getStoredTimeframe();
    const dataTimeframe = timeframe === 'ytm' ? 'ytm' : 'full-year';
    const tableData = getAllBusinessGroupData(dataTimeframe);
    const overallRow = tableData.find((row) => row.id === 'overall');
    const normalizedSelected = selectedBus.map(normalizeBu);
    const selectedRows =
      normalizedSelected.length === 0
        ? overallRow
          ? [overallRow]
          : tableData
        : tableData.filter((row) =>
            normalizedSelected.includes(normalizeBu(row.name))
          );
    const selectedNpBaseline = selectedRows.reduce(
      (sum, row) => sum + row.np.baseline,
      0
    );
    const selectedNpValue = selectedRows.reduce(
      (sum, row) => sum + row.np.value,
      0
    );

    const roundToOne = (value: number) => Math.round(value * 10) / 10;
    const rowsById = new Map(
      mockFunctionDeviationRows.map((row) => [row.id, row])
    );
    const baseRevenue = rowsById.get('revenue')?.ytmBudget ?? 0;
    const baseCost = rowsById.get('cost')?.ytmBudget ?? 0;
    const baseRevenueActuals = rowsById.get('revenue')?.ytmActuals ?? 0;
    const baseCostActuals = rowsById.get('cost')?.ytmActuals ?? 0;

    const topBudgetScale =
      baseRevenue + baseCost === 0
        ? 1
        : selectedNpBaseline / (baseRevenue + baseCost);
    const topActualsScale =
      baseRevenueActuals + baseCostActuals === 0
        ? 1
        : selectedNpValue / (baseRevenueActuals + baseCostActuals);

    const revenueBudget = baseRevenue * topBudgetScale;
    const costBudget = baseCost * topBudgetScale;
    const revenueActuals = baseRevenueActuals * topActualsScale;
    const costActuals = baseCostActuals * topActualsScale;

    const revenueChildIds = ['topline'];
    const costChildIds = ['procurement', 'mva', 'rd', 'opex', 'shared-expenses'];

    const scaleChildren = (
      ids: string[],
      baseTotal: number,
      targetTotal: number,
      key: 'ytmBudget' | 'ytmActuals'
    ) => {
      if (ids.length === 0) return new Map<string, number>();
      const scale = baseTotal === 0 ? 0 : targetTotal / baseTotal;
      const values = ids.map((id) => ({
        id,
        value: (rowsById.get(id)?.[key] ?? 0) * scale,
      }));
      const rounded = values.map((entry) => ({
        ...entry,
        value: roundToOne(entry.value),
      }));
      const sumRounded = rounded.reduce((sum, entry) => sum + entry.value, 0);
      const diff = roundToOne(targetTotal - sumRounded);
      if (rounded.length > 0) {
        rounded[rounded.length - 1].value = roundToOne(
          rounded[rounded.length - 1].value + diff
        );
      }
      return new Map(rounded.map((entry) => [entry.id, entry.value]));
    };

    const revenueBudgetChildren = scaleChildren(
      revenueChildIds,
      revenueChildIds.reduce(
        (sum, id) => sum + (rowsById.get(id)?.ytmBudget ?? 0),
        0
      ),
      revenueBudget,
      'ytmBudget'
    );
    const revenueActualsChildren = scaleChildren(
      revenueChildIds,
      revenueChildIds.reduce(
        (sum, id) => sum + (rowsById.get(id)?.ytmActuals ?? 0),
        0
      ),
      revenueActuals,
      'ytmActuals'
    );
    const costBudgetChildren = scaleChildren(
      costChildIds,
      costChildIds.reduce(
        (sum, id) => sum + (rowsById.get(id)?.ytmBudget ?? 0),
        0
      ),
      costBudget,
      'ytmBudget'
    );
    const costActualsChildren = scaleChildren(
      costChildIds,
      costChildIds.reduce(
        (sum, id) => sum + (rowsById.get(id)?.ytmActuals ?? 0),
        0
      ),
      costActuals,
      'ytmActuals'
    );

    return mockFunctionDeviationRows.map((row) => {
      if (row.id === 'conn-op') {
        return {
          ...row,
          ytmBudget: roundToOne(selectedNpBaseline),
          ytmActuals: roundToOne(selectedNpValue),
        };
      }
      if (row.id === 'revenue') {
        return {
          ...row,
          ytmBudget: roundToOne(revenueBudget),
          ytmActuals: roundToOne(revenueActuals),
        };
      }
      if (row.id === 'cost') {
        return {
          ...row,
          ytmBudget: roundToOne(costBudget),
          ytmActuals: roundToOne(costActuals),
        };
      }
      if (revenueChildIds.includes(row.id)) {
        return {
          ...row,
          ytmBudget: revenueBudgetChildren.get(row.id) ?? 0,
          ytmActuals: revenueActualsChildren.get(row.id) ?? 0,
        };
      }
      if (costChildIds.includes(row.id)) {
        return {
          ...row,
          ytmBudget: costBudgetChildren.get(row.id) ?? 0,
          ytmActuals: costActualsChildren.get(row.id) ?? 0,
        };
      }
      return row;
    });
  }, [selectedBus]);

  const scaledFunctionRow = useMemo(() => {
    const normalizedParam = normalizeFunction(functionParam);
    return (
      scaledRows.find((row) => normalizeFunction(row.label) === normalizedParam) ??
      scaledRows[0]
    );
  }, [scaledRows, functionParam]);

  const keyCallout = useMemo(() => {
    const buLabel =
      selectedBus.length > 0 ? selectedBus.join(', ') : 'all BUs';
    const budget = scaledFunctionRow?.ytmBudget ?? 0;
    const actual = scaledFunctionRow?.ytmActuals ?? 0;
    const variance = actual - budget;
    const varianceLabel =
      variance >= 0 ? 'above budget' : 'below budget';
    const absVariance = Math.abs(variance);
    const functionLabel = scaledFunctionRow?.label ?? functionParam;

    return {
      headline: `${functionLabel} for ${buLabel} is ${formatMn(
        absVariance
      )} ${varianceLabel}.`,
      bullets: [
        `Budget: ${formatMn(budget)} • Actual: ${formatMn(actual)} • Variance: ${formatMn(
          variance
        )}.`,
        `Focus on ${functionLabel.toLowerCase()} execution levers across ${buLabel}.`,
        variance >= 0
          ? 'Upside driven by mix and volume momentum in selected BUs.'
          : 'Gap driven by cost pressure and mix drift in selected BUs.',
      ],
    };
  }, [functionParam, scaledFunctionRow, selectedBus]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50'>
      <div className='max-w-[1920px] mx-auto px-8 py-8 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              {scaledFunctionRow?.label ?? functionParam} performance
            </h1>
            <div className='flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2'>
              <span className='px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600 font-semibold'>
                {getStoredTimeframe() === 'ytm' ? 'YTM actuals' : 'Full year'}
              </span>
              <span className='px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600 font-semibold'>
                {selectedBus.length > 0
                  ? `BUs: ${selectedBus.join(', ')}`
                  : 'All BUs'}
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>Key Call Out</h2>
              <p className='text-sm text-gray-500 mt-1'>
                {selectedBus.length > 0
                  ? `Selected BUs: ${selectedBus.join(', ')}`
                  : 'All BUs'}
              </p>
            </div>
            <span className='px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border-2 border-purple-400 shadow-md shadow-purple-200/50 flex items-center gap-1.5'>
              <span className='text-sm'>✨</span>
              <span>AI</span>
            </span>
          </div>
          <div className='space-y-3 text-sm text-gray-700'>
            <p className='leading-relaxed'>{keyCallout.headline}</p>
            <ul className='list-disc list-inside space-y-1'>
              {keyCallout.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
            <div className='flex items-center gap-2 mb-3 text-sm text-gray-500'>
              <ChartBarIcon className='w-4 h-4 text-primary-600' />
              <span>Budget</span>
            </div>
            <div className='text-3xl font-bold text-gray-900'>
              {formatMn(scaledFunctionRow?.ytmBudget ?? 0)}
            </div>
            <p className='text-xs text-gray-500 mt-2'>YTM budget</p>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
            <div className='flex items-center gap-2 mb-3 text-sm text-gray-500'>
              <ChartBarIcon className='w-4 h-4 text-primary-600' />
              <span>Actual</span>
            </div>
            <div className='text-3xl font-bold text-gray-900'>
              {formatMn(scaledFunctionRow?.ytmActuals ?? 0)}
            </div>
            <p className='text-xs text-gray-500 mt-2'>YTM actuals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
