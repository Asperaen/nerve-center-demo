import { TREND_MONTHS } from '../constants';

export interface MonthlyTrendPoint {
  month: string; // e.g., "Jan", "Feb"
  value: number; // value in billions
}

export interface BusinessGroupMetric {
  value: number; // e.g., 14.8 (in billions)
  baseline: number; // e.g., 14.2 (comparison value)
  stly: number; // e.g., 14.2 (comparison value)
  percent: number; // e.g., 4.2
}

export interface BusinessGroupMetricWithTrend extends BusinessGroupMetric {
  trend: MonthlyTrendPoint[];
  aiInsight: string;
}

export interface BusinessGroupData {
  id: string;
  name: string; // "PCBG", "ISBG", etc.
  rev: BusinessGroupMetricWithTrend;
  gp: BusinessGroupMetricWithTrend;
  op: BusinessGroupMetricWithTrend;
  np: BusinessGroupMetricWithTrend;
}

export type BusinessGroupTimeframe = 'full-year' | 'ytm';

// Helper to generate trend data
const generateTrend = (
  baseValue: number,
  volatility: number = 0.1,
  trend: 'up' | 'down' | 'flat' = 'up'
): MonthlyTrendPoint[] => {
  const trendFactor = trend === 'up' ? 0.03 : trend === 'down' ? -0.02 : 0;

  return TREND_MONTHS.map((month, index) => {
    const trendValue = baseValue * (1 + trendFactor * (index - 11));
    const randomVariation = (Math.random() - 0.5) * volatility * baseValue;
    return {
      month,
      value: Math.max(0, trendValue + randomVariation),
    };
  });
};

// AI insights for each business group and metric
const aiInsights: Record<string, Record<string, string>> = {
  pcbg: {
    rev: 'PCBG revenue shows strong Q4 performance driven by premium product launches. Holiday season demand exceeded forecasts by 8%.',
    gp: 'Gross profit margin improved due to supply chain optimization and favorable commodity pricing in Q3-Q4.',
    op: 'Operating profit benefiting from automation investments made in H1. Labor cost efficiency up 12% YoY.',
    np: 'Net profit growth reflects successful cost management and lower interest expenses from debt refinancing.',
  },
  isbg: {
    rev: 'ISBG revenue remained flat as market maturation offset new customer acquisitions. Focus shifting to value-added services.',
    gp: 'Stable GP despite competitive pricing pressure. Product mix optimization maintaining margins.',
    op: 'Operating costs well-controlled. Restructuring completed in Q2 now showing efficiency gains.',
    np: 'Net profit stable with improved working capital management offsetting revenue pressure.',
  },
  aep: {
    rev: 'AEP revenue growth driven by EV connector demand surge (+45% YoY) and data center expansion projects.',
    gp: 'GP expanding with higher-margin EV and server products now representing 38% of portfolio.',
    op: 'Operating leverage improving as Vietnam facility reaches 85% utilization. Scale benefits emerging.',
    np: 'Strong NP growth reflecting operational excellence and favorable product mix shift.',
  },
  sdbg: {
    rev: 'SDBG revenue up on 5G infrastructure deployments and smart device component wins.',
    gp: 'GP improvement from proprietary component designs and reduced reliance on third-party IP.',
    op: 'R&D investments in AI accelerator components expected to drive future OP growth. Current phase is investment.',
    np: 'NP growth healthy despite increased R&D spend. Tax incentives in key markets contributing.',
  },
  mbu: {
    rev: 'MBU segment showing strong growth from emerging market expansion and new B2B service offerings.',
    gp: 'GP benefiting from diversification strategy and higher-margin specialty products.',
    op: 'OP growth accelerating as startup costs for new ventures normalize. Break-even achieved in 3 of 5 new units.',
    np: 'NP growth outpacing revenue due to operational maturity in previously loss-making units.',
  },
  overall: {
    rev: 'Consolidated revenue growth of 3.2% reflects balanced portfolio performance across all business groups.',
    gp: 'Overall GP healthy with margin expansion from product mix optimization across all business units.',
    op: 'OP benefiting from shared services consolidation and cross-BU synergy initiatives launched in Q1.',
    np: 'NP growth demonstrates effective cost management and strategic focus on high-margin opportunities.',
  },
};

