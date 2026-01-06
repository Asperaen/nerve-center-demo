export interface MonthlyTrendPoint {
  month: string; // e.g., "Jan", "Feb"
  value: number; // value in billions
}

export interface BusinessGroupMetric {
  value: number; // e.g., 14.8 (in billions)
  baseline: number; // e.g., 14.2 (comparison value)
  percent: number; // e.g., 4.2
}

export interface BusinessGroupMetricWithTrend extends BusinessGroupMetric {
  trend: MonthlyTrendPoint[];
  aiInsight: string;
}

export interface BusinessGroupData {
  id: string;
  name: string; // "HH", "FII", etc.
  rev: BusinessGroupMetricWithTrend;
  gp: BusinessGroupMetricWithTrend;
  op: BusinessGroupMetricWithTrend;
  np: BusinessGroupMetricWithTrend;
}

// Helper to generate trend data
const generateTrend = (
  baseValue: number,
  volatility: number = 0.1,
  trend: 'up' | 'down' | 'flat' = 'up'
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
  const trendFactor = trend === 'up' ? 0.03 : trend === 'down' ? -0.02 : 0;

  return months.map((month, index) => {
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
  hh: {
    rev: 'HH revenue shows strong Q4 performance driven by premium product launches. Holiday season demand exceeded forecasts by 8%.',
    gp: 'Gross profit margin improved due to supply chain optimization and favorable commodity pricing in Q3-Q4.',
    op: 'Operating profit benefiting from automation investments made in H1. Labor cost efficiency up 12% YoY.',
    np: 'Net profit growth reflects successful cost management and lower interest expenses from debt refinancing.',
  },
  fii: {
    rev: 'FII revenue remained flat as market maturation offset new customer acquisitions. Focus shifting to value-added services.',
    gp: 'Stable GP despite competitive pricing pressure. Product mix optimization maintaining margins.',
    op: 'Operating costs well-controlled. Restructuring completed in Q2 now showing efficiency gains.',
    np: 'Net profit stable with improved working capital management offsetting revenue pressure.',
  },
  fih: {
    rev: 'FIH revenue growth driven by EV connector demand surge (+45% YoY) and data center expansion projects.',
    gp: 'GP expanding with higher-margin EV and server products now representing 38% of portfolio.',
    op: 'Operating leverage improving as Vietnam facility reaches 85% utilization. Scale benefits emerging.',
    np: 'Strong NP growth reflecting operational excellence and favorable product mix shift.',
  },
  fit: {
    rev: 'FIT revenue up on 5G infrastructure deployments and smart device component wins. Nvidia partnership ramping.',
    gp: 'GP improvement from proprietary component designs and reduced reliance on third-party IP.',
    op: 'R&D investments in AI accelerator components expected to drive future OP growth. Current phase is investment.',
    np: 'NP growth healthy despite increased R&D spend. Tax incentives in key markets contributing.',
  },
  others: {
    rev: 'Others segment showing strong growth from emerging market expansion and new B2B service offerings.',
    gp: 'GP benefiting from diversification strategy and higher-margin specialty products.',
    op: 'OP growth accelerating as startup costs for new ventures normalize. Break-even achieved in 3 of 5 new units.',
    np: 'NP growth outpacing revenue due to operational maturity in previously loss-making units.',
  },
  overall: {
    rev: 'Consolidated revenue growth of 3.2% reflects balanced portfolio performance. EV and data center segments leading.',
    gp: 'Overall GP healthy with margin expansion from product mix optimization across all business units.',
    op: 'OP benefiting from shared services consolidation and cross-BU synergy initiatives launched in Q1.',
    np: 'NP growth demonstrates effective cost management and strategic focus on high-margin opportunities.',
  },
};

export const mockBusinessGroupData: BusinessGroupData[] = [
  {
    id: 'hh',
    name: 'HH',
    rev: {
      value: 14.8,
      baseline: 14.2,
      percent: 4.2,
      trend: generateTrend(14.5, 0.08, 'up'),
      aiInsight: aiInsights.hh.rev,
    },
    gp: {
      value: 14.8,
      baseline: 14.2,
      percent: 4.2,
      trend: generateTrend(14.5, 0.06, 'up'),
      aiInsight: aiInsights.hh.gp,
    },
    op: {
      value: 14.8,
      baseline: 14.2,
      percent: 4.2,
      trend: generateTrend(14.5, 0.1, 'up'),
      aiInsight: aiInsights.hh.op,
    },
    np: {
      value: 14.8,
      baseline: 14.2,
      percent: 4.2,
      trend: generateTrend(14.5, 0.12, 'up'),
      aiInsight: aiInsights.hh.np,
    },
  },
  {
    id: 'fii',
    name: 'FII',
    rev: {
      value: 12.9,
      baseline: 12.9,
      percent: 0.0,
      trend: generateTrend(12.9, 0.05, 'flat'),
      aiInsight: aiInsights.fii.rev,
    },
    gp: {
      value: 12.9,
      baseline: 12.9,
      percent: 0.0,
      trend: generateTrend(12.9, 0.04, 'flat'),
      aiInsight: aiInsights.fii.gp,
    },
    op: {
      value: 12.9,
      baseline: 12.9,
      percent: 0.0,
      trend: generateTrend(12.9, 0.06, 'flat'),
      aiInsight: aiInsights.fii.op,
    },
    np: {
      value: 12.9,
      baseline: 12.9,
      percent: 0.0,
      trend: generateTrend(12.9, 0.07, 'flat'),
      aiInsight: aiInsights.fii.np,
    },
  },
  {
    id: 'fih',
    name: 'FIH',
    rev: {
      value: 18.3,
      baseline: 17.8,
      percent: 2.8,
      trend: generateTrend(18.0, 0.07, 'up'),
      aiInsight: aiInsights.fih.rev,
    },
    gp: {
      value: 18.3,
      baseline: 17.8,
      percent: 2.8,
      trend: generateTrend(18.0, 0.06, 'up'),
      aiInsight: aiInsights.fih.gp,
    },
    op: {
      value: 18.3,
      baseline: 17.8,
      percent: 2.8,
      trend: generateTrend(18.0, 0.08, 'up'),
      aiInsight: aiInsights.fih.op,
    },
    np: {
      value: 18.3,
      baseline: 17.8,
      percent: 2.8,
      trend: generateTrend(18.0, 0.09, 'up'),
      aiInsight: aiInsights.fih.np,
    },
  },
  {
    id: 'fit',
    name: 'FIT',
    rev: {
      value: 10.2,
      baseline: 9.8,
      percent: 4.1,
      trend: generateTrend(10.0, 0.09, 'up'),
      aiInsight: aiInsights.fit.rev,
    },
    gp: {
      value: 10.2,
      baseline: 9.8,
      percent: 4.1,
      trend: generateTrend(10.0, 0.07, 'up'),
      aiInsight: aiInsights.fit.gp,
    },
    op: {
      value: 10.2,
      baseline: 9.8,
      percent: 4.1,
      trend: generateTrend(10.0, 0.1, 'up'),
      aiInsight: aiInsights.fit.op,
    },
    np: {
      value: 10.2,
      baseline: 9.8,
      percent: 4.1,
      trend: generateTrend(10.0, 0.11, 'up'),
      aiInsight: aiInsights.fit.np,
    },
  },
  {
    id: 'others',
    name: 'Others',
    rev: {
      value: 13.9,
      baseline: 13.2,
      percent: 5.3,
      trend: generateTrend(13.5, 0.1, 'up'),
      aiInsight: aiInsights.others.rev,
    },
    gp: {
      value: 13.9,
      baseline: 13.2,
      percent: 5.3,
      trend: generateTrend(13.5, 0.08, 'up'),
      aiInsight: aiInsights.others.gp,
    },
    op: {
      value: 13.9,
      baseline: 13.2,
      percent: 5.3,
      trend: generateTrend(13.5, 0.12, 'up'),
      aiInsight: aiInsights.others.op,
    },
    np: {
      value: 13.9,
      baseline: 13.2,
      percent: 5.3,
      trend: generateTrend(13.5, 0.14, 'up'),
      aiInsight: aiInsights.others.np,
    },
  },
];

// Calculate overall consolidated totals
export const calculateOverallConsolidated = (): BusinessGroupData => {
  const totals = mockBusinessGroupData.reduce(
    (acc, group) => ({
      rev: {
        value: acc.rev.value + group.rev.value,
        baseline: acc.rev.baseline + group.rev.baseline,
      },
      gp: {
        value: acc.gp.value + group.gp.value,
        baseline: acc.gp.baseline + group.gp.baseline,
      },
      op: {
        value: acc.op.value + group.op.value,
        baseline: acc.op.baseline + group.op.baseline,
      },
      np: {
        value: acc.np.value + group.np.value,
        baseline: acc.np.baseline + group.np.baseline,
      },
    }),
    {
      rev: { value: 0, baseline: 0 },
      gp: { value: 0, baseline: 0 },
      op: { value: 0, baseline: 0 },
      np: { value: 0, baseline: 0 },
    }
  );

  const calcPercent = (value: number, baseline: number) =>
    baseline === 0 ? 0 : ((value - baseline) / baseline) * 100;

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
      value: mockBusinessGroupData.reduce(
        (sum, group) => sum + group[metricKey].trend[index].value,
        0
      ),
    }));
  };

  return {
    id: 'overall',
    name: 'Overall consolidated',
    rev: {
      value: totals.rev.value,
      baseline: totals.rev.baseline,
      percent: calcPercent(totals.rev.value, totals.rev.baseline),
      trend: generateConsolidatedTrend('rev'),
      aiInsight: aiInsights.overall.rev,
    },
    gp: {
      value: totals.gp.value,
      baseline: totals.gp.baseline,
      percent: calcPercent(totals.gp.value, totals.gp.baseline),
      trend: generateConsolidatedTrend('gp'),
      aiInsight: aiInsights.overall.gp,
    },
    op: {
      value: totals.op.value,
      baseline: totals.op.baseline,
      percent: calcPercent(totals.op.value, totals.op.baseline),
      trend: generateConsolidatedTrend('op'),
      aiInsight: aiInsights.overall.op,
    },
    np: {
      value: totals.np.value,
      baseline: totals.np.baseline,
      percent: calcPercent(totals.np.value, totals.np.baseline),
      trend: generateConsolidatedTrend('np'),
      aiInsight: aiInsights.overall.np,
    },
  };
};

