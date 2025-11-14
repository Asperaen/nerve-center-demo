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
  Proposal,
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
    value: 10.14070077, // Budget Net Profit baseline
    type: 'baseline',
    description: 'Budget Net Profit baseline',
    isClickable: true,
  },
  {
    stage: 'vol-impact',
    label: 'Vol. impact',
    value: 18.948364608, // Budget NP + Vol impact
    delta: 8.807663838,
    type: 'positive',
    description: 'Volume impact on Net Profit',
    isClickable: true,
  },
  {
    stage: 'price-impact',
    label: 'Price impact',
    value: 22.610580312, // Previous + Price impact
    delta: 3.662215704,
    type: 'positive',
    description: 'Price impact on Net Profit',
    isClickable: true,
  },
  {
    stage: 'cost-impact',
    label: 'Cost impact',
    value: 15.287366259, // Previous - Cost impact
    delta: -7.323214053,
    type: 'negative',
    description: 'Cost impact on Net Profit',
    isClickable: true,
  },
  {
    stage: 'mix-impact',
    label: 'Mix impact',
    value: 12.490735021, // Previous - Mix impact
    delta: -2.796631238,
    type: 'negative',
    description: 'Product mix impact on Net Profit',
    isClickable: false,
  },
  {
    stage: 'mva-deviation',
    label: 'MVA Deviation',
    value: 8.690173824, // Previous - MVA Deviation
    delta: -3.800561197,
    type: 'negative',
    description: 'MVA deviation',
    isClickable: false,
  },
  {
    stage: 'opex-deviation',
    label: 'OPEX Deviation',
    value: 6.6254205, // Previous - OPEX Deviation
    delta: -2.064753324,
    type: 'negative',
    description: 'Operating expense deviation',
    isClickable: false,
  },
  {
    stage: 'other-cogs',
    label: 'Others (e.g., scrap)',
    value: 11.05626532, // Previous + Others
    delta: 4.43084482,
    type: 'positive',
    description: 'Other adjustments (e.g., scrap)',
    isClickable: false,
  },
  {
    stage: 'actual-np',
    label: 'Actual NP',
    value: 11.29969174, // Final Actual Net Profit
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
    productFamily: 'Modular Jack Connector',
    gpActual: 5819.276,
    gpBudget: 4374.08,
    gpGapToBudget: 1445.196,
    volImpact: 590.3186,
    priceImpact: 1451.255,
    costImpact: -738.412,
    mixImpact: 142.0337,
  },
  {
    id: 'pf-2',
    productFamily: 'Edgecard Connector',
    gpActual: 11988.25,
    gpBudget: 10651.73,
    gpGapToBudget: 1336.519,
    volImpact: 2054.352,
    priceImpact: 1225.269,
    costImpact: -963.807,
    mixImpact: -979.295,
  },
  {
    id: 'pf-3',
    productFamily: 'Others',
    gpActual: 1273.981,
    gpBudget: 0,
    gpGapToBudget: 1273.981,
    volImpact: 1273.981,
    priceImpact: 0,
    costImpact: 0,
    mixImpact: 0,
  },
  {
    id: 'pf-4',
    productFamily: 'Board to Board Connector',
    gpActual: 1159.983,
    gpBudget: 647.5003,
    gpGapToBudget: 512.4825,
    volImpact: 349.858,
    priceImpact: 827.5655,
    costImpact: -637.301,
    mixImpact: -27.6405,
  },
  {
    id: 'pf-5',
    productFamily: 'SFP Receptacle Connector',
    gpActual: 355.4945,
    gpBudget: 187.9688,
    gpGapToBudget: 167.5256,
    volImpact: 42.94863,
    priceImpact: 126.7977,
    costImpact: 53.7116,
    mixImpact: -55.9323,
  },
  {
    id: 'pf-6',
    productFamily: 'USB Connector',
    gpActual: 2110.074,
    gpBudget: 2064.615,
    gpGapToBudget: 45.45876,
    volImpact: 372.1601,
    priceImpact: 59.98187,
    costImpact: -428.015,
    mixImpact: 41.33208,
  },
  {
    id: 'pf-7',
    productFamily: 'Circular Connector',
    gpActual: 28.40231,
    gpBudget: -17.0157,
    gpGapToBudget: 45.41804,
    volImpact: 5.795492,
    priceImpact: 30.06486,
    costImpact: 9.557684,
    mixImpact: 0,
  },
  {
    id: 'pf-8',
    productFamily: 'Game Connector',
    gpActual: 57.07211,
    gpBudget: 28.81389,
    gpGapToBudget: 28.25822,
    volImpact: 43.94576,
    priceImpact: -24.0645,
    costImpact: 8.377007,
    mixImpact: 0,
  },
  {
    id: 'pf-9',
    productFamily: 'DVI Connector',
    gpActual: 18.26292,
    gpBudget: 12.3138,
    gpGapToBudget: 5.949113,
    volImpact: -3.48845,
    priceImpact: 15.03721,
    costImpact: -3.652,
    mixImpact: -1.94765,
  },
  {
    id: 'pf-10',
    productFamily: 'Wire to Board Connector',
    gpActual: 7.135469,
    gpBudget: 5.228405,
    gpGapToBudget: 1.907064,
    volImpact: 5.330993,
    priceImpact: -14.5162,
    costImpact: 10.98081,
    mixImpact: 0.111408,
  },
  {
    id: 'pf-11',
    productFamily: 'LED',
    gpActual: 1.199406,
    gpBudget: 0,
    gpGapToBudget: 1.199406,
    volImpact: 1.199406,
    priceImpact: 0,
    costImpact: 0,
    mixImpact: 0,
  },
  {
    id: 'pf-12',
    productFamily: 'Terminal Block',
    gpActual: 9.176851,
    gpBudget: 8.456919,
    gpGapToBudget: 0.719932,
    volImpact: 0.318195,
    priceImpact: -4.43593,
    costImpact: 4.837669,
    mixImpact: 0,
  },
  {
    id: 'pf-13',
    productFamily: 'Ribbon Beetle Connector',
    gpActual: 0.336857,
    gpBudget: 0.164976,
    gpGapToBudget: 0.17188,
    volImpact: 0.045067,
    priceImpact: 0.109669,
    costImpact: 0.017145,
    mixImpact: 0,
  },
  {
    id: 'pf-14',
    productFamily: 'Metal parts',
    gpActual: 1.038933,
    gpBudget: 1.054049,
    gpGapToBudget: -0.01512,
    volImpact: -0.26735,
    priceImpact: 15.95111,
    costImpact: -15.3163,
    mixImpact: -0.3826,
  },
  {
    id: 'pf-15',
    productFamily: 'Centronic Connector',
    gpActual: 2.265061,
    gpBudget: 2.896337,
    gpGapToBudget: -0.63128,
    volImpact: -1.22984,
    priceImpact: 1.799531,
    costImpact: -1.20097,
    mixImpact: 0,
  },
  {
    id: 'pf-16',
    productFamily: 'Smart Serial Connector',
    gpActual: 4.575059,
    gpBudget: 6.941939,
    gpGapToBudget: -2.36688,
    volImpact: -4.02924,
    priceImpact: 1.49785,
    costImpact: -0.76419,
    mixImpact: 0.928695,
  },
  {
    id: 'pf-17',
    productFamily: 'IEEE 1394 Connector',
    gpActual: 0.298009,
    gpBudget: 2.915124,
    gpGapToBudget: -2.61711,
    volImpact: -2.41144,
    priceImpact: -0.15817,
    costImpact: -0.0475,
    mixImpact: 0,
  },
  {
    id: 'pf-18',
    productFamily: 'Mini Din Connector',
    gpActual: -5.96684,
    gpBudget: -1.78034,
    gpGapToBudget: -4.18651,
    volImpact: -0.14761,
    priceImpact: 7.768347,
    costImpact: -10.0961,
    mixImpact: -1.71112,
  },
  {
    id: 'pf-19',
    productFamily: 'Busbar Power',
    gpActual: 0,
    gpBudget: 5.5,
    gpGapToBudget: -5.5,
    volImpact: -5.5,
    priceImpact: 0,
    costImpact: 0,
    mixImpact: 0,
  },
  {
    id: 'pf-20',
    productFamily: 'SCSI Connector',
    gpActual: 7.768245,
    gpBudget: 14.19952,
    gpGapToBudget: -6.43127,
    volImpact: -1.04584,
    priceImpact: 22.10899,
    costImpact: -27.4944,
    mixImpact: 0,
  },
  {
    id: 'pf-21',
    productFamily: 'DSUB Connector',
    gpActual: 232.5278,
    gpBudget: 249.83,
    gpGapToBudget: -17.3022,
    volImpact: -17.0474,
    priceImpact: 11.29842,
    costImpact: -47.0779,
    mixImpact: 35.52477,
  },
  {
    id: 'pf-22',
    productFamily: 'POF Connector',
    gpActual: 12.38406,
    gpBudget: 40.6344,
    gpGapToBudget: -28.2503,
    volImpact: -24.3284,
    priceImpact: -16.7365,
    costImpact: 12.81457,
    mixImpact: 0,
  },
  {
    id: 'pf-23',
    productFamily: 'Pogo Connector',
    gpActual: -23.1665,
    gpBudget: 13.78592,
    gpGapToBudget: -36.9524,
    volImpact: -3.27618,
    priceImpact: -2.50444,
    costImpact: -31.1718,
    mixImpact: 0,
  },
  {
    id: 'pf-24',
    productFamily: 'HDMI Connector',
    gpActual: 123.5039,
    gpBudget: 172.802,
    gpGapToBudget: -49.2981,
    volImpact: 2.177902,
    priceImpact: 137.1575,
    costImpact: -188.633,
    mixImpact: 0,
  },
  {
    id: 'pf-25',
    productFamily: 'Battery Connector',
    gpActual: 246.6817,
    gpBudget: 297.727,
    gpGapToBudget: -51.0453,
    volImpact: 6.306963,
    priceImpact: 17.39185,
    costImpact: -27.1789,
    mixImpact: -47.5653,
  },
  {
    id: 'pf-26',
    productFamily: 'Audio Jack Connector',
    gpActual: 214.868,
    gpBudget: 269.0152,
    gpGapToBudget: -54.1472,
    volImpact: 57.40359,
    priceImpact: -107.774,
    costImpact: -13.2032,
    mixImpact: 9.426894,
  },
  {
    id: 'pf-27',
    productFamily: 'Plastic Parts',
    gpActual: 206.349,
    gpBudget: 264.8676,
    gpGapToBudget: -58.5186,
    volImpact: -23.7714,
    priceImpact: 69.75043,
    costImpact: -113.229,
    mixImpact: 8.730985,
  },
  {
    id: 'pf-28',
    productFamily: 'DisplayPort Connector',
    gpActual: 737.1372,
    gpBudget: 850.6863,
    gpGapToBudget: -113.549,
    volImpact: 231.7789,
    priceImpact: -247.888,
    costImpact: -90.637,
    mixImpact: -6.8029,
  },
  {
    id: 'pf-29',
    productFamily: 'Power Connector',
    gpActual: 254.0236,
    gpBudget: 460.4314,
    gpGapToBudget: -206.408,
    volImpact: 2201.986,
    priceImpact: -1039.69,
    costImpact: 595.3169,
    mixImpact: -1964.03,
  },
  {
    id: 'pf-30',
    productFamily: 'Foxray-s Connector',
    gpActual: -128.424,
    gpBudget: 174.3188,
    gpGapToBudget: -302.743,
    volImpact: 17.43188,
    priceImpact: 0.884397,
    costImpact: -321.059,
    mixImpact: 0,
  },
  {
    id: 'pf-31',
    productFamily: 'Docking Connector',
    gpActual: 427.9825,
    gpBudget: 898.4622,
    gpGapToBudget: -470.48,
    volImpact: -381.818,
    priceImpact: 188.9506,
    costImpact: -241.483,
    mixImpact: -36.1294,
  },
  {
    id: 'pf-32',
    productFamily: 'Card Connector',
    gpActual: 77.75676,
    gpBudget: 587.92,
    gpGapToBudget: -510.163,
    volImpact: 161.0663,
    priceImpact: -238.855,
    costImpact: -355.41,
    mixImpact: -76.9644,
  },
  {
    id: 'pf-33',
    productFamily: 'Memory Connector',
    gpActual: 10238.99,
    gpBudget: 10833.14,
    gpGapToBudget: -594.146,
    volImpact: 1857.621,
    priceImpact: 1148.195,
    costImpact: -3763.64,
    mixImpact: 163.6769,
  },
];

