import type React from "react";

export interface KPICardKpi {
  label: string;
  group?: string;
  value: string;
  unit?: string;
  lastUpdate?: string;
  benchmarkVersion?: string;
  benchmarkValue?: string;
  status?: string;
  statusColor?: string;
  trend?: string;
  trendColor?: string;
}

export interface KPICardProps {
  kpi: KPICardKpi;
}

export function KPICard({ kpi }: KPICardProps): React.ReactElement {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{kpi.label}</span>
        {kpi.statusColor && (
          <span className={`rounded px-1.5 py-0.5 text-xs border ${kpi.statusColor}`}>
            {kpi.status ?? "—"}
          </span>
        )}
      </div>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {kpi.value} {kpi.unit ?? ""}
      </p>
      {kpi.trend && (
        <p className={`mt-0.5 text-xs ${kpi.trendColor ?? "text-gray-500"}`}>{kpi.trend}</p>
      )}
      {kpi.lastUpdate && (
        <p className="mt-1 text-xs text-gray-500">Updated: {kpi.lastUpdate}</p>
      )}
      {kpi.benchmarkVersion && (
        <p className="text-xs text-gray-500">Benchmark: {kpi.benchmarkVersion}</p>
      )}
    </div>
  );
}
