import type {
  ForecastDriver,
  OperationalKPI,
  IncomeStatement,
  BusinessEvent,
  Scenario,
  Initiative,
} from '../types';
import { addMonths, subDays } from 'date-fns';

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
    owner: 'Michael Chen - CPO',
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
