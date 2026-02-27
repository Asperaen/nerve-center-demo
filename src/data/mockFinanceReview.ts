/**
 * Mock data for FinanceReviewPage
 * ============================================
 * CONSISTENT MOCK DATA STRUCTURE:
 * ============================================
 * Base Financials (2025 YTM Actual):
 *   - Compal Total Revenue: 11313M
 *   - Compal Total GP: 259M (2.3% margin)
 *   - Compal Total OP: 164M (1.4% margin)
 *   - Compal Total NP: 115M (1.0% margin)
 *
 * Business Units (Revenue breakdown):
 *   - AEBU: 4637M (AEBU1 + AEBU2 + AEP)
 *   - APBU: 1322M (APBU1 + APBU2)
 *   - SDBG: 1306M (SDBGBU1-6)
 *   - Others: 139M (ISBG + MBU + RD6)
 *   - Central: 28M (Central + PCBGCEO)
 *   Total: 7432M (YTM consolidated)
 *
 * Cash & Loan (typical ratios):
 *   - Compal Cash: 3394M (30% of revenue)
 *   - Compal Loan: 2263M (20% of revenue)
 *   - BU cash/loan proportional to revenue
 *
 * Time Periods:
 *   - Current Year: 2025
 *   - Prior Year: 2024
 *   - Revenue Growth: 0.5% (11313 vs 11255 budget)
 *
 * All mock data sections use these consistent values.
 * ============================================
 */

// Dashboard Data
// Note: This structure matches BiweeklyDashboardData type
// Groups need to have BiweeklyFinancialMetric objects for revenue, grossProfit, operatingProfit, netProfit
export const mockDashboardData = {
  summary: {
    revenue: { actual: 4190, budget: 4000, lastYear: 3796 },
    gp: { actual: 1047.5, budget: 1000, lastYear: 949 },
    op: { actual: 452.5, budget: 440, lastYear: 409.4 },
    np: { actual: 301.7, budget: 280, lastYear: 272.9 },
  },
  groups: [
    {
      id: "aebu",
      name: "AEBU",
      revenue: { label: "Revenue", actual: 1250, budget: 1200, lastYear: 1085 },
      grossProfit: {
        label: "GP",
        actual: 356.25,
        budget: 342,
        lastYear: 309.2,
      },
      operatingProfit: {
        label: "OP",
        actual: 153.75,
        budget: 147.6,
        lastYear: 133.5,
      },
      netProfit: { label: "NP", actual: 101.25, budget: 97.2, lastYear: 87.9 },
      sbus: [],
    },
    {
      id: "apbu",
      name: "APBU",
      revenue: { label: "Revenue", actual: 980, budget: 950, lastYear: 902 },
      grossProfit: {
        label: "GP",
        actual: 216.58,
        budget: 209.95,
        lastYear: 199.34,
      },
      operatingProfit: {
        label: "OP",
        actual: 93.1,
        budget: 90.25,
        lastYear: 85.69,
      },
      netProfit: { label: "NP", actual: 60.76, budget: 58.9, lastYear: 55.92 },
      sbus: [],
    },
    {
      id: "isbg",
      name: "ISBG",
      revenue: { label: "Revenue", actual: 650, budget: 680, lastYear: 686 },
      grossProfit: {
        label: "GP",
        actual: 122.85,
        budget: 128.52,
        lastYear: 129.65,
      },
      operatingProfit: {
        label: "OP",
        actual: 33.8,
        budget: 35.36,
        lastYear: 35.67,
      },
      netProfit: { label: "NP", actual: 18.2, budget: 19.04, lastYear: 19.21 },
      sbus: [],
    },
    {
      id: "sdbg",
      name: "SDBG",
      revenue: { label: "Revenue", actual: 420, budget: 400, lastYear: 374 },
      grossProfit: {
        label: "GP",
        actual: 106.26,
        budget: 101.2,
        lastYear: 94.59,
      },
      operatingProfit: {
        label: "OP",
        actual: 46.62,
        budget: 44.4,
        lastYear: 41.51,
      },
      netProfit: { label: "NP", actual: 31.5, budget: 30, lastYear: 28.05 },
      sbus: [],
    },
    {
      id: "mbu",
      name: "MBU",
      revenue: { label: "Revenue", actual: 890, budget: 820, lastYear: 729 },
      grossProfit: {
        label: "GP",
        actual: 268.78,
        budget: 247.64,
        lastYear: 220.16,
      },
      operatingProfit: {
        label: "OP",
        actual: 140.62,
        budget: 129.56,
        lastYear: 115.18,
      },
      netProfit: { label: "NP", actual: 99.68, budget: 91.84, lastYear: 81.65 },
      sbus: [],
    },
  ],
};

