import type {
  FinancialCategoryData,
  FinancialMetric,
  ValueDriver,
  AffectingFactor,
} from '../types';
import { subMonths } from 'date-fns';

// Helper function to create affecting factors
function createFactor(
  id: string,
  name: string,
  tag: AffectingFactor['tag'],
  description?: string
): AffectingFactor {
  return { id, name, tag, description };
}

// Helper function to create value drivers
function createValueDriver(
  id: string,
  name: string,
  factors: AffectingFactor[],
  description?: string
): ValueDriver {
  return { id, name, description, affectingFactors: factors };
}

// Revenue Category
const revenueValueDrivers: ValueDriver[] = [
  createValueDriver('revenue-volume', 'Volume', [
    createFactor(
      'rev-vol-1',
      'Customer demand forecast (rolling order / MRP)',
      'internal-information'
    ),
    createFactor(
      'rev-vol-2',
      'Capacity constraint / allocation decision',
      'internal-kpi'
    ),
  ]),
  createValueDriver('revenue-asp', 'ASP (Average Selling Price)', [
    createFactor(
      'rev-asp-1',
      'Contract price adjustment / annual negotiation',
      'internal-information'
    ),
    createFactor(
      'rev-asp-2',
      'FX rate (billing currency vs cost currency)',
      'external-information'
    ),
  ]),
  createValueDriver('revenue-product-mix', 'Product Mix', [
    createFactor(
      'rev-mix-1',
      'Customer demand forecast (rolling order / MRP)',
      'internal-information'
    ),
  ]),
];

const revenueMetric: FinancialMetric = {
  id: 'revenue',
  name: 'Revenue',
  value: 2305.0,
  unit: 'M USD',
  budget: 2350.0,
  variance: -45.0,
  variancePercent: -1.9,
  status: 'warning',
  trend: 'up',
  lastUpdated: new Date(),
  valueDrivers: revenueValueDrivers,
  history: [
    { date: subMonths(new Date(), 11), value: 2100.0, budget: 2150.0 },
    { date: subMonths(new Date(), 10), value: 2135.0, budget: 2180.0 },
    { date: subMonths(new Date(), 9), value: 2158.0, budget: 2210.0 },
    { date: subMonths(new Date(), 8), value: 2180.0, budget: 2240.0 },
    { date: subMonths(new Date(), 7), value: 2202.0, budget: 2260.0 },
    { date: subMonths(new Date(), 6), value: 2225.0, budget: 2280.0 },
    { date: subMonths(new Date(), 5), value: 2238.0, budget: 2300.0 },
    { date: subMonths(new Date(), 4), value: 2245.0, budget: 2315.0 },
    { date: subMonths(new Date(), 3), value: 2248.0, budget: 2325.0 },
    { date: subMonths(new Date(), 2), value: 2250.3, budget: 2335.0 },
    { date: subMonths(new Date(), 1), value: 2278.0, budget: 2342.0 },
    { date: new Date(), value: 2305.0, budget: 2350.0 },
  ],
};

// COGS Category
const cogsDirectLaborDrivers: ValueDriver[] = [
  createValueDriver('dl-production-volume', 'Production Volume', [
    createFactor(
      'dl-vol-1',
      'Customer demand forecast (rolling order / MRP)',
      'internal-information'
    ),
  ]),
  createValueDriver('dl-upph', 'UPPH (Units Per Person Hour)', [
    createFactor(
      'dl-upph-1',
      'Line balancing / process optimization',
      'internal-kpi'
    ),
    createFactor(
      'dl-upph-2',
      'Automation upgrade / tooling efficiency',
      'internal-kpi'
    ),
  ]),
  createValueDriver('dl-labor-rate', 'DL Labor Rate', [
    createFactor(
      'dl-rate-1',
      'Wage adjustment / policy',
      'external-information'
    ),
    createFactor(
      'dl-rate-2',
      'Overtime ratio / manpower flexibility',
      'internal-kpi'
    ),
  ]),
];

