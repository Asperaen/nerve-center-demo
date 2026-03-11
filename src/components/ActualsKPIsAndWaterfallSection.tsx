/**
 * Actuals - Performance Overview (5 BarChartKPIs) + NP Deviation Waterfall (by BU).
 */
import {
  ArrowPathIcon,
  ChartBarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  Bar,
  Cell,
  ComposedChart,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import BarChartKPI from "./BarChartKPI";
import FineTuneInsightsCard from "./FineTuneInsightsCard";
import {
  getInsightFeedback,
  getInsightComments,
  type NpWaterfallBuInsight,
  type NpWaterfallBuInsightDetail,
  type NpWaterfallBuInsightDetailBlocks,
  type RevenueGpTemplate,
} from "../utils/api";

/** Type guard: detail is the structured columnar form (bu_order + blocks). */
function isNpWaterfallDetailBlocks(
  v: unknown
): v is NpWaterfallBuInsightDetailBlocks {
  return (
    typeof v === "object" &&
    v !== null &&
    "bu_order" in v &&
    Array.isArray((v as NpWaterfallBuInsightDetailBlocks).bu_order) &&
    "blocks" in v &&
    typeof (v as NpWaterfallBuInsightDetailBlocks).blocks === "object"
  );
}

/**
 * Parse LLM string format (e.g. "CONN:\n  Topline/GP (-1 Mn): ...\nCable:\n  ...")
 * into { bu_order, blocks } for columnar display. Returns null if parsing yields no BUs.
 */
function parseNpWaterfallDetailStringToBlocks(
  str: string
): NpWaterfallBuInsightDetailBlocks | null {
  if (typeof str !== "string" || !str.trim()) return null;
  const lines = str.split("\n");
  const bu_order: string[] = [];
  const blocks: Record<string, string> = {};
  let currentBu: string | null = null;
  for (const line of lines) {
    const headerMatch = line.match(/^([^:\n]+):\s*$/);
    if (headerMatch) {
      currentBu = headerMatch[1].trim();
      if (currentBu) {
        if (!(currentBu in blocks)) {
          bu_order.push(currentBu);
          blocks[currentBu] = "";
        }
      }
    } else if (currentBu != null) {
      blocks[currentBu] += (blocks[currentBu] ? "\n" : "") + line;
    }
  }
  if (bu_order.length === 0) return null;
  return { bu_order, blocks };
}

/** Build NP panel detail text from op_income_template (same as backend: op + income vs_budget or vs_last_year). */
function buildNpWaterfallDetailFromOpIncome(
  op_income_template: {
    op?: { vs_budget?: string[]; vs_last_year?: string[] };
    income?: { vs_budget?: string[]; vs_last_year?: string[] };
  } | null | undefined,
  vsLastYear: boolean
): string {
  if (!op_income_template?.op && !op_income_template?.income) return "";
  const opVb = op_income_template.op?.vs_budget?.filter(Boolean) ?? [];
  const opLy = op_income_template.op?.vs_last_year?.filter(Boolean) ?? [];
  const incVb = op_income_template.income?.vs_budget?.filter(Boolean) ?? [];
  const incLy = op_income_template.income?.vs_last_year?.filter(Boolean) ?? [];
  const opLines = vsLastYear ? opLy : opVb;
  const incLines = vsLastYear ? incLy : incVb;
  const parts: string[] = [];
  if (opLines.length) parts.push(opLines.join("\n"));
  if (incLines.length) parts.push(incLines.join("\n"));
  return parts.join("\n\n").trim();
}

/**
 * Derive "1. Negative deviation BU" / "2. Positive deviation BU" lists from the same
 * waterfall data that drives the chart. Excludes first bar (Budget NP / Last Year NP)
 * and last bar (Actual NP). Formats each BU bar as "BUname (±XMn)" and splits by delta sign.
 */
function deriveNpWaterfallListsFromChartData(
  waterfallData: any[]
): { negative: string[]; positive: string[] } {
  if (!waterfallData?.length) return { negative: [], positive: [] };
  const negativeEntries: { delta: number; str: string }[] = [];
  const positiveEntries: { delta: number; str: string }[] = [];
  // BU bars are between first (budget-np / last-year-np) and last (actual-np)
  const start = 1;
  const end = waterfallData.length - 1;
  for (let i = start; i < end; i++) {
    const bar = waterfallData[i];
    const delta = bar?.delta;
    if (delta == null) continue;
    const buName = bar?.label ?? bar?.buName ?? bar?.name ?? "";
    if (!buName) continue;
    const deltaMn = typeof delta === "number" ? Math.round(delta) : Math.round(Number(delta) || 0);
    const signed = deltaMn >= 0 ? `+${deltaMn}` : `${deltaMn}`;
    const str = `${buName} (${signed}Mn)`;
    const deltaNum = typeof delta === "number" ? delta : Number(delta) || 0;
    if (deltaNum < 0) negativeEntries.push({ delta: deltaNum, str });
    else positiveEntries.push({ delta: deltaNum, str });
  }
  // Sort by descending absolute value: negative ascending (most negative first), positive descending (largest first)
  negativeEntries.sort((a, b) => a.delta - b.delta);
  positiveEntries.sort((a, b) => b.delta - a.delta);
  return {
    negative: negativeEntries.map((e) => e.str),
    positive: positiveEntries.map((e) => e.str),
  };
}

/** Parse GP section lines into BU -> delta string (e.g. "±X Mn (±Y%)"). BU line = no leading spaces, "BUname ±X Mn (±Y%)". */
function parseGpByBu(lines: string[]): Map<string, string> {
  const byBu = new Map<string, string>();
  for (const line of lines ?? []) {
    const s = (line ?? "").trim();
    if (!s || s.startsWith("  ")) continue;
    const match = s.match(/^(.+?)\s+([+-]?\d+.*)$/);
    if (match) {
      const buName = match[1].trim();
      const deltaPart = match[2].trim();
      if (buName && deltaPart) byBu.set(buName, deltaPart);
    }
  }
  return byBu;
}

/** Parse OP/Income section lines into BU -> list of driver lines (lines starting with "- "). */
function parseOpIncomeByBu(lines: string[]): Map<string, string[]> {
  const byBu = new Map<string, string[]>();
  let currentBu: string | null = null;
  for (const line of lines ?? []) {
    const s = (line ?? "").trim();
    if (!s) continue;
    if (s.startsWith("- ")) {
      if (currentBu) {
        const list = byBu.get(currentBu) ?? [];
        list.push(s);
        byBu.set(currentBu, list);
      }
    } else {
      currentBu = s;
      if (currentBu && !byBu.has(currentBu)) byBu.set(currentBu, []);
    }
  }
  return byBu;
}

function buNormalize(name: string): string {
  const n = (name ?? "").trim();
  if (!n) return n;
  const lower = n.toLowerCase();
  if (lower === "conn" || lower === "conn.") return "conn";
  return n;
}

/** Return BU name only for display (strip trailing " ±X Mn (±Y%)" so we show no value after BU). */
function buDisplayName(buKey: string): string {
  const s = (buKey ?? "").trim();
  if (!s) return s;
  const match = s.match(/^(.+?)\s+[+-]?\d+/);
  return match ? match[1].trim() : s;
}

/** Collect unique BUs in order: gp first, then op, then income. Deduplicate by normalized display name so "SDBGBU2" and "Cable +123 Mn" count as one BU. */
function collectBuOrder(
  gpByBu: Map<string, string>,
  opByBu: Map<string, string[]>,
  incomeByBu: Map<string, string[]>
): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const bu of gpByBu.keys()) {
    const norm = buNormalize(buDisplayName(bu));
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      order.push(bu);
    }
  }
  for (const bu of opByBu.keys()) {
    const norm = buNormalize(buDisplayName(bu));
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      order.push(bu);
    }
  }
  for (const bu of incomeByBu.keys()) {
    const norm = buNormalize(buDisplayName(bu));
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      order.push(bu);
    }
  }
  return order;
}

