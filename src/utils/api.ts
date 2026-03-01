/**
 * API client for insights feedback/comments and leading indicators (stock, KPIs).
 * Stub implementations for build; wire to real endpoints as needed.
 */

// --- Insight feedback / comments ---
export interface InsightFeedbackResponse {
  success: boolean;
  ratings: Record<string, number>;
}

export interface InsightComment {
  id: number;
  comment_text: string;
  author_name: string | null;
  created_at: string | null;
}

export interface InsightCommentsResponse {
  success: boolean;
  comments: InsightComment[];
}

export async function getInsightFeedback(
  _scope: string,
  _contextKey: string
): Promise<InsightFeedbackResponse> {
  return { success: true, ratings: {} };
}

export async function getInsightComments(
  _scope: string,
  _contextKey: string,
  _metricKey: string
): Promise<InsightCommentsResponse> {
  return { success: true, comments: [] };
}

// --- NP Waterfall BU insight types ---
export interface NpWaterfallBuInsightDetailBlocks {
  bu_order: string[];
  blocks: Record<string, string>;
}

export interface NpWaterfallBuInsightDetail {
  overview?: string;
  detail?: string | NpWaterfallBuInsightDetailBlocks;
  vs_last_year?: string | NpWaterfallBuInsightDetailBlocks;
  vs_budget?: string | NpWaterfallBuInsightDetailBlocks;
  remaining_highlight?: string;
}

export interface NpWaterfallBuInsight {
  vs_budget?: { negative_bus?: string[]; positive_bus?: string[] };
  vs_last_year?: { negative_bus?: string[]; positive_bus?: string[] };
}

export interface RevenueGpTemplate {
  revenue?: { vs_budget?: string[]; vs_last_year?: string[] };
  gp?: { vs_budget?: string[]; vs_last_year?: string[] };
}

// --- Stock / leading indicators ---
export interface StockPriceResponse {
  symbol?: string;
  price?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface StockPriceHistoryPoint {
  date: string;
  close?: number;
  price?: number;
  [key: string]: unknown;
}

export interface StockPriceHistorySuccess {
  data: StockPriceHistoryPoint[];
}

export interface StockPriceHistoryError {
  error: true;
  message: string;
}

export type StockPriceHistoryResponse =
  | StockPriceHistorySuccess
  | StockPriceHistoryError;

/** Previous month snapshot for leading indicators (used for trend comparison). */
export interface LeadingIndicatorsSnapshot {
  goldUsdPerOz?: number;
  copperUsdPerMt?: number;
  hrcUsdPerT?: number;
  ppRmbPerT?: number;
  cnyPerUsd?: number;
  vndPerUsd?: number;
}

export interface LeadingIndicatorsResponse {
  asOf?: string;
  prevMonth?: LeadingIndicatorsSnapshot | null;
  goldUsdPerOz?: number;
  copperUsdPerMt?: number;
  hrcUsdPerT?: number;
  ppRmbPerT?: number;
  cnyPerUsd?: number;
  vndPerUsd?: number;
  data?: unknown[];
}

const stockCache: Map<string, { data: StockPriceResponse }> = new Map();
const stockHistoryCache: Map<string, { data: StockPriceHistoryPoint[] }> =
  new Map();
const leadingIndicatorsCache: Map<string, LeadingIndicatorsResponse> = new Map();

export function getCachedStockPrice(symbol: string): { data: StockPriceResponse } | null {
  return stockCache.get(symbol) ?? null;
}

export function getCachedStockPriceHistory(
  symbol: string,
  _days: number
): { data: StockPriceHistoryPoint[] } | null {
  return stockHistoryCache.get(symbol) ?? null;
}

export function getCachedLeadingIndicators(): LeadingIndicatorsResponse | null {
  return leadingIndicatorsCache.get("default") ?? null;
}

export async function getStockPrice(
  _symbol: string,
  _opts?: { skipCache?: boolean }
): Promise<StockPriceResponse> {
  return { symbol: _symbol, price: 0, currency: "USD" };
}

export async function getStockPriceHistory(
  _symbol: string,
  _days: number,
  _opts?: { skipCache?: boolean }
): Promise<StockPriceHistoryResponse> {
  return { data: [] };
}

export async function getLeadingIndicators(_opts?: {
  skipCache?: boolean;
}): Promise<LeadingIndicatorsResponse> {
  return { data: [] };
}