const cogsIndirectLaborDrivers: ValueDriver[] = [
  createValueDriver('idl-count', '# of IDL (Number of Indirect Labor)', [
    createFactor(
      'idl-count-1',
      'Manufacturing complexity / # of lines supported',
      'internal-kpi'
    ),
  ]),
  createValueDriver('idl-labor-rate', 'IDL Labor Rate', [
    createFactor(
      'idl-rate-1',
      'Wage inflation / market benchmark',
      'external-information'
    ),
    createFactor(
      'idl-rate-2',
      'Shift allowance / benefit policy',
      'internal-kpi'
    ),
  ]),
];

const cogsOverheadDrivers: ValueDriver[] = [
  createValueDriver('oh-energy', 'Energy Cost', [
    createFactor(
      'oh-energy-1',
      'Utility tariff / energy index',
      'external-information'
    ),
    createFactor('oh-energy-2', 'Utilization rate / idle time', 'internal-kpi'),
  ]),
  createValueDriver('oh-depreciation', 'Depreciation', [
    createFactor('oh-dep-1', 'CapEx plan / asset base', 'internal-information'),
  ]),
  createValueDriver('oh-maintenance', 'Maintenance Cost', [
    createFactor('oh-maint-1', 'Equipment downtime / age', 'internal-kpi'),
  ]),
  createValueDriver('oh-materials', 'Indirect Materials', [
    createFactor('oh-mat-1', 'Usage rate / machine efficiency', 'internal-kpi'),
  ]),
];

const cogsMaterialDrivers: ValueDriver[] = [
  createValueDriver('mat-volume', 'Material Volume', [
    createFactor('mat-vol-1', 'Production output', 'internal-kpi'),
    createFactor('mat-vol-2', 'Scrap & yield rate', 'internal-kpi'),
  ]),
  createValueDriver('mat-index-price', 'Index-Based Material Price', [
    createFactor(
      'mat-price-1',
      'Commodity index (resin, copper, aluminum, etc.)',
      'external-information'
    ),
    createFactor(
      'mat-price-2',
      'FX rate (imported materials)',
      'external-information'
    ),
  ]),
  createValueDriver('mat-non-index-price', 'Non-Index-Based Material Price', [
    createFactor(
      'mat-non-index-1',
      'Supplier negotiation / localization',
      'internal-information'
    ),
  ]),
];

