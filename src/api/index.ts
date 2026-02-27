import {
  fetchBudgetDashboardApi,
  fetchExternalPulseApi,
  fetchForecastMetricsApi,
} from "./api";
import { mockExternalPulseResponse, mockForecastMetrics } from "./mockData";
import {
  getMonthlyBudgetData,
  transformExternalPulseResponse,
} from "./transform";
import type {
  FetchBudgetDashboard,
  FetchExternalPulse,
  FetchForecastMetrics,
} from "./types";

const isMocking = () => {
  // Default to true in development mode if VITE_USE_MOCKS is not explicitly set to "false"
  const envValue = import.meta.env?.VITE_USE_MOCKS;
  if (envValue === "false") return false;
  if (envValue === "true") return true;
  // Default to true in development, false in production
  return import.meta.env?.DEV ?? true;
};

export const fetchForecastMetrics: FetchForecastMetrics = async () => {
  if (isMocking()) {
    return mockForecastMetrics;
  }

  return fetchForecastMetricsApi();
};

export const fetchExternalPulse: FetchExternalPulse = async () => {
  const data = isMocking()
    ? mockExternalPulseResponse
    : await fetchExternalPulseApi();

  return transformExternalPulseResponse(data);
};

export const fetchBudgetDashboard: FetchBudgetDashboard = async (
  startYearMonth: string,
  endYearMonth: string
) => {
  // Extract month indices (1-12)
  const startMonth: number = parseInt(startYearMonth.split("-")[1]);
  const endMonth: number = parseInt(endYearMonth.split("-")[1]);

  if (isMocking()) {
    // Use monthly budget data aggregation
    const data = getMonthlyBudgetData(startMonth, endMonth);
    return {
      summary: data.summary,
      groups: data.groups || [],
    };
  }

  const data = await fetchBudgetDashboardApi(startYearMonth, endYearMonth);
  return {
    summary: data.summary,
    groups: data.groups || [],
  };
};
