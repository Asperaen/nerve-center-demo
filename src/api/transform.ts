import type {
  BiweeklyBusinessGroup,
  BiweeklyDashboardData,
  BiweeklyFinancialMetric,
  NewsItem,
} from "../types";
import { monthlyBudgetData } from "./mockData";
import type { ExternalPulseResponse } from "./types";

const transformExternalPulseResponse = (
  data: ExternalPulseResponse
): NewsItem[] => {
  // 轉換數據並確保 ID 唯一
  const seenIds = new Set<string>();
  const transformedData = data.map((item: any, index: number) => {
    let itemId = item.id;

    // 如果 ID 重複，生成新的唯一 ID
    if (seenIds.has(itemId)) {
      itemId = `${itemId}-${Date.now()}-${index}`;
      console.warn(`Duplicate ID detected, generated new ID: ${itemId}`);
    }
    seenIds.add(itemId);

    // 正確解析 timestamp from date 欄位
    let parsedTimestamp: Date;
    const dateField = item.date || item.timestamp;

    if (dateField) {
      try {
        // 嘗試解析日期字符串
        parsedTimestamp = new Date(dateField);

        // 檢查是否為有效日期
        if (isNaN(parsedTimestamp.getTime())) {
          console.warn(
            `Invalid date format for item ${itemId}: ${dateField}, using current date`
          );
          parsedTimestamp = new Date();
        }
      } catch (e) {
        console.error(`Error parsing date for item ${itemId}: ${dateField}`, e);
        parsedTimestamp = new Date();
      }
    } else {
      console.warn(
        `No date field found for item ${itemId}, using current date`
      );
      parsedTimestamp = new Date();
    }

    // 處理 category
    let category: string;
    if (Array.isArray(item.category)) {
      category = item.category[0] || "Unknown";
    } else if (item.category) {
      category = String(item.category);
    } else {
      category = "Unknown";
    }

    // 處理 urgency
    let urgency: "short_term" | "mid_term" | "long_term" = "long_term";
    const urgencyLabel = item.urgency_label || item.urgency || "";
    if (urgencyLabel.toLowerCase().includes("short")) {
      urgency = "short_term";
    } else if (urgencyLabel.toLowerCase().includes("mid")) {
      urgency = "mid_term";
    }

    // 處理 priority
    let priority: "high" | "medium" | "low" = "low";
    const priorityLabel = item.importance_label || item.priority || "";
    if (priorityLabel.toLowerCase().includes("high")) {
      priority = "high";
    } else if (priorityLabel.toLowerCase().includes("medium")) {
      priority = "medium";
    }

    return {
      ...item,
      id: itemId,
      timestamp: parsedTimestamp,
      category,
      urgency,
      priority,
      title: item.title || "Untitled",
      summary: item.summary || "",
      reasoning: item.reasoning || item.impact_analysis?.join("\n") || "",
      source: item.source || "Unknown",
    } as NewsItem;
  });

  console.log(`Processed ${transformedData.length} unique news items`);

  // Log first item's timestamp for debugging
  if (transformedData.length > 0) {
    console.log("Sample timestamp:", {
      id: transformedData[0].id,
      parsedTimestamp: transformedData[0].timestamp,
      formattedDate: transformedData[0].timestamp.toISOString(),
    });
  }

  return transformedData;
};

/**
 * Aggregate monthly budget data for a specific month range
 * Uses monthlyBudgetData from mockData.ts
 */