const cogsMetrics: FinancialMetric[] = [
  {
    id: 'cogs-dl',
    name: 'Direct Labor (MVA-DL)',
    value: 245.8,
    unit: 'M USD',
    budget: 240.0,
    variance: 5.8,
    variancePercent: 2.4,
    status: 'warning',
    trend: 'up',
    lastUpdated: new Date(),
    valueDrivers: cogsDirectLaborDrivers,
    history: [
      { date: subMonths(new Date(), 11), value: 230.0, budget: 235.0 },
      { date: subMonths(new Date(), 10), value: 232.0, budget: 237.0 },
      { date: subMonths(new Date(), 9), value: 234.0, budget: 238.0 },
      { date: subMonths(new Date(), 8), value: 236.0, budget: 239.0 },
      { date: subMonths(new Date(), 7), value: 238.0, budget: 240.0 },
      { date: subMonths(new Date(), 6), value: 240.0, budget: 240.0 },
      { date: subMonths(new Date(), 5), value: 242.0, budget: 240.0 },
      { date: subMonths(new Date(), 4), value: 243.0, budget: 240.0 },
      { date: subMonths(new Date(), 3), value: 244.0, budget: 240.0 },
      { date: subMonths(new Date(), 2), value: 244.5, budget: 240.0 },
      { date: subMonths(new Date(), 1), value: 245.2, budget: 240.0 },
      { date: new Date(), value: 245.8, budget: 240.0 },
    ],
  },
  {
    id: 'cogs-idl',
    name: 'Indirect Labor (MVA-IDL)',
    value: 128.5,
    unit: 'M USD',
    budget: 125.0,
    variance: 3.5,
    variancePercent: 2.8,
    status: 'warning',
    trend: 'up',
    lastUpdated: new Date(),
    valueDrivers: cogsIndirectLaborDrivers,
    history: [
      { date: subMonths(new Date(), 11), value: 120.0, budget: 122.0 },
      { date: subMonths(new Date(), 10), value: 121.0, budget: 123.0 },
      { date: subMonths(new Date(), 9), value: 122.0, budget: 123.5 },
      { date: subMonths(new Date(), 8), value: 123.0, budget: 124.0 },
      { date: subMonths(new Date(), 7), value: 124.0, budget: 124.5 },
      { date: subMonths(new Date(), 6), value: 125.0, budget: 125.0 },
      { date: subMonths(new Date(), 5), value: 126.0, budget: 125.0 },
      { date: subMonths(new Date(), 4), value: 126.5, budget: 125.0 },
      { date: subMonths(new Date(), 3), value: 127.0, budget: 125.0 },
      { date: subMonths(new Date(), 2), value: 127.5, budget: 125.0 },
      { date: subMonths(new Date(), 1), value: 128.0, budget: 125.0 },
      { date: new Date(), value: 128.5, budget: 125.0 },
    ],
  },
  {
    id: 'cogs-oh',
    name: 'MFG Overhead (MVA-OH)',
    value: 1341.5,
    unit: 'M USD',
    budget: 1390.0,
    variance: -48.5,
    variancePercent: -3.5,
    status: 'good',
    trend: 'down',
    lastUpdated: new Date(),
    valueDrivers: cogsOverheadDrivers,
    history: [
      { date: subMonths(new Date(), 11), value: 1400.0, budget: 1420.0 },
      { date: subMonths(new Date(), 10), value: 1395.0, budget: 1415.0 },
      { date: subMonths(new Date(), 9), value: 1390.0, budget: 1410.0 },
      { date: subMonths(new Date(), 8), value: 1385.0, budget: 1405.0 },
      { date: subMonths(new Date(), 7), value: 1375.0, budget: 1400.0 },
      { date: subMonths(new Date(), 6), value: 1370.0, budget: 1395.0 },
      { date: subMonths(new Date(), 5), value: 1365.0, budget: 1392.0 },
      { date: subMonths(new Date(), 4), value: 1355.0, budget: 1390.0 },
      { date: subMonths(new Date(), 3), value: 1350.0, budget: 1390.0 },
      { date: subMonths(new Date(), 2), value: 1345.0, budget: 1390.0 },
      { date: subMonths(new Date(), 1), value: 1343.0, budget: 1390.0 },
      { date: new Date(), value: 1341.5, budget: 1390.0 },
    ],
  },
  {
    id: 'cogs-material',
    name: 'Material (BOM)',
    value: 1025.2,
    unit: 'M USD',
    budget: 995.0,
    variance: 30.2,
    variancePercent: 3.0,
    status: 'warning',
    trend: 'up',
    lastUpdated: new Date(),
    valueDrivers: cogsMaterialDrivers,
    history: [
      { date: subMonths(new Date(), 11), value: 990.0, budget: 1000.0 },
      { date: subMonths(new Date(), 10), value: 995.0, budget: 998.0 },
      { date: subMonths(new Date(), 9), value: 1000.0, budget: 996.0 },
      { date: subMonths(new Date(), 8), value: 1005.0, budget: 994.0 },
      { date: subMonths(new Date(), 7), value: 1010.0, budget: 992.0 },
      { date: subMonths(new Date(), 6), value: 1015.0, budget: 990.0 },
      { date: subMonths(new Date(), 5), value: 1020.0, budget: 990.0 },
      { date: subMonths(new Date(), 4), value: 1022.0, budget: 992.0 },
      { date: subMonths(new Date(), 3), value: 1023.0, budget: 993.0 },
      { date: subMonths(new Date(), 2), value: 1024.0, budget: 994.0 },
      { date: subMonths(new Date(), 1), value: 1024.5, budget: 994.5 },
      { date: new Date(), value: 1025.2, budget: 995.0 },
    ],
  },
];

// OPEX Category
const opexSalesDrivers: ValueDriver[] = [
  createValueDriver('sales-fte', 'FTE (Full-Time Equivalent)', [
    createFactor('sales-fte-1', 'Account management headcount', 'internal-kpi'),
  ]),
  createValueDriver('sales-non-fte', 'Non-FTE', [
    createFactor(
      'sales-non-fte-1',
      'Travel / customer support / logistics',
      'internal-kpi'
    ),
  ]),
];