// Calculate totals for Product Analysis
export const mockProductFamilyTotals: ProductFamilyData = {
  id: 'pf-total',
  productFamily: 'Grand Total',
  gpActual: 35459.24,
  gpBudget: 33109.2,
  gpGapToBudget: 2350.034,
  volImpact: 8807.664,
  priceImpact: 3662.216,
  costImpact: -7323.21,
  mixImpact: -2796.63,
};

// Cost Impact Breakdown Data (Layer 3)
export const mockCostImpactData: CostImpactData[] = [
  {
    id: 'ci-1',
    productFamily: 'Memory Connector',
    costImpact: -3763.64,
    volActual: 115320.74,
    unitCostActual: 0.396,
    unitCostBudget: 0.363,
    unitCostGap: -0.0334,
    unitCostMaterialGap: -0.0529,
    unitCostLaborGap: 0.0025,
    unitCostMOHGap: 0.0106,
    unitCostOutsourceGap: 0.0065,
  },
  {
    id: 'ci-2',
    productFamily: 'Edgecard Connector',
    costImpact: -963.81,
    volActual: 102529.25,
    unitCostActual: 0.209,
    unitCostBudget: 0.207,
    unitCostGap: -0.0013,
    unitCostMaterialGap: -0.0097,
    unitCostLaborGap: 0.0032,
    unitCostMOHGap: 0.0052,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-3',
    productFamily: 'Modular Jack Connector',
    costImpact: -738.41,
    volActual: 28410.6,
    unitCostActual: 0.603,
    unitCostBudget: 0.556,
    unitCostGap: -0.047,
    unitCostMaterialGap: -0.0502,
    unitCostLaborGap: -0.0019,
    unitCostMOHGap: 0.0024,
    unitCostOutsourceGap: 0.0026,
  },
  {
    id: 'ci-4',
    productFamily: 'Board to Board Connector',
    costImpact: -637.3,
    volActual: 10201.25,
    unitCostActual: 0.328,
    unitCostBudget: 0.241,
    unitCostGap: -0.0866,
    unitCostMaterialGap: -0.0469,
    unitCostLaborGap: -0.0154,
    unitCostMOHGap: -0.0242,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-5',
    productFamily: 'USB Connector',
    costImpact: -428.02,
    volActual: 66629.88,
    unitCostActual: 0.153,
    unitCostBudget: 0.145,
    unitCostGap: -0.0074,
    unitCostMaterialGap: -0.0068,
    unitCostLaborGap: 0.0004,
    unitCostMOHGap: -0.0003,
    unitCostOutsourceGap: -0.0008,
  },
  {
    id: 'ci-6',
    productFamily: 'Card Connector',
    costImpact: -355.41,
    volActual: 4967.38,
    unitCostActual: 0.303,
    unitCostBudget: 0.248,
    unitCostGap: -0.0558,
    unitCostMaterialGap: -0.0485,
    unitCostLaborGap: -0.0061,
    unitCostMOHGap: -0.0012,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-7',
    productFamily: 'Foxray-s Connector',
    costImpact: -321.06,
    volActual: 220.0,
    unitCostActual: 2.588,
    unitCostBudget: 1.128,
    unitCostGap: -1.4594,
    unitCostMaterialGap: -0.2128,
    unitCostLaborGap: -0.5817,
    unitCostMOHGap: -0.6649,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-8',
    productFamily: 'Docking Connector',
    costImpact: -241.48,
    volActual: 2299.24,
    unitCostActual: 0.24,
    unitCostBudget: 0.125,
    unitCostGap: -0.1152,
    unitCostMaterialGap: -0.0313,
    unitCostLaborGap: -0.045,
    unitCostMOHGap: -0.0388,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-9',
    productFamily: 'HDMI Connector',
    costImpact: -188.63,
    volActual: 7858.86,
    unitCostActual: 0.195,
    unitCostBudget: 0.171,
    unitCostGap: -0.024,
    unitCostMaterialGap: -0.0073,
    unitCostLaborGap: -0.0023,
    unitCostMOHGap: -0.0048,
    unitCostOutsourceGap: -0.0097,
  },
  {
    id: 'ci-10',
    productFamily: 'Plastic Parts',
    costImpact: -113.23,
    volActual: 11843.3,
    unitCostActual: 0.049,
    unitCostBudget: 0.034,
    unitCostGap: -0.015,
    unitCostMaterialGap: -0.0069,
    unitCostLaborGap: -0.0021,
    unitCostMOHGap: -0.0033,
    unitCostOutsourceGap: -0.0027,
  },
  {
    id: 'ci-11',
    productFamily: 'DisplayPort Connector',
    costImpact: -90.64,
    volActual: 13559.07,
    unitCostActual: 0.212,
    unitCostBudget: 0.206,
    unitCostGap: -0.0061,
    unitCostMaterialGap: -0.0072,
    unitCostLaborGap: 0.0013,
    unitCostMOHGap: -0.0002,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-12',
    productFamily: 'DSUB Connector',
    costImpact: -47.08,
    volActual: 10606.44,
    unitCostActual: 0.294,
    unitCostBudget: 0.273,
    unitCostGap: -0.0218,
    unitCostMaterialGap: -0.0302,
    unitCostLaborGap: 0.0043,
    unitCostMOHGap: 0.0044,
    unitCostOutsourceGap: -0.0004,
  },
  {
    id: 'ci-13',
    productFamily: 'Pogo Connector',
    costImpact: -31.17,
    volActual: 1260.98,
    unitCostActual: 0.09,
    unitCostBudget: 0.065,
    unitCostGap: -0.0247,
    unitCostMaterialGap: -0.0194,
    unitCostLaborGap: -0.0006,
    unitCostMOHGap: -0.0047,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-14',
    productFamily: 'SCSI Connector',
    costImpact: -27.49,
    volActual: 44.46,
    unitCostActual: 1.043,
    unitCostBudget: 0.425,
    unitCostGap: -0.6184,
    unitCostMaterialGap: -0.6718,
    unitCostLaborGap: 0.0218,
    unitCostMOHGap: 0.0316,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-15',
    productFamily: 'Battery Connector',
    costImpact: -27.18,
    volActual: 1698.45,
    unitCostActual: 0.204,
    unitCostBudget: 0.193,
    unitCostGap: -0.0111,
    unitCostMaterialGap: -0.0178,
    unitCostLaborGap: 0.0,
    unitCostMOHGap: 0.0067,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-16',
    productFamily: 'Metal parts',
    costImpact: -15.32,
    volActual: 1295.68,
    unitCostActual: 0.026,
    unitCostBudget: 0.013,
    unitCostGap: -0.0136,
    unitCostMaterialGap: -0.0071,
    unitCostLaborGap: -0.001,
    unitCostMOHGap: -0.0055,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-17',
    productFamily: 'Audio Jack Connector',
    costImpact: -13.2,
    volActual: 18109.81,
    unitCostActual: 0.147,
    unitCostBudget: 0.149,
    unitCostGap: 0.0019,
    unitCostMaterialGap: -0.0117,
    unitCostLaborGap: 0.0027,
    unitCostMOHGap: 0.0047,
    unitCostOutsourceGap: 0.0062,
  },
  {
    id: 'ci-18',
    productFamily: 'Mini Din Connector',
    costImpact: -10.1,
    volActual: 1505.5,
    unitCostActual: 0.183,
    unitCostBudget: 0.176,
    unitCostGap: -0.0068,
    unitCostMaterialGap: -0.0036,
    unitCostLaborGap: 0.0001,
    unitCostMOHGap: -0.0033,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-19',
    productFamily: 'DVI Connector',
    costImpact: -3.65,
    volActual: 807.96,
    unitCostActual: 0.279,
    unitCostBudget: 0.291,
    unitCostGap: 0.0117,
    unitCostMaterialGap: -0.0031,
    unitCostLaborGap: 0.0102,
    unitCostMOHGap: 0.0049,
    unitCostOutsourceGap: -0.0003,
  },
  {
    id: 'ci-20',
    productFamily: 'Centronic Connector',
    costImpact: -1.2,
    volActual: 49.92,
    unitCostActual: 0.454,
    unitCostBudget: 0.43,
    unitCostGap: -0.0241,
    unitCostMaterialGap: -0.0226,
    unitCostLaborGap: 0.0012,
    unitCostMOHGap: -0.0026,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-21',
    productFamily: 'Smart Serial Connector',
    costImpact: -0.76,
    volActual: 4.8,
    unitCostActual: 0.952,
    unitCostBudget: 0.658,
    unitCostGap: -0.2936,
    unitCostMaterialGap: -0.192,
    unitCostLaborGap: -0.0368,
    unitCostMOHGap: -0.0648,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-22',
    productFamily: 'IEEE 1394 Connector',
    costImpact: -0.05,
    volActual: 9.72,
    unitCostActual: 0.204,
    unitCostBudget: 0.2,
    unitCostGap: -0.0049,
    unitCostMaterialGap: -0.0031,
    unitCostLaborGap: -0.0005,
    unitCostMOHGap: -0.0013,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-23',
    productFamily: 'LED',
    costImpact: 0.0,
    volActual: 320.3,
    unitCostActual: 0.033,
    unitCostBudget: 0.0,
    unitCostGap: 0.0,
    unitCostMaterialGap: 0.0,
    unitCostLaborGap: 0.0,
    unitCostMOHGap: 0.0,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-24',
    productFamily: 'Busbar Power',
    costImpact: 0.0,
    volActual: 0.0,
    unitCostActual: 0.0,
    unitCostBudget: 0.55,
    unitCostGap: 0.0,
    unitCostMaterialGap: 0.0,
    unitCostLaborGap: 0.0,
    unitCostMOHGap: 0.0,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-25',
    productFamily: 'Others',
    costImpact: 0.0,
    volActual: 43.72,
    unitCostActual: 0.005,
    unitCostBudget: 0.0,
    unitCostGap: 0.0,
    unitCostMaterialGap: 0.0,
    unitCostLaborGap: 0.0,
    unitCostMOHGap: 0.0,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-26',
    productFamily: 'Ribbon Beetle Connector',
    costImpact: 0.02,
    volActual: 4.18,
    unitCostActual: 0.806,
    unitCostBudget: 0.81,
    unitCostGap: 0.0041,
    unitCostMaterialGap: -0.0048,
    unitCostLaborGap: 0.0067,
    unitCostMOHGap: 0.0021,
    unitCostOutsourceGap: 0.0001,
  },
  {
    id: 'ci-27',
    productFamily: 'Terminal Block',
    costImpact: 4.84,
    volActual: 38.66,
    unitCostActual: 0.262,
    unitCostBudget: 0.387,
    unitCostGap: 0.1251,
    unitCostMaterialGap: 0.1,
    unitCostLaborGap: 0.0162,
    unitCostMOHGap: 0.0114,
    unitCostOutsourceGap: -0.0025,
  },
  {
    id: 'ci-28',
    productFamily: 'Game Connector',
    costImpact: 8.38,
    volActual: 4309.6,
    unitCostActual: 0.073,
    unitCostBudget: 0.075,
    unitCostGap: 0.0019,
    unitCostMaterialGap: -0.0017,
    unitCostLaborGap: 0.0018,
    unitCostMOHGap: 0.0004,
    unitCostOutsourceGap: 0.0015,
  },
  {
    id: 'ci-29',
    productFamily: 'Circular Connector',
    costImpact: 9.56,
    volActual: 9.29,
    unitCostActual: 0.921,
    unitCostBudget: 1.95,
    unitCostGap: 1.0287,
    unitCostMaterialGap: -0.0122,
    unitCostLaborGap: 0.3906,
    unitCostMOHGap: 0.6475,
    unitCostOutsourceGap: 0.0028,
  },
  {
    id: 'ci-30',
    productFamily: 'Wire to Board Connector',
    costImpact: 10.98,
    volActual: 545.12,
    unitCostActual: 0.105,
    unitCostBudget: 0.125,
    unitCostGap: 0.0206,
    unitCostMaterialGap: 0.0065,
    unitCostLaborGap: 0.0053,
    unitCostMOHGap: 0.0088,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-31',
    productFamily: 'POF Connector',
    costImpact: 12.81,
    volActual: 330.44,
    unitCostActual: 0.167,
    unitCostBudget: 0.206,
    unitCostGap: 0.0388,
    unitCostMaterialGap: 0.0416,
    unitCostLaborGap: -0.0016,
    unitCostMOHGap: -0.0011,
    unitCostOutsourceGap: 0.0,
  },
  {
    id: 'ci-32',
    productFamily: 'SFP Receptacle Connector',
    costImpact: 53.71,
    volActual: 3833.48,
    unitCostActual: 0.33,
    unitCostBudget: 0.379,
    unitCostGap: 0.0491,
    unitCostMaterialGap: 0.0159,
    unitCostLaborGap: 0.0099,
    unitCostMOHGap: 0.0215,
    unitCostOutsourceGap: 0.0019,
  },
  {
    id: 'ci-33',
    productFamily: 'Power Connector',
    costImpact: 595.32,
    volActual: 26679.85,
    unitCostActual: 0.024,
    unitCostBudget: 0.109,
    unitCostGap: 0.0842,
    unitCostMaterialGap: 0.0574,
    unitCostLaborGap: 0.0094,
    unitCostMOHGap: 0.0178,
    unitCostOutsourceGap: -0.0004,
  },
];

