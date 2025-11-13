import type {
  ForecastDriver,
  OperationalKPI,
  IncomeStatement,
  BusinessEvent,
  Scenario,
  Initiative,
  OPWaterfallStage,
  FinancialCategoryGroup,
  AppliedAssumption,
  NPDeviationStage,
  KeyCallOut,
  ProductFamilyData,
  CostImpactData,
  CostComponentTotals,
  MVABreakdownStage,
} from '../types';
import { addMonths, subDays } from 'date-fns';

// Hierarchical Value Drivers matching the image structure
export const mockValueDriverHierarchy: FinancialCategoryGroup[] = [
  {
    id: 'revenue',
    name: 'Revenue',
    metrics: [
      {
        id: 'revenue-metric',
        name: 'Revenue',
        valueDrivers: [
          {
            id: 'vd-rev-vol-1',
            name: 'Volume',
            value: 7.2,
            unit: 'M units',
            changePercent: -4.0,
          },
          {
            id: 'vd-rev-vol-2',
            name: 'Volume',
            value: 7.2,
            unit: 'M units',
            changePercent: -4.0,
          },
          {
            id: 'vd-rev-asp-1',
            name: 'ASP (avg. selling price)',
            value: 331.8,
            unit: 'USD',
            changePercent: 4.2,
          },
          {
            id: 'vd-rev-asp-2',
            name: 'ASP',
            value: 331.8,
            unit: 'USD',
            changePercent: 4.2,
          },
          {
            id: 'vd-rev-mix',
            name: 'Product Mix',
            value: 1.05,
            unit: 'ratio',
            changePercent: 5.0,
          },
        ],
      },
    ],
  },
  {
    id: 'cogs',
    name: 'COGS',
    metrics: [
      {
        id: 'cogs-dl',
        name: 'Direct Labor (MVA-DL)',
        valueDrivers: [
          {
            id: 'vd-dl-vol',
            name: 'Production Volume',
            value: 7.2,
            unit: 'M units',
            changePercent: -4.0,
          },
          {
            id: 'vd-dl-upph-1',
            name: 'UPPH',
            value: 2.6,
            unit: 'units/person/hr',
            changePercent: 13.0,
          },
          {
            id: 'vd-dl-upph-2',
            name: 'UPPH',
            value: 2.6,
            unit: 'units/person/hr',
            changePercent: 13.0,
          },
          {
            id: 'vd-dl-rate-1',
            name: 'DL Labor Rate',
            value: 4.54,
            unit: 'USD/hour',
            changePercent: 8.1,
          },
          {
            id: 'vd-dl-rate-2',
            name: 'DL Labor Rate',
            value: 4.54,
            unit: 'USD/hour',
            changePercent: 8.1,
          },
        ],
      },
      {
        id: 'cogs-idl',
        name: 'Indirect Labor (MVA-IDL)',
        valueDrivers: [
          {
            id: 'vd-idl-count',
            name: '# of IDL',
            value: 875,
            unit: 'people',
            changePercent: 2.9,
          },
          {
            id: 'vd-idl-rate-1',
            name: 'IDL Labor Rate',
            value: 6.1,
            unit: 'USD/hour',
            changePercent: 5.2,
          },
          {
            id: 'vd-idl-rate-2',
            name: 'IDL Labor Rate',
            value: 6.1,
            unit: 'USD/hour',
            changePercent: 5.2,
          },
        ],
      },
      {
        id: 'cogs-oh',
        name: 'MFG Overhead (MVA-OH)',
        valueDrivers: [
          {
            id: 'vd-oh-energy-1',
            name: 'Energy Cost',
            value: 0.135,
            unit: 'USD/kWh',
            changePercent: 12.5,
          },
          {
            id: 'vd-oh-energy-2',
            name: 'Energy Cost',
            value: 0.135,
            unit: 'USD/kWh',
            changePercent: 12.5,
          },
          {
            id: 'vd-oh-depr',
            name: 'Depreciation',
            value: 48.5,
            unit: 'M USD',
            changePercent: 7.3,
          },
          {
            id: 'vd-oh-maint',
            name: 'Maintenance Cost',
            value: 19.2,
            unit: 'M USD',
            changePercent: 3.8,
          },
        ],
      },
      {
        id: 'cogs-material',
        name: 'Material (BOM)',
        valueDrivers: [
          {
            id: 'vd-mat-indirect',
            name: 'Indirect Materials',
            value: 13.2,
            unit: 'M USD',
            changePercent: 5.6,
          },
          {
            id: 'vd-mat-vol-1',
            name: 'Material Volume',
            value: 7.2,
            unit: 'M units',
            changePercent: -4.0,
          },
          {
            id: 'vd-mat-vol-2',
            name: 'Material Volume',
            value: 7.2,
            unit: 'M units',
            changePercent: -4.0,
          },
          {
            id: 'vd-mat-index-price-1',
            name: 'Index-Based Material Price',
            value: 61.0,
            unit: 'USD/kg',
            changePercent: 35.0,
          },
          {
            id: 'vd-mat-index-price-2',
            name: 'Index-Based Material Price',
            value: 61.0,
            unit: 'USD/kg',
            changePercent: 35.0,
          },
          {
            id: 'vd-mat-non-index-price',
            name: 'Non-Index-Based Material Price',
            value: 31.2,
            unit: 'USD/kg',
            changePercent: 9.5,
          },
        ],
      },
    ],
  },
  {
    id: 'opex',
    name: 'OPEX',
    metrics: [
      {
        id: 'opex-sales',
        name: 'Sales Expense',
        valueDrivers: [
          {
            id: 'vd-sales-fte',
            name: 'FTE',
            value: 258,
            unit: 'people',
            changePercent: 5.3,
          },
          {
            id: 'vd-sales-non-fte',
            name: 'Non-FTE',
            value: 92,
            unit: 'people',
            changePercent: 8.2,
          },
        ],
      },
      {
        id: 'opex-admin',
        name: 'Admin Expense',
        valueDrivers: [
          {
            id: 'vd-admin-fte',
            name: 'FTE',
            value: 192,
            unit: 'people',
            changePercent: 3.8,
          },
          {
            id: 'vd-admin-non-fte',
            name: 'Non-FTE',
            value: 45,
            unit: 'people',
            changePercent: 7.1,
          },
        ],
      },
      {
        id: 'opex-rd',
        name: 'R&D Expense',
        valueDrivers: [
          {
            id: 'vd-rd-fte',
            name: 'FTE',
            value: 335,
            unit: 'people',
            changePercent: 4.7,
          },
          {
            id: 'vd-rd-non-fte',
            name: 'Non-FTE',
            value: 138,
            unit: 'people',
            changePercent: 10.4,
          },
        ],
      },
    ],
  },
  {
    id: 'operating-profit',
    name: 'Operating Profit',
    metrics: [
      {
        id: 'op-metric',
        name: '',
        valueDrivers: [
          {
            id: 'vd-op-gp',
            name: 'Gross Profit',
            value: 660.7,
            unit: 'M USD',
            changePercent: -1.9,
          },
          {
            id: 'vd-op-opex',
            name: 'OPEX',
            value: 390.7,
            unit: 'M USD',
            changePercent: 0.0,
          },
        ],
      },
    ],
  },
];