export const getAllBusinessGroupData = (): BusinessGroupData[] => {
  return [...mockBusinessGroupData, calculateOverallConsolidated()];
};

// ============================================
// Sub-Business Group Data (for drill-down)
// ============================================

export interface SubBusinessGroupData extends BusinessGroupData {
  parentBgId: string;
}

// AI insights for sub-business groups
const subGroupAiInsights: Record<string, Record<string, string>> = {
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

// Generate sub-business group data for a parent BG
const generateSubGroupData = (
  parentBgId: string,
  parentBgName: string,
  parentData: BusinessGroupData
): SubBusinessGroupData[] => {
  // Define distributions based on parentBgId
  let distributions;

  if (parentBgId === 'hh') {
    distributions = [
      { id: 'ipbg', name: 'A Group', factor: 0.35, trend: 'up' as const },
      { id: 'cnsbg', name: 'B Group', factor: 0.30, trend: 'flat' as const },
      { id: 'cesbg', name: 'C Group', factor: 0.15, trend: 'up' as const },
      { id: 'others_sub', name: 'E Group', factor: 0.10, trend: 'down' as const },
      { id: 'others_sub_2', name: 'S Group', factor: 0.10, trend: 'down' as const },
    ];
  } else if (parentBgId === 'fit') {
    distributions = [
      { id: 'fit_sub1', name: 'Conn.', factor: 0.40, trend: 'up' as const },
      { id: 'fit_sub2', name: 'Cable', factor: 0.35, trend: 'up' as const },
      { id: 'fit_sub3', name: 'Audio', factor: 0.25, trend: 'up' as const },
      { id: 'fit_sub4', name: 'Mobility', factor: 0.25, trend: 'up' as const },
      { id: 'fit_sub5', name: 'Belkin', factor: 0.25, trend: 'up' as const },
    ];
  } else if (parentBgId === 'fih') {
    distributions = [
      { id: 'fih_sub1', name: 'Server', factor: 0.45, trend: 'up' as const },
      { id: 'fih_sub2', name: 'AI/HPC', factor: 0.35, trend: 'up' as const },
      { id: 'fih_sub3', name: 'Networking', factor: 0.20, trend: 'flat' as const },
      { id: 'fih_sub4', name: 'Storage', factor: 0.20, trend: 'flat' as const },
      { id: 'fih_sub5', name: 'IIOT', factor: 0.20, trend: 'flat' as const },
      { id: 'fih_sub6', name: 'Automation', factor: 0.20, trend: 'flat' as const },
    ];
  } else if (parentBgId === 'fii') {
    distributions = [
      { id: 'fii_sub1', name: 'Smartphone', factor: 0.50, trend: 'flat' as const },
      { id: 'fii_sub2', name: 'Feature Phone', factor: 0.30, trend: 'up' as const },
      { id: 'fii_sub3', name: 'Smart Device', factor: 0.20, trend: 'up' as const },
      { id: 'fii_sub4', name: 'ODM', factor: 0.20, trend: 'up' as const },
      { id: 'fii_sub5', name: 'EMS', factor: 0.20, trend: 'up' as const },
    ];
  } else if (parentBgId === 'others') {
    distributions = [
      { id: 'others_sub1', name: 'Sharp', factor: 0.40, trend: 'up' as const },
      { id: 'others_sub2', name: 'MIH/EV', factor: 0.35, trend: 'up' as const },
      { id: 'others_sub3', name: 'Others', factor: 0.25, trend: 'flat' as const },
    ];
  } else {
    // Default distribution for any other parentBgId
    distributions = [
      { id: 'ipbg', name: 'A Group', factor: 0.35, trend: 'up' as const },
      { id: 'cnsbg', name: 'B Group', factor: 0.30, trend: 'flat' as const },
      { id: 'cesbg', name: 'C Group', factor: 0.15, trend: 'up' as const },
      { id: 'others_sub', name: 'E Group', factor: 0.10, trend: 'down' as const },
      { id: 'others_sub_2', name: 'S Group', factor: 0.10, trend: 'down' as const },
    ];
  }

  return distributions.map((dist) => {
    const revValue = parentData.rev.value * dist.factor;
    const revBaseline = parentData.rev.baseline * dist.factor;
    const gpValue = parentData.gp.value * dist.factor;
    const gpBaseline = parentData.gp.baseline * dist.factor;
    const opValue = parentData.op.value * dist.factor;
    const opBaseline = parentData.op.baseline * dist.factor;
    const npValue = parentData.np.value * dist.factor;
    const npBaseline = parentData.np.baseline * dist.factor;

    const calcPercent = (val: number, base: number) =>
      base === 0 ? 0 : ((val - base) / base) * 100;

    // Add some variance to percentages to make it more realistic
    const variance = (Math.random() - 0.5) * 2; // -1 to +1

    return {
      id: `${parentBgId}-${dist.id}`,
      parentBgId,
      name: dist.name,
      rev: {
        value: revValue,
        baseline: revBaseline,
        percent: calcPercent(revValue, revBaseline) + variance,
        trend: generateTrend(revValue, 0.08, dist.trend),
        aiInsight: subGroupAiInsights[dist.id].rev,
      },
      gp: {
        value: gpValue,
        baseline: gpBaseline,
        percent: calcPercent(gpValue, gpBaseline) + variance,
        trend: generateTrend(gpValue, 0.06, dist.trend),
        aiInsight: subGroupAiInsights[dist.id].gp,
      },
      op: {
        value: opValue,
        baseline: opBaseline,
        percent: calcPercent(opValue, opBaseline) + variance,
        trend: generateTrend(opValue, 0.1, dist.trend),
        aiInsight: subGroupAiInsights[dist.id].op,
      },
      np: {
        value: npValue,
        baseline: npBaseline,
        percent: calcPercent(npValue, npBaseline) + variance,
        trend: generateTrend(npValue, 0.12, dist.trend),
        aiInsight: subGroupAiInsights[dist.id].np,
      },
    };
  });
};

// Get sub-business groups for a given parent BG (without overall row)
export const getSubBusinessGroups = (
  parentBgId: string
): SubBusinessGroupData[] => {
  const parentBg = mockBusinessGroupData.find((bg) => bg.id === parentBgId);
  if (!parentBg) return [];
  return generateSubGroupData(parentBgId, parentBg.name, parentBg);
};

// Get sub-business groups with overall for a given parent BG
export const getSubBusinessGroupsWithOverall = (
  parentBgId: string
): BusinessGroupData[] => {
  const parentBg = mockBusinessGroupData.find((bg) => bg.id === parentBgId);
  if (!parentBg) return [];

  const subGroups = generateSubGroupData(parentBgId, parentBg.name, parentBg);

  // Create overall row for this BG
  const overall: BusinessGroupData = {
    id: `${parentBgId}-overall`,
    name: `${parentBg.name} overall`,
    rev: { ...parentBg.rev },
    gp: { ...parentBg.gp },
    op: { ...parentBg.op },
    np: { ...parentBg.np },
  };

  return [...subGroups, overall];
};

// Get parent BG info by ID
export const getParentBusinessGroup = (
  parentBgId: string
): BusinessGroupData | undefined => {
  return mockBusinessGroupData.find((bg) => bg.id === parentBgId);
};

// Get list of all main BU IDs and names for filter options
export const getMainBusinessGroupOptions = (): { id: string; name: string }[] => {
  return mockBusinessGroupData.map((bg) => ({ id: bg.id, name: bg.name }));
};