export const mockBusinessGroupData: BusinessGroupData[] = [
  {
    id: 'pcbg',
    name: 'PCBG',
    rev: {
      value: 1349,
      baseline: 1547,
      stly: 1203,
      percent: ((1349 - 1547) / 1547) * 100,
      trend: generateTrend(10.0, 0.09, 'up'),
      aiInsight: aiInsights.pcbg.rev,
    },
    gp: {
      value: 276,
      baseline: 344,
      stly: 215,
      percent: ((276 - 344) / 344) * 100,
      trend: generateTrend(10.0, 0.07, 'up'),
      aiInsight: aiInsights.pcbg.gp,
    },
    op: {
      value: 55,
      baseline: 133,
      stly: 38,
      percent: ((55 - 133) / 133) * 100,
      trend: generateTrend(10.0, 0.1, 'up'),
      aiInsight: aiInsights.pcbg.op,
    },
    np: {
      value: 47,
      baseline: 83,
      stly: 53,
      percent: ((47 - 83) / 83) * 100,
      trend: generateTrend(10.0, 0.11, 'up'),
      aiInsight: aiInsights.pcbg.np,
    },
  },
  {
    id: 'isbg',
    name: 'ISBG',
    rev: {
      value: 129,
      baseline: 120.3,
      stly: 129,
      percent: 0.0,
      trend: generateTrend(12.9, 0.05, 'flat'),
      aiInsight: aiInsights.isbg.rev,
    },
    gp: {
      value: 129,
      baseline: 120.3,
      stly: 129,
      percent: 0.0,
      trend: generateTrend(12.9, 0.04, 'flat'),
      aiInsight: aiInsights.isbg.gp,
    },
    op: {
      value: 129,
      baseline: 120.3,
      stly: 129,
      percent: 0.0,
      trend: generateTrend(12.9, 0.06, 'flat'),
      aiInsight: aiInsights.isbg.op,
    },
    np: {
      value: 129,
      baseline: 120.3,
      stly: 129,
      percent: 0.0,
      trend: generateTrend(12.9, 0.07, 'flat'),
      aiInsight: aiInsights.isbg.np,
    },
  },
  {
    id: 'aep',
    name: 'AEP',
    rev: {
      value: 183,
      baseline: 120.3,
      stly: 178,
      percent: 2.8,
      trend: generateTrend(18.0, 0.07, 'up'),
      aiInsight: aiInsights.aep.rev,
    },
    gp: {
      value: 183,
      baseline: 120.3,
      stly: 17.8,
      percent: 2.8,
      trend: generateTrend(18.0, 0.06, 'up'),
      aiInsight: aiInsights.aep.gp,
    },
    op: {
      value: 183,
      baseline: 120.3,
      stly: 178,
      percent: 2.8,
      trend: generateTrend(18.0, 0.08, 'up'),
      aiInsight: aiInsights.aep.op,
    },
    np: {
      value: 183,
      baseline: 120.3,
      stly: 178,
      percent: 2.8,
      trend: generateTrend(18.0, 0.09, 'up'),
      aiInsight: aiInsights.aep.np,
    },
  },
  {
    id: 'sdbg',
    name: 'SDBG',
    rev: {
      value: 1349,
      baseline: 1547,
      stly: 1203,
      percent: ((1349 - 1547) / 1547) * 100,
      trend: generateTrend(10.0, 0.09, 'up'),
      aiInsight: aiInsights.sdbg.rev,
    },
    gp: {
      value: 276,
      baseline: 344,
      stly: 215,
      percent: ((276 - 344) / 344) * 100,
      trend: generateTrend(10.0, 0.07, 'up'),
      aiInsight: aiInsights.sdbg.gp,
    },
    op: {
      value: 55,
      baseline: 133,
      stly: 38,
      percent: ((55 - 133) / 133) * 100,
      trend: generateTrend(10.0, 0.1, 'up'),
      aiInsight: aiInsights.sdbg.op,
    },
    np: {
      value: 47,
      baseline: 83,
      stly: 53,
      percent: ((47 - 83) / 83) * 100,
      trend: generateTrend(10.0, 0.11, 'up'),
      aiInsight: aiInsights.sdbg.np,
    },
  },
  {
    id: 'mbu',
    name: 'MBU',
    rev: {
      value: 139,
      baseline: 120.3,
      stly: 132,
      percent: 5.3,
      trend: generateTrend(13.5, 0.1, 'up'),
      aiInsight: aiInsights.mbu.rev,
    },
    gp: {
      value: 139,
      baseline: 120.3,
      stly: 132,
      percent: 5.3,
      trend: generateTrend(13.5, 0.08, 'up'),
      aiInsight: aiInsights.mbu.gp,
    },
    op: {
      value: 139,
      baseline: 120.3,
      stly: 132,
      percent: 5.3,
      trend: generateTrend(13.5, 0.12, 'up'),
      aiInsight: aiInsights.mbu.op,
    },
    np: {
      value: 139,
      baseline: 120.3,
      stly: 132,
      percent: 5.3,
      trend: generateTrend(13.5, 0.14, 'up'),
      aiInsight: aiInsights.mbu.np,
    },
  },
];

