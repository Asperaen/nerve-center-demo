import type { NewsItem } from '../types';

export const mockNews: NewsItem[] = [
  {
    id: 'news-11',
    category: 'suppliers',
    headline: 'Vietnam sets 7.2% minimum wage hike from next year',
    summary:
      'The National Wage Council of Vietnam has approved a 7.2% increase in regional minimum wage for 2026, effective January 1, 2026. The new wage levels range from 3.70 million VND to 5.31 million VND per month depending on the region.',
    aiAnalysis:
      'Labor cost increase for Vietnam operations: Key impacts: (1) For EMS companies, minimum wage hike of 7.2% typically requires adjusting entry-level/base wages by 7%+, seniority tiers slightly below proportional, and overtime & allowances (computed off base wage), resulting in effective blended labor-rate increase of ~5%, (2) Our Vietnam operations employ 450 workers with $180M annual revenue, (3) Estimated $2-3M annual cost increase if wage structure adjustments follow typical EMS patterns, (4) May pressure gross margins by 0.3-0.5% for Vietnam-sourced products. Recommended actions: Review current Vietnam wage structure and prepare 2026 budget adjustments, assess impact on product pricing and customer contracts, explore productivity improvements to offset labor cost increases, and benchmark against industry peers.',
    riskOrOpportunity: 'risk',
    impactLevel: 'high',
    urgencyLevel: 'urgent',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    source: 'VietnamNet',
    annotations: [],
  },
  {
    id: 'news-1',
    category: 'macro',
    headline: 'US Announces 25% Tariff on Chinese-Made EV Connectors',
    summary:
      'The United States Trade Representative has announced a new 25% tariff on Chinese-manufactured electric vehicle connectors, effective in 30 days. This follows ongoing trade tensions and aims to protect domestic manufacturing.',
    aiAnalysis:
      'This tariff announcement poses a significant risk to our EV connector business. Key impacts: (1) 20% of our EV connector volume is manufactured in China and exported to the US, (2) Estimated $10M revenue impact if we cannot shift production, (3) Customer orders from Tesla and other US automakers may be at risk. Recommended actions: Investigate feasibility of shifting production to Vietnam facility within 6 months, engage with customers to understand their timeline flexibility, and explore pricing adjustments.',
    riskOrOpportunity: 'risk',
    impactLevel: 'high',
    urgencyLevel: 'urgent',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    source: 'Reuters',
    annotations: [],
    analyzingBy: 'Jennifer Wu - VP Operations',
  },
  {
    id: 'news-2',
    category: 'suppliers',
    headline: 'China Limits Rare Earth Exports Affecting Connector Materials',
    summary:
      'China has announced export restrictions on rare earth elements critical for high-performance connectors, citing national security concerns. The restrictions will take effect in 60 days.',
    aiAnalysis:
      'Supply chain disruption alert: Rare earth materials account for 15% of our connector component costs. Key impacts: (1) Material costs may increase by 30-40% without alternative suppliers, (2) Estimated $5M cost increase in H2, (3) Production capacity may be constrained if supply is limited. Current inventory covers 45 days. Recommended actions: Accelerate negotiations with Australian and US rare earth suppliers, increase safety stock to 90 days, and explore material substitution opportunities with R&D.',
    riskOrOpportunity: 'risk',
    impactLevel: 'high',
    urgencyLevel: 'urgent',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    source: 'Bloomberg',
    annotations: [],
    analyzingBy: 'Jack Chen - CPO',
  },
  {
    id: 'news-3',
    category: 'customers',
    headline:
      'Tesla Q3 Earnings Beat Expectations, Plans to Double EV Production',
    summary:
      'Tesla reported stronger-than-expected Q3 earnings and announced plans to double electric vehicle production by 2026, requiring significant expansion of supplier partnerships.',
    aiAnalysis:
      'Major opportunity: Tesla is our #2 customer for high-voltage connectors. Key implications: (1) Potential to increase Tesla business by 80-100% over next 2 years, (2) Estimated $25M additional revenue opportunity, (3) Will require capacity expansion at our Shenzhen and Vietnam facilities. Current Tesla volume: $45M annually. Recommended actions: Schedule strategic account review with Tesla procurement within 2 weeks, prepare capacity expansion proposal, and assess competitive positioning.',
    riskOrOpportunity: 'opportunity',
    impactLevel: 'high',
    urgencyLevel: 'important',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    source: 'Wall Street Journal',
    annotations: [],
  },
  {
    id: 'news-4',
    category: 'competitors',
    headline: 'TE Connectivity Acquires Optical Connector Startup for $380M',
    summary:
      'Major competitor TE Connectivity has acquired a Silicon Valley-based optical connector startup, strengthening their position in the copper-to-optical transition market.',
    aiAnalysis:
      'Competitive threat in our strategic direction: TE is accelerating their optical connector capabilities. Key impacts: (1) TE may now compete more aggressively in our target optical market segment, (2) Could affect our win rate with data center customers, (3) Market may consolidate faster than expected. Our optical connector revenue: $120M (5% of total). Recommended actions: Accelerate our own optical connector roadmap, review M&A pipeline for similar targets, and strengthen relationships with key data center customers.',
    riskOrOpportunity: 'risk',
    impactLevel: 'medium',
    urgencyLevel: 'important',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    source: 'TechCrunch',
    annotations: [],
  },
  {
    id: 'news-5',
    category: 'macro',
    headline: 'Global 5G Infrastructure Investment Reaches $200B in 2025',
    summary:
      'Worldwide 5G infrastructure spending has reached record levels, with telecommunications companies investing heavily in network expansion and upgrades.',
    aiAnalysis:
      'Positive macro trend supporting our 5G AIoT business unit: Key opportunities: (1) 5G connector demand is growing 30% YoY, (2) Our 5G business currently $420M annually with strong margins, (3) Major telco customers are increasing capex budgets. Recommended actions: Increase production capacity for 5G antenna connectors, prioritize R&D for next-gen 5G products, and expand sales team in high-growth regions (India, Southeast Asia).',
    riskOrOpportunity: 'opportunity',
    impactLevel: 'medium',
    urgencyLevel: 'normal',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
    source: 'Financial Times',
    annotations: [],
  },
  {
    id: 'news-6',
    category: 'customers',
    headline: 'Apple Delays New AirPods Pro Launch to Q2 2026',
    summary:
      'Apple has postponed the launch of its next-generation AirPods Pro from Q1 to Q2 2026, citing supply chain optimization and feature enhancements.',
    aiAnalysis:
      'Volume timing shift for our TWS earphone connector business: Key impacts: (1) $8M revenue will shift from Q1 to Q2 2026, (2) Production planning needs adjustment to avoid excess inventory, (3) Opportunity to reallocate capacity to other customers in Q1. Apple TWS business: $95M annually, 23% of our audio segment. Recommended actions: Confirm revised schedule with Apple directly, adjust Q1 production plan by 15%, and explore opportunity to accelerate other TWS customer projects.',
    riskOrOpportunity: 'risk',
    impactLevel: 'medium',
    urgencyLevel: 'normal',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
    source: 'The Verge',
    annotations: [],
  },
  {
    id: 'news-7',
    category: 'competitors',
    headline: 'Amphenol Reports Strong Q3 Results Driven by Data Center Growth',
    summary:
      "Amphenol, the world's second-largest connector manufacturer, reported 18% YoY revenue growth in Q3, primarily driven by AI data center applications.",
    aiAnalysis:
      "Competitive intelligence - data center opportunity validation: Key insights: (1) AI data center connector market is growing faster than anticipated, (2) Amphenol's success validates our strategic focus on Nvidia/Amazon supply chain, (3) Market pricing remains strong. Our data center business: $354M in H1 2025 (+35.7% YoY). Recommended actions: Benchmark our growth rate vs Amphenol, accelerate engagement with Nvidia GB300 program, and ensure competitive pricing remains intact.",
    riskOrOpportunity: 'opportunity',
    impactLevel: 'low',
    urgencyLevel: 'normal',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
    source: 'Seeking Alpha',
    annotations: [],
  },
  {
    id: 'news-8',
    category: 'suppliers',
    headline: 'Global Copper Prices Surge 15% Amid Supply Concerns',
    summary:
      'Copper prices have increased 15% over the past month due to supply disruptions in South American mines and strong demand from renewable energy projects.',
    aiAnalysis:
      'Cost pressure on copper-based products: Key impacts: (1) Copper accounts for 28% of our material costs, (2) Estimated $7M cost increase if prices sustain at current levels, (3) May pressure gross margins by 0.8-1.0%. Our copper cable revenue: $920M annually (40% of total, market leading position). Recommended actions: Review copper hedging strategy with CFO, initiate customer discussions on potential price adjustments, and accelerate copper recycling initiatives.',
    riskOrOpportunity: 'risk',
    impactLevel: 'medium',
    urgencyLevel: 'important',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 72 hours ago
    source: 'Commodity Markets',
    annotations: [],
  },
  {
    id: 'news-9',
    category: 'macro',
    headline: 'Vietnam Offers Tax Incentives for Advanced Manufacturing',
    summary:
      'Vietnamese government announces new 10-year tax holiday for advanced manufacturing facilities, targeting electronics and automotive supply chain companies.',
    aiAnalysis:
      'Strategic opportunity for capacity expansion: Key opportunities: (1) Could significantly reduce tax burden on our Vietnam operations, (2) Perfect timing given need to shift production from China due to US tariffs, (3) Estimated $3-4M annual tax savings if we qualify. Current Vietnam operations: $180M revenue, 450 employees. Recommended actions: Engage with Vietnam government officials to understand qualification requirements, accelerate Vietnam capacity expansion plans, and evaluate ROI for additional facility investment.',
    riskOrOpportunity: 'opportunity',
    impactLevel: 'medium',
    urgencyLevel: 'normal',
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000), // 96 hours ago
    source: 'Vietnam Investment Review',
    annotations: [],
  },
  {
    id: 'news-10',
    category: 'customers',
    headline: 'BYD Expands European EV Production with New Hungary Plant',
    summary:
      'Chinese EV giant BYD announces €800M investment in new Hungarian manufacturing facility, expected to produce 200,000 vehicles annually by 2027.',
    aiAnalysis:
      'Geographic expansion opportunity with key customer: Key implications: (1) BYD is our #3 EV customer, current volume $38M annually, (2) European expansion creates opportunity for local connector supply, (3) May require establishing local inventory or production presence. Recommended actions: Schedule meeting with BYD Europe procurement team, assess feasibility of European distribution hub, and evaluate potential partnership with local connector distributors.',
    riskOrOpportunity: 'opportunity',
    impactLevel: 'low',
    urgencyLevel: 'normal',
    timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000), // 120 hours ago
    source: 'Automotive News Europe',
    annotations: [],
  },
];
