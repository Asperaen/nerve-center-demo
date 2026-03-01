import type React from "react";

export interface LeadingKpisKeyCallOutCardProps {
  overview: string;
  kpisNeedingAttention: Array<{ label: string; group?: string; description: string }>;
  loading?: boolean;
  error?: string | null;
}

export function LeadingKpisKeyCallOutCard({
  overview,
  kpisNeedingAttention,
  loading,
  error,
}: LeadingKpisKeyCallOutCardProps): React.ReactElement {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <>
          <p className="text-sm font-medium text-gray-800">{overview}</p>
          {kpisNeedingAttention.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {kpisNeedingAttention.map((k, i) => (
                <li key={i}>
                  <span className="font-medium">{k.label}</span>
                  {k.description ? ` — ${k.description}` : null}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
