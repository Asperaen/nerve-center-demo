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
  name: string; // "HH", "FII", etc.
  rev: BusinessGroupMetricWithTrend;
  gp: BusinessGroupMetricWithTrend;
  op: BusinessGroupMetricWithTrend;
  np: BusinessGroupMetricWithTrend;
}

export type BusinessGroupTimeframe = "full-year" | "ytm";

// Helper to generate trend data
const generateTrend = (
  baseValue: number,
  volatility: number = 0.1,
  trend: "up" | "down" | "flat" = "up"
): MonthlyTrendPoint[] => {
  const months = [
    "Dec",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
  ];
  const trendFactor = trend === "up" ? 0.03 : trend === "down" ? -0.02 : 0;

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
  pcbg: {
    rev: "PCBG revenue at $6.1B YTD driven by AEBU1 notebook segment. Tracking slightly below target due to market conditions.",
    gp: "GP at $228M with healthy margins from AEBU1 and AEBU2. Cost optimization initiatives ongoing.",
    op: "Operating profit at $70M YTD, near budget. Manufacturing efficiency and product mix improvements in progress.",
    np: "Net profit reflects operational discipline across PCBG business units.",
  },
  aebu: {
    rev: "AEBU revenue shows strong performance driven by notebook and docking station demand. AEBU1 remains the largest revenue contributor at $3.9B YTD.",
    gp: "Gross profit margin at 3.8% with AEBU1 contributing majority of GP. BOM cost optimization ongoing.",
    op: "Operating profit at $82M YTD, slightly below budget. Manufacturing efficiency improvements in progress.",
    np: "Net profit growth reflects operational discipline. Focus on margin improvement initiatives across all sub-units.",
  },
  apbu: {
    rev: "APBU revenue at $1.3B YTD driven by APBU2-C38 leading performance. APBU1 units facing market headwinds.",
    gp: "GP margins challenged by competitive pricing pressure in application products market.",
    op: "Operating loss in APBU1 units offset by APBU2 performance. Restructuring initiatives underway.",
    np: "Net profit impacted by APBU1 losses. Focus on turnaround strategy for underperforming units.",
  },
  sdbg: {
    rev: "SDBG revenue at $1.3B YTD with SDBGBU2 as the leading contributor. System design business showing steady growth.",
    gp: "GP margins varying by unit. SDBGBU2 maintaining healthy margins while smaller units face challenges.",
    op: "Operating profit at $17M YTD, above budget. SDBGBU2 driving majority of the profit contribution.",
    np: "Net profit growth reflecting strong performance in SDBGBU2 and cost management across the group.",
  },
  mbu: {
    rev: "MBU revenue at $5M YTD with new product introductions driving growth momentum.",
    gp: "GP margins improving as MBU scales operations and optimizes product costs.",
    op: "Operating profit nearing break-even, ahead of schedule. Focus on profitable growth.",
    np: "Net profit improvement reflecting operational efficiency gains in MBU.",
  },
  isbg: {
    rev: "ISBG revenue at $6.5B YTD driven by industrial systems and server solutions. Strong performance in enterprise segment.",
    gp: "GP at $280M with healthy margins from enterprise solutions. Component cost optimization ongoing.",
    op: "Operating profit at $140M YTD, exceeding budget. Manufacturing efficiency gains realized.",
    np: "Net profit reflects strong operational performance in industrial systems business.",
  },
  aep: {
    rev: "AEP revenue at $1.1B YTD with embedded products leading growth. Edge computing solutions gaining traction.",
    gp: "GP margins healthy at $189M. Product mix optimization driving margin improvement.",
    op: "Operating profit at $87M YTD, above target. Focus on high-value embedded solutions.",
    np: "Net profit growth reflects successful product positioning in embedded markets.",
  },
  others: {
    rev: "Others segment includes ISBG and corporate functions. ISBG revenue at $106M YTD.",
    gp: "GP margins healthy in ISBG. Central functions operating as cost centers.",
    op: "Operating performance impacted by central overhead costs. ISBG showing improvement versus budget.",
    np: "Net profit reflects mix of profitable ISBG and central overhead allocations.",
  },
  central: {
    rev: "Central functions provide shared services across business groups.",
    gp: "Central GP reflects shared service revenue and internal allocations.",
    op: "Operating costs represent corporate overhead and shared service expenses.",
    np: "Net impact from central functions reflects consolidated corporate activities.",
  },
  overall: {
    rev: "Compal consolidated revenue at $7.4B YTD with PCBG driving majority of performance.",
    gp: "Overall GP at 3.5% margin with focus on improving product mix and cost reduction initiatives.",
    op: "Consolidated OP at $82M YTD, tracking near budget. Operational efficiency programs ongoing.",
    np: "NP growth demonstrates effective cost management. Focus on profitable growth across all business units.",
  },
};

