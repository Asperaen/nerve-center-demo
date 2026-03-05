import type { NewsItem } from '../types';

export const mockNews: NewsItem[] = [
  {
    id: 'news-11',
    category: 'Suppliers & Supply Chain',
    title: 'Vietnam sets 7.2% minimum wage hike from next year',
    summary:
      'Vietnam 7.2% minimum wage hike (effective Jan 2026) may increase DL cost by $7.5M across Vietnam operations, impacting Must-win BU ($3M) and Never-lose BU ($4.5M).',
    reasoning:
      'The National Wage Council approved regional minimum wage increases ranging from 3.70M to 5.31M VND per month. Direct labor expense typically represents 10% of revenue; applying a 5% blended increase translates to ~0.75pp margin erosion on a 10% OP margin.',
    riskOrOpportunity: 'risk',
    priority: 'high',
    urgency: 'short_term',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    source: 'VietnamNet',
    annotations: [],
  },
  {
    id: 'news-1',
    category: 'Macro & Geopolitics',
    title: 'US Announces 25% Tariff on Chinese-Made EV Connectors',
    summary:
      'New 25% US tariff on Chinese EV connectors (effective in 30 days) may cause $7.5M OP hit and 0.75pp margin erosion for mid-size EMS BUs with China exposure.',
    reasoning:
      'For a mid-size EMS BU with $1B annual revenue: Direct labor expense is $100M (10% of revenue), indirect labor overhead portion is $50M, totaling $150M in labor-related costs. This follows ongoing US-China trade tensions aimed at protecting domestic manufacturing.',
    riskOrOpportunity: 'risk',
    priority: 'high',
    urgency: 'short_term',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    source: 'Reuters',
    annotations: [],
    analyzingBy: 'Jennifer Wu - VP Operations',
  },
  {
    id: 'news-2',
    category: 'Suppliers & Supply Chain',
    title: 'China Limits Rare Earth Exports Affecting Connector Materials',
    summary:
      'China rare earth export restrictions may increase material costs by 30-40%, driving estimated $5M cost increase in H2. Current inventory covers only 45 days.',
    reasoning:
      'Rare earth materials account for 15% of our connector component costs. China has announced export restrictions citing national security concerns, effective in 60 days. Recommended actions: Accelerate negotiations with Australian and US rare earth suppliers, increase safety stock to 90 days, and explore material substitution opportunities with R&D.',
    riskOrOpportunity: 'risk',
    priority: 'high',
    urgency: 'short_term',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    source: 'Bloomberg',
    annotations: [],
    analyzingBy: 'Jack Chen - CPO',
  },
  {
    id: 'news-3',
    category: 'Customer & End-market',
    title: 'Major EV OEM Q3 Earnings Beat Expectations, Plans to Double EV Production',
    summary:
      'Major EV OEM production doubling by 2026 creates $25M revenue opportunity. Current volume: $45M annually (#2 customer).',
    reasoning:
      'Major EV OEM reported stronger-than-expected Q3 earnings and announced plans to double electric vehicle production by 2026. Potential to increase EV business by 80-100% over next 2 years. Will require capacity expansion at our facilities. Recommended actions: Schedule strategic account review with EV OEM procurement within 2 weeks.',
    riskOrOpportunity: 'opportunity',
    priority: 'high',
    urgency: 'mid_term',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    source: 'Wall Street Journal',
    annotations: [],
  },
  {
    id: 'news-4',
    category: 'Competitors & Industry',
    title: 'TE Connectivity Acquires Optical Connector Startup for $380M',
    summary:
      'TE Connectivity optical acquisition may threaten our $120M optical connector business (5% of total revenue). Risk of reduced win rate with data center customers.',
    reasoning:
      'Major competitor TE Connectivity has acquired a Silicon Valley-based optical connector startup for $380M, strengthening their position in the copper-to-optical transition market. Market may consolidate faster than expected. Recommended actions: Accelerate our own optical connector roadmap, review M&A pipeline for similar targets, and strengthen relationships with key data center customers.',
    riskOrOpportunity: 'risk',
    priority: 'medium',
    urgency: 'mid_term',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    source: 'TechCrunch',
    annotations: [],
  },
  {
    id: 'news-5',
    category: 'Macro & Geopolitics',
    title: 'Global 5G Infrastructure Investment Reaches $200B in 2025',
    summary:
      '5G infrastructure boom drives 30% YoY connector demand growth. Our $420M 5G business positioned for expansion in India and Southeast Asia.',
    reasoning:
      'Worldwide 5G infrastructure spending has reached record levels at $200B in 2025, with telecommunications companies investing heavily in network expansion and upgrades. Recommended actions: Increase production capacity for 5G antenna connectors, prioritize R&D for next-gen 5G products, and expand sales team in high-growth regions.',
    riskOrOpportunity: 'opportunity',
    priority: 'medium',
    urgency: 'long_term',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
    source: 'Financial Times',
    annotations: [],
  },
  {
    id: 'news-6',
    category: 'Customer & End-market',
    title: 'Major OEM Delays Consumer Electronics Launch to Q2 2026',
    summary:
      'Major OEM product delay shifts $8M revenue from Q1 to Q2 2026. Production planning adjustment needed to avoid excess inventory. Consumer electronics business: $95M annually (23% of audio segment).',
    reasoning:
      'Major OEM has postponed the launch of next-generation consumer electronics from Q1 to Q2 2026, citing supply chain optimization and feature enhancements. Recommended actions: Confirm revised schedule with customer directly, adjust Q1 production plan by 15%, and explore opportunity to accelerate other customer projects.',
    riskOrOpportunity: 'risk',
    priority: 'medium',
    urgency: 'long_term',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
    source: 'The Verge',
    annotations: [],
  },
  {
    id: 'news-7',
    category: 'Competitors & Industry',
    title: 'Amphenol Reports Strong Q3 Results Driven by Data Center Growth',
    summary:
      'Amphenol 18% YoY data center growth validates AI connector market opportunity. Our data center business: $354M in H1 2025 (+35.7% YoY) - outpacing key competitor.',
    reasoning:
      "Amphenol, the world's second-largest connector manufacturer, reported 18% YoY revenue growth in Q3, primarily driven by AI data center applications. This validates our strategic focus on data center supply chain. Recommended actions: Benchmark our growth rate vs Amphenol, accelerate engagement with AI server programs, and ensure competitive pricing remains intact.",
    riskOrOpportunity: 'opportunity',
    priority: 'low',
    urgency: 'long_term',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
    source: 'Seeking Alpha',
    annotations: [],
  },
  {
    id: 'news-8',
    category: 'Suppliers & Supply Chain',
    title: 'Global Copper Prices Surge 15% Amid Supply Concerns',
    summary:
      'Copper price surge (+15%) may increase costs by $7M and erode gross margins by 0.8-1.0pp. Copper accounts for 28% of material costs across our $920M copper cable business.',
    reasoning:
      'Copper prices have increased 15% over the past month due to supply disruptions in South American mines and strong demand from renewable energy projects. Our copper cable revenue represents 40% of total (market leading position). Recommended actions: Review copper hedging strategy with CFO, initiate customer discussions on potential price adjustments, and accelerate copper recycling initiatives.',
    riskOrOpportunity: 'risk',
    priority: 'medium',
    urgency: 'mid_term',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000), // 72 hours ago
    source: 'Commodity Markets',
    annotations: [],
  },
  {
    id: 'news-9',
    category: 'Macro & Geopolitics',
    title: 'Vietnam Offers Tax Incentives for Advanced Manufacturing',
    summary:
      'Vietnam 10-year tax holiday could save $3-4M annually on our $180M Vietnam operations. Strategic opportunity to shift production from China amid US tariffs.',
    reasoning:
      'Vietnamese government announces new 10-year tax holiday for advanced manufacturing facilities, targeting electronics and automotive supply chain companies. Current Vietnam operations: 450 employees. Recommended actions: Engage with Vietnam government officials to understand qualification requirements, accelerate Vietnam capacity expansion plans, and evaluate ROI for additional facility investment.',
    riskOrOpportunity: 'opportunity',
    priority: 'medium',
    urgency: 'long_term',
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000), // 96 hours ago
    source: 'Vietnam Investment Review',
    annotations: [],
  },
  {
    id: 'news-10',
    category: 'Customer & End-market',
    title: 'Major EV OEM Expands European Production with New Hungary Plant',
    summary:
      'Major EV OEM €800M Hungary plant (200K vehicles/year by 2027) creates European supply opportunity. Current volume: $38M annually (#3 EV customer).',
    reasoning:
      'Major Chinese EV OEM announces €800M investment in new Hungarian manufacturing facility, expected to produce 200,000 vehicles annually by 2027. European expansion creates opportunity for local supply. May require establishing local inventory or production presence. Recommended actions: Schedule meeting with EV OEM Europe procurement team and assess feasibility of European distribution hub.',
    riskOrOpportunity: 'opportunity',
    priority: 'low',
    urgency: 'long_term',
    timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000), // 120 hours ago
    source: 'Automotive News Europe',
    annotations: [],
  },
  {
    id: 'news-12',
    category: 'Customer & End-market',
    title: 'AI Chip Maker Reports Record Demand, Data Center Revenue Up 122%',
    summary:
      'AI chip demand surge drives 122% YoY data center revenue growth. Our high-speed connector business positioned to benefit from hyperscaler capex acceleration.',
    reasoning:
      'Major AI chip maker reported record quarterly earnings with data center revenue up 122% YoY, driven by unprecedented AI infrastructure demand. Major cloud providers are accelerating capex to meet AI compute needs. This validates our strategic investment in high-speed data center connectors. Recommended actions: Accelerate capacity expansion for 800G/1.6T connectors and strengthen partnerships.',
    riskOrOpportunity: 'opportunity',
    priority: 'high',
    urgency: 'short_term',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    source: 'CNBC',
    annotations: [],
  },
  {
    id: 'news-13',
    category: 'Customer & End-market',
    title: 'Consumer Electronics Demand Softens in Q4 Amid Economic Uncertainty',
    summary:
      'Global consumer electronics demand down 8% QoQ. TWS headphone shipments declined 12% affecting our $95M audio business and $45M consumer electronics segment.',
    reasoning:
      'Consumer spending on electronics has softened due to macroeconomic headwinds and inflation concerns. Premium audio segment particularly affected with TWS shipments down 12%. May see continued weakness into Q1 2026. Recommended actions: Diversify customer base, accelerate cost reduction initiatives, and explore value segment opportunities.',
    riskOrOpportunity: 'risk',
    priority: 'medium',
    urgency: 'short_term',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    source: 'IDC Research',
    annotations: [],
  },
  {
    id: 'news-14',
    category: 'Customer & End-market',
    title: 'Major OEM Revises Q1 Guidance Citing Component Shortages',
    summary:
      'Major OEM lowers Q1 revenue guidance by 5-7% due to component supply constraints. Multiple product launches pushed to Q2 affecting supplier revenue timing.',
    reasoning:
      'Major OEM announced revised Q1 guidance citing ongoing component shortages and production optimization for new products. Consumer electronics launches delayed by 4-6 weeks. This follows broader industry trend of product launch delays. Recommended actions: Adjust production schedules, manage inventory levels carefully, and confirm revised delivery schedules with customer.',
    riskOrOpportunity: 'risk',
    priority: 'high',
    urgency: 'short_term',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    source: 'Bloomberg',
    annotations: [],
  },
  {
    id: 'news-15',
    category: 'Suppliers & Supply Chain',
    title: 'Global Supply Chain Disruptions Continue Amid Red Sea Tensions',
    summary:
      'Red Sea shipping disruptions add 10-14 days to Asia-Europe transit times. Freight costs up 200% affecting material procurement and customer deliveries.',
    reasoning:
      'Ongoing tensions in the Red Sea region have forced major shipping lines to reroute around Africa, significantly increasing transit times and costs. This impacts both inbound material procurement from European suppliers and outbound shipments to European customers. Recommended actions: Increase safety stock levels, explore air freight for critical components, and communicate proactively with customers on delivery timelines.',
    riskOrOpportunity: 'risk',
    priority: 'high',
    urgency: 'short_term',
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000), // 30 hours ago
    source: 'Lloyd\'s List',
    annotations: [],
  },
];
