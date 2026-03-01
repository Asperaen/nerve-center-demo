/**
 * Mock data for Leading KPIs key call-out card (overview + KPIs needing attention).
 */
export const MOCK_LEADING_KPIS_KEY_CALL_OUT = {
  overview:
    "Key leading indicators are within acceptable ranges. Focus on COPQ and customer complaints where trends need attention.",
  kpis_needing_attention: [
    { label: "COPQ", group: "Quality", description: "Trend vs 2026 Target" },
    { label: "Customer complaints", group: "Quality", description: "Slight increase vs Last Year" },
  ] as Array<{ label: string; group?: string; description?: string }>,
};