// Cost Component Totals (Layer 3)
// Calculated from Excel Grand Total unit gaps * total volume (435347.93)
export const mockCostComponentTotals: CostComponentTotals = {
  material: -7920.0, // -0.0182 * 435347.93 in thousands
  labor: 1001.3, // 0.0023 * 435347.93 in thousands
  moh: 2916.8, // 0.0067 * 435347.93 in thousands
  outsource: 957.8, // 0.0022 * 435347.93 in thousands
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
// Based on Excel data: Ordered to match x-axis label alignment
export const mockMVABreakdownStages: MVABreakdownStage[] = [
  {
    stage: 'actual-mva-cost',
    label: 'Actual MVA',
    value: 10.93,
    type: 'baseline',
    description: 'Actual Manufacturing Value Added',
  },
  {
    stage: 'dl-efficiency-gap',
    label: 'Direct Labour Efficiency',
    value: 9.18,
    delta: 0.85,
    type: 'negative',
    description: 'Direct Labour efficiency impact',
  },
  {
    stage: 'dl-hourly-rate-impact',
    label: 'DL Hourly Rate Impact',
    value: 9.53,
    delta: 0.35,
    type: 'negative',
    description: 'Direct Labor hourly rate impact',
  },
  {
    stage: 'fixed-moh-efficiency-gap',
    label: 'Fixed MOH',
    value: 10.48,
    delta: 0.3,
    type: 'negative',
    description: 'Fixed Manufacturing Overhead impact',
  },
  {
    stage: 'fix-impact',
    label: 'FX Impact',
    value: 10.93,
    delta: 0.45,
    type: 'negative',
    description: 'Foreign exchange impact',
  },
  {
    stage: 'idl-hourly-rate-impact',
    label: 'IDL Hourly Rate Impact',
    value: 9.93,
    delta: 0.15,
    type: 'negative',
    description: 'Indirect Labor hourly rate impact',
  },
  {
    stage: 'idl-efficiency-gap',
    label: 'IDL Impact',
    value: 9.78,
    delta: 0.25,
    type: 'negative',
    description: 'Indirect Labor impact',
  },
  {
    stage: 'mva-exclu-fx-impact',
    label: 'MVA excl. FX impact',
    value: 10.48,
    type: 'baseline',
    description: 'MVA excluding FX impact',
  },
  {
    stage: 'mva-exclu-external-impact',
    label: 'MVA excl. Uncontrollable Impact',
    value: 9.28,
    type: 'baseline',
    description: 'MVA excluding uncontrollable impact',
  },
  {
    stage: 'budget-mva-cost',
    label: 'Target MVA',
    value: 7.13,
    type: 'baseline',
    description: 'Target Manufacturing Value Added',
  },
  {
    stage: 'variable-moh-efficiency-gap',
    label: 'Variable MOH',
    value: 10.18,
    delta: 0.25,
    type: 'negative',
    description: 'Variable Manufacturing Overhead impact',
  },
  {
    stage: 'vol-mix-variance',
    label: 'Volume Variance',
    value: 8.33,
    delta: 1.2,
    type: 'negative',
    description: 'Volume variance impact',
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

// Leakage Recovery Proposal - Standalone proposal for NP Deviation recovery
export const mockLeakageRecoveryProposal: Proposal = {
  id: 'proposal-leakage-recovery',
  assumptionId: '', // Not tied to any assumption
  description:
    'Leakage recovery initiatives to address productivity and labor-related issues',
  actions: [
    // Initiative 1: UPPH down 4% due to unbalanced line setup
    {
      id: 'action-leakage-1',
      description:
        'UPPH down 4% due to unbalanced line setup after product mix change.\n\nActions:\n• Conduct rapid line rebalance and workstation redesign on Cable Assembly Line 2.\n• Cross-train operators between Line 2 & 3 to improve utilization.\n• Introduce daily "First-Pass Yield" dashboard to monitor rework trend.\n\nType: DL – Lower productivity vs plan\nSite: Vietnam (VSIP)\nOwner: MFG Head – An Nguyen\nImpact: +3% UPPH by Dec; US$ 0.8 M saving',
      expectedImpact: 0.8,
      feasibility: 'high',
      priority: 'high',
    },
    // Initiative 2: Forecast-volume spike unaligned with manpower planning
    {
      id: 'action-leakage-2',
      description:
        'Forecast-volume spike unaligned with manpower planning.\n\nActions:\n• Implement dynamic labor deployment across 3 lines.\n• Launch pilot AI-based production planning module in Nerve Center to predict load and shift pattern.\n\nType: DL – Overtime overrun\nSite: Kunshan\nOwner: Planning Mgr – Chen Wei\nImpact: Reduce OT hours ~15% by Q1 FY26; US$ 0.6 M saving',
      expectedImpact: 0.6,
      feasibility: 'high',
      priority: 'high',
    },
    // Initiative 3: Indirect-labor reduction delayed due to labor negotiation
    {
      id: 'action-leakage-3',
      description:
        'Indirect-labor reduction delayed due to labor negotiation.\n\nActions:\n• Freeze new IDL hires & backfills until Q2.\n• Accelerate admin automation (digital attendance, e-approval).\n• Re-phase IDL lay-off to deliver full impact in Q3–Q4.\n\nType: IDL – Initiative delay\nSite: Vietnam (VSIP & Binh Duong)\nOwner: HR Director – Linh Tran\nImpact: Recover US$ 1.5 M annualized saving',
      expectedImpact: 1.5,
      feasibility: 'high',
      priority: 'high',
    },
    // Initiative 4: Overlapping warehouse & QA functions between plants
    {
      id: 'action-leakage-4',
      description:
        'Overlapping warehouse & QA functions between plants.\n\nActions:\n• Merge inbound QA across Plant A/B into single shared service hub.\n• Standardize logistics scheduling through Nerve Center module.\n\nType: IDL – Support duplication\nSite: Mexico – Juárez\nOwner: Ops Excellence Lead – Carlos Ruiz\nImpact: US$ 0.9 M annual saving',
      expectedImpact: 0.9,
      feasibility: 'high',
      priority: 'high',
    },
    // Initiative 5: Limited productivity governance rhythm
    {
      id: 'action-leakage-5',
      description:
        'Limited productivity governance rhythm.\n\nActions:\n• Launch "Daily Performance Pulse" in Nerve Center – auto-push UPPH, absenteeism, and labor cost dashboards to BU Heads.\n• Integrate weekly variance review into site rhythm.\n\nType: DL & IDL – General leakage\nSite: All sites\nOwner: Regional COO – Jeffrey Huang\nImpact: Restore run-rate savings by March FY26',
      expectedImpact: 0,
      feasibility: 'high',
      priority: 'high',
    },
  ],
  createdDate: new Date('2025-01-15'),
  lastUpdated: new Date('2025-01-15'),
};