const opexAdminDrivers: ValueDriver[] = [
  createValueDriver('admin-fte', 'FTE', [
    createFactor('admin-fte-1', 'Shared service efficiency', 'internal-kpi'),
  ]),
  createValueDriver('admin-non-fte', 'Non-FTE', [
    createFactor(
      'admin-non-fte-1',
      'Rent, utilities, IT systems',
      'internal-information'
    ),
  ]),
];

const opexRDDrivers: ValueDriver[] = [
  createValueDriver('rd-fte', 'FTE', [
    createFactor(
      'rd-fte-1',
      'Customer engineering support',
      'internal-information'
    ),
  ]),
  createValueDriver('rd-non-fte', 'Non-FTE', [
    createFactor(
      'rd-non-fte-1',
      'Project cost, test materials',
      'internal-information'
    ),
  ]),
];

const opexMetrics: FinancialMetric[] = [
  {
    id: 'opex-sales',
    name: 'Sales Expense',
    value: 285.5,
    unit: 'M USD',
    budget: 290.0,
    variance: -4.5,
    variancePercent: -1.6,
    status: 'good',
    trend: 'down',
    lastUpdated: new Date(),
    valueDrivers: opexSalesDrivers,
    history: [
      { date: subMonths(new Date(), 11), value: 295.0, budget: 295.0 },
      { date: subMonths(new Date(), 10), value: 293.0, budget: 293.0 },
      { date: subMonths(new Date(), 9), value: 291.0, budget: 291.5 },
      { date: subMonths(new Date(), 8), value: 290.0, budget: 290.5 },
      { date: subMonths(new Date(), 7), value: 289.0, budget: 290.0 },
      { date: subMonths(new Date(), 6), value: 288.0, budget: 290.0 },
      { date: subMonths(new Date(), 5), value: 287.0, budget: 290.0 },
      { date: subMonths(new Date(), 4), value: 286.5, budget: 290.0 },
      { date: subMonths(new Date(), 3), value: 286.0, budget: 290.0 },
      { date: subMonths(new Date(), 2), value: 285.8, budget: 290.0 },
      { date: subMonths(new Date(), 1), value: 285.6, budget: 290.0 },
      { date: new Date(), value: 285.5, budget: 290.0 },
    ],
  },
  {
    id: 'opex-admin',
    name: 'Admin Expense',
    value: 195.3,
    unit: 'M USD',
    budget: 200.0,
    variance: -4.7,
    variancePercent: -2.4,
    status: 'good',
    trend: 'down',
    lastUpdated: new Date(),
    valueDrivers: opexAdminDrivers,
    history: [
      { date: subMonths(new Date(), 11), value: 205.0, budget: 205.0 },
      { date: subMonths(new Date(), 10), value: 203.0, budget: 203.0 },
      { date: subMonths(new Date(), 9), value: 201.0, budget: 202.0 },
      { date: subMonths(new Date(), 8), value: 200.0, budget: 201.0 },
      { date: subMonths(new Date(), 7), value: 199.0, budget: 200.5 },
      { date: subMonths(new Date(), 6), value: 198.0, budget: 200.0 },
      { date: subMonths(new Date(), 5), value: 197.0, budget: 200.0 },
      { date: subMonths(new Date(), 4), value: 196.5, budget: 200.0 },
      { date: subMonths(new Date(), 3), value: 196.0, budget: 200.0 },
      { date: subMonths(new Date(), 2), value: 195.8, budget: 200.0 },
      { date: subMonths(new Date(), 1), value: 195.5, budget: 200.0 },
      { date: new Date(), value: 195.3, budget: 200.0 },
    ],
  },
  {
    id: 'opex-rd',
    name: 'R&D Expense',
    value: 110.6,
    unit: 'M USD',
    budget: 105.8,
    variance: 4.8,
    variancePercent: 4.5,
    status: 'warning',
    trend: 'up',
    lastUpdated: new Date(),
    valueDrivers: opexRDDrivers,
    history: [
      { date: subMonths(new Date(), 11), value: 109.2, budget: 110.0 },
      { date: subMonths(new Date(), 10), value: 109.5, budget: 109.5 },
      { date: subMonths(new Date(), 9), value: 109.8, budget: 109.0 },
      { date: subMonths(new Date(), 8), value: 110.0, budget: 108.5 },
      { date: subMonths(new Date(), 7), value: 110.2, budget: 108.0 },
      { date: subMonths(new Date(), 6), value: 110.3, budget: 107.5 },
      { date: subMonths(new Date(), 5), value: 110.4, budget: 107.0 },
      { date: subMonths(new Date(), 4), value: 110.5, budget: 106.5 },
      { date: subMonths(new Date(), 3), value: 110.55, budget: 106.2 },
      { date: subMonths(new Date(), 2), value: 110.58, budget: 106.0 },
      { date: subMonths(new Date(), 1), value: 110.6, budget: 105.9 },
      { date: new Date(), value: 110.6, budget: 105.8 },
    ],
  },
];