/**
 * Data based on Compal CEO Dashboard (YTM 2025, values in Million USD)
 *
 * Hierarchy: BG -> BU -> Sub-BU -> Sub-sub-BU
 *
 * PCBG: AEBU1, AEBU2, APBU (APBU1: APBU1-ABO/T88/T99, APBU2: APBU2-C38/T12/T89), RD6, PCBGCEO
 * SDBG: SDBGBU1, SDBGBU2, SDBGBU3, SDBGBU5, SDBGBU6
 * MBU
 * ISBG (elevated to BG level)
 * AEP (elevated to BG level)
 * Central (Shared Expense)
 */
export const mockBusinessGroupData: BusinessGroupData[] = [
  // PCBG (PC Business Group) - Aggregate of AEBU1, AEBU2, APBU, ISBG, AEP, RD6, PCBGCEO
  {
    id: "pcbg",
    name: "PCBG",
    rev: {
      value: 6093, // PCBG aggregate
      baseline: 6245,
      stly: 6512,
      percent: ((6093 - 6245) / 6245) * 100,
      trend: generateTrend(6093, 0.08, "flat"),
      aiInsight:
        aiInsights.pcbg?.rev ||
        "PCBG revenue tracking near target with notebook segment leading.",
    },
    gp: {
      value: 228,
      baseline: 230,
      stly: 218,
      percent: ((228 - 230) / 230) * 100,
      trend: generateTrend(228, 0.07, "flat"),
      aiInsight:
        aiInsights.pcbg?.gp ||
        "GP margin stable with cost optimization efforts.",
    },
    op: {
      value: 70,
      baseline: 73,
      stly: 73,
      percent: ((70 - 73) / 73) * 100,
      trend: generateTrend(70, 0.09, "flat"),
      aiInsight:
        aiInsights.pcbg?.op ||
        "OP slightly below target due to product mix shift.",
    },
    np: {
      value: 49,
      baseline: 51,
      stly: 51,
      percent: ((49 - 51) / 51) * 100,
      trend: generateTrend(49, 0.1, "flat"),
      aiInsight:
        aiInsights.pcbg?.np ||
        "NP performance aligned with operational efficiency.",
    },
  },
  // SDBG (Smart Device Business Group)
  {
    id: "sdbg",
    name: "SDBG",
    rev: {
      value: 1306,
      baseline: 1184,
      stly: 1475,
      percent: ((1306 - 1184) / 1184) * 100,
      trend: generateTrend(1306, 0.07, "up"),
      aiInsight: aiInsights.sdbg.rev,
    },
    gp: {
      value: 34,
      baseline: 27,
      stly: 21,
      percent: ((34 - 27) / 27) * 100,
      trend: generateTrend(34, 0.08, "up"),
      aiInsight: aiInsights.sdbg.gp,
    },
    op: {
      value: 17,
      baseline: 10,
      stly: 4,
      percent: ((17 - 10) / 10) * 100,
      trend: generateTrend(17, 0.1, "up"),
      aiInsight: aiInsights.sdbg.op,
    },
    np: {
      value: 12,
      baseline: 7,
      stly: 3,
      percent: ((12 - 7) / 7) * 100,
      trend: generateTrend(12, 0.12, "up"),
      aiInsight: aiInsights.sdbg.np,
    },
  },
  // MBU
  {
    id: "mbu",
    name: "MBU",
    rev: {
      value: 5,
      baseline: 6,
      stly: 2,
      percent: ((5 - 6) / 6) * 100,
      trend: generateTrend(5, 0.15, "up"),
      aiInsight: "MBU revenue growing with new product introductions.",
    },
    gp: {
      value: 2,
      baseline: 1,
      stly: 0,
      percent: ((2 - 1) / 1) * 100,
      trend: generateTrend(2, 0.12, "up"),
      aiInsight: "GP improvement driven by product margin optimization.",
    },
    op: {
      value: 0,
      baseline: 0,
      stly: -1,
      percent: 0,
      trend: generateTrend(1, 0.1, "up"),
      aiInsight: "OP reaching break-even point ahead of schedule.",
    },
    np: {
      value: 0,
      baseline: 0,
      stly: -1,
      percent: 0,
      trend: generateTrend(1, 0.1, "up"),
      aiInsight: "NP improvement reflecting operational efficiency gains.",
    },
  },
  // ISBG (Industrial Systems Business Group) - elevated to BG level
  {
    id: "isbg",
    name: "ISBG",
    rev: {
      value: 6467, // ISBG revenue
      baseline: 6357,
      stly: 5914,
      percent: ((6467 - 6357) / 6357) * 100,
      trend: generateTrend(6467, 0.06, "up"),
      aiInsight: aiInsights.isbg?.rev || "ISBG revenue driven by industrial systems growth.",
    },
    gp: {
      value: 280,
      baseline: 286,
      stly: 266,
      percent: ((280 - 286) / 286) * 100,
      trend: generateTrend(280, 0.07, "flat"),
      aiInsight: aiInsights.isbg?.gp || "GP performance steady with cost optimization.",
    },
    op: {
      value: 140,
      baseline: 114,
      stly: 106,
      percent: ((140 - 114) / 114) * 100,
      trend: generateTrend(140, 0.08, "up"),
      aiInsight: aiInsights.isbg?.op || "OP exceeding targets from operational efficiency.",
    },
    np: {
      value: 87,
      baseline: 86,
      stly: 80,
      percent: ((87 - 86) / 86) * 100,
      trend: generateTrend(87, 0.09, "up"),
      aiInsight: aiInsights.isbg?.np || "NP growth reflecting strong business performance.",
    },
  },
  // AEP (Advanced Embedded Products) - elevated to BG level
  {
    id: "aep",
    name: "AEP",
    rev: {
      value: 1131, // AEP revenue
      baseline: 1251,
      stly: 1024,
      percent: ((1131 - 1251) / 1251) * 100,
      trend: generateTrend(1131, 0.07, "up"),
      aiInsight: aiInsights.aep?.rev || "AEP revenue growing with embedded solutions.",
    },
    gp: {
      value: 189,
      baseline: 174,
      stly: 143,
      percent: ((189 - 174) / 174) * 100,
      trend: generateTrend(189, 0.08, "up"),
      aiInsight: aiInsights.aep?.gp || "GP margin improvement from product optimization.",
    },
    op: {
      value: 87,
      baseline: 80,
      stly: 66,
      percent: ((87 - 80) / 80) * 100,
      trend: generateTrend(87, 0.09, "up"),
      aiInsight: aiInsights.aep?.op || "OP above budget with embedded solutions growth.",
    },
    np: {
      value: 54,
      baseline: 60,
      stly: 49,
      percent: ((54 - 60) / 60) * 100,
      trend: generateTrend(54, 0.1, "flat"),
      aiInsight: aiInsights.aep?.np || "NP reflecting operational improvements.",
    },
  },
];