export const mockForecastDrivers: ForecastDriver[] = [
  {
    id: 'driver-1',
    name: 'EV Connector Volume (H2 2025)',
    category: 'volume',
    latestActual: 2.3,
    forecastValue: 1.84,
    unit: 'M units',
    changePercent: -20,
    impactOnPL: -10.0,
    relatedAssumptions: ['assum-1', 'assum-2'],
  },
  {
    id: 'driver-2',
    name: 'Data Center Connector Volume',
    category: 'volume',
    latestActual: 1.8,
    forecastValue: 2.56,
    unit: 'M units',
    changePercent: 42,
    impactOnPL: 18.5,
    relatedAssumptions: ['assum-11'],
  },
  {
    id: 'driver-3',
    name: 'UPPH (Manufacturing Productivity)',
    category: 'productivity',
    latestActual: 2.3,
    forecastValue: 2.6,
    unit: 'units/person/hr',
    changePercent: 13,
    impactOnPL: 4.2,
    relatedAssumptions: ['assum-9'],
  },
  {
    id: 'driver-4',
    name: 'Rare Earth Material Cost',
    category: 'cost',
    latestActual: 45.2,
    forecastValue: 61.0,
    unit: 'USD/kg',
    changePercent: 35,
    impactOnPL: -5.0,
    relatedAssumptions: ['assum-3'],
  },
  {
    id: 'driver-5',
    name: 'Copper Price',
    category: 'cost',
    latestActual: 8.5,
    forecastValue: 9.78,
    unit: 'USD/kg',
    changePercent: 15,
    impactOnPL: -7.0,
    relatedAssumptions: ['assum-4'],
  },
  {
    id: 'driver-6',
    name: 'Vietnam Labor Rate',
    category: 'cost',
    latestActual: 4.2,
    forecastValue: 4.54,
    unit: 'USD/hour',
    changePercent: 8,
    impactOnPL: -2.1,
    relatedAssumptions: ['assum-6'],
  },
  {
    id: 'driver-7',
    name: '5G Connector Volume',
    category: 'volume',
    latestActual: 3.2,
    forecastValue: 4.16,
    unit: 'M units',
    changePercent: 30,
    impactOnPL: 12.6,
    relatedAssumptions: ['assum-5'],
  },
  {
    id: 'driver-8',
    name: 'Apple TWS Revenue (Q1 Impact)',
    category: 'volume',
    latestActual: 24.0,
    forecastValue: 16.0,
    unit: 'M USD',
    changePercent: -33,
    impactOnPL: -8.0,
    relatedAssumptions: ['assum-10'],
  },
];

export const mockOperationalKPIs: OperationalKPI[] = [
  {
    id: 'opkpi-1',
    name: 'Units Per Person Hour (UPPH)',
    actual: 2.3,
    forecast: 2.6,
    unit: 'units/person/hr',
    impactDescription:
      'L4 manufacturing initiative launching in 3 days expected to improve productivity by 13%',
  },
  {
    id: 'opkpi-2',
    name: 'Overall Equipment Effectiveness (OEE)',
    actual: 73.5,
    forecast: 76.8,
    unit: '%',
    impactDescription:
      'Maintenance optimization and line balancing improvements',
  },
  {
    id: 'opkpi-3',
    name: 'Material Cost per Unit',
    actual: 12.8,
    forecast: 14.2,
    unit: 'USD/unit',
    impactDescription:
      'Copper and rare earth price increases partially offset by procurement negotiations',
  },
  {
    id: 'opkpi-4',
    name: 'Labor Cost per Unit',
    actual: 3.2,
    forecast: 2.95,
    unit: 'USD/unit',
    impactDescription:
      'UPPH improvement reducing per-unit labor costs despite wage increases',
  },
];

