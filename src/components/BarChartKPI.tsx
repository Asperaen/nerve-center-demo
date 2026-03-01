/**
 * Bar chart KPI card for Actuals Performance Overview (Revenue, GP, OP, Income, NP).
 */
import type React from "react";

export interface BarChartKPIMetric {
  label: string;
  lastYear: number;
  actual: number;
  budget: number;
}

export interface BarChartKPIProps {
  metric: BarChartKPIMetric;
  message?: string;
  messageBullets?: string[];
  onMessageChange?: (value: string) => void;
  messageKey: string;
  isEditMode?: boolean;
  showDeltas?: boolean;
  showBudgetBar?: boolean;
  insightLoading?: boolean;
}

export default function BarChartKPI({
  metric,
  message = "",
  messageBullets,
}: BarChartKPIProps): React.ReactElement {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{metric.label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-800">
        {metric.actual.toFixed(1)} Mn
      </p>
      {message ? (
        <p className="mt-2 text-xs text-slate-600 line-clamp-3">{message}</p>
      ) : null}
      {messageBullets?.length ? (
        <ul className="mt-1 list-inside list-disc text-xs text-slate-600">
          {messageBullets.slice(0, 3).map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