const ytmScaleByGroup: Record<
  string,
  { value: number; baseline: number; stly: number }
> = {
  pcbg: { value: 0.73, baseline: 0.74, stly: 0.72 },
  sdbg: { value: 0.78, baseline: 0.77, stly: 0.76 },
  mbu: { value: 0.75, baseline: 0.74, stly: 0.73 },
  // Sub-unit scales (for PCBG sub-units)
  aebu1: { value: 0.72, baseline: 0.74, stly: 0.71 },
  aebu2: { value: 0.74, baseline: 0.73, stly: 0.72 },
  apbu: { value: 0.76, baseline: 0.75, stly: 0.74 },
  isbg: { value: 0.71, baseline: 0.72, stly: 0.7 },
  aep: { value: 0.73, baseline: 0.74, stly: 0.72 },
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
    metricKey: "rev" | "gp" | "op" | "np"
  ): MonthlyTrendPoint[] => {
    const months = [
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
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
    id: "overall",
    name: "Grand total",
    rev: {
      value: totals.rev.value,
      baseline: totals.rev.baseline,
      stly: totals.rev.stly,
      percent: calcPercent(totals.rev.value, totals.rev.baseline),
      trend: generateConsolidatedTrend("rev"),
      aiInsight: aiInsights.overall.rev,
    },
    gp: {
      value: totals.gp.value,
      baseline: totals.gp.baseline,
      stly: totals.gp.stly,
      percent: calcPercent(totals.gp.value, totals.gp.baseline),
      trend: generateConsolidatedTrend("gp"),
      aiInsight: aiInsights.overall.gp,
    },
    op: {
      value: totals.op.value,
      baseline: totals.op.baseline,
      stly: totals.op.stly,
      percent: calcPercent(totals.op.value, totals.op.baseline),
      trend: generateConsolidatedTrend("op"),
      aiInsight: aiInsights.overall.op,
    },
    np: {
      value: totals.np.value,
      baseline: totals.np.baseline,
      stly: totals.np.stly,
      percent: calcPercent(totals.np.value, totals.np.baseline),
      trend: generateConsolidatedTrend("np"),
      aiInsight: aiInsights.overall.np,
    },
  };
};

