import type { AnalysisResult } from '../types';

export const mockAnalysisResults: Record<string, AnalysisResult> = {
  'net-profit-by-bu': {
    id: 'analysis-1',
    queryId: 'query-1',
    summary:
      'Net profit variance of -$3.7M (-2.3%) is primarily driven by the PC Business Unit, which is $8.2M below budget due to US tariff impacts and volume decline. This is partially offset by strong performance in PC & Enterprise BU (+$4.5M above budget).',
    drillDownData: {
      level: 'bu',
      data: [
        {
          name: 'PC Products',
          value: 42.3,
          variance: -8.2,
          variancePercent: -16.2,
          children: [
            {
              name: 'PC Components',
              value: 28.5,
              variance: -6.8,
              variancePercent: -19.3,
            },
            {
              name: 'System Management',
              value: 8.9,
              variance: -1.2,
              variancePercent: -11.9,
            },
            {
              name: 'Power Systems',
              value: 4.9,
              variance: -0.2,
              variancePercent: -3.9,
            },
          ],
        },
        {
          name: 'PC & Enterprise',
          value: 52.8,
          variance: 4.5,
          variancePercent: 9.3,
          children: [
            {
              name: 'Server Components',
              value: 32.1,
              variance: 5.2,
              variancePercent: 19.3,
            },
            {
              name: 'Network Infrastructure',
              value: 15.2,
              variance: 0.3,
              variancePercent: 2.0,
            },
            {
              name: 'Storage Solutions',
              value: 5.5,
              variance: -1.0,
              variancePercent: -15.4,
            },
          ],
        },
        {
          name: 'Communication',
          value: 35.2,
          variance: 0.8,
          variancePercent: 2.3,
          children: [
            {
              name: 'Network Equipment',
              value: 21.3,
              variance: 1.2,
              variancePercent: 6.0,
            },
            {
              name: 'Antenna Systems',
              value: 9.8,
              variance: 0.1,
              variancePercent: 1.0,
            },
            {
              name: 'Fiber Optics',
              value: 4.1,
              variance: -0.5,
              variancePercent: -10.9,
            },
          ],
        },
        {
          name: 'Consumer Electronics',
          value: 26.0,
          variance: -0.8,
          variancePercent: -3.0,
          children: [
            {
              name: 'TWS Earphones',
              value: 14.2,
              variance: -1.2,
              variancePercent: -7.8,
            },
            {
              name: 'Laptops & Tablets',
              value: 8.5,
              variance: 0.2,
              variancePercent: 2.4,
            },
            {
              name: 'Wearables',
              value: 3.3,
              variance: 0.2,
              variancePercent: 6.5,
            },
          ],
        },
      ],
    },
    waterfallData: [
      { name: 'Budget', value: 160.0, type: 'total' },
      { name: 'Market Impact', value: -10.0, type: 'negative' },
      { name: 'Material Cost Increase', value: -5.2, type: 'negative' },
      { name: 'PC Growth', value: 8.5, type: 'positive' },
      { name: 'Market Growth', value: 3.8, type: 'positive' },
      { name: 'Customer Delay', value: -3.2, type: 'negative' },
      { name: 'L4 Initiative', value: 2.4, type: 'positive' },
      { name: 'Actual', value: 156.3, type: 'total' },
    ],
    timestamp: new Date(),
  },
  'procurement-cost-down': {
    id: 'analysis-2',
    queryId: 'query-2',
    summary:
      'Procurement cost down of 3.2% vs 5.0% target is underdelivered by 1.8 percentage points. Root causes: (1) Raw material inflation (component +15%, raw material +35%) offsetting supplier negotiation gains of 6.8%, (2) Mix shift toward higher-cost materials for server components, (3) Supply chain disruptions limiting alternative sourcing options.',
    drillDownData: {
      level: 'company',
      data: [
        {
          name: 'Supplier Negotiations',
          value: 6.8,
          variance: 1.8,
          variancePercent: 36.0,
          children: [
            {
              name: 'Component Suppliers',
              value: 2.1,
              variance: 0.3,
              variancePercent: 16.7,
            },
            {
              name: 'Plastic Materials',
              value: 2.3,
              variance: 0.5,
              variancePercent: 27.8,
            },
            {
              name: 'Raw Material Suppliers',
              value: 0.8,
              variance: -0.2,
              variancePercent: -20.0,
            },
            {
              name: 'Electronics Components',
              value: 1.6,
              variance: 1.2,
              variancePercent: 300.0,
            },
          ],
        },
        {
          name: 'Raw Material Inflation',
          value: -3.6,
          variance: -3.6,
          variancePercent: -100.0,
          children: [
            {
              name: 'Component Price Impact',
              value: -2.1,
              variance: -2.1,
              variancePercent: -100.0,
            },
            {
              name: 'Raw Material Impact',
              value: -1.3,
              variance: -1.3,
              variancePercent: -100.0,
            },
            {
              name: 'Other Metals',
              value: -0.2,
              variance: -0.2,
              variancePercent: -100.0,
            },
          ],
        },
      ],
    },
    waterfallData: [
      { name: 'Target', value: 5.0, type: 'total' },
      { name: 'Supplier Negotiations', value: 6.8, type: 'positive' },
      { name: 'Component Inflation', value: -2.1, type: 'negative' },
      { name: 'Raw Material Inflation', value: -1.3, type: 'negative' },
      { name: 'Mix Impact', value: -0.8, type: 'negative' },
      { name: 'Volume Leverage', value: 0.4, type: 'positive' },
      { name: 'Supply Chain Disruption', value: -0.6, type: 'negative' },
      { name: 'Other', value: -4.2, type: 'negative' },
      { name: 'Actual', value: 3.2, type: 'total' },
    ],
    timestamp: new Date(),
  },
  'revenue-by-customer': {
    id: 'analysis-3',
    queryId: 'query-3',
    summary:
      'Revenue variance of -$45M (-1.9%) is primarily driven by three factors: (1) Major Company A orders delayed by $12M due to production rescheduling, (2) Major OEM product launch shift reducing Q4 revenue by $8M, (3) General PC market softness in US market due to tariff uncertainty reducing orders by $18M. Partially offset by strong enterprise orders (+$15M) and PC infrastructure growth in Asia (+$8M).',
    drillDownData: {
      level: 'customer',
      data: [
        {
          name: 'Company A A',
          value: 142.5,
          variance: -12.0,
          variancePercent: -7.8,
        },
        {
          name: 'OEM A',
          value: 238.0,
          variance: -8.0,
          variancePercent: -3.3,
        },
        {
          name: 'Enterprise Customer A',
          value: 95.8,
          variance: 8.5,
          variancePercent: 9.7,
        },
        {
          name: 'Cloud Provider A',
          value: 87.3,
          variance: 6.5,
          variancePercent: 8.0,
        },
        {
          name: 'Company A B',
          value: 96.2,
          variance: -5.8,
          variancePercent: -5.7,
        },
        {
          name: 'Electronics A',
          value: 78.5,
          variance: 1.2,
          variancePercent: 1.6,
        },
        {
          name: 'Telecom Operators',
          value: 185.7,
          variance: 8.0,
          variancePercent: 4.5,
        },
        {
          name: 'Other Customers',
          value: 1381.0,
          variance: -43.4,
          variancePercent: -3.0,
        },
      ],
    },
    waterfallData: [
      { name: 'Budget', value: 2350.0, type: 'total' },
      { name: 'Company A Delay', value: -12.0, type: 'negative' },
      { name: 'OEM Shift', value: -8.0, type: 'negative' },
      { name: 'US Market Softness', value: -18.0, type: 'negative' },
      { name: 'PC Growth', value: 8.5, type: 'positive' },
      { name: 'Cloud Growth', value: 6.5, type: 'positive' },
      { name: 'Asia Growth', value: 8.0, type: 'positive' },
      { name: 'Company A B Decline', value: -5.8, type: 'negative' },
      { name: 'Other', value: -24.2, type: 'negative' },
      { name: 'Actual', value: 2305.0, type: 'total' },
    ],
    timestamp: new Date(),
  },
};

export const examplePrompts = [
  'Which BU is causing our net profit to fall behind budget?',
  'Why is procurement cost down underdelivered?',
  'Show me revenue variance by customer',
  'What is driving the gross profit variance?',
  'Analyze the UPPH performance by facility',
  'Break down the PC business unit performance by product line',
];
