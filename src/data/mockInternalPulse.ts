import type { PulseColumn, FinancialCategoryData } from '../types';

export const internalPulseColumns: PulseColumn[] = [
  {
    type: 'financial',
    title: 'Financial',
    sections: [
      {
        title: 'P&L',
        metrics: [
          {
            id: 'net-profit',
            name: 'Net Profit',
            value: 145.2,
            valuePercent: 6.3,
            unit: 'M USD',
            comparisons: {
              vsHHtarget: { percent: 2.5, percentagePoints: 1.2 },
              vsInternalTarget: { percent: 1.8, percentagePoints: 0.8 },
              vsLastRefresh: { percent: -1.2, percentagePoints: -0.5 },
              vsLastYear: { percent: -3.5, percentagePoints: -1.8 },
            },
          },
          {
            id: 'operating-profit',
            name: 'Operating Profit',
            value: 198.5,
            valuePercent: 8.6,
            unit: 'M USD',
            comparisons: {
              vsHHtarget: { percent: 3.2, percentagePoints: 1.5 },
              vsInternalTarget: { percent: 2.1, percentagePoints: 1.0 },
              vsLastRefresh: { percent: -0.8, percentagePoints: -0.3 },
              vsLastYear: { percent: -2.9, percentagePoints: -1.4 },
            },
          },
          {
            id: 'gross-profit',
            name: 'Gross Profit',
            value: 589.2,
            valuePercent: 25.6,
            unit: 'M USD',
            comparisons: {
              vsHHtarget: { percent: 1.5, percentagePoints: 0.7 },
              vsInternalTarget: { percent: 0.9, percentagePoints: 0.4 },
              vsLastRefresh: { percent: -0.5, percentagePoints: -0.2 },
              vsLastYear: { percent: -1.8, percentagePoints: -0.9 },
            },
          },
        ],
      },
      {
        title: 'Working Capital',
        metrics: [
          {
            id: 'working-capital',
            name: 'Rolling 3-months Working Capital',
            value: 325.8,
            unit: 'M USD',
            comparisons: {
              vsLastRefresh: { percent: 2.3 },
              vsCurrentYearAverage: { percent: -1.5 },
            },
          },
        ],
      },
    ],
  },
  {
    type: 'topline',
    title: 'Topline',
    sections: [
      {
        title: 'Revenue',
        metrics: [
          {
            id: 'total-revenue',
            name: 'Total Revenue',
            value: 2305.0,
            unit: 'M USD',
            comparisons: {
              vsTarget: { percent: 2.1 },
              vsLastRefresh: { percent: 1.5 },
              vsLastYear: { percent: -3.2 },
            },
          },
          {
            id: 'a-customer-revenue',
            name: 'A Customer Revenue',
            value: 850.5,
            valuePercent: 36.9,
            unit: 'M USD',
            comparisons: {
              vsTarget: { percent: 1.8 },
              vsLastRefresh: { percent: 1.2 },
              vsLastYear: { percent: -2.5 },
            },
          },
          {
            id: '5gaiot-revenue',
            name: '5GAIoT Revenue',
            value: 680.3,
            valuePercent: 29.5,
            unit: 'M USD',
            comparisons: {
              vsTarget: { percent: 2.5 },
              vsLastRefresh: { percent: 1.8 },
              vsLastYear: { percent: -1.5 },
            },
          },
          {
            id: 'belkin-revenue',
            name: 'Belkin Revenue',
            value: 425.8,
            valuePercent: 18.5,
            unit: 'M USD',
            comparisons: {
              vsTarget: { percent: 1.2 },
              vsLastRefresh: { percent: 0.9 },
              vsLastYear: { percent: -4.2 },
            },
          },
          {
            id: 'mobility-revenue',
            name: 'Mobility Revenue',
            value: 348.4,
            valuePercent: 15.1,
            unit: 'M USD',
            comparisons: {
              vsTarget: { percent: 0.8 },
              vsLastRefresh: { percent: 0.5 },
              vsLastYear: { percent: -2.8 },
            },
          },
        ],
      },
    ],
  },
  {
    type: 'operation',
    title: 'Operation',
    sections: [
      {
        title: 'Quality',
        metrics: [
          {
            id: 'copq',
            name: 'COPQ',
            value: 0.02,
            unit: 'M USD',
            subMetrics: [
              {
                name: 'Repeated cases',
                value: 4.8,
                unit: 'M USD',
                percentOfTotal: 38.4,
              },
              {
                name: 'KA cases',
                value: 3.2,
                unit: 'M USD',
                percentOfTotal: 25.6,
              },
            ],
          },
          {
            id: 'customer-complaints',
            name: 'Customer Complaint Open Cases',
            value: 28,
            unit: '',
            subMetrics: [
              {
                name: 'Repeated cases',
                value: 12,
                unit: '',
                percentOfTotal: 42.9,
              },
              {
                name: 'KA cases',
                value: 8,
                unit: '',
                percentOfTotal: 28.6,
              },
            ],
          },
        ],
      },
      {
        title: 'MFG',
        metrics: [
          {
            id: 'upph',
            name: 'UPPH',
            comparisons: {
              vsLastYear: { percent: -2.5 },
            },
          },
          {
            id: 'oee',
            name: 'OEE',
            comparisons: {
              vsLastYear: { percent: -1.8 },
            },
          },
        ],
      },
      {
        title: 'Procurement',
        metrics: [
          {
            id: 'critical-material-price-header',
            name: 'Critical material price',
            value: undefined,
          },
          {
            id: 'gold-material',
            name: 'Gold',
            value: 2400,
            unit: 'USD / oz',
            subMetrics: [
              {
                name: 'PO price (Vs. MAP)',
                value: 2300,
                unit: 'USD / oz',
                percentOfTotal: -4.17, // (2300-2400)/2400 * 100
              },
              {
                name: 'GR price (Vs. MAP)',
                value: 2350,
                unit: 'USD / oz',
                percentOfTotal: -2.08, // (2350-2400)/2400 * 100
              },
              {
                name: 'Market price (Vs. MAP)',
                value: 2450,
                unit: 'USD / oz',
                percentOfTotal: 2.08, // (2450-2400)/2400 * 100
              },
            ],
          },
          {
            id: 'copper-material',
            name: 'Copper',
            value: 3.75,
            unit: 'USD / lb',
            subMetrics: [
              {
                name: 'PO price (Vs. MAP)',
                value: 3.65,
                unit: 'USD / lb',
                percentOfTotal: -2.67, // (3.65-3.75)/3.75 * 100
              },
              {
                name: 'GR price (Vs. MAP)',
                value: 3.7,
                unit: 'USD / lb',
                percentOfTotal: -1.33, // (3.70-3.75)/3.75 * 100
              },
              {
                name: 'Market price (Vs. MAP)',
                value: 3.85,
                unit: 'USD / lb',
                percentOfTotal: 2.67, // (3.85-3.75)/3.75 * 100
              },
            ],
          },
          {
            id: 'rubber-material',
            name: 'Rubber',
            value: 1.45,
            unit: 'USD / lb',
            subMetrics: [
              {
                name: 'PO price (Vs. MAP)',
                value: 1.42,
                unit: 'USD / lb',
                percentOfTotal: -2.07, // (1.42-1.45)/1.45 * 100
              },
              {
                name: 'GR price (Vs. MAP)',
                value: 1.44,
                unit: 'USD / lb',
                percentOfTotal: -0.69, // (1.44-1.45)/1.45 * 100
              },
              {
                name: 'Market price (Vs. MAP)',
                value: 1.48,
                unit: 'USD / lb',
                percentOfTotal: 2.07, // (1.48-1.45)/1.45 * 100
              },
            ],
          },
        ],
      },
      {
        title: 'R&D',
        metrics: [
          {
            id: 'rd-expense-percent',
            name: 'R&D exp. As % of revenue',
            valuePercent: 4.8,
            hasWarning: true,
            comparisons: {
              vsTarget: { percent: 0.3 },
              vsLastRefresh: { percent: 0.2 },
              vsLastYear: { percent: 0.5 },
            },
          },
        ],
      },
      {
        title: 'Supply Chain',
        metrics: [
          {
            id: 'inventory-turnover',
            name: 'Inventory Turnover rate',
            valuePercent: 12.5,
            comparisons: {
              vsLastYear: { percent: 1.2 },
            },
          },
        ],
      },
    ],
  },
];

// Backward compatibility export - empty array to prevent breaking other components
// TODO: Migrate RootCauseAnalysisSidebar and valueDriverMapping to use new structure
export const mockInternalPulseData: FinancialCategoryData[] = [];