const getBusinessGroupDataset = (
  timeframe: BusinessGroupTimeframe = "full-year"
): BusinessGroupData[] =>
  timeframe === "ytm" ? mockBusinessGroupDataYtm : mockBusinessGroupData;

export const getAllBusinessGroupData = (
  timeframe: BusinessGroupTimeframe = "full-year"
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
const subGroupAiInsights: Record<string, Record<string, string>> = {
  // AEBU subgroups
  aebu1: {
    rev: "AEBU1 is the largest revenue contributor at $3.9B YTD, driven by notebook and system products.",
    gp: "GP margins at 3.8% with ongoing cost optimization. BOM efficiency initiatives showing results.",
    op: "Operating profit at $82M, slightly below budget due to volume softness in Q1.",
    np: "Net profit reflecting solid operational performance with focus on margin improvement.",
  },
  aebu2: {
    rev: "AEBU2 revenue at $640M YTD, growing 8% vs budget driven by product mix improvements.",
    gp: "GP margins improved vs prior year through better material cost management.",
    op: "Operating profit at $2M, significantly above budget. Turnaround initiatives successful.",
    np: "Net profit positive after prior year losses, reflecting operational improvements.",
  },
  aep: {
    rev: "AEP revenue at $87M YTD with strong growth vs budget (+17%). Emerging product lines ramping.",
    gp: "GP margins healthy at 8%. Focus on premium product positioning.",
    op: "Operating loss narrowing vs budget. Investment phase for new product development.",
    np: "Net profit improving as new products reach scale. Break-even trajectory positive.",
  },
  // APBU subgroups
  apbu1_t99: {
    rev: "APBU1-T99 revenue below expectations due to market headwinds in target segments.",
    gp: "GP margins under pressure from competitive pricing environment.",
    op: "Operating loss reflecting volume shortfall and fixed cost absorption challenges.",
    np: "Net profit impacted by operating losses. Restructuring initiatives underway.",
  },
  apbu1_t88: {
    rev: "APBU1-T88 revenue at $90M YTD, below prior year but improving sequentially.",
    gp: "GP margins challenged by input cost inflation and competitive dynamics.",
    op: "Operating loss narrowing with cost reduction programs showing early results.",
    np: "Net profit trajectory improving with operational efficiency initiatives.",
  },
  apbu1_abo: {
    rev: "APBU1-ABO revenue at $242M YTD, the largest unit in APBU1 segment.",
    gp: "GP at $4M, margin pressure from product mix and competitive pricing.",
    op: "Operating loss at -$6M, focus on turnaround and portfolio optimization.",
    np: "Net profit impacted by operating challenges. Strategic review ongoing.",
  },
  apbu2_t89: {
    rev: "APBU2-T89 revenue at $38M YTD with positive momentum in target markets.",
    gp: "GP margins healthy with focus on value-added products and services.",
    op: "Operating profit slightly positive, ahead of prior year performance.",
    np: "Net profit reflecting improved operational execution and market positioning.",
  },
  apbu2_t12: {
    rev: "APBU2-T12 revenue at $25M YTD, strong margin profile with niche market focus.",
    gp: "GP margins premium due to specialized product offerings.",
    op: "Operating profit at $1.4M, consistent contributor to segment profitability.",
    np: "Net profit solid with stable demand and efficient operations.",
  },
  apbu2_c38: {
    rev: "APBU2-C38 is the largest APBU unit at $917M revenue YTD.",
    gp: "GP at $28M, margin optimization ongoing through operational improvements.",
    op: "Operating loss at -$0.8M, near break-even with improvement trajectory.",
    np: "Net profit impacted by scale-related operating challenges.",
  },
  // SDBG subgroups
  sdbgbu1: {
    rev: "SDBGBU1 revenue at $428M YTD, solid performance in system design business.",
    gp: "GP margins challenged but OP positive due to operating efficiency.",
    op: "Operating profit at $2.2M, contributing positively to segment results.",
    np: "Net profit positive with focus on operational discipline.",
  },
  sdbgbu2: {
    rev: "SDBGBU2 is the leading SDBG unit at $806M revenue, driving segment performance.",
    gp: "GP at $28M, healthy margins reflecting favorable product mix.",
    op: "Operating profit at $19M, the primary profit contributor in SDBG.",
    np: "Net profit strong at $13M, demonstrating operational excellence.",
  },
  sdbgbu3: {
    rev: "SDBGBU3 revenue at $39M YTD, smaller unit with growth potential.",
    gp: "GP at $4M with healthy margins in specialized segments.",
    op: "Operating loss at -$1.3M, investment phase for market expansion.",
    np: "Net profit impacted by growth investments. Positive trajectory expected.",
  },
  sdbgbu5: {
    rev: "SDBGBU5 revenue at $24M YTD, focused on niche applications.",
    gp: "GP margins minimal due to competitive pricing environment.",
    op: "Operating loss at -$3.3M, restructuring initiatives in progress.",
    np: "Net profit impacted by operating challenges. Turnaround plan underway.",
  },
  sdbgbu6: {
    rev: "SDBGBU6 revenue at $8M YTD, smallest unit with specialized focus.",
    gp: "GP at $1.6M, healthy margins in niche markets.",
    op: "Operating profit at $0.4M, positive contribution to segment.",
    np: "Net profit positive, demonstrating viability of specialized business model.",
  },
  // Others subgroups
  isbg: {
    rev: "ISBG revenue at $106M YTD with stable performance vs prior year.",
    gp: "GP at $16M, healthy margins reflecting product differentiation.",
    op: "Operating loss at -$2M, improved significantly vs budget (-$11M).",
    np: "Net profit trajectory positive with operational improvements.",
  },
  mbu: {
    rev: "MBU revenue at $5M YTD, emerging business with growth potential.",
    gp: "GP at $1.7M, healthy margins in focused market segment.",
    op: "Operating profit positive at $0.5M, ahead of budget.",
    np: "Net profit positive, demonstrating business model viability.",
  },
  rd6: {
    rev: "RD6 represents R&D activities and cost center functions.",
    gp: "GP reflects internal R&D cost allocations and project revenues.",
    op: "Operating costs managed through R&D efficiency programs.",
    np: "Net impact from R&D investments driving future product development.",
  },
  // Central subgroups
  central_main: {
    rev: "Central functions provide shared services across Compal business groups.",
    gp: "GP reflects shared service revenue and cost allocations.",
    op: "Operating costs represent corporate overhead and administrative expenses.",
    np: "Net impact from central functions reflects consolidated corporate activities.",
  },
  pcbgceo: {
    rev: "PCBGCEO revenue at $28M YTD from specialty products and services.",
    gp: "GP at $1M, margin pressure from competitive dynamics.",
    op: "Operating loss at -$2M, below budget performance.",
    np: "Net profit impacted by operating challenges in current period.",
  },
};

/**
 * Generate sub-business group data for a parent BG
 *
 * Hierarchy:
 * - PCBG: AEBU1, AEBU2, APBU, ISBG, AEP, RD6, PCBGCEO
 * - APBU: APBU1-ABO, APBU1-T88, APBU1-T99, APBU2-C38, APBU2-T12, APBU2-T89
 * - SDBG: SDBGBU1, SDBGBU2, SDBGBU3, SDBGBU5, SDBGBU6
 * - MBU: (no sub-units)
 * - Central: (no sub-units)
 */
const generateSubGroupData = (
  parentBgId: string,
  parentData: BusinessGroupData
): SubBusinessGroupData[] => {
  // Define distributions based on parentBgId
  let distributions;

  if (parentBgId === "pcbg") {
    // PCBG sub-units based on revenue distribution
    distributions = [
      { id: "aebu1", name: "AEBU1", factor: 0.64, trend: "up" as const },
      { id: "aebu2", name: "AEBU2", factor: 0.1, trend: "up" as const },
      { id: "apbu", name: "APBU", factor: 0.22, trend: "down" as const },
      { id: "rd6", name: "RD6", factor: 0.0, trend: "flat" as const },
      { id: "pcbgceo", name: "PCBGCEO", factor: 0.005, trend: "flat" as const },
    ];
  } else if (parentBgId === "apbu" || parentBgId === "pcbg-apbu") {
    distributions = [
      {
        id: "apbu1_t99",
        name: "APBU1-T99",
        factor: 0.01,
        trend: "down" as const,
      },
      {
        id: "apbu1_t88",
        name: "APBU1-T88",
        factor: 0.07,
        trend: "down" as const,
      },
      {
        id: "apbu1_abo",
        name: "APBU1-ABO",
        factor: 0.18,
        trend: "down" as const,
      },
      {
        id: "apbu2_t89",
        name: "APBU2-T89",
        factor: 0.03,
        trend: "flat" as const,
      },
      {
        id: "apbu2_t12",
        name: "APBU2-T12",
        factor: 0.02,
        trend: "up" as const,
      },
      {
        id: "apbu2_c38",
        name: "APBU2-C38",
        factor: 0.69,
        trend: "flat" as const,
      },
    ];
  } else if (parentBgId === "sdbg") {
    distributions = [
      { id: "sdbgbu1", name: "SDBGBU1", factor: 0.33, trend: "up" as const },
      { id: "sdbgbu2", name: "SDBGBU2", factor: 0.62, trend: "up" as const },
      { id: "sdbgbu3", name: "SDBGBU3", factor: 0.03, trend: "down" as const },
      { id: "sdbgbu5", name: "SDBGBU5", factor: 0.02, trend: "down" as const },
      { id: "sdbgbu6", name: "SDBGBU6", factor: 0.01, trend: "up" as const },
    ];
  } else if (parentBgId === "mbu") {
    // MBU has no sub-units, return empty
    return [];
  } else if (parentBgId === "isbg") {
    // ISBG has no sub-units, return empty
    return [];
  } else if (parentBgId === "aep") {
    // AEP has no sub-units, return empty
    return [];
  } else if (parentBgId === "central") {
    // Central has no sub-units, return empty
    return [];
  } else if (parentBgId === "aebu" || parentBgId === "pcbg-aebu1") {
    // Legacy support for AEBU sub-units
    distributions = [
      { id: "aebu1", name: "AEBU1", factor: 0.84, trend: "up" as const },
      { id: "aebu2", name: "AEBU2", factor: 0.14, trend: "up" as const },
      ];
  } else {
    // Default distribution - return empty for unknown parentBgId
    return [];
  }

  return distributions.map((dist) => {
    const revValue = parentData.rev.value * dist.factor;
    const revBaseline = parentData.rev.baseline * dist.factor;
    const revStly = parentData.rev.stly * dist.factor;
    const gpValue = parentData.gp.value * dist.factor;
    const gpBaseline = parentData.gp.baseline * dist.factor;
    const gpStly = parentData.gp.stly * dist.factor;
    const opValue = parentData.op.value * dist.factor;
    const opBaseline = parentData.op.baseline * dist.factor;
    const opStly = parentData.op.stly * dist.factor;
    const npValue = parentData.np.value * dist.factor;
    const npBaseline = parentData.np.baseline * dist.factor;
    const npStly = parentData.np.stly * dist.factor;

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
        stly: revStly,
        percent: calcPercent(revValue, revBaseline) + variance,
        trend: generateTrend(revValue, 0.08, dist.trend),
        aiInsight: subGroupAiInsights[dist.id].rev,
      },
      gp: {
        value: gpValue,
        baseline: gpBaseline,
        stly: gpStly,
        percent: calcPercent(gpValue, gpBaseline) + variance,
        trend: generateTrend(gpValue, 0.06, dist.trend),
        aiInsight: subGroupAiInsights[dist.id].gp,
      },
      op: {
        value: opValue,
        baseline: opBaseline,
        stly: opStly,
        percent: calcPercent(opValue, opBaseline) + variance,
        trend: generateTrend(opValue, 0.1, dist.trend),
        aiInsight: subGroupAiInsights[dist.id].op,
      },
      np: {
        value: npValue,
        baseline: npBaseline,
        stly: npStly,
        percent: calcPercent(npValue, npBaseline) + variance,
        trend: generateTrend(npValue, 0.12, dist.trend),
        aiInsight: subGroupAiInsights[dist.id].np,
      },
    };
  });
};