const ytmScaleByGroup: Record<
  string,
  { value: number; baseline: number; stly: number }
> = {
  pcbg: { value: 0.72, baseline: 0.74, stly: 0.71 },
  isbg: { value: 0.76, baseline: 0.75, stly: 0.74 },
  aep: { value: 0.78, baseline: 0.77, stly: 0.76 },
  sdbg: { value: 0.73, baseline: 0.75, stly: 0.72 },
  mbu: { value: 0.7, baseline: 0.71, stly: 0.69 },
};

const roundTo = (value: number, digits: number = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const calcPercent = (value: number, baseline: number) =>
  baseline === 0 ? 0 : ((value - baseline) / baseline) * 100;

const scaleMetricForYtm = (
  metric: BusinessGroupMetricWithTrend,
  scale: { value: number; baseline: number; stly: number }
): BusinessGroupMetricWithTrend => {
  const value = roundTo(metric.value * scale.value);
  const baseline = roundTo(metric.baseline * scale.baseline);
  const stly = roundTo(metric.stly * scale.stly);

  return {
    ...metric,
    value,
    baseline,
    stly,
    percent: calcPercent(value, baseline),
    trend: metric.trend.map((point) => ({
      ...point,
      value: roundTo(point.value * scale.value, 2),
    })),
  };
};

export const mockBusinessGroupDataYtm: BusinessGroupData[] =
  mockBusinessGroupData.map((group) => {
    const scale = ytmScaleByGroup[group.id] ?? {
      value: 0.74,
      baseline: 0.74,
      stly: 0.72,
    };
    return {
      ...group,
      rev: scaleMetricForYtm(group.rev, scale),
      gp: scaleMetricForYtm(group.gp, scale),
      op: scaleMetricForYtm(group.op, scale),
      np: scaleMetricForYtm(group.np, scale),
    };
  });

// Calculate Grand total totals
export const calculateOverallConsolidated = (
  data: BusinessGroupData[] = mockBusinessGroupData
): BusinessGroupData => {
  const totals = data.reduce(
    (acc, group) => ({
      rev: {
        value: acc.rev.value + group.rev.value,
        baseline: acc.rev.baseline + group.rev.baseline,
        stly: acc.rev.stly + group.rev.stly,
      },
      gp: {
        value: acc.gp.value + group.gp.value,
        baseline: acc.gp.baseline + group.gp.baseline,
        stly: acc.gp.stly + group.gp.stly,
      },
      op: {
        value: acc.op.value + group.op.value,
        baseline: acc.op.baseline + group.op.baseline,
        stly: acc.op.stly + group.op.stly,

      },
      np: {
        value: acc.np.value + group.np.value,
        baseline: acc.np.baseline + group.np.baseline,
        stly: acc.np.stly + group.np.stly,
      },
    }),
    {
      rev: { value: 0, baseline: 0, stly: 0 },
      gp: { value: 0, baseline: 0, stly: 0 },
      op: { value: 0, baseline: 0, stly: 0 },
      np: { value: 0, baseline: 0, stly: 0 },
    }
  );

  // Generate consolidated trend by summing all BU trends
  const generateConsolidatedTrend = (
    metricKey: 'rev' | 'gp' | 'op' | 'np'
  ): MonthlyTrendPoint[] => {
    const months = [
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
    ];
    return months.map((month, index) => ({
      month,
      value: data.reduce(
        (sum, group) => sum + group[metricKey].trend[index].value,
        0
      ),
    }));
  };

  return {
    id: 'overall',
    name: 'Grand total',
    rev: {
      value: totals.rev.value,
      baseline: totals.rev.baseline,
      stly: totals.rev.stly,
      percent: calcPercent(totals.rev.value, totals.rev.baseline),
      trend: generateConsolidatedTrend('rev'),
      aiInsight: aiInsights.overall.rev,
    },
    gp: {
      value: totals.gp.value,
      baseline: totals.gp.baseline,
      stly: totals.gp.stly,
      percent: calcPercent(totals.gp.value, totals.gp.baseline),
      trend: generateConsolidatedTrend('gp'),
      aiInsight: aiInsights.overall.gp,
    },
    op: {
      value: totals.op.value,
      baseline: totals.op.baseline,
      stly: totals.op.stly,
      percent: calcPercent(totals.op.value, totals.op.baseline),
      trend: generateConsolidatedTrend('op'),
      aiInsight: aiInsights.overall.op,
    },
    np: {
      value: totals.np.value,
      baseline: totals.np.baseline,
      stly: totals.np.stly,
      percent: calcPercent(totals.np.value, totals.np.baseline),
      trend: generateConsolidatedTrend('np'),
      aiInsight: aiInsights.overall.np,
    },
  };
};

const getBusinessGroupDataset = (
  timeframe: BusinessGroupTimeframe = 'full-year'
): BusinessGroupData[] =>
  timeframe === 'ytm' ? mockBusinessGroupDataYtm : mockBusinessGroupData;

export const getAllBusinessGroupData = (
  timeframe: BusinessGroupTimeframe = 'full-year'
): BusinessGroupData[] => {
  const data = getBusinessGroupDataset(timeframe);
  return [...data, calculateOverallConsolidated(data)];
};

// ============================================
// Sub-Business Group Data (for drill-down)
// ============================================

export interface SubBusinessGroupData extends BusinessGroupData {
  parentBgId: string;
}

// AI insights for sub-business groups
export const subGroupAiInsights: Record<string, Record<string, string>> = {
  ipbg: {
    rev: 'IPBG revenue driven by industrial power solutions demand. Key wins in renewable energy sector contributing to growth.',
    gp: 'GP margins expanding with shift to higher-value integrated solutions. Component cost optimization ongoing.',
    op: 'Operating efficiency improving with lean manufacturing initiatives. Capacity utilization at 82%.',
    np: 'Net profit growth reflects successful pricing strategy and operational discipline.',
  },
  cnsbg: {
    rev: 'CNSBG revenue growth from consumer electronics refresh cycles and new product introductions.',
    gp: 'GP stable despite competitive pressure. Premium product mix providing margin support.',
    op: 'Operating costs well-managed. Marketing investments in Q4 for product launches.',
    np: 'Net profit benefiting from favorable tax positions and working capital improvements.',
  },
  cesbg: {
    rev: 'CESBG revenue accelerating with cloud infrastructure expansion. Data center demand robust.',
    gp: 'GP margins expanding on high-value server and networking solutions. Scale benefits emerging.',
    op: 'Operating leverage improving as fixed costs spread across larger revenue base.',
    np: 'Strong net profit growth reflecting market leadership in enterprise solutions.',
  },
  others_sub: {
    rev: 'Other segments showing mixed performance. New ventures in pilot phase with growth potential.',
    gp: 'GP margins vary by segment. Focus on higher-margin opportunities in emerging categories.',
    op: 'Operating investments in new capabilities. Some units approaching break-even.',
    np: 'Net profit recovering as startup costs normalize. Strategic patience required.',
  },
  others_sub_2: {
    rev: 'Other segments showing mixed performance. New ventures in pilot phase with growth potential.',
    gp: 'GP margins vary by segment. Focus on higher-margin opportunities in emerging categories.',
    op: 'Operating investments in new capabilities. Some units approaching break-even.',
    np: 'Net profit recovering as startup costs normalize. Strategic patience required.',
  },
  fit_sub1: {
    rev: '5G Infrastructure revenue growing with telecom network deployments and equipment upgrades.',
    gp: 'GP margins benefiting from standardized components and volume production.',
    op: 'Operating leverage improving with scale. Supply chain optimization reducing costs.',
    np: 'Net profit growth driven by market share gains and operational efficiencies.',
  },
  fit_sub2: {
    rev: 'Smart Components revenue from IoT and connected device applications expanding rapidly.',
    gp: 'GP margins expanding with proprietary sensor technologies and integration services.',
    op: 'Operating investments in R&D yielding higher-margin product opportunities.',
    np: 'Net profit benefiting from technology differentiation and premium pricing.',
  },
  fit_sub3: {
    rev: 'AI Accelerators revenue ramping with machine learning and AI processing demand.',
    gp: 'GP margins premium due to specialized high-performance computing components.',
    op: 'Operating costs managed through strategic partnerships and outsourcing.',
    np: 'Strong net profit growth from leading-edge technology positioning.',
  },
  fit_sub4: {
    rev: 'Mobility revenue growing with automotive and transportation technology solutions.',
    gp: 'GP margins expanding with integrated mobility platform offerings.',
    op: 'Operating investments in autonomous vehicle technologies driving future growth.',
    np: 'Net profit benefiting from strategic partnerships in mobility ecosystem.',
  },
  fit_sub5: {
    rev: 'Belkin revenue from consumer connectivity products and smart home solutions.',
    gp: 'GP margins premium with established brand positioning and product differentiation.',
    op: 'Operating efficiency high with mature product lines and global distribution.',
    np: 'Net profit solid with strong cash flow generation from consumer business.',
  },
  fih_sub1: {
    rev: 'Server revenue growing with enterprise data center and cloud computing demand.',
    gp: 'GP margins expanding with high-volume server component production.',
    op: 'Operating leverage improving with scale and manufacturing efficiency.',
    np: 'Net profit growth strong from leadership in enterprise computing solutions.',
  },
  fih_sub4: {
    rev: 'Storage revenue from enterprise and cloud storage solutions expanding steadily.',
    gp: 'GP margins premium with specialized storage technology and enterprise pricing.',
    op: 'Operating costs controlled through established manufacturing processes.',
    np: 'Net profit solid with consistent demand from enterprise storage market.',
  },
  fih_sub5: {
    rev: 'IIOT revenue from industrial internet of things and smart manufacturing applications.',
    gp: 'GP margins expanding with value-added industrial automation solutions.',
    op: 'Operating investments in industrial technology development and partnerships.',
    np: 'Net profit growth driven by adoption of Industry 4.0 technologies.',
  },
  fih_sub6: {
    rev: 'Automation revenue from factory automation and robotics systems increasing.',
    gp: 'GP margins high with specialized automation equipment and systems integration.',
    op: 'Operating efficiency improving with standardized automation platforms.',
    np: 'Net profit benefiting from leadership in industrial automation solutions.',
  },
  fii_sub4: {
    rev: 'ODM revenue from original design manufacturing services for global brands.',
    gp: 'GP margins competitive in design and manufacturing services market.',
    op: 'Operating costs managed through manufacturing scale and process optimization.',
    np: 'Net profit stable with established ODM business model and client relationships.',
  },
  fii_sub5: {
    rev: 'EMS revenue from electronics manufacturing services expanding with demand.',
    gp: 'GP margins maintaining competitive levels in manufacturing services.',
    op: 'Operating efficiency high with global manufacturing footprint optimization.',
    np: 'Net profit growth supported by manufacturing service expansion.',
  },
  fih_sub2: {
    rev: 'Data Center revenue growing with cloud computing and AI infrastructure investments.',
    gp: 'GP margins expanding with high-density and high-reliability product mix.',
    op: 'Operating costs well-controlled through automation and process improvements.',
    np: 'Net profit benefiting from premium positioning in growing data center market.',
  },
  fih_sub3: {
    rev: 'Industrial revenue stable with steady demand from manufacturing and automation sectors.',
    gp: 'GP margins maintained through product quality and reliability advantages.',
    op: 'Operating efficiency stable with established processes and cost controls.',
    np: 'Net profit solid with consistent performance in mature industrial markets.',
  },
  fii_sub1: {
    rev: 'Consumer Electronics revenue reflecting market maturity and refresh cycles.',
    gp: 'GP margins challenged by competitive pricing and component cost pressures.',
    op: 'Operating costs managed through efficiency programs and cost optimization.',
    np: 'Net profit stable with focus on working capital and expense management.',
  },
  fii_sub2: {
    rev: 'Value-Added Services revenue growing with software and service offerings.',
    gp: 'GP margins expanding with higher-value service and support contracts.',
    op: 'Operating investments in service capabilities building future growth platform.',
    np: 'Net profit improving as service business scales and margins expand.',
  },
  fii_sub3: {
    rev: 'Emerging Markets revenue accelerating with geographic expansion initiatives.',
    gp: 'GP margins varying by market but improving with localization strategies.',
    op: 'Operating costs increasing with market development but offset by growth.',
    np: 'Net profit growth driven by market penetration and scale benefits.',
  },
  others_sub1: {
    rev: 'Emerging Ventures revenue from new business development and market entry.',
    gp: 'GP margins building as products mature and scale advantages emerge.',
    op: 'Operating investments heavy in initial phases but decreasing as businesses mature.',
    np: 'Net profit trajectory improving with business model validation and scaling.',
  },
  others_sub2: {
    rev: 'B2B Services revenue growing with enterprise software and consulting offerings.',
    gp: 'GP margins premium due to service-based business model and recurring revenue.',
    op: 'Operating leverage building with scalable service delivery platforms.',
    np: 'Net profit growth strong with subscription model and client retention.',
  },
  others_sub3: {
    rev: 'Specialty Products revenue from niche markets and customized solutions.',
    gp: 'GP margins high due to specialized nature and value proposition.',
    op: 'Operating costs managed through focused manufacturing and supply chain.',
    np: 'Net profit solid with premium positioning in specialized segments.',
  },
};

// Get parent BG info by ID
export const getParentBusinessGroup = (
  parentBgId: string,
  timeframe: BusinessGroupTimeframe = 'full-year'
): BusinessGroupData | undefined => {
  return getBusinessGroupDataset(timeframe).find((bg) => bg.id === parentBgId);
};

// Get list of all main BU IDs and names for filter options
export const getMainBusinessGroupOptions = (): { id: string; name: string }[] => {
  return mockBusinessGroupData.map((bg) => ({ id: bg.id, name: bg.name }));
};