export const baselineIncomeStatement: IncomeStatement = {
  revenue: 2389.0,
  cogs: 1715.8,
  grossProfit: 673.2,
  opex: 390.7,
  operatingProfit: 282.5,
  netProfit: 223.0,
  breakdown: {
    momentum: 2350.0, // Baseline forecast
    pipeline: 420.0, // New opportunities (5G: 150, Data Center: 220, L4 Initiative: 50)
    risk: -381.0, // Tariffs: -120, Copper: -85, Apple: -95, Rare Earth: -60, Vietnam Labor: -21
    opportunity: 0, // Not yet realized
  },
};

export const forecastIncomeStatement: IncomeStatement = {
  revenue: 2389.0,
  cogs: 1728.3,
  grossProfit: 660.7,
  opex: 390.7,
  operatingProfit: 270.0,
  netProfit: 213.2,
  breakdown: {
    momentum: 2350.0,
    pipeline: 420.0,
    risk: -381.0,
    opportunity: 0,
  },
};

export const mockBusinessEvents: BusinessEvent[] = [
  {
    id: 'event-baseline',
    name: 'Baseline Forecast',
    impact: 2350.0,
    type: 'baseline',
    implications: [
      'Based on momentum from H1 2025 performance',
      'Assumes continuation of current customer order patterns',
      'No major market disruptions assumed',
    ],
    actionProposals: [],
  },
  {
    id: 'event-5g-growth',
    name: '5G Infrastructure Growth',
    impact: 150.0,
    type: 'opportunity',
    implications: [
      'Global 5G investment reached $200B creating strong demand',
      '30% YoY growth in 5G connector volume',
      'Opportunity to increase market share in Asia-Pacific region',
    ],
    actionProposals: [
      {
        id: 'ap-1',
        description: 'Increase 5G antenna connector production capacity by 25%',
        expectedImpact: 3.2,
        feasibility: 'high',
        priority: 'medium',
        stage: 'L3',
        progress: 70,
        status: 'On Track',
      },
    ],
  },
  {
    id: 'event-data-center',
    name: 'AI Data Center Acceleration',
    impact: 220.0,
    type: 'opportunity',
    implications: [
      'Nvidia GB300 program ramping faster than expected',
      '42% YoY growth in data center connector demand',
      'Strong pricing environment with limited competition',
    ],
    actionProposals: [
      {
        id: 'ap-2',
        description: 'Accelerate Nvidia GB300 engagement and secure design-in',
        expectedImpact: 8.5,
        feasibility: 'high',
        priority: 'high',
      },
    ],
  },
  {
    id: 'event-us-tariff',
    name: 'US Tariff on EV Connectors',
    impact: -120.0,
    type: 'risk',
    implications: [
      '25% tariff on Chinese-made EV connectors for US market',
      '20% of EV connector volume affected',
      'Customers may switch to competitors with non-China production',
    ],
    actionProposals: [
      {
        id: 'ap-3',
        description: 'Shift production to Vietnam facility within 6 months',
        expectedImpact: 7.0,
        feasibility: 'medium',
        priority: 'high',
      },
      {
        id: 'ap-4',
        description: 'Negotiate temporary price adjustments with key customers',
        expectedImpact: 2.0,
        feasibility: 'high',
        priority: 'high',
      },
    ],
  },
  {
    id: 'event-copper-price',
    name: 'Copper Price Surge',
    impact: -85.0,
    type: 'risk',
    implications: [
      '15% increase in copper prices due to supply disruptions',
      'Copper accounts for 28% of material costs',
      'Affects copper cable products (40% of revenue)',
    ],
    actionProposals: [
      {
        id: 'ap-5',
        description: 'Implement copper hedging strategy for next 12 months',
        expectedImpact: 3.5,
        feasibility: 'high',
        priority: 'medium',
      },
      {
        id: 'ap-6',
        description: 'Initiate customer price adjustment discussions',
        expectedImpact: 2.8,
        feasibility: 'medium',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'event-apple-delay',
    name: 'Apple AirPods Launch Delay',
    impact: -95.0,
    type: 'risk',
    implications: [
      'Q1 2026 revenue shifted to Q2 2026',
      'Affects TWS earphone connector production planning',
      'May result in excess inventory if not managed',
    ],
    actionProposals: [
      {
        id: 'ap-7',
        description: 'Reallocate Q1 capacity to other TWS customers',
        expectedImpact: 4.0,
        feasibility: 'high',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'event-rare-earth',
    name: 'Rare Earth Supply Disruption',
    impact: -60.0,
    type: 'risk',
    implications: [
      'China export restrictions on rare earth materials',
      '35% cost increase for affected materials',
      'Current inventory covers only 45 days',
    ],
    actionProposals: [
      {
        id: 'ap-8',
        description: 'Secure alternative suppliers in Australia and US',
        expectedImpact: 3.5,
        feasibility: 'medium',
        priority: 'high',
      },
      {
        id: 'ap-9',
        description: 'Increase safety stock to 90 days',
        expectedImpact: 0.8,
        feasibility: 'high',
        priority: 'high',
      },
    ],
  },
  {
    id: 'event-vietnam-labor',
    name: 'Vietnam Labor Rate Increase',
    impact: -21.0,
    type: 'risk',
    implications: [
      '8% increase in Vietnam labor rates due to inflation',
      'Affects 30% of production capacity in Vietnam',
      'Labor cost per unit increases despite productivity gains',
    ],
    actionProposals: [
      {
        id: 'ap-10',
        description: 'Implement automation to reduce labor dependency',
        expectedImpact: 1.5,
        feasibility: 'medium',
        priority: 'medium',
      },
    ],
  },
];

export const mockScenarios: Scenario[] = [
  {
    id: 'scenario-baseline',
    name: 'Baseline Forecast',
    createdDate: subDays(new Date(), 7),
    createdBy: 'System',
    drivers: mockForecastDrivers,
    forecast: forecastIncomeStatement,
    isBaseline: true,
  },
  {
    id: 'scenario-tariff-mitigated',
    name: 'Tariff Impact Mitigated',
    createdDate: subDays(new Date(), 2),
    createdBy: 'CEO',
    drivers: mockForecastDrivers.map((d) =>
      d.id === 'driver-1'
        ? {
            ...d,
            forecastValue: 2.07,
            changePercent: -10,
            impactOnPL: -5.0,
            relatedAssumptions: ['US tariff canceled assumption'],
          }
        : d
    ),
    forecast: {
      ...forecastIncomeStatement,
      revenue: 2509.0,
      netProfit: 223.2,
      breakdown: {
        momentum: 2350.0,
        pipeline: 420.0,
        risk: -261.0, // Reduced from -381.0 (mitigated US tariff: -120)
        opportunity: 0,
      },
    },
    isBaseline: false,
  },
  {
    id: 'scenario-aggressive',
    name: 'Aggressive Growth Scenario',
    createdDate: subDays(new Date(), 5),
    createdBy: 'David Park - VP Sales',
    drivers: [
      ...mockForecastDrivers.map((d) => {
        if (d.id === 'driver-2')
          return {
            ...d,
            forecastValue: 2.88,
            changePercent: 60,
            impactOnPL: 24.5,
          };
        if (d.id === 'driver-7')
          return {
            ...d,
            forecastValue: 4.48,
            changePercent: 40,
            impactOnPL: 16.8,
          };
        return d;
      }),
    ],
    forecast: {
      ...forecastIncomeStatement,
      revenue: 2644.0,
      netProfit: 234.2,
      breakdown: {
        momentum: 2350.0,
        pipeline: 520.0, // Increased from 420.0 (additional 100 from aggressive growth)
        risk: -381.0,
        opportunity: 135.0, // New opportunity from aggressive growth initiatives
      },
    },
    isBaseline: false,
  },
];

export const mockOPWaterfallStages: OPWaterfallStage[] = [
  {
    stage: 'ytm-actual',
    label: 'YTM Actuals Jan-Sep OP',
    value: 210.0, // Year-to-month actual OP (baseline)
    type: 'baseline',
    description: 'Actual Operating Profit from January to September 2025',
  },
  {
    stage: 'momentum',
    label: 'Momentum',
    value: 235.0, // Assumes no other actions, keep as is OP
    delta: 25.0, // Change from YTM actual
    type: 'positive',
    description:
      'Assumes no other actions, keep business as it is - projected OP based on momentum',
  },
  {
    stage: 'pipeline-improvement',
    label: 'Pipeline improvement',
    value: 280.0, // Momentum + pipeline initiatives
    delta: 45.0, // Existing initiative pipeline boost
    type: 'positive',
    description:
      'Existing initiative pipeline that boosts OP: NVIDIA GB300 server connectors, 5G expansion, EV connector production ramp',
  },
  {
    stage: 'headwinds-tailwinds',
    label: 'Headwinds / Tailwinds',
    value: 255.0, // After volume/price/mix impacts
    delta: -25.0, // Mixed risks/opportunities
    type: 'negative',
    description:
      'Volume/Price/Mix related impacts: US tariff on EV connectors, Apple AirPods launch delay, market demand shifts',
  },
  {
    stage: 'additional-risk',
    label: 'Additional pressure / risk',
    value: 240.0, // After additional risks
    delta: -15.0, // Additional risks: copper price, rare earth, Vietnam labor
    type: 'negative',
    description:
      'Additional risks: Copper price surge (+15%), Rare earth supply disruption (+35% cost), Vietnam labor rate increase (+8%)',
  },
  {
    stage: 'assumed-leakage',
    label: 'Assumed pipeline leakage',
    value: 232.0, // After accounting for leakage
    delta: -8.0, // Pipeline initiatives under-delivered
    type: 'negative',
    description:
      'Pipeline initiatives designed for higher uplift but under-delivered (e.g., designed for 3M USD profit, achieved 2M, 1M leakage)',
  },
  {
    stage: 'leakage-recovery',
    label: 'Leakage recovery',
    value: 237.0, // After recovery initiatives
    delta: 5.0, // Recovery initiatives
    type: 'positive',
    description:
      'Additional recovery initiatives to address pipeline leakage: accelerated supplier qualification, enhanced production efficiency',
  },
  {
    stage: 'full-year-fcst',
    label: 'Full year OP FCST',
    value: 237.0, // Final forecast
    type: 'baseline',
    description:
      'Full Year Operating Profit Forecast - cumulative result of all stages',
  },
];

// NP Deviation Waterfall Stages
export const mockNPDeviationStages: NPDeviationStage[] = [
  {
    stage: 'budget-np',
    label: 'Budget NP',
    value: 26.0, // Budget Net Profit baseline
    type: 'baseline',
    description: 'Budget Net Profit baseline',
    isClickable: true,
  },
  {
    stage: 'vol-impact',
    label: 'Vol. impact',
    value: 34.8, // Budget NP + Vol impact
    delta: 8.8,
    type: 'positive',
    description: 'Volume impact on Net Profit',
    isClickable: true,
  },
  {
    stage: 'price-impact',
    label: 'Price impact',
    value: 38.5, // Previous + Price impact
    delta: 3.7,
    type: 'positive',
    description: 'Price impact on Net Profit',
    isClickable: true,
  },
  {
    stage: 'cost-impact',
    label: 'Cost impact',
    value: 31.2, // Previous - Cost impact
    delta: -7.3,
    type: 'negative',
    description: 'Cost impact on Net Profit',
    isClickable: true,
  },
  {
    stage: 'mix-impact',
    label: 'Mix impact',
    value: 28.4, // Previous - Mix impact
    delta: -2.8,
    type: 'negative',
    description: 'Product mix impact on Net Profit',
    isClickable: false,
  },
  {
    stage: 'opex-deviation',
    label: 'OPEX Deviation',
    value: 23.1, // Previous - OPEX Deviation
    delta: -5.3,
    type: 'negative',
    description: 'Operating expense deviation',
    isClickable: false,
  },
  {
    stage: 'other-cogs',
    label: 'Other COGS (e.g., scrap, freight)',
    value: 28.4, // Previous + Other COGS
    delta: 5.3,
    type: 'positive',
    description: 'Other cost of goods sold adjustments',
    isClickable: false,
  },
  {
    stage: 'gap-non-op-tax',
    label: 'Gap of non-OP and tax',
    value: 29.0, // Previous + Gap
    delta: 0.6,
    type: 'positive',
    description: 'Non-operating and tax adjustments',
    isClickable: false,
  },
  {
    stage: 'actual-np',
    label: 'Actual NP',
    value: 28.9, // Final Actual Net Profit
    type: 'baseline',
    description: 'Actual Net Profit',
    isClickable: false,
  },
];

// Key Call Out for NP Deviation
export const mockNPDeviationKeyCallOut: KeyCallOut = {
  id: 'key-callout-np-deviation',
  bulletPoints: [
    'The largest positive impact on Net Profit (NP) was from volume, contributing +8.81 Mn USD.',
    'Cost impact and OPEX deviation were the most significant negative drivers, reducing NP by -7.32 Mn USD and -5.29 Mn USD respectively.',
    'Actual NP exceeded Budget NP, with Actual NP at 28.94 Mn USD versus Budget NP at 25.97 Mn USD.',
  ],
  rootCauseAnalysis:
    'The root cause for the positive variance appears to be strong volume performance, while increased costs and OPEX partially offset these gains. This suggests that while sales or production volumes drove profit above budget, cost management remains a key area for improvement.',
  generatedAt: new Date(),
};

// Product Analysis Data (Layer 2)
export const mockProductFamilyData: ProductFamilyData[] = [
  {
    id: 'pf-1',
    productFamily: 'Product Fam 1',
    gpActual: 11988.3,
    gpBudget: 10651.7,
    gpGapToBudget: 1336.5,
    volImpact: 2054.4,
    priceImpact: 1225.27,
    costImpact: -963.81,
    mixImpact: -979.3,
  },
  {
    id: 'pf-10',
    productFamily: 'Product Fam 10',
    gpActual: 3456.2,
    gpBudget: 3200.0,
    gpGapToBudget: 256.2,
    volImpact: 450.3,
    priceImpact: 280.5,
    costImpact: -320.1,
    mixImpact: -154.5,
  },
  {
    id: 'pf-11',
    productFamily: 'Product Fam 11',
    gpActual: 2890.5,
    gpBudget: 2750.0,
    gpGapToBudget: 140.5,
    volImpact: 380.2,
    priceImpact: 195.3,
    costImpact: -280.5,
    mixImpact: -154.5,
  },
  {
    id: 'pf-12',
    productFamily: 'Product Fam 12',
    gpActual: 1274.0,
    gpBudget: 0.0,
    gpGapToBudget: 1274.0,
    volImpact: 1274.0,
    priceImpact: 0.0,
    costImpact: 0.0,
    mixImpact: 0.0,
  },
  {
    id: 'pf-13',
    productFamily: 'Product Fam 13',
    gpActual: 890.2,
    gpBudget: 850.0,
    gpGapToBudget: 40.2,
    volImpact: 120.5,
    priceImpact: 85.3,
    costImpact: -95.2,
    mixImpact: -70.4,
  },
  {
    id: 'pf-26',
    productFamily: 'Product Fam 26',
    gpActual: 2456.8,
    gpBudget: 1011.6,
    gpGapToBudget: 1445.2,
    volImpact: 1850.3,
    priceImpact: 890.5,
    costImpact: -195.2,
    mixImpact: -100.4,
  },
];

// Calculate totals for Product Analysis
export const mockProductFamilyTotals: ProductFamilyData = {
  id: 'pf-total',
  productFamily: 'Total',
  gpActual: 23955.0,
  gpBudget: 18463.3,
  gpGapToBudget: 2491.7,
  volImpact: 6129.7,
  priceImpact: 2676.87,
  costImpact: -1854.82,
  mixImpact: -1458.68,
};

// Cost Impact Breakdown Data (Layer 3)
export const mockCostImpactData: CostImpactData[] = [
  {
    id: 'ci-1',
    productFamily: 'Product Fam 1',
    costImpact: -963.81,
    volActual: 102529,
    unitCostActual: 0.21,
    unitCostBudget: 0.21,
    unitCostGap: 0.0,
    unitCostMaterialGap: -0.01,
    unitCostLaborGap: 0.0,
    unitCostMOHGap: 0.01,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-2',
    productFamily: 'Product Fam 2',
    costImpact: -3763.64,
    volActual: 125430,
    unitCostActual: 0.28,
    unitCostBudget: 0.25,
    unitCostGap: -0.03,
    unitCostMaterialGap: -0.05,
    unitCostLaborGap: 0.01,
    unitCostMOHGap: 0.01,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-8',
    productFamily: 'Product Fam 8',
    costImpact: 595.32,
    volActual: 7432,
    unitCostActual: 1.92,
    unitCostBudget: 2.0,
    unitCostGap: 0.08,
    unitCostMaterialGap: 0.06,
    unitCostLaborGap: 0.01,
    unitCostMOHGap: 0.01,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-13',
    productFamily: 'Product Fam 13',
    costImpact: -321.06,
    volActual: 220,
    unitCostActual: 2.59,
    unitCostBudget: 1.13,
    unitCostGap: -1.46,
    unitCostMaterialGap: -0.21,
    unitCostLaborGap: -0.58,
    unitCostMOHGap: -0.66,
    unitCostOutsourceGap: -0.01,
  },
];

// Cost Component Totals (Layer 3)
export const mockCostComponentTotals: CostComponentTotals = {
  material: -8788,
  labor: 732,
  moh: 586,
  outsource: 146,
};

// Total Cost Impact
export const mockTotalCostImpact = -7323.21;

// Key Call Out for Cost Impact Breakdown
export const mockCostImpactKeyCallOut: KeyCallOut = {
  id: 'key-callout-cost-impact',
  bulletPoints: [
    'The largest negative cost impact is in Product Fam 2 with a cost impact of -3,763.64K and a unit cost gap of -0.03, driven by a material gap of -0.05.',
    'Product Fam 8 shows a positive cost impact of 595.32K and a favorable unit cost gap of 0.08, mainly due to a material gap of 0.06.',
    'Product Fam 13 shows a significant unit cost gap of -1.46, with main drivers being a material gap of -0.21, labor gap, and MOH gap.',
  ],
  rootCauseAnalysis:
    'The cost impact breakdown reveals significant variations across product families, with material costs being the primary driver of negative impacts. Product Fam 2 and Product Fam 13 require immediate attention to address cost overruns.',
  generatedAt: new Date(),
};

// MVA Breakdown Stages (Layer 4)
export const mockMVABreakdownStages: MVABreakdownStage[] = [
  {
    stage: 'budget-mva-cost',
    label: 'Budget MVA Cost',
    value: 46.9,
    type: 'baseline',
    description: 'Budget Manufacturing Value Added Cost',
  },
  {
    stage: 'fix-impact',
    label: 'Fix impact',
    value: 40.8,
    delta: -6.1,
    type: 'positive',
    description: 'Fixed cost impact',
  },
  {
    stage: 'mva-exclu-fx-impact',
    label: 'MVA exclu. FX impact',
    value: 40.8,
    type: 'baseline',
    description: 'MVA excluding FX impact',
  },
  {
    stage: 'vol-mix-variance',
    label: 'Vol. and mix variance',
    value: 45.0,
    delta: 4.2,
    type: 'negative',
    description: 'Volume and mix variance',
  },
  {
    stage: 'dl-hourly-rate-impact',
    label: 'DL Hourly rate impact',
    value: 45.3,
    delta: 0.3,
    type: 'negative',
    description: 'Direct Labor hourly rate impact',
  },
  {
    stage: 'idl-hourly-rate-impact',
    label: 'IDL Hourly rate impact',
    value: 45.8,
    delta: 0.5,
    type: 'negative',
    description: 'Indirect Labor hourly rate impact',
  },
  {
    stage: 'mva-exclu-external-impact',
    label: 'MVA exclu. external impact',
    value: 45.8,
    type: 'baseline',
    description: 'MVA excluding external impact',
  },
  {
    stage: 'dl-efficiency-gap',
    label: 'DL efficiency gap',
    value: 47.9,
    delta: 2.1,
    type: 'negative',
    description: 'Direct Labor efficiency gap',
  },
  {
    stage: 'idl-efficiency-gap',
    label: 'IDL efficiency gap',
    value: 48.4,
    delta: 0.5,
    type: 'negative',
    description: 'Indirect Labor efficiency gap',
  },
  {
    stage: 'fixed-moh-efficiency-gap',
    label: 'Fixed MOH efficiency gap',
    value: 48.7,
    delta: 0.3,
    type: 'negative',
    description: 'Fixed Manufacturing Overhead efficiency gap',
  },
  {
    stage: 'variable-moh-efficiency-gap',
    label: 'Variable MOH efficiency gap',
    value: 45.6,
    delta: -3.1,
    type: 'positive',
    description: 'Variable Manufacturing Overhead efficiency gap',
  },
  {
    stage: 'actual-mva-cost',
    label: 'Actual MVA Cost',
    value: 45.5,
    type: 'baseline',
    description: 'Actual Manufacturing Value Added Cost',
  },
];

// Key Call Out for MVA Breakdown
export const mockMVABreakdownKeyCallOut: KeyCallOut = {
  id: 'key-callout-mva-breakdown',
  bulletPoints: [
    'Actual MVA Cost is 45.53, which is lower than the Budget MVA Cost of 46.85.',
    'The largest negative impact comes from "Fix impact" at -6.10, suggesting a significant cost reduction in this area.',
    '"Variable MOH efficiency gap" also contributed a negative variance of -3.12, indicating improved efficiency or cost savings in variable manufacturing overhead.',
  ],
  rootCauseAnalysis:
    'These variances imply that cost-saving measures, particularly in fixed impacts and variable MOH efficiency, are the primary drivers for the actual costs being below budget.',
  generatedAt: new Date(),
};

export const mockAppliedAssumptions: AppliedAssumption[] = [
  {
    id: 'assum-applied-1',
    name: 'AI Data Center Acceleration',
    description: 'Global data center trend accelerating faster than expected',
    impact: 5.0, // +5M impact (tailwind)
    targetStage: 'headwinds-tailwinds',
    impactType: 'positive',
    isApplied: true,
    color: '#10b981', // emerald-500 for positive/tailwind
    valueDriverChanges: [
      {
        valueDriverId: 'vd-rev-vol-1',
        change: 0.15,
        unit: 'M units',
        changePercent: 2.1,
      },
      {
        valueDriverId: 'vd-rev-asp-1',
        change: 5.2,
        unit: 'USD',
        changePercent: 1.6,
      },
    ],
    proposal: {
      id: 'proposal-1',
      assumptionId: 'assum-applied-1',
      description: 'Proposal to amplify AI Data Center tailwind opportunity',
      actions: [
        {
          id: 'action-1-1',
          description:
            'Expand data center connector production capacity by 30% to capture additional market share',
          expectedImpact: 2.5,
          feasibility: 'high',
          priority: 'high',
          stage: 'L4', // Ready in Wave - L4
        },
        {
          id: 'action-1-2',
          description:
            'Launch new high-speed connector product line targeting hyperscale data centers',
          expectedImpact: 1.8,
          feasibility: 'medium',
          priority: 'high',
          stage: 'L2', // Ready in Wave - L2
        },
        {
          id: 'action-1-3',
          description:
            'Strengthen partnerships with major cloud providers for exclusive supply agreements',
          expectedImpact: 1.2,
          feasibility: 'medium',
          priority: 'medium',
        },
      ],
      createdDate: new Date('2025-01-15'),
      lastUpdated: new Date('2025-01-15'),
    },
  },
  {
    id: 'assum-applied-2',
    name: 'Apple AirPods Launch Delay',
    description: 'Affects customer facts and revenue timing',
    impact: -5.0, // -5M impact (headwind)
    targetStage: 'additional-risk',
    impactType: 'negative',
    isApplied: true,
    color: '#f59e0b', // amber-500 for negative/headwind
    valueDriverChanges: [
      {
        valueDriverId: 'vd-rev-vol-1',
        change: -0.12,
        unit: 'M units',
        changePercent: -1.7,
      },
      {
        valueDriverId: 'vd-rev-mix',
        change: -0.02,
        unit: 'ratio',
        changePercent: -1.9,
      },
    ],
    proposal: {
      id: 'proposal-2',
      assumptionId: 'assum-applied-2',
      description:
        'Proposal to recover revenue impact from Apple AirPods delay',
      actions: [
        {
          id: 'action-2-1',
          description:
            'Accelerate alternative customer pipeline to offset delayed AirPods revenue',
          expectedImpact: 3.5,
          feasibility: 'high',
          priority: 'high',
        },
        {
          id: 'action-2-2',
          description:
            'Negotiate partial payment or milestone payments from Apple for work completed',
          expectedImpact: 1.5,
          feasibility: 'medium',
          priority: 'high',
        },
        {
          id: 'action-2-3',
          description:
            'Repurpose AirPods production capacity for other audio product lines',
          expectedImpact: 1.0,
          feasibility: 'high',
          priority: 'medium',
          stage: 'L3', // Ready in Wave - L3
        },
      ],
      createdDate: new Date('2025-01-10'),
      lastUpdated: new Date('2025-01-12'),
    },
  },
  {
    id: 'assum-applied-3',
    name: 'Copper Price Surge',
    description: 'Copper price increase impacting material costs',
    impact: -5.0, // -5M impact (headwind)
    targetStage: 'additional-risk',
    impactType: 'negative',
    isApplied: true,
    color: '#ef4444', // red-500 for negative/headwind
    valueDriverChanges: [
      {
        valueDriverId: 'vd-oh-energy-1',
        change: 0.025,
        unit: 'USD/kWh',
        changePercent: 18.5,
      },
      {
        valueDriverId: 'vd-mat-index-price-1',
        change: 7.5,
        unit: 'USD/kg',
        changePercent: 12.3,
      },
    ],
    proposal: {
      id: 'proposal-3',
      assumptionId: 'assum-applied-3',
      description: 'Proposal to mitigate copper price surge impact',
      actions: [
        {
          id: 'action-3-1',
          description:
            'Lock in copper prices through forward contracts for next 6 months',
          expectedImpact: 2.8,
          feasibility: 'high',
          priority: 'high',
        },
        {
          id: 'action-3-2',
          description:
            'Source alternative materials or copper substitutes for non-critical applications',
          expectedImpact: 1.5,
          feasibility: 'medium',
          priority: 'medium',
          stage: 'L0', // Just created in Wave - L0
        },
        {
          id: 'action-3-3',
          description:
            'Negotiate price pass-through clauses with key customers for copper-intensive products',
          expectedImpact: 1.2,
          feasibility: 'low',
          priority: 'medium',
          stage: 'L0', // Just created in Wave - L0
        },
      ],
      createdDate: new Date('2025-01-08'),
      lastUpdated: new Date('2025-01-14'),
    },
  },
];

export const mockSuggestedAssumptions: AppliedAssumption[] = [
  {
    id: 'assum-suggested-1',
    name: 'Vietnam Minimum Wage Hike',
    description:
      'Vietnam sets 7.2% minimum wage hike from next year. Estimated $2-3M annual cost increase for Vietnam operations (450 workers, $180M revenue). May pressure gross margins by 0.3-0.5% for Vietnam-sourced products.',
    impact: -2.5, // -2.5M impact (headwind)
    targetStage: 'additional-risk',
    impactType: 'negative',
    isApplied: false,
    isSuggested: true,
    sourceNewsId: 'news-11',
    color: '#f97316', // orange-500 for suggested negative/headwind
    valueDriverChanges: [
      {
        valueDriverId: 'vd-dl-rate-1',
        change: 0.33,
        unit: 'USD/hour',
        changePercent: 7.3,
      },
      {
        valueDriverId: 'vd-idl-rate-1',
        change: 0.44,
        unit: 'USD/hour',
        changePercent: 7.2,
      },
    ],
  },
  {
    id: 'assum-suggested-2',
    name: 'US Tariff on EV Connectors',
    description:
      'US announces 25% tariff on Chinese-made EV connectors. 20% of EV connector volume affected. Estimated $10M revenue impact if production cannot be shifted to Vietnam within 6 months.',
    impact: -10.0, // -10M impact (headwind)
    targetStage: 'headwinds-tailwinds',
    impactType: 'negative',
    isApplied: false,
    isSuggested: true,
    sourceNewsId: 'news-1',
    color: '#dc2626', // red-600 for suggested negative/headwind
    valueDriverChanges: [
      {
        valueDriverId: 'vd-rev-vol-1',
        change: -0.3,
        unit: 'M units',
        changePercent: -4.2,
      },
      {
        valueDriverId: 'vd-rev-asp-1',
        change: -8.5,
        unit: 'USD',
        changePercent: -2.6,
      },
    ],
  },
  {
    id: 'assum-suggested-3',
    name: 'China Rare Earth Export Restrictions',
    description:
      'China limits rare earth exports affecting connector materials. Material costs may increase by 30-40% without alternative suppliers. Estimated $5M cost increase in H2. Current inventory covers 45 days.',
    impact: -5.0, // -5M impact (headwind)
    targetStage: 'additional-risk',
    impactType: 'negative',
    isApplied: false,
    isSuggested: true,
    sourceNewsId: 'news-2',
    color: '#ea580c', // orange-600 for suggested negative/headwind
    valueDriverChanges: [
      {
        valueDriverId: 'vd-mat-index-price-1',
        change: 22.0,
        unit: 'USD/kg',
        changePercent: 36.1,
      },
      {
        valueDriverId: 'vd-idl-count',
        change: -5,
        unit: 'people',
        changePercent: -0.6,
      },
    ],
  },
];

export const mockInitiatives: Initiative[] = [
  {
    id: 'init-1',
    title: 'Vietnam Production Capacity Expansion',
    description:
      'Shift 20% of EV connector production from China to Vietnam to avoid US tariffs. Estimated timeline: 6 months. Investment required: $8M for equipment and training.',
    estimatedImpact: 7.0,
    owner: 'Jennifer Wu - VP Operations',
    status: 'submitted',
    resourceRequirements: '$8M capex, 25 FTE for 6 months',
    createdDate: subDays(new Date(), 3),
    dueDate: addMonths(new Date(), 6),
  },
  {
    id: 'init-2',
    title: 'Nvidia GB300 Program Acceleration',
    description:
      'Allocate dedicated engineering resources to accelerate Nvidia GB300 server connector program. Target: design-in confirmation by Q1 2026 and revenue start in Q2 2026.',
    estimatedImpact: 8.5,
    owner: 'Dr. Lisa Zhang - CTO',
    status: 'in-progress',
    resourceRequirements: '12 engineers for 4 months, $500K prototype costs',
    createdDate: subDays(new Date(), 10),
    dueDate: addMonths(new Date(), 4),
  },
  {
    id: 'init-3',
    title: 'Copper Hedging Strategy Implementation',
    description:
      'Implement 12-month copper hedging program to protect against price volatility. Cover 60% of expected copper purchases with forward contracts.',
    estimatedImpact: 3.5,
    owner: 'Mark Thompson - CFO',
    status: 'draft',
    resourceRequirements: 'Treasury team 2 FTE, hedging margin $2M',
    createdDate: subDays(new Date(), 1),
    dueDate: addMonths(new Date(), 1),
  },
  {
    id: 'init-4',
    title: 'Alternative Rare Earth Supplier Qualification',
    description:
      'Qualify and onboard Australian and US rare earth suppliers to diversify supply chain. Target: signed agreements and initial orders within 45 days.',
    estimatedImpact: 3.5,
    actualImpact: undefined,
    owner: 'Jack Chen - CPO',
    status: 'in-progress',
    resourceRequirements: 'Procurement team 3 FTE, quality testing $200K',
    createdDate: subDays(new Date(), 5),
    dueDate: addMonths(new Date(), 1.5),
  },
  {
    id: 'init-5',
    title: '5G Connector Capacity Expansion',
    description:
      'Increase 5G antenna connector production capacity by 25% to capture market growth from $200B global 5G infrastructure investment.',
    estimatedImpact: 3.2,
    owner: 'Jennifer Wu - VP Operations',
    status: 'draft',
    resourceRequirements: '$3M capex for new lines, 15 FTE',
    createdDate: subDays(new Date(), 2),
    dueDate: addMonths(new Date(), 3),
  },
];