// Get sub-business groups for a given parent BG (without overall row)
export const getSubBusinessGroups = (
  parentBgId: string,
  timeframe: BusinessGroupTimeframe = "full-year"
): SubBusinessGroupData[] => {
  const parentBg = getBusinessGroupDataset(timeframe).find(
    (bg) => bg.id === parentBgId
  );
  if (!parentBg) return [];
  return generateSubGroupData(parentBgId, parentBg);
};

// Get sub-business groups with overall for a given parent BG
export const getSubBusinessGroupsWithOverall = (
  parentBgId: string,
  timeframe: BusinessGroupTimeframe = "full-year"
): BusinessGroupData[] => {
  const parentBg = getBusinessGroupDataset(timeframe).find(
    (bg) => bg.id === parentBgId
  );
  if (!parentBg) return [];

  const subGroups = generateSubGroupData(parentBgId, parentBg);

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
  parentBgId: string,
  timeframe: BusinessGroupTimeframe = "full-year"
): BusinessGroupData | undefined => {
  return getBusinessGroupDataset(timeframe).find((bg) => bg.id === parentBgId);
};

// Get list of all main BU IDs and names for filter options
export const getMainBusinessGroupOptions = (): {
  id: string;
  name: string;
}[] => {
  return mockBusinessGroupData.map((bg) => ({ id: bg.id, name: bg.name }));
};
