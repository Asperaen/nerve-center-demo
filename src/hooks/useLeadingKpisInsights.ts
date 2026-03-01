import { useState, useCallback } from "react";

export interface LeadingKpiInsightItem {
  label: string;
  group?: string | null;
  description?: string;
}

interface UseLeadingKpisInsightsOptions {
  enabled?: boolean;
  internalKpis?: Array<{ label: string; group?: string }>;
}

export function useLeadingKpisInsights(options: UseLeadingKpisInsightsOptions = {}) {
  const { enabled = false, internalKpis = [] } = options;
  const [overview, setOverview] = useState<string>("");
  const [kpisNeedingAttention, setKpisNeedingAttention] = useState<LeadingKpiInsightItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    (_skipCache?: boolean): Promise<void> | undefined => {
      if (!enabled) return undefined;
      setLoading(true);
      setError(null);
      return Promise.resolve()
        .then(() => {
          setOverview("Leading KPIs overview.");
          setKpisNeedingAttention(
            internalKpis
              .filter((k) => k.label === "COPQ" || k.label === "Customer complaints")
              .map((k) => ({ label: k.label, group: k.group, description: "Needs attention" }))
          );
        })
        .catch((err) => setError(String(err)))
        .finally(() => setLoading(false));
    },
    [enabled, internalKpis]
  );

  return {
    overview,
    kpisNeedingAttention,
    loading,
    error,
    refetch,
  };
}