/** Get value from map by key or by normalized display-name match (so "SDBGBU2" matches "Cable +123 Mn (+180%)"). */
function getByBuKey<T>(map: Map<string, T>, buKey: string): T | undefined {
  const v = map.get(buKey);
  if (v !== undefined) return v;
  const norm = buNormalize(buDisplayName(buKey));
  for (const [k, val] of map) {
    if (buNormalize(buDisplayName(k)) === norm) return val;
  }
  return undefined;
}

function getListByBuKey(map: Map<string, string[]>, buKey: string): string[] {
  return getByBuKey(map, buKey) ?? [];
}

/** Tooltip content for NP Deviation Waterfall. Extracted and memoized to avoid Recharts Tooltip causing infinite re-renders (new content fn every render). */
const NpWaterfallTooltipContent = React.memo(function NpWaterfallTooltipContent({
  active,
  payload,
  isVsLastYear,
}: {
  active?: boolean;
  payload?: Array<{ payload: any }>;
  isVsLastYear: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  const sbus = data.sbus as
    | Array<{
        id?: string;
        name?: string;
        netProfit?: {
          actual?: number;
          budget?: number;
          lastYear?: number;
        };
      }>
    | undefined;
  const hasSbuDetail = Array.isArray(sbus) && sbus.length > 0;
  const showLastYear = isVsLastYear && data.npLastYear != null;
  return (
    <div className="bg-white border border-slate-300 rounded-lg shadow-lg p-3 max-w-sm">
      <p className="font-semibold text-slate-800 mb-2">{data.label}</p>
      <p className="text-sm text-slate-600">
        actual np:{" "}
        {data.npActual != null
          ? Math.round(data.npActual).toLocaleString("en-US")
          : "0"}
      </p>
      {showLastYear ? (
        <p className="text-sm text-slate-600">
          last year np:{" "}
          {Math.round(data.npLastYear).toLocaleString("en-US")}
        </p>
      ) : (
        <p className="text-sm text-slate-600">
          budget np:{" "}
          {data.npBudget != null
            ? Math.round(data.npBudget).toLocaleString("en-US")
            : "0"}
        </p>
      )}
      {data.delta !== undefined && (
        <p className="text-sm text-slate-600 mt-1">
          {showLastYear ? "Gap (vs. Last Year): " : "Gap: "}
          {data.delta >= 0 ? "+" : ""}
          {Math.round(data.delta).toLocaleString("en-US")}
        </p>
      )}
      {hasSbuDetail && (
        <div className="mt-2 pt-2 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-500 mb-1">By SBU</p>
          <ul className="text-xs text-slate-600 space-y-0.5 max-h-32 overflow-y-auto">
            {sbus!.map((sbu: any, i: number) => {
              const np = sbu.netProfit;
              const actual =
                np?.actual != null ? np.actual / 1_000_000 : 0;
              const refVal = showLastYear
                ? (np?.lastYear != null ? np.lastYear / 1_000_000 : 0)
                : (np?.budget != null ? np.budget / 1_000_000 : 0);
              const gap = actual - refVal;
              const name = sbu.name || sbu.id || `SBU ${i + 1}`;
              return (
                <li key={sbu.id || i}>
                  {name}: {Math.round(actual).toLocaleString("en-US")} actual /{" "}
                  {Math.round(refVal).toLocaleString("en-US")}{" "}
                  {showLastYear ? "last year" : "budget"}
                  {gap !== 0 && (
                    <span
                      className={
                        gap >= 0 ? "text-emerald-600" : "text-red-600"
                      }
                    >
                      {" "}
                      ({gap >= 0 ? "+" : ""}
                      {Math.round(gap).toLocaleString("en-US")})
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
});


/**
 * Derive NP KPI card message and bullets from revenue_gp_template.gp and op_income_template (op + income).
 * Same format as GP/OP/Non-Op: Vs. Budget and Vs. Last Year sections, each by BU with GP (first level), then OP component lines, then Non-Op component lines.
 */
function deriveNpInsightsFromGpOpIncome(
  revenue_gp_template: RevenueGpTemplate | null | undefined,
  op_income_template: {
    op?: { vs_budget?: string[]; vs_last_year?: string[] };
    income?: { vs_budget?: string[]; vs_last_year?: string[] };
  } | null | undefined
): { message: string; bullets: string[] } {
  const gp = revenue_gp_template?.gp;
  const op = op_income_template?.op;
  const income = op_income_template?.income;
  const gpVb = gp?.vs_budget ?? [];
  const gpLy = gp?.vs_last_year ?? [];
  const opVb = op?.vs_budget ?? [];
  const opLy = op?.vs_last_year ?? [];
  const incVb = income?.vs_budget ?? [];
  const incLy = income?.vs_last_year ?? [];

  const gpByBuVb = parseGpByBu(gpVb);
  const gpByBuLy = parseGpByBu(gpLy);
  const opByBuVb = parseOpIncomeByBu(opVb);
  const opByBuLy = parseOpIncomeByBu(opLy);
  const incByBuVb = parseOpIncomeByBu(incVb);
  const incByBuLy = parseOpIncomeByBu(incLy);

  const buOrderVb = collectBuOrder(gpByBuVb, opByBuVb, incByBuVb);
  const buOrderLy = collectBuOrder(gpByBuLy, opByBuLy, incByBuLy);
  if (buOrderVb.length === 0 && buOrderLy.length === 0) {
    return { message: "", bullets: [] };
  }

  const bullets: string[] = [];
  const pushSection = (
    title: string,
    buOrder: string[],
    gpByBu: Map<string, string>,
    opByBu: Map<string, string[]>,
    incByBu: Map<string, string[]>
  ) => {
    if (buOrder.length === 0) return;
    bullets.push(title);
    for (const buKey of buOrder) {
      bullets.push(buDisplayName(buKey));
      const gpDelta = getByBuKey(gpByBu, buKey);
      if (gpDelta) bullets.push(`  Gross profit ${gpDelta}`);
      const stripDash = (s: string) => (s.startsWith("- ") ? s.slice(2) : s);
      for (const line of getListByBuKey(opByBu, buKey)) {
        bullets.push(`  ${stripDash(line)}`);
      }
      for (const line of getListByBuKey(incByBu, buKey)) {
        bullets.push(`  ${stripDash(line)}`);
      }
    }
  };

  pushSection("vs. Budget", buOrderVb, gpByBuVb, opByBuVb, incByBuVb);
  pushSection("vs. Last Year", buOrderLy, gpByBuLy, opByBuLy, incByBuLy);

  return { message: "", bullets };
}

export interface DisplaySummaryMetric {
  actual?: number;
  budget?: number;
  lastYear?: number;
}

export interface DisplaySummary {
  revenue?: DisplaySummaryMetric;
  gp?: DisplaySummaryMetric;
  op?: DisplaySummaryMetric;
  np?: DisplaySummaryMetric;
  income?: DisplaySummaryMetric;
}

export interface ActualsKPIsAndWaterfallSectionProps {
  displaySummary: DisplaySummary | null;
  buNpGapWaterfallData: any[];
  buNpGapVsLastYearData: any[];
  npWaterfallViewMode: "vsBudget" | "vsLastYear";
  onNpWaterfallViewModeChange: (mode: "vsBudget" | "vsLastYear") => void;
  performanceLoading: boolean;
  /** True while AI insights (KPI messages, strategic highlights) are being fetched. */
  insightsLoading?: boolean;
  /** Set when the insights request failed (e.g. timeout, 500). */
  insightsError?: Error | null;
  onWaterfallBarClick: (entry: {
    buId: string;
    label?: string;
    buName?: string;
  }) => void;
  /** AI-generated KPI messages (revenue, gp, op, income, np). When provided, override hardcoded messages. */
  kpiMessages?: Record<string, string>;
  /** Optional bullet points per KPI (e.g. McKinsey-style BU/SBU bullets). When present, shown as list under each KPI. */
  kpiBullets?: Record<string, string[]>;
  /** NP Deviation Waterfall (by BU) AI insight: negative/positive BUs for vs. Budget and vs. Last Year. */
  npWaterfallBuInsight?: NpWaterfallBuInsight | null;
  /** Revenue/GP template. NP KPI card fallback is derived from gp + op_income_template (GP, OP, Non-Op by BU). */
  revenue_gp_template?: RevenueGpTemplate | null;
  /** OP/Income template (single source for D/F lever detail). When present, NP panel AI Insights detail is derived from this; same content as OP and Income KPI cards. */
  op_income_template?: {
    op?: {
      vs_budget?: string[];
      next_steps_vs_budget?: string[];
      vs_last_year?: string[];
      next_steps_vs_last_year?: string[];
    };
    income?: {
      vs_budget?: string[];
      next_steps_vs_budget?: string[];
      vs_last_year?: string[];
      next_steps_vs_last_year?: string[];
    };
  } | null;
  /** NP Deviation Waterfall (by BU) full formatted text. Fallback when op_income_template is not provided; when op_income_template is present, detail is derived from it instead. */
  npWaterfallBuInsightDetail?: NpWaterfallBuInsightDetail | null;
  /** Show "Generate insights" button (when AI insights are available). */
  showRegenerateInsightsButton?: boolean;
  /** Called when user clicks Generate insights under Performance Overview; regenerates only KPI/overview insights. */
  onRegeneratePerformanceInsights?: () => void | Promise<void>;
  /** Called when user clicks Generate insights under NP Deviation Waterfall (by BU); regenerates only NP waterfall insights. */
  onRegenerateNpWaterfallInsights?: () => void | Promise<void>;
  /** True while Performance Overview regeneration is in progress. */
  regeneratingPerformanceInsights?: boolean;
  /** True while NP Waterfall regeneration is in progress. */
  regeneratingNpWaterfallInsights?: boolean;
  /** True while any regeneration is in progress (fallback if section-specific flags not provided). */
  regeneratingInsights?: boolean;
  /** When set (e.g. BU name), show "Insights for [label]" to indicate BU-scoped insights. */
  insightsScopeLabel?: string;
  isEditMode?: boolean;
  onMessageChange?: (metricKey: string, value: string) => void;
  /** For feedback/comment APIs: context key (e.g. from buildActualsInsightsContextKey). Passed to each BarChartKPI when isEditMode. */
  insightContextKey?: string;
}

export function ActualsKPIsAndWaterfallSection({
  displaySummary,
  buNpGapWaterfallData,
  buNpGapVsLastYearData,
  npWaterfallViewMode,
  onNpWaterfallViewModeChange,
  performanceLoading,
  insightsLoading,
  insightsError,
  onWaterfallBarClick,
  kpiMessages,
  kpiBullets,
  op_income_template,
  revenue_gp_template,
  npWaterfallBuInsight: _npWaterfallBuInsight,
  npWaterfallBuInsightDetail,
  showRegenerateInsightsButton,
  onRegeneratePerformanceInsights,
  onRegenerateNpWaterfallInsights,
  regeneratingPerformanceInsights,
  regeneratingNpWaterfallInsights,
  regeneratingInsights,
  insightsScopeLabel,
  isEditMode = false,
  onMessageChange,
  insightContextKey,
}: ActualsKPIsAndWaterfallSectionProps) {
  // NP Deviation Waterfall chart layout: gap line starts at first bar (after Y-axis), not at y-axis
  const npWaterfallChartMarginLeft = 56;
  const npWaterfallChartMarginRight = 16;
  const npWaterfallYAxisWidth = 54;

  const activeWaterfallData =
    npWaterfallViewMode === "vsLastYear"
      ? buNpGapVsLastYearData
      : buNpGapWaterfallData;
  const isVsLastYear = npWaterfallViewMode === "vsLastYear";
  const derivedNpWaterfallLists = useMemo(
    () => deriveNpWaterfallListsFromChartData(activeWaterfallData),
    [activeWaterfallData]
  );
  const { message: derivedNpMessage, bullets: derivedNpBullets } = useMemo(
    () =>
      deriveNpInsightsFromGpOpIncome(revenue_gp_template, op_income_template),
    [revenue_gp_template, op_income_template]
  );

  const [sectionFeedbackRating, setSectionFeedbackRating] = useState<number | null>(null);
  const [sectionComments, setSectionComments] = useState<{ id: number; comment_text: string; author_name: string | null; created_at: string | null }[]>([]);

  useEffect(() => {
    if (!isEditMode || !insightContextKey) return;
    getInsightFeedback("actuals", insightContextKey)
      .then((res: import("../utils/api").InsightFeedbackResponse) => {
        if (res.success && res.ratings["overview"] != null) setSectionFeedbackRating(res.ratings["overview"]);
      })
      .catch(() => {});
    getInsightComments("actuals", insightContextKey, "overview")
      .then((res: import("../utils/api").InsightCommentsResponse) => {
        if (res.success) setSectionComments(res.comments);
      })
      .catch(() => {});
  }, [isEditMode, insightContextKey]);

  const loadSectionComments = useCallback(() => {
    if (!insightContextKey) return;
    getInsightComments("actuals", insightContextKey, "overview")
      .then((res: import("../utils/api").InsightCommentsResponse) => {
        if (res.success) setSectionComments(res.comments);
      })
      .catch(() => {});
  }, [insightContextKey]);

  const npWaterfallTooltipContent = useCallback(
    (props: { active?: boolean; payload?: Array<{ payload: any }> }) => (
      <NpWaterfallTooltipContent {...props} isVsLastYear={isVsLastYear} />
    ),
    [isVsLastYear]
  );

  return (
    <>
      {/* Performance Overview */}
      <section id="performance" className="mt-8 mb-4 scroll-mt-28">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Actuals - Performance Overview
              </h2>
              <p className="text-sm text-slate-600 mt-1">Mn, USD</p>
              {insightsScopeLabel && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Insights for {insightsScopeLabel}
                </p>
              )}
            </div>
          </div>
          {insightsError && !insightsLoading && (
            <p className="text-sm text-amber-700 mt-2" role="alert">
              AI insights could not be loaded. You may still see charts and
              data.
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <svg width="24" height="2" className="overflow-visible">
              <line
                x1="0"
                y1="1"
                x2="24"
                y2="1"
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
            </svg>
            <span className="text-xs text-slate-600 font-medium">Budget</span>
          </div>
          {showRegenerateInsightsButton && onRegeneratePerformanceInsights && (
            <button
              type="button"
              onClick={onRegeneratePerformanceInsights}
              disabled={
                (regeneratingPerformanceInsights ?? regeneratingInsights) ||
                insightsLoading
              }
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-60 disabled:pointer-events-none"
              title="Clear cache and generate AI insights for Performance Overview only"
            >
              <ArrowPathIcon
                className={`h-3.5 w-3.5 ${(regeneratingPerformanceInsights ?? regeneratingInsights) || insightsLoading ? "animate-spin" : ""}`}
                aria-hidden
              />
              {(regeneratingPerformanceInsights ?? regeneratingInsights) ||
              insightsLoading
                ? "Generating..."
                : "Generate insights"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {displaySummary && (
            <>
              <BarChartKPI
                metric={{
                  label: "Revenue",
                  lastYear: (displaySummary.revenue?.lastYear || 0) / 1000000,
                  actual: (displaySummary.revenue?.actual || 0) / 1000000,
                  budget: (displaySummary.revenue?.budget || 0) / 1000000,
                }}
                message={kpiMessages?.revenue ?? ""}
                messageBullets={kpiBullets?.revenue}
                onMessageChange={(value: string) => onMessageChange?.("revenue", value)}
                messageKey="revenue"
                isEditMode={isEditMode}
                showDeltas={false}
                showBudgetBar={false}
                insightLoading={insightsLoading}
              />
              <BarChartKPI
                metric={{
                  label: "Gross Profit",
                  lastYear: (displaySummary.gp?.lastYear || 0) / 1000000,
                  actual: (displaySummary.gp?.actual || 0) / 1000000,
                  budget: (displaySummary.gp?.budget || 0) / 1000000,
                }}
                message={kpiMessages?.gp ?? ""}
                messageBullets={kpiBullets?.gp}
                onMessageChange={(value: string) => onMessageChange?.("gp", value)}
                messageKey="gp"
                isEditMode={isEditMode}
                showDeltas={false}
                showBudgetBar={false}
                insightLoading={insightsLoading}
              />
              <BarChartKPI
                metric={{
                  label: "Operating Profit",
                  lastYear: (displaySummary.op?.lastYear || 0) / 1000000,
                  actual: (displaySummary.op?.actual || 0) / 1000000,
                  budget: (displaySummary.op?.budget || 0) / 1000000,
                }}
                message={kpiMessages?.op ?? ""}
                messageBullets={kpiBullets?.op}
                onMessageChange={(value: string) => onMessageChange?.("op", value)}
                messageKey="op"
                isEditMode={isEditMode}
                showDeltas={false}
                showBudgetBar={false}
                insightLoading={insightsLoading}
              />
              <BarChartKPI
                metric={{
                  label: "Non-Op Gain/Loss",
                  lastYear: (displaySummary.income?.lastYear || 0) / 1000000,
                  actual: (displaySummary.income?.actual || 0) / 1000000,
                  budget: (displaySummary.income?.budget || 0) / 1000000,
                }}
                message={kpiMessages?.income ?? ""}
                messageBullets={kpiBullets?.income}
                onMessageChange={(value: string) => onMessageChange?.("income", value)}
                messageKey="income"
                isEditMode={isEditMode}
                showDeltas={false}
                showBudgetBar={false}
                insightLoading={insightsLoading}
              />
              <BarChartKPI
                metric={{
                  label: "Net Profit",
                  lastYear: (displaySummary.np?.lastYear || 0) / 1000000,
                  actual: (displaySummary.np?.actual || 0) / 1000000,
                  budget: (displaySummary.np?.budget || 0) / 1000000,
                }}
                message={
                  (kpiMessages?.np?.trim() || derivedNpMessage) ?? ""
                }
                messageBullets={
                  kpiBullets?.np?.length ? kpiBullets.np : derivedNpBullets
                }
                onMessageChange={(value: string) => onMessageChange?.("np", value)}
                messageKey="np"
                isEditMode={isEditMode}
                showDeltas={false}
                showBudgetBar={false}
                insightLoading={insightsLoading}
              />
            </>
          )}
        </div>
        {isEditMode && insightContextKey && (
          <div className="mt-3">
            <FineTuneInsightsCard
              scope="actuals"
              contextKey={insightContextKey}
              metricKey="overview"
              initialRating={sectionFeedbackRating}
              onRatingChange={setSectionFeedbackRating}
              comments={sectionComments}
              onCommentSubmitted={loadSectionComments}
            />
          </div>
        )}
      </section>

      {/* BU-level NP Gap to Budget / Last Year Waterfall Chart + AI insight */}
      <section id="bu-deviation" className="mb-8 pt-6 scroll-mt-28">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="text-blue-600 w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Actuals - NP Deviation Waterfall (by BU)
                  </h2>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-slate-600">Mn, USD</p>
                    {showRegenerateInsightsButton &&
                      onRegenerateNpWaterfallInsights && (
                      <button
                        type="button"
                        onClick={onRegenerateNpWaterfallInsights}
                        disabled={
                          (regeneratingNpWaterfallInsights ??
                            regeneratingInsights) ||
                          insightsLoading
                        }
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-60 disabled:pointer-events-none"
                        title="Clear cache and generate AI insights for NP Deviation Waterfall (by BU) only"
                      >
                        <ArrowPathIcon
                          className={`h-3.5 w-3.5 ${(regeneratingNpWaterfallInsights ?? regeneratingInsights) || insightsLoading ? "animate-spin" : ""}`}
                          aria-hidden
                        />
                        {(regeneratingNpWaterfallInsights ??
                          regeneratingInsights) ||
                        insightsLoading
                          ? "Generating..."
                          : "Generate insights"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">View:</span>
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => onNpWaterfallViewModeChange("vsBudget")}
                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                      npWaterfallViewMode === "vsBudget"
                        ? "bg-white shadow-sm text-primary-600 font-bold"
                        : "text-gray-500"
                    }`}
                  >
                    vs. Budget
                  </button>
                  <button
                    type="button"
                    onClick={() => onNpWaterfallViewModeChange("vsLastYear")}
                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                      npWaterfallViewMode === "vsLastYear"
                        ? "bg-white shadow-sm text-primary-600 font-bold"
                        : "text-gray-500"
                    }`}
                  >
                    vs. Last Year
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="h-96 min-h-0 flex flex-col">
              {performanceLoading ? (
                <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-600">
                      Loading NP deviation data...
                    </p>
                  </div>
                </div>
              ) : activeWaterfallData && activeWaterfallData.length > 0 ? (
                <>
                  {/* Gap to Budget / Gap to Last Year — horizontal square bracket from middle of first bucket to middle of last bucket */}
                  {(() => {
                    let gapLabel = isVsLastYear ? "Gap to Last Year: —" : "Gap to Budget: —";
                    if (activeWaterfallData.length >= 2) {
                      const first = activeWaterfallData[0] as any;
                      const last = activeWaterfallData[activeWaterfallData.length - 1] as any;
                      const firstVal = first?.cumulativeValue;
                      const lastVal = last?.cumulativeValue;
                      if (typeof firstVal === "number" && typeof lastVal === "number") {
                        const gapMn = lastVal - firstVal;
                        gapLabel = isVsLastYear
                          ? `Gap to Last Year: ${gapMn >= 0 ? "+" : ""}${gapMn.toFixed(1)} Mn`
                          : `Gap to Budget: ${gapMn >= 0 ? "+" : ""}${gapMn.toFixed(1)} Mn`;
                      }
                    }
                    const n = Math.max(1, activeWaterfallData.length);
                    // Center of first bucket: (0.5 / n) * 100; center of last bucket: ((n - 0.5) / n) * 100
                    const startPct = (100 * 0.5) / n;
                    const endPct = (100 * (n - 0.5)) / n;
                    const labelCenterPct = (startPct + endPct) / 2;
                    const gapLineStartInset = npWaterfallChartMarginLeft + npWaterfallYAxisWidth;
                    return (
                      <div className="w-full shrink-0 flex flex-col bg-white rounded-t-lg py-2 relative" style={{ paddingLeft: gapLineStartInset, paddingRight: npWaterfallChartMarginRight }}>
                        <div className="flex items-center w-full relative">
                          <svg className="flex-1 min-w-0 h-3 shrink-0" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden>
                            <path
                              d={`M ${startPct} 6 L ${startPct} 12 M ${startPct} 6 L ${endPct} 6 L ${endPct} 12`}
                              fill="none"
                              stroke="#475569"
                              strokeWidth="1.5"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                          <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-xs font-semibold text-slate-700 whitespace-nowrap bg-white px-1.5" style={{ left: `${labelCenterPct}%` }}>{gapLabel}</span>
                        </div>
                      </div>
                    );
                  })()}
                  <ResponsiveContainer width="100%" className="min-h-0 flex-1" initialDimension={{ width: 100, height: 100 }}>
                  <ComposedChart data={activeWaterfallData} margin={{ left: npWaterfallChartMarginLeft, right: npWaterfallChartMarginRight }}>
                    <XAxis
                      dataKey="label"
                      angle={0}
                      textAnchor="middle"
                      height={120}
                      axisLine={false}
                      tickLine={false}
                      fontSize={16}
                      interval={0}
                      tick={(props: any) => {
                        const { x, y, payload } = props;
                        const label = payload.value || "";
                        const maxCharsPerLine = 12;
                        const lineHeight = 16;
                        const lines: string[] = [];

                        if (label.length <= maxCharsPerLine) {
                          lines.push(label);
                        } else {
                          const words = label.split(/(\s+|-|_)/);
                          let currentLine = "";
                          words.forEach((word: string) => {
                            if (
                              (currentLine + word).length <= maxCharsPerLine
                            ) {
                              currentLine += word;
                            } else {
                              if (currentLine) {
                                lines.push(currentLine.trim());
                              }
                              if (word.length > maxCharsPerLine) {
                                for (
                                  let i = 0;
                                  i < word.length;
                                  i += maxCharsPerLine
                                ) {
                                  lines.push(
                                    word.substring(i, i + maxCharsPerLine),
                                  );
                                }
                                currentLine = "";
                              } else {
                                currentLine = word;
                              }
                            }
                          });
                          if (currentLine) {
                            lines.push(currentLine.trim());
                          }
                        }
                        if (lines.length === 0) lines.push(label);

                        return (
                          <g transform={`translate(${x},${y})`}>
                            {lines.map((line, index) => (
                              <text
                                key={index}
                                x={0}
                                y={index * lineHeight}
                                dy={16}
                                textAnchor="middle"
                                fill="#64748b"
                                fontSize={16}
                                fontWeight="bold"
                              >
                                {line}
                              </text>
                            ))}
                          </g>
                        );
                      }}
                    />
                    <YAxis
                      width={npWaterfallYAxisWidth}
                      label={{
                        value: "Mn, USD",
                        angle: -90,
                        position: "insideLeft",
                        style: { fontWeight: "bold" },
                      }}
                      tickFormatter={(value) => Math.round(value).toString()}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
                    <Tooltip content={npWaterfallTooltipContent} />
                    <Bar
                      dataKey="baselineValue"
                      stackId="a"
                      fill="transparent"
                      isAnimationActive={false}
                    />
                    <Bar dataKey="barValue" stackId="a" isAnimationActive={false}>
                      {activeWaterfallData.map((entry: any, index: number) => {
                        const isFirst = entry.stage === "budget-np" || entry.stage === "last-year-np";
                        const isLast = entry.stage === "actual-np";
                        const isBuBar = !isFirst && !isLast;

                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.type === "baseline"
                                ? "#6b7280"
                                : entry.isPositive
                                  ? "#10b981"
                                  : "#ef4444"
                            }
                            style={{
                              cursor: isBuBar ? "pointer" : "default",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isBuBar && entry.buId) {
                                onWaterfallBarClick({
                                  buId: entry.buId,
                                  label: entry.label,
                                  buName: entry.buName,
                                });
                              }
                            }}
                          />
                        );
                      })}
                      <LabelList
                        dataKey="labelValue"
                        position="top"
                        content={(props: any) => {
                          const { x, y, width, height, value, payload } = props;
                          if (value === undefined || value === null)
                            return null;
                          const numValue =
                            typeof value === "number"
                              ? value
                              : parseFloat(value);
                          if (isNaN(numValue)) return null;

                          const entry =
                            payload ||
                            activeWaterfallData.find(
                              (e: any) => e.labelValue === numValue,
                            );
                          if (!entry) return null;

                          const isFirst = entry.stage === "budget-np" || entry.stage === "last-year-np";
                          const isLast = entry.stage === "actual-np";

                          const labelText =
                            entry?.type === "baseline"
                              ? `${Math.round(numValue).toLocaleString("en-US")}`
                              : `${numValue >= 0 ? "+" : ""}${Math.round(numValue).toLocaleString("en-US")}`;

                          const labelY =
                            isFirst || isLast ? y - 5 : y + height / 2;

                          return (
                            <text
                              x={x + width / 2}
                              y={labelY}
                              fill="#374151"
                              fontSize={16}
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline={
                                isFirst || isLast ? "auto" : "middle"
                              }
                            >
                              {labelText}
                            </text>
                          );
                        }}
                      />
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">No data available</p>
                </div>
              )}
            </div>
            {/* NP Waterfall BU AI insight */}
            <div className="flex flex-col h-96">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-sm font-bold text-slate-400 italic">
                  AI Insights
                </p>
              </div>
              <div className="bg-slate-50 rounded p-2 flex flex-col flex-1 min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto">
              {insightsLoading ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Loading insight...
                </div>
              ) : (() => {
                const detailFromTemplate = buildNpWaterfallDetailFromOpIncome(
                  op_income_template,
                  isVsLastYear
                );
                const detailRaw = npWaterfallBuInsightDetail
                  ? isVsLastYear
                    ? npWaterfallBuInsightDetail.vs_last_year
                    : npWaterfallBuInsightDetail.vs_budget
                  : undefined;
                const detailBlocks = isNpWaterfallDetailBlocks(detailRaw)
                  ? detailRaw
                  : (typeof detailRaw === "string"
                      ? parseNpWaterfallDetailStringToBlocks(detailRaw)
                      : null);
                const detailText =
                  detailFromTemplate ||
                  (typeof detailRaw === "string" && !detailBlocks
                    ? detailRaw
                    : undefined);
                const hasChartData = activeWaterfallData && activeWaterfallData.length > 0;
                const { negative: derivedNegative, positive: derivedPositive } = derivedNpWaterfallLists;
                return (
                  <>
                    {hasChartData && (
                      <>
                        <div className="mb-2">
                          <p className="text-sm font-semibold text-slate-700 mb-1">
                            1. Negative deviation BU:
                          </p>
                          <ul className="text-sm text-slate-700 list-disc list-inside space-y-0.5">
                            {derivedNegative.length > 0
                              ? derivedNegative.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))
                              : (<li className="text-slate-500">—</li>)}
                          </ul>
                        </div>
                        <div className="mb-2">
                          <p className="text-sm font-semibold text-slate-700 mb-1">
                            2. Positive deviation BU:
                          </p>
                          <ul className="text-sm text-slate-700 list-disc list-inside space-y-0.5">
                            {derivedPositive.length > 0
                              ? derivedPositive.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))
                              : (<li className="text-slate-500">—</li>)}
                          </ul>
                        </div>
                      </>
                    )}
                    {detailBlocks && detailBlocks.bu_order.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-3 min-w-0">
                        {detailBlocks.bu_order.map((buName: string) => {
                          const blockText = (detailBlocks.blocks[buName] ?? "").trim();
                          const lines = blockText
                            ? blockText.split(/\n/).filter((line: string) => line.length > 0)
                            : [];
                          /** Impact lines indent under section headers (Topline/GP, OP, Non-Op). */
                          const isImpactSubBullet = (line: string): boolean => {
                            const trimmed = line.trimStart();
                            if (line !== trimmed && line.length - trimmed.length >= 2) return true;
                            return (
                              /^(Volume|Cost|Price|Mix)\s+impact\b/i.test(trimmed) ||
                              /\bOPEX\s+(deviation|impact)?/i.test(trimmed) ||
                              /\bOPEX\s*\(/i.test(trimmed) ||
                              /^Sales\s+impact\b/i.test(trimmed) ||
                              /^Admin:\s/i.test(trimmed) ||
                              /^R&D:\s/i.test(trimmed) ||
                              /\bNon-OPEX\b/i.test(trimmed) ||
                              /中央統籌/.test(trimmed) ||
                              /其他收入/.test(trimmed) ||
                              /其他利益及損失/.test(trimmed) ||
                              /財務成本/.test(trimmed) ||
                              /^Other\s+(COGS|impact)/i.test(trimmed)
                            );
                          };
                          return (
                            <div
                              key={buName}
                              className="min-w-[10rem] flex-1 flex flex-col rounded border border-slate-200 bg-white p-2"
                            >
                              <p className="text-sm font-semibold text-slate-700 mb-1.5 border-b border-slate-200 pb-1">
                                {buName}
                              </p>
                              {lines.length > 0 ? (
                                <ul className="text-sm text-slate-700 list-disc list-inside space-y-0.5 leading-relaxed overflow-y-auto">
                                  {lines.map((line: string, i: number) => {
                                    const sub = isImpactSubBullet(line);
                                    const displayLine = line.trimStart();
                                    return (
                                      <li
                                        key={i}
                                        className={sub ? "pl-4" : undefined}
                                      >
                                        {displayLine}
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p className="text-sm text-slate-500">—</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : detailText && detailText.trim() ? (
                      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pr-1 mt-2">
                        {detailText}
                      </div>
                    ) : null}
                    {npWaterfallBuInsightDetail?.remaining_highlight?.trim() && (
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <p className="text-sm font-semibold text-slate-700 mb-1">
                          BUs with largest 2026 Remaining (三率競對分析)
                        </p>
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pr-1">
                          {npWaterfallBuInsightDetail.remaining_highlight}
                        </div>
                      </div>
                    )}
                    {!hasChartData && !(detailBlocks && detailBlocks.bu_order.length > 0) && !(detailText && detailText.trim()) && !npWaterfallBuInsightDetail?.remaining_highlight?.trim() && (
                      <p className="text-sm text-slate-500">No insight available</p>
                    )}
                  </>
                );
              })()}
              </div>
              </div>
            </div>
            </div>
          </div>
        </section>
    </>
  );
}
