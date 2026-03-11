import type { BiweeklyDashboardData, NewsItem } from "../types";

export interface ForecastData {
    revenue: {
        lastYear: number;
        lastWeek: number;
        current: number;
        target: number;
    };
    gp: { lastYear: number; lastWeek: number; current: number; target: number };
    op: { lastYear: number; lastWeek: number; current: number; target: number };
    income: { lastYear: number; lastWeek: number; current: number; target: number };
    np: { lastYear: number; lastWeek: number; current: number; target: number };
}


export type ExternalPulseResponse = NewsItem[];


export type FetchForecastMetrics = () => Promise<{metrics: ForecastData}>;

export type FetchExternalPulse = () => Promise<ExternalPulseResponse>;

export type FetchBudgetDashboard = (startYearMonth: string, endYearMonth: string) => Promise<BiweeklyDashboardData>;