// NP Waterfall Data
export const mockNpWaterfallData = {
  success: true,
  data: [
    {
      stage: "Revenue",
      value: 4190,
      budget: 4000,
      lastYear: 3796,
      children: [
        { stage: "GP", value: 1047.5, budget: 1000, lastYear: 949 },
        { stage: "OP", value: 452.5, budget: 440, lastYear: 409.4 },
        { stage: "NP", value: 301.7, budget: 280, lastYear: 272.9 },
      ],
    },
  ],
};

// Insights
export const mockInsights = [
  {
    id: 1,
    name: "revenue",
    content: "",
    creator_name: "demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "gp",
    content: "",
    creator_name: "demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "op",
    content: "",
    creator_name: "demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "income",
    content: "",
    creator_name: "demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "np",
    content: "",
    creator_name: "demo",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// FX Rate Data
export const mockFxRateData = {
  currencies: ["USD", "NTD", "CNY", "EUR", "JPY"],
  data: [
    { USD: 1.0, NTD: 31.5, CNY: 7.2, EUR: 0.92, JPY: 150.0 },
    { USD: 1.0, NTD: 31.6, CNY: 7.25, EUR: 0.93, JPY: 151.0 },
    { USD: 1.0, NTD: 31.7, CNY: 7.3, EUR: 0.94, JPY: 152.0 },
    { USD: 1.0, NTD: 31.8, CNY: 7.35, EUR: 0.95, JPY: 153.0 },
    { USD: 1.0, NTD: 31.9, CNY: 7.4, EUR: 0.96, JPY: 154.0 },
    { USD: 1.0, NTD: 32.0, CNY: 7.45, EUR: 0.97, JPY: 155.0 },
    { USD: 1.0, NTD: 32.1, CNY: 7.5, EUR: 0.98, JPY: 156.0 },
    { USD: 1.0, NTD: 32.2, CNY: 7.55, EUR: 0.99, JPY: 157.0 },
    { USD: 1.0, NTD: 32.3, CNY: 7.6, EUR: 1.0, JPY: 158.0 },
    { USD: 1.0, NTD: 32.4, CNY: 7.65, EUR: 1.01, JPY: 159.0 },
    { USD: 1.0, NTD: 32.5, CNY: 7.7, EUR: 1.02, JPY: 160.0 },
    { USD: 1.0, NTD: 32.6, CNY: 7.75, EUR: 1.03, JPY: 161.0 },
  ],
};

// Free Cash Flow Overtime Data
export const mockFreeCashFlowOvertimeData = {
  regions: ["Americas", "EMEA", "APAC"],
  mainChartData: [
    {
      year: 2024,
      quarter: "Q1",
      americas: -50,
      emea: -30,
      apac: -85,
      total: -165,
    },
    {
      year: 2024,
      quarter: "Q2",
      americas: -45,
      emea: -25,
      apac: -75,
      total: -145,
    },
    {
      year: 2024,
      quarter: "Q3",
      americas: -40,
      emea: -20,
      apac: -70,
      total: -130,
    },
    {
      year: 2024,
      quarter: "Q4",
      americas: -35,
      emea: -15,
      apac: -65,
      total: -115,
    },
    {
      year: 2025,
      quarter: "Q1",
      americas: -30,
      emea: -20,
      apac: -60,
      total: -110,
    },
    {
      year: 2025,
      quarter: "Q2",
      americas: -25,
      emea: -15,
      apac: -55,
      total: -95,
    },
    {
      year: 2025,
      quarter: "Q3",
      americas: -20,
      emea: -10,
      apac: -50,
      total: -80,
    },
    {
      year: 2025,
      quarter: "Q4",
      americas: -15,
      emea: -5,
      apac: -45,
      total: -65,
    },
  ],
};

// Cash Flow Summary Data
export const mockCashFlowSummaryData = {
  operating: { actual: -165, budget: -150, lastYear: -140 },
  financing: { actual: 289, budget: 250, lastYear: 180 },
  other: { actual: 42, budget: 40, lastYear: 35 },
};

// Other Income/Expense Details
export const mockOtherIncomeExpenseData = {
  data: [
    {
      category: "Other Income",
      account: "Interest Income",
      actual: 15.5,
      budget: 12.0,
      delta: 3.5,
    },
    {
      category: "Other Income",
      account: "Foreign Exchange Gain",
      actual: 8.2,
      budget: 5.0,
      delta: 3.2,
    },
    {
      category: "Other Expense",
      account: "Interest Expense",
      actual: -25.3,
      budget: -22.0,
      delta: -3.3,
    },
    {
      category: "Other Expense",
      account: "Foreign Exchange Loss",
      actual: -12.1,
      budget: -10.0,
      delta: -2.1,
    },
  ],
};

// BU Metrics 2025
export const mockBUMetrics2025 = {
  success: true,
  data: [
    {
      bu_name: "AEBU",
      bu_id: "aebu",
      revenue_growth: 15.2,
      gp_margin: 28.5,
      op_margin: 12.3,
      np_margin: 8.1,
      revenue_actual: 1250,
      revenue_last_year: 1085,
    },
    {
      bu_name: "APBU",
      bu_id: "apbu",
      revenue_growth: 8.7,
      gp_margin: 22.1,
      op_margin: 9.5,
      np_margin: 6.2,
      revenue_actual: 980,
      revenue_last_year: 902,
    },
    {
      bu_name: "ISBG",
      bu_id: "isbg",
      revenue_growth: -5.3,
      gp_margin: 18.9,
      op_margin: 5.2,
      np_margin: 2.8,
      revenue_actual: 650,
      revenue_last_year: 686,
    },
    {
      bu_name: "SDBG",
      bu_id: "sdbg",
      revenue_growth: 12.4,
      gp_margin: 25.3,
      op_margin: 11.1,
      np_margin: 7.5,
      revenue_actual: 420,
      revenue_last_year: 374,
    },
    {
      bu_name: "MBU",
      bu_id: "mbu",
      revenue_growth: 22.1,
      gp_margin: 30.2,
      op_margin: 15.8,
      np_margin: 11.2,
      revenue_actual: 890,
      revenue_last_year: 729,
    },
  ],
  compal: {
    revenue_growth: 10.4,
    gp_margin: 25.0,
    op_margin: 10.8,
    np_margin: 7.2,
    revenue_actual: 4190,
    revenue_last_year: 3796,
  },
};

// Competitive Margin Analysis
export const mockCompetitiveMarginData = {
  businessUnits: ["AEBU", "APBU", "ISBG", "SDBG", "MBU"],
  metrics: ["GP Margin", "OP Margin", "NP Margin"],
  data: {
    AEBU: {
      "GP Margin": {
        competitor: 25.0,
        actual: 28.5,
        benchmark: 25.0,
        delta: 3.5,
      },
      "OP Margin": {
        competitor: 10.0,
        actual: 12.3,
        benchmark: 10.0,
        delta: 2.3,
      },
      "NP Margin": { competitor: 6.5, actual: 8.1, benchmark: 6.5, delta: 1.6 },
    },
    APBU: {
      "GP Margin": {
        competitor: 20.0,
        actual: 22.1,
        benchmark: 20.0,
        delta: 2.1,
      },
      "OP Margin": { competitor: 8.0, actual: 9.5, benchmark: 8.0, delta: 1.5 },
      "NP Margin": { competitor: 5.0, actual: 6.2, benchmark: 5.0, delta: 1.2 },
    },
    ISBG: {
      "GP Margin": {
        competitor: 20.0,
        actual: 18.9,
        benchmark: 20.0,
        delta: -1.1,
      },
      "OP Margin": {
        competitor: 6.0,
        actual: 5.2,
        benchmark: 6.0,
        delta: -0.8,
      },
      "NP Margin": {
        competitor: 3.5,
        actual: 2.8,
        benchmark: 3.5,
        delta: -0.7,
      },
    },
    SDBG: {
      "GP Margin": {
        competitor: 24.0,
        actual: 25.3,
        benchmark: 24.0,
        delta: 1.3,
      },
      "OP Margin": {
        competitor: 10.0,
        actual: 11.1,
        benchmark: 10.0,
        delta: 1.1,
      },
      "NP Margin": { competitor: 7.0, actual: 7.5, benchmark: 7.0, delta: 0.5 },
    },
    MBU: {
      "GP Margin": {
        competitor: 28.0,
        actual: 30.2,
        benchmark: 28.0,
        delta: 2.2,
      },
      "OP Margin": {
        competitor: 14.0,
        actual: 15.8,
        benchmark: 14.0,
        delta: 1.8,
      },
      "NP Margin": {
        competitor: 10.0,
        actual: 11.2,
        benchmark: 10.0,
        delta: 1.2,
      },
    },
  },
};

// Cash and Loan Data
export const mockCashAndLoanData = {
  data: [
    {
      entity: "Compal",
      cash: { value: 3394, variance: 5.2 },
      loan: { value: 2263, variance: 12.3 },
    },
    {
      entity: "AEBU",
      cash: { value: 1391, variance: 8.1 },
      loan: { value: 927, variance: 15.5 },
    },
    {
      entity: "APBU",
      cash: { value: 397, variance: 3.5 },
      loan: { value: 264, variance: 10.2 },
    },
    {
      entity: "ISBG",
      cash: { value: 180, variance: -2.1 },
      loan: { value: 120, variance: 8.7 },
    },
    {
      entity: "SDBG",
      cash: { value: 150, variance: 6.8 },
      loan: { value: 100, variance: 12.5 },
    },
    {
      entity: "MBU",
      cash: { value: 320, variance: 15.3 },
      loan: { value: 300, variance: 18.2 },
    },
  ],
};

// Price/Cost Impact and Volume/Mix Impact Data
// These are generated dynamically based on selected BU, but we provide base structure
export const getMockPriceCostImpactData = (
  bu?: string,
  sbu?: string | null
) => {
  const allBUs = ["AEBU", "APBU", "ISBG", "SDBG", "MBU"];
  const productFamilies = {
    AEBU: ["Commercial Notebook", "Consumer Notebook", "Gaming"],
    APBU: ["Server", "AI/HPC", "Storage"],
    ISBG: ["Industrial Systems", "Embedded Solutions", "Automation"],
    SDBG: ["Smart Devices", "IoT Products", "Wearables"],
    MBU: ["Mobile Components", "5G Modules", "RF Solutions"],
  };

  const mockData: Array<{
    year: number;
    month: number;
    bu: string | null;
    sbu: string | null;
    product_family: string | null;
    product_series: string | null;
    price_impact: number;
    cost_impact: number;
  }> = [];

  const targetBUs = bu ? [bu] : allBUs;

  for (const targetBU of targetBUs) {
    const families = productFamilies[
      targetBU as keyof typeof productFamilies
    ] || ["Standard"];

    for (let month = 1; month <= 12; month++) {
      for (let i = 0; i < families.length; i++) {
        const family = families[i];
        const basePrice = 5 + month * 0.5 + i * 2;
        const baseCost = -3 - month * 0.3 - i * 1.5;

        mockData.push({
          year: 2025,
          month,
          bu: targetBU,
          sbu: sbu || null,
          product_family: family,
          product_series: `Series ${String.fromCharCode(65 + i)}`,
          price_impact: Math.round(basePrice * 10) / 10,
          cost_impact: Math.round(baseCost * 10) / 10,
        });
      }
    }
  }

  return mockData;
};

export const getMockVolumeMixImpactData = (
  bu?: string,
  sbu?: string | null
) => {
  const allBUs = ["AEBU", "APBU", "ISBG", "SDBG", "MBU"];
  const productFamilies = {
    AEBU: ["Commercial Notebook", "Consumer Notebook", "Gaming"],
    APBU: ["Server", "AI/HPC", "Storage"],
    ISBG: ["Industrial Systems", "Embedded Solutions", "Automation"],
    SDBG: ["Smart Devices", "IoT Products", "Wearables"],
    MBU: ["Mobile Components", "5G Modules", "RF Solutions"],
  };

  const mockData: Array<{
    year: number;
    month: number;
    bu: string | null;
    sbu: string | null;
    product_family: string | null;
    volume_impact: number;
    mix_impact: number;
  }> = [];

  const targetBUs = bu ? [bu] : allBUs;

  for (const targetBU of targetBUs) {
    const families = productFamilies[
      targetBU as keyof typeof productFamilies
    ] || ["Standard"];

    for (let month = 1; month <= 12; month++) {
      for (let i = 0; i < families.length; i++) {
        const family = families[i];
        const baseVolume = 8 + month * 0.8 + i * 1.5;
        const baseMix = 2 + month * 0.2 + i * 0.5;

        mockData.push({
          year: 2025,
          month,
          bu: targetBU,
          sbu: sbu || null,
          product_family: family,
          volume_impact: Math.round(baseVolume * 10) / 10,
          mix_impact: Math.round(baseMix * 10) / 10,
        });
      }
    }
  }

  return mockData;
};
