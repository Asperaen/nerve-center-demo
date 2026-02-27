import type { ExternalPulseResponse, FetchBudgetDashboard, FetchExternalPulse, FetchForecastMetrics, ForecastData } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const APIS = {
    FINANCE_WEEKLY_FORECAST_METRICS: `${API_BASE_URL}/finance/weekly-forecast-metrics`,
    EXTERNAL_PULSE: `${API_BASE_URL}/fetch_external_pulse`,
    BUDGET_DASHBOARD: `${API_BASE_URL}/biweekly-dashboard`,
}

const fetchForecastMetricsApi: FetchForecastMetrics = async ()=> {
    const response = await fetch(APIS.FINANCE_WEEKLY_FORECAST_METRICS);
    const data = await response.json();
    return data as {metrics: ForecastData};
}

const fetchExternalPulseApi: FetchExternalPulse = async ()=> {
  try {
    const response = await fetch(APIS.EXTERNAL_PULSE);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data as ExternalPulseResponse;
  } catch (error) {
    console.error('Failed to fetch external pulse:', error);
    throw error;
  }
};

const fetchBudgetDashboardApi: FetchBudgetDashboard = async (startYearMonth: string, endYearMonth: string)=> {
    const response = await fetch(`${APIS.BUDGET_DASHBOARD}?start_year_month=${startYearMonth.replace("-", "")}&end_year_month=${endYearMonth.replace("-", "")}`);
    const data = await response.json();

    return {
        summary: data.summary,
        groups: data.groups || []
    }
}

export { fetchBudgetDashboardApi, fetchExternalPulseApi, fetchForecastMetricsApi };