const aggregateMonthlyData = (
  startMonth: number,
  endMonth: number
): BiweeklyDashboardData => {
  // Map BU keys to display structure
  const buMapping: Record<
    string,
    { id: string; name: string; parentId?: string }
  > = {
    pcbg: { id: "pcbg", name: "PCBG" },
    sdbg: { id: "sdbg", name: "SDBG" },
    mbu: { id: "mbu", name: "MBU" },
    central: { id: "central", name: "Central" },
    aebu1: { id: "aebu1", name: "AEBU1", parentId: "pcbg" },
    aebu2: { id: "aebu2", name: "AEBU2", parentId: "pcbg" },
    aep: { id: "aep", name: "AEP" },
    apbu: { id: "apbu", name: "APBU", parentId: "pcbg" },
    isbg: { id: "isbg", name: "ISBG" },
    pcbgceo: { id: "pcbgceo", name: "PCBGCEO", parentId: "pcbg" },
    rd6: { id: "rd6", name: "RD6", parentId: "pcbg" },
    sdbgbu1: { id: "sdbgbu1", name: "SDBGBU1", parentId: "sdbg" },
    sdbgbu2: { id: "sdbgbu2", name: "SDBGBU2", parentId: "sdbg" },
    sdbgbu3: { id: "sdbgbu3", name: "SDBGBU3", parentId: "sdbg" },
    sdbgbu5: { id: "sdbgbu5", name: "SDBGBU5", parentId: "sdbg" },
    sdbgbu6: { id: "sdbgbu6", name: "SDBGBU6", parentId: "sdbg" },
    apbu1_abo: { id: "apbu1-abo", name: "APBU1-ABO", parentId: "apbu" },
    apbu1_t88: { id: "apbu1-t88", name: "APBU1-T88", parentId: "apbu" },
    apbu1_t99: { id: "apbu1-t99", name: "APBU1-T99", parentId: "apbu" },
    apbu2_c38: { id: "apbu2-c38", name: "APBU2-C38", parentId: "apbu" },
    apbu2_t12: { id: "apbu2-t12", name: "APBU2-T12", parentId: "apbu" },
    apbu2_t89: { id: "apbu2-t89", name: "APBU2-T89", parentId: "apbu" },
  };

  // Aggregate data for selected months
  const aggregatedData: Record<
    string,
    {
      budget: { rev: number; gp: number; op: number; np: number };
      lastYear: { rev: number; gp: number; op: number; np: number };
    }
  > = {};

  // Initialize all BUs with zero values
  Object.keys(buMapping).forEach((key) => {
    aggregatedData[key] = {
      budget: { rev: 0, gp: 0, op: 0, np: 0 },
      lastYear: { rev: 0, gp: 0, op: 0, np: 0 },
    };
  });
  aggregatedData["all"] = {
    budget: { rev: 0, gp: 0, op: 0, np: 0 },
    lastYear: { rev: 0, gp: 0, op: 0, np: 0 },
  };

  // Sum up monthly data for the selected range
  for (let m = startMonth; m <= endMonth; m++) {
    const monthKey = m.toString().padStart(2, "0");
    const monthData = monthlyBudgetData[monthKey];

    if (monthData) {
      Object.keys(aggregatedData).forEach((buKey) => {
        const buMonthData = monthData[buKey];
        if (buMonthData) {
          aggregatedData[buKey].budget.rev += buMonthData.budget.rev;
          aggregatedData[buKey].budget.gp += buMonthData.budget.gp;
          aggregatedData[buKey].budget.op += buMonthData.budget.op;
          aggregatedData[buKey].budget.np += buMonthData.budget.np;
          aggregatedData[buKey].lastYear.rev += buMonthData.lastYear.rev;
          aggregatedData[buKey].lastYear.gp += buMonthData.lastYear.gp;
          aggregatedData[buKey].lastYear.op += buMonthData.lastYear.op;
          aggregatedData[buKey].lastYear.np += buMonthData.lastYear.np;
        }
      });
    }
  }

  // Helper to create BiweeklyFinancialMetric
  const createMetric = (
    label: string,
    buKey: string,
    field: "rev" | "gp" | "op" | "np"
  ): BiweeklyFinancialMetric => ({
    label,
    actual: 0, // Actual data not yet implemented
    budget: aggregatedData[buKey]?.budget[field] || 0,
    lastYear: aggregatedData[buKey]?.lastYear[field] || 0,
  });

  // Helper to create BiweeklyBusinessGroup
  const createGroup = (
    buKey: string,
    sbus?: BiweeklyBusinessGroup[]
  ): BiweeklyBusinessGroup => ({
    id: buMapping[buKey]?.id || buKey,
    name: buMapping[buKey]?.name || buKey.toUpperCase(),
    revenue: createMetric("Revenue", buKey, "rev"),
    grossProfit: createMetric("GP", buKey, "gp"),
    operatingProfit: createMetric("OP", buKey, "op"),
    netProfit: createMetric("NP", buKey, "np"),
    sbus: sbus || [],
  });

  // Build APBU sub-units
  const apbuSubs = [
    createGroup("apbu1_abo"),
    createGroup("apbu1_t88"),
    createGroup("apbu1_t99"),
    createGroup("apbu2_c38"),
    createGroup("apbu2_t12"),
    createGroup("apbu2_t89"),
  ];

  // Build PCBG sub-units (ISBG and AEP elevated to BG level)
  const pcbgSbus = [
    createGroup("aebu1"),
    createGroup("aebu2"),
    { ...createGroup("apbu"), sbus: apbuSubs },
    createGroup("rd6"),
    createGroup("pcbgceo"),
  ];

  // Build SDBG sub-units
  const sdbgSbus = [
    createGroup("sdbgbu1"),
    createGroup("sdbgbu2"),
    createGroup("sdbgbu3"),
    createGroup("sdbgbu5"),
    createGroup("sdbgbu6"),
  ];

  return {
    summary: {
      revenue: createMetric("Revenue", "all", "rev"),
      gp: createMetric("GP", "all", "gp"),
      op: createMetric("OP", "all", "op"),
      np: createMetric("NP", "all", "np"),
    },
    groups: [
      { ...createGroup("pcbg"), sbus: pcbgSbus },
      { ...createGroup("sdbg"), sbus: sdbgSbus },
      createGroup("mbu"),
      createGroup("isbg"),
      createGroup("aep"),
      createGroup("central"),
    ],
  };
};

/**
 * Get aggregated budget data for a specific month range
 * @param startMonth - Start month (1-12)
 * @param endMonth - End month (1-12)
 */
const getMonthlyBudgetData = (
  startMonth: number,
  endMonth: number
): BiweeklyDashboardData => {
  return aggregateMonthlyData(startMonth, endMonth);
};

export { getMonthlyBudgetData, transformExternalPulseResponse };
