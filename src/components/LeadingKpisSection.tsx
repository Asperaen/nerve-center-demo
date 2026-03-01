import { useCallback, useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { LeadingKpisKeyCallOutCard } from "./LeadingKpisKeyCallOutCard";
import { KPICard } from "./KPICard";
import { useLiveInsight } from "../contexts/LiveInsightContext";
import { useLeadingKpisInsights } from "../hooks/useLeadingKpisInsights";
import {
  getStockPrice,
  getStockPriceHistory,
  getLeadingIndicators,
  getCachedStockPrice,
  getCachedStockPriceHistory,
  getCachedLeadingIndicators,
  type StockPriceResponse,
  type StockPriceHistoryPoint,
  type StockPriceHistoryResponse,
  type LeadingIndicatorsResponse,
} from "../utils/api";
import { MOCK_LEADING_KPIS_KEY_CALL_OUT } from "../data/mockLeadingKpisInsights";

const internalKpis = [
  { group: "Quality", label: "COPQ", value: "763", unit: "K USD", status: "GOOD", statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100", lastUpdate: "2025 FY", trend: "-76.0% vs 2026 Target" },
  { group: "Quality", label: "Customer complaints", value: "175", unit: "# of cases", status: "WARNING", statusColor: "bg-yellow-50 text-yellow-600 border-yellow-100", lastUpdate: "2025 FY", trend: "2.3% vs Last Year" },
  { group: "Topline", label: "破冰階段營收占比", value: "4", unit: "%", lastUpdate: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)", benchmarkValue: "TBD" },
  { group: "Topline", label: "Pre-RFQ階段營收占比", value: "2", unit: "%", lastUpdate: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)", benchmarkValue: "TBD" },
  { group: "Topline", label: "RFQ+開發階段營收占比", value: "7", unit: "%", lastUpdate: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)", benchmarkValue: "TBD" },
  { group: "Topline", label: "送樣階段營收占比", value: "11", unit: "%", lastUpdate: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)", benchmarkValue: "TBD" },
  { group: "Topline", label: "量產階段營收占比", value: "76", unit: "%", lastUpdate: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)", benchmarkValue: "TBD" },
  { group: "Manufacturing", label: "UPPH", value: "2.3 u/h", status: "WARNING", statusColor: "bg-amber-50 text-amber-600 border-amber-100", lastUpdate: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)", benchmarkValue: "2.4" },
  { group: "Manufacturing", label: "OEE", value: "73.5%", status: "WARNING", statusColor: "bg-amber-50 text-amber-600 border-amber-100", lastUpdate: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)", benchmarkValue: "74.5" },
];

function sortKpisByStatus<T extends { status?: string }>(kpis: T[]): T[] {
  const statusOrder = { RISK: 0, WARNING: 1, GOOD: 2 };
  return [...kpis].sort((a, b) => {
    const aStatus = (a.status || "GOOD").toUpperCase() as keyof typeof statusOrder;
    const bStatus = (b.status || "GOOD").toUpperCase() as keyof typeof statusOrder;
    return (statusOrder[aStatus] ?? 2) - (statusOrder[bStatus] ?? 2);
  });
}

const BU_REVENUE_ROWS = [
  { scope: "Cable", group: "Quality", label: "COPQ", value: "TBD", unit: "K USD", version: "Actuals as of today", benchmarkVersion: "Avg. of last month" },
  { scope: "Audio", group: "Quality", label: "COPQ", value: "TBD", unit: "K USD", version: "Actuals as of today", benchmarkVersion: "Avg. of last month" },
  { scope: "Conn", group: "Quality", label: "COPQ", value: "TBD", unit: "K USD", version: "Actuals as of today", benchmarkVersion: "Avg. of last month" },
  { scope: "Cable", group: "Quality", label: "Customer complaints", value: "TBD", unit: "# of cases", version: "Actuals as of today", benchmarkVersion: "Avg. of last month" },
  { scope: "Audio", group: "Quality", label: "Customer complaints", value: "TBD", unit: "# of cases", version: "Actuals as of today", benchmarkVersion: "Avg. of last month" },
  { scope: "Conn", group: "Quality", label: "Customer complaints", value: "TBD", unit: "# of cases", version: "Actuals as of today", benchmarkVersion: "Avg. of last month" },
  { scope: "Cable", group: "Topline", label: "破冰階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Audio", group: "Topline", label: "破冰階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Conn", group: "Topline", label: "破冰階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Cable", group: "Topline", label: "Pre-RFQ階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Audio", group: "Topline", label: "Pre-RFQ階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Conn", group: "Topline", label: "Pre-RFQ階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Cable", group: "Topline", label: "RFQ+開發階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Audio", group: "Topline", label: "RFQ+開發階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Conn", group: "Topline", label: "RFQ+開發階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Cable", group: "Topline", label: "送樣階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Audio", group: "Topline", label: "送樣階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Conn", group: "Topline", label: "送樣階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Cable", group: "Topline", label: "量產階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Audio", group: "Topline", label: "量產階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
  { scope: "Conn", group: "Topline", label: "量產階段營收占比", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "LY actuals as of today (2024 FY)" },
];
const BU_COGS_ROWS = [
  { scope: "Cable", group: "Manufacturing", label: "UPPH", value: "TBD", unit: "Unit", version: "Actuals as of today", benchmarkVersion: "Avg. of last month" },
  { scope: "Audio", group: "Manufacturing", label: "UPPH", value: "TBD", unit: "Unit", version: "Actuals as of today", benchmarkVersion: "Avg. of last month" },
  { scope: "Cable", group: "Manufacturing", label: "UPH", value: "TBD", unit: "Unit", version: "Actuals as of today", benchmarkVersion: "Avg. of last month" },
  { scope: "Conn", group: "Manufacturing", label: "OEE1", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "Avg. of last month" },
  { scope: "Conn", group: "Manufacturing", label: "OEE2", value: "TBD", unit: "%", version: "Actuals as of today", benchmarkVersion: "Avg. of last month" },
];
const SITE_COGS_ROWS = [
  { scope: "CN - HA", group: "Manufacturing", label: "Labor rate", version: "Latest Quarter", value: "TBD", unit: "USD", benchmarkVersion: "Budget", benchmarkValue: "TBD" },
  { scope: "CN - KS", group: "Manufacturing", label: "Labor rate", version: "Latest Quarter", value: "TBD", unit: "USD", benchmarkVersion: "Budget", benchmarkValue: "TBD" },
  { scope: "CN - BK", group: "Manufacturing", label: "Labor rate", version: "Latest Quarter", value: "TBD", unit: "USD", benchmarkVersion: "Budget", benchmarkValue: "TBD" },
  { scope: "VN", group: "Manufacturing", label: "Labor rate", version: "Latest Quarter", value: "TBD", unit: "USD", benchmarkVersion: "Budget", benchmarkValue: "TBD" },
];

export function LeadingKpisSection() {
  const { liveInsightOn } = useLiveInsight();
  const [isBuSectionExpanded, setIsBuSectionExpanded] = useState(false);
  const [isFitSectionExpanded, setIsFitSectionExpanded] = useState(true);
  const [selectedBu, setSelectedBu] = useState<string>("Cable");
  const [isSiteSectionExpanded, setIsSiteSectionExpanded] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>("CN - HA");

  const [stockPriceResponse, setStockPriceResponse] = useState<StockPriceResponse | null>(null);
  const [, setIsLoadingStockPrice] = useState(true);
  const [stockPriceHistory, setStockPriceHistory] = useState<StockPriceHistoryPoint[] | null>(null);
  const [, setIsLoadingStockPriceHistory] = useState(true);
  const [, setStockPriceHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCachedStockPrice("6088.HK");
    if (cached != null) {
      setStockPriceResponse(cached);
      setIsLoadingStockPrice(false);
    }
    let cancelled = false;
    const fetchStockPrice = async () => {
      if (cached == null) setIsLoadingStockPrice(true);
      try {
        const data = await getStockPrice("6088.HK");
        if (!cancelled) setStockPriceResponse(data);
      } catch (error) {
        if (!cancelled) setStockPriceResponse({ error: true, message: String(error), source: "api" });
      } finally {
        if (!cancelled) setIsLoadingStockPrice(false);
      }
    };
    fetchStockPrice();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cached = getCachedStockPriceHistory("6088.HK", 30);
    if (cached != null && "data" in cached) {
      setStockPriceHistory(cached.data);
      setStockPriceHistoryError(null);
      setIsLoadingStockPriceHistory(false);
    }
    let cancelled = false;
    const fetchHistory = async () => {
      if (cached == null) {
        setIsLoadingStockPriceHistory(true);
        setStockPriceHistoryError(null);
      }
      try {
        const res = await getStockPriceHistory("6088.HK", 30);
        if (cancelled) return;
        if ("error" in res && res.error) {
          setStockPriceHistoryError(res.message);
          setStockPriceHistory([]);
        } else {
          setStockPriceHistoryError(null);
          setStockPriceHistory("data" in res ? res.data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setStockPriceHistoryError(String(error));
          setStockPriceHistory([]);
        }
      } finally {
        if (!cancelled) setIsLoadingStockPriceHistory(false);
      }
    };
    fetchHistory();
    return () => { cancelled = true; };
  }, []);

  const [leadingIndicators, setLeadingIndicators] = useState<LeadingIndicatorsResponse | null>(null);
  const [, setIsLoadingLeadingIndicators] = useState(true);

  useEffect(() => {
    const cached = getCachedLeadingIndicators();
    if (cached != null) {
      setLeadingIndicators(cached);
      setIsLoadingLeadingIndicators(false);
    }
    let cancelled = false;
    const fetchIndicators = async () => {
      if (cached == null) setIsLoadingLeadingIndicators(true);
      try {
        const data = await getLeadingIndicators();
        if (!cancelled) setLeadingIndicators(data);
      } catch {
        if (!cancelled) setLeadingIndicators(null);
      } finally {
        if (!cancelled) setIsLoadingLeadingIndicators(false);
      }
    };
    fetchIndicators();
    return () => { cancelled = true; };
  }, []);

  const internalKpisForLeading = useMemo(() => internalKpis.filter((k) => k.group !== "Manufacturing"), []);

  const latestStockPriceForKpi = stockPriceResponse && !("error" in stockPriceResponse) ? stockPriceResponse.price : undefined;
  const stockCurrencyForKpi = stockPriceResponse && !("error" in stockPriceResponse) ? stockPriceResponse.currency : undefined;

  const leadingIndicatorsSourceLabel = useMemo(() => {
    if (!leadingIndicators?.asOf) return "—";
    try {
      return `Yahoo Finance as of ${format(new Date(leadingIndicators.asOf), "d MMM yyyy, HH:mm")}`;
    } catch {
      return "Yahoo Finance";
    }
  }, [leadingIndicators?.asOf]);

  const externalKpis = useMemo(() => {
    const fmt = (n: number, decimals = 2) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const na = "—";
    const prev = leadingIndicators?.prevMonth ?? null;
    const absoluteDeltaPct = (current: number, benchmark: number): number | null => (benchmark === 0 ? null : Math.abs((current / benchmark - 1) * 100));
    type StatusResult = { status: "RISK" | "WARNING" | "GOOD"; statusColor: string };
    const statusFromPriceDelta = (absDelta: number | null): StatusResult => {
      if (absDelta == null) return { status: "GOOD", statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100" };
      if (absDelta > 10) return { status: "RISK", statusColor: "bg-red-50 text-red-600 border-red-100" };
      if (absDelta > 5) return { status: "WARNING", statusColor: "bg-amber-50 text-amber-600 border-amber-100" };
      return { status: "GOOD", statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100" };
    };
    const statusFromCnyDelta = (absDelta: number | null): StatusResult => {
      if (absDelta == null) return { status: "GOOD", statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100" };
      if (absDelta > 2.5) return { status: "RISK", statusColor: "bg-red-50 text-red-600 border-red-100" };
      if (absDelta > 1) return { status: "WARNING", statusColor: "bg-amber-50 text-amber-600 border-amber-100" };
      return { status: "GOOD", statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100" };
    };
    const statusFromVndDelta = (absDelta: number | null): StatusResult => {
      if (absDelta == null) return { status: "GOOD", statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100" };
      if (absDelta > 2) return { status: "RISK", statusColor: "bg-red-50 text-red-600 border-red-100" };
      if (absDelta > 1) return { status: "WARNING", statusColor: "bg-amber-50 text-amber-600 border-amber-100" };
      return { status: "GOOD", statusColor: "bg-emerald-50 text-emerald-600 border-emerald-100" };
    };
    const trendFromDelta = (current: number | null, prevVal: number | null): { trend: string; trendColor: string } => {
      if (current == null || prevVal == null || prevVal === 0) return { trend: "vs Last Month", trendColor: "text-slate-500" };
      const pct = ((current - prevVal) / prevVal) * 100;
      const trend = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs last month`;
      const trendColor = pct > 0 ? "text-emerald-600" : pct < 0 ? "text-red-600" : "text-slate-500";
      return { trend, trendColor };
    };
    const goldVal = leadingIndicators?.goldUsdPerOz ?? null;
    const goldBench = prev?.goldUsdPerOz ?? null;
    const gold = goldVal != null ? fmt(goldVal) : na;
    const goldTrend = trendFromDelta(goldVal, goldBench);
    const goldStatus = statusFromPriceDelta(goldVal != null && goldBench != null ? absoluteDeltaPct(goldVal, goldBench) : null);
    const copperVal = leadingIndicators?.copperUsdPerMt ?? null;
    const copperBench = prev?.copperUsdPerMt ?? null;
    const copper = copperVal != null ? fmt(copperVal) : na;
    const copperTrend = trendFromDelta(copperVal, copperBench);
    const copperStatus = statusFromPriceDelta(copperVal != null && copperBench != null ? absoluteDeltaPct(copperVal, copperBench) : null);
    const hrcVal = leadingIndicators?.hrcUsdPerT ?? null;
    const hrcBench = prev?.hrcUsdPerT ?? null;
    const hrc = hrcVal != null ? String(Math.round(hrcVal)) : na;
    const hrcTrend = trendFromDelta(hrcVal, hrcBench);
    const hrcStatus = statusFromPriceDelta(hrcVal != null && hrcBench != null ? absoluteDeltaPct(hrcVal, hrcBench) : null);
    const ppVal = leadingIndicators?.ppRmbPerT ?? null;
    const ppBench = prev?.ppRmbPerT ?? null;
    const pp = ppVal != null ? fmt(ppVal, 0) : na;
    const ppTrend = trendFromDelta(ppVal, ppBench);
    const ppStatus = statusFromPriceDelta(ppVal != null && ppBench != null ? absoluteDeltaPct(ppVal, ppBench) : null);
    const cnyVal = leadingIndicators?.cnyPerUsd ?? null;
    const cnyBench = prev?.cnyPerUsd ?? null;
    const cny = cnyVal != null ? fmt(cnyVal) : na;
    const cnyTrend = trendFromDelta(cnyVal, cnyBench);
    const cnyStatus = statusFromCnyDelta(cnyVal != null && cnyBench != null ? absoluteDeltaPct(cnyVal, cnyBench) : null);
    const vndVal = leadingIndicators?.vndPerUsd ?? null;
    const vndBench = prev?.vndPerUsd ?? null;
    const vnd = vndVal != null ? fmt(vndVal) : na;
    const vndTrend = trendFromDelta(vndVal, vndBench);
    const vndStatus = statusFromVndDelta(vndVal != null && vndBench != null ? absoluteDeltaPct(vndVal, vndBench) : null);
    const stockVal = latestStockPriceForKpi;
    const stockStr = typeof stockVal === "number" ? `Today: ${stockVal.toFixed(2)}` : "Today: —";
    const stockPrev = stockPriceHistory && stockPriceHistory.length >= 2 ? stockPriceHistory[0].price : null;
    const stockTrend = typeof stockVal === "number" && stockPrev != null && stockPrev !== 0 ? trendFromDelta(stockVal, stockPrev) : { trend: "vs Last Month", trendColor: "text-slate-500" };
    const stockStatus = statusFromPriceDelta(typeof stockVal === "number" && stockPrev != null && stockPrev !== 0 ? absoluteDeltaPct(stockVal, stockPrev) : null);
    return [
      { group: "Material Index", label: "Gold price", value: gold, unit: "USD / OZ", status: goldStatus.status, statusColor: goldStatus.statusColor, lastUpdate: leadingIndicatorsSourceLabel, trend: goldTrend.trend, trendColor: goldTrend.trendColor },
      { group: "Material Index", label: "Copper price", value: copper, unit: "USD / mt", status: copperStatus.status, statusColor: copperStatus.statusColor, lastUpdate: leadingIndicatorsSourceLabel, trend: copperTrend.trend, trendColor: copperTrend.trendColor },
      { group: "Material Index", label: "HRC (Steel) price", value: hrc, unit: "USD / T", status: hrcStatus.status, statusColor: hrcStatus.statusColor, lastUpdate: leadingIndicatorsSourceLabel, trend: hrcTrend.trend, trendColor: hrcTrend.trendColor },
      { group: "Material Index", label: "PP Resin (DCCPc1)", value: pp, unit: "CNY / T", status: ppStatus.status, statusColor: ppStatus.statusColor, lastUpdate: leadingIndicatorsSourceLabel, trend: ppTrend.trend, trendColor: ppTrend.trendColor },
      { group: "Capital Market", label: "Stock price", value: stockStr, unit: stockCurrencyForKpi ?? "—", status: stockStatus.status, statusColor: stockStatus.statusColor, lastUpdate: "Actuals as of today", trend: stockTrend.trend, trendColor: stockTrend.trendColor },
      { group: "FX Rate", label: "CNY to USD", value: cny, status: cnyStatus.status, statusColor: cnyStatus.statusColor, lastUpdate: leadingIndicatorsSourceLabel, trend: cnyTrend.trend, trendColor: cnyTrend.trendColor },
      { group: "FX Rate", label: "VND to USD", value: vnd, status: vndStatus.status, statusColor: vndStatus.statusColor, lastUpdate: leadingIndicatorsSourceLabel, trend: vndTrend.trend, trendColor: vndTrend.trendColor },
    ];
  }, [leadingIndicators, leadingIndicatorsSourceLabel, latestStockPriceForKpi, stockCurrencyForKpi, stockPriceHistory]);

  const { overview: leadingKpisOverview, kpisNeedingAttention: leadingKpisNeedingAttention, loading: leadingKpisInsightsLoading, error: leadingKpisInsightsError, refetch: refetchLeadingKpisInsights } = useLeadingKpisInsights({
    enabled: leadingIndicators != null && liveInsightOn,
    internalKpis: internalKpisForLeading,
  });
  const [isRefreshingLeadingKpis, setIsRefreshingLeadingKpis] = useState(false);

  const refreshLeadingKpisAndInsights = useCallback(async () => {
    setIsRefreshingLeadingKpis(true);
    try {
      await Promise.all([
        getStockPrice("6088.HK", { skipCache: true }).then(setStockPriceResponse),
        getStockPriceHistory("6088.HK", 30, { skipCache: true }).then((res: StockPriceHistoryResponse) => {
          if ("error" in res && res.error) {
            setStockPriceHistoryError(res.message);
            setStockPriceHistory([]);
          } else {
            setStockPriceHistoryError(null);
            setStockPriceHistory("data" in res ? res.data : []);
          }
        }),
        getLeadingIndicators({ skipCache: true }).then(setLeadingIndicators),
        refetchLeadingKpisInsights(true) ?? Promise.resolve(),
      ]);
    } catch (error) {
      console.warn("[Leading KPIs refresh] One or more requests failed:", error);
    } finally {
      setIsRefreshingLeadingKpis(false);
    }
  }, [refetchLeadingKpisInsights]);

  const leadingKpisWarningOrRisk = useMemo(() => {
    const combined = [...internalKpisForLeading, ...externalKpis];
    const filtered = combined.filter((k) => k.status === "WARNING" || k.status === "RISK");
    const statusOrder: Record<string, number> = { RISK: 0, WARNING: 1 };
    return [...filtered].sort((a, b) => (statusOrder[a.status ?? ""] ?? 2) - (statusOrder[b.status ?? ""] ?? 2));
  }, [internalKpisForLeading, externalKpis]);

  const keyCallOutKpisList = useMemo(() => {
    const insightList = liveInsightOn ? leadingKpisNeedingAttention : MOCK_LEADING_KPIS_KEY_CALL_OUT.kpis_needing_attention;
    return leadingKpisWarningOrRisk.map((k) => {
      const match = insightList?.find((item: { label: string; group?: string | null; description?: string }) => item.label === k.label && (item.group == null || item.group === k.group));
      return { label: k.label, group: k.group, description: match?.description ?? (typeof k.trend === "string" ? k.trend : "Needs attention") };
    });
  }, [leadingKpisWarningOrRisk, liveInsightOn, leadingKpisNeedingAttention]);

  return (
    <section id="primary-kpis" className="space-y-8 scroll-mt-28">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Leading KPIs</h2>
        <button
          type="button"
          onClick={refreshLeadingKpisAndInsights}
          disabled={isRefreshingLeadingKpis}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ArrowPathIcon className={isRefreshingLeadingKpis ? "w-4 h-4 animate-spin" : "w-4 h-4"} aria-hidden />
          Refresh
        </button>
      </div>
      {leadingIndicators != null && (
        <div className="mt-8">
          <LeadingKpisKeyCallOutCard
            overview={liveInsightOn ? leadingKpisOverview : MOCK_LEADING_KPIS_KEY_CALL_OUT.overview}
            kpisNeedingAttention={keyCallOutKpisList}
            loading={liveInsightOn ? leadingKpisInsightsLoading : false}
            error={liveInsightOn ? leadingKpisInsightsError : null}
          />
        </div>
      )}
      <div className="space-y-6">
        <button onClick={() => setIsFitSectionExpanded(!isFitSectionExpanded)} className="flex items-center gap-2 text-left">
          {isFitSectionExpanded ? <ChevronDownIcon className="w-5 h-5 text-gray-600" /> : <ChevronRightIcon className="w-5 h-5 text-gray-600" />}
          <h3 className="text-lg font-semibold text-gray-800">FIT</h3>
        </button>
        {isFitSectionExpanded && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-2">
              <div className="hidden lg:block" />
              <div>
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded text-xs text-gray-700">Data collected by AI (Need further validation)</div>
              </div>
              <div className="hidden lg:block" /><div className="hidden lg:block" /><div className="hidden lg:block" />
            </div>
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="space-y-4 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800">Growth and value creation</h3>
                  <div className="space-y-4">
                    {sortKpisByStatus(internalKpis.filter((kpi) => ["破冰階段營收占比", "Pre-RFQ階段營收占比", "RFQ+開發階段營收占比", "送樣階段營收占比", "量產階段營收占比"].includes(kpi.label))).map((kpi, idx) => (
                      <div key={idx} className="w-full"><KPICard kpi={kpi} /></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800">Margin and cost discipline</h3>
                  <div className="space-y-4">
                    {sortKpisByStatus(externalKpis.filter((kpi) => ["Gold price", "Copper price", "HRC (Steel) price", "PP Resin (DCCPc1)"].includes(kpi.label))).map((kpi, idx) => (
                      <div key={idx} className="w-full"><KPICard kpi={kpi} /></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800">Quality and execution health</h3>
                  <div className="space-y-4">
                    {sortKpisByStatus(internalKpis.filter((kpi) => kpi.label === "COPQ" || kpi.label === "Customer complaints")).map((kpi, idx) => (
                      <div key={idx} className="w-full"><KPICard kpi={kpi} /></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800">Other external factors</h3>
                  <div className="space-y-4">
                    {sortKpisByStatus(externalKpis.filter((kpi) => kpi.label === "CNY to USD" || kpi.label === "VND to USD")).map((kpi, idx) => (
                      <div key={idx} className="w-full"><KPICard kpi={kpi} /></div>
                    ))}
                  </div>
                </div>
                <div className="hidden lg:block" />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="space-y-6 mt-8">
        <button onClick={() => setIsBuSectionExpanded(!isBuSectionExpanded)} className="flex items-center gap-2 text-left">
          {isBuSectionExpanded ? <ChevronDownIcon className="w-5 h-5 text-gray-600" /> : <ChevronRightIcon className="w-5 h-5 text-gray-600" />}
          <h3 className="text-lg font-semibold text-gray-800">BU</h3>
        </button>
        {isBuSectionExpanded && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              {["Cable", "Audio", "Conn"].map((bu) => (
                <button key={bu} onClick={() => setSelectedBu(bu)} className={`px-4 py-2 text-sm rounded-md transition-all ${selectedBu === bu ? "bg-primary-600 text-white font-semibold" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{bu}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-8 gap-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Revenue related</h3>
                <div className="space-y-4">
                  {BU_REVENUE_ROWS.filter((r) => r.scope === selectedBu).map((row, idx) => (
                    <div key={idx} className="mb-4">
                      <KPICard kpi={{ group: row.group, label: row.label, value: row.value, unit: row.unit, lastUpdate: row.version, benchmarkVersion: row.benchmarkVersion }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-800 mb-4">COGS related</h3>
                <div className="space-y-4">
                  {BU_COGS_ROWS.filter((r) => r.scope === selectedBu).map((row, idx) => (
                    <div key={idx} className="mb-4">
                      <KPICard kpi={{ group: row.group, label: row.label, value: row.value, unit: row.unit, lastUpdate: row.version, benchmarkVersion: row.benchmarkVersion }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:block" /><div className="hidden lg:block" /><div className="hidden lg:block" />
            </div>
          </div>
        )}
      </div>
      <div className="space-y-6 mt-8">
        <button onClick={() => setIsSiteSectionExpanded(!isSiteSectionExpanded)} className="flex items-center gap-2 text-left">
          {isSiteSectionExpanded ? <ChevronDownIcon className="w-5 h-5 text-gray-600" /> : <ChevronRightIcon className="w-5 h-5 text-gray-600" />}
          <h3 className="text-lg font-semibold text-gray-800">Site</h3>
        </button>
        {isSiteSectionExpanded && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              {["CN - HA", "CN - KS", "CN - BK", "VN"].map((site) => (
                <button key={site} onClick={() => setSelectedSite(site)} className={`px-4 py-2 text-sm rounded-md transition-all ${selectedSite === site ? "bg-primary-600 text-white font-semibold" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{site}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-8 gap-y-6">
              <div className="hidden lg:block" />
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-800 mb-4">COGS related</h3>
                <div className="space-y-4">
                  {SITE_COGS_ROWS.filter((r) => r.scope === selectedSite).map((row, idx) => (
                    <div key={idx} className="mb-4">
                      <KPICard kpi={{ group: row.group, label: row.label, value: row.value, unit: row.unit, lastUpdate: row.version, benchmarkVersion: row.benchmarkVersion, benchmarkValue: row.benchmarkValue }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:block" /><div className="hidden lg:block" /><div className="hidden lg:block" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