// Operating Profit Category
const operatingProfitMetrics: FinancialMetric[] = [
  {
    id: 'gross-profit',
    name: 'Gross Profit',
    value: 589.2,
    unit: 'M USD',
    budget: 595.0,
    variance: -5.8,
    variancePercent: -1.0,
    status: 'good',
    trend: 'up',
    lastUpdated: new Date(),
    valueDrivers: [
      createValueDriver('gp-derived', 'Gross Profit', [
        createFactor('gp-factor-1', 'Revenue & COGS outcome', 'derived'),
      ]),
    ],
    history: [
      { date: subMonths(new Date(), 11), value: 540.2, budget: 550.0 },
      { date: subMonths(new Date(), 10), value: 548.5, budget: 555.0 },
      { date: subMonths(new Date(), 9), value: 552.8, budget: 560.0 },
      { date: subMonths(new Date(), 8), value: 557.2, budget: 565.0 },
      { date: subMonths(new Date(), 7), value: 562.5, budget: 570.0 },
      { date: subMonths(new Date(), 6), value: 568.0, budget: 575.0 },
      { date: subMonths(new Date(), 5), value: 571.9, budget: 580.0 },
      { date: subMonths(new Date(), 4), value: 574.3, budget: 585.0 },
      { date: subMonths(new Date(), 3), value: 576.6, budget: 588.0 },
      { date: subMonths(new Date(), 2), value: 578.5, budget: 590.0 },
      { date: subMonths(new Date(), 1), value: 583.7, budget: 592.0 },
      { date: new Date(), value: 589.2, budget: 595.0 },
    ],
  },
  {
    id: 'opex-total',
    name: 'OPEX',
    value: 591.4,
    unit: 'M USD',
    budget: 595.8,
    variance: -4.4,
    variancePercent: -0.7,
    status: 'good',
    trend: 'down',
    lastUpdated: new Date(),
    valueDrivers: [
      createValueDriver('opex-derived', 'OPEX', [
        createFactor('opex-factor-1', 'OPEX control & productivity', 'derived'),
      ]),
    ],
    history: [
      { date: subMonths(new Date(), 11), value: 609.2, budget: 610.0 },
      { date: subMonths(new Date(), 10), value: 605.5, budget: 605.5 },
      { date: subMonths(new Date(), 9), value: 601.8, budget: 602.5 },
      { date: subMonths(new Date(), 8), value: 600.0, budget: 600.0 },
      { date: subMonths(new Date(), 7), value: 598.2, budget: 598.5 },
      { date: subMonths(new Date(), 6), value: 596.3, budget: 597.0 },
      { date: subMonths(new Date(), 5), value: 594.4, budget: 596.5 },
      { date: subMonths(new Date(), 4), value: 593.5, budget: 596.5 },
      { date: subMonths(new Date(), 3), value: 592.6, budget: 596.0 },
      { date: subMonths(new Date(), 2), value: 592.18, budget: 596.0 },
      { date: subMonths(new Date(), 1), value: 591.76, budget: 595.9 },
      { date: new Date(), value: 591.4, budget: 595.8 },
    ],
  },
];

export const mockInternalPulseData: FinancialCategoryData[] = [
  {
    category: 'revenue',
    categoryName: 'Revenue',
    metrics: [revenueMetric],
  },
  {
    category: 'cogs',
    categoryName: 'COGS (Cost of Goods Sold)',
    metrics: cogsMetrics,
  },
  {
    category: 'opex',
    categoryName: 'OPEX (Operating Expenses)',
    metrics: opexMetrics,
  },
  {
    category: 'operating-profit',
    categoryName: 'Operating Profit',
    metrics: operatingProfitMetrics,
  },
];
