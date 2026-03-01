/**
 * Card for feedback rating and comments on insights (edit mode).
 */
import type React from "react";

export interface FineTuneInsightsCardProps {
  scope: string;
  contextKey?: string;
  metricKey: string;
  initialRating?: number | null;
  onRatingChange?: (rating: number | null) => void;
  comments: Array<{
    id: number;
    comment_text: string;
    author_name: string | null;
    created_at: string | null;
  }>;
  onCommentSubmitted?: () => void;
}

export default function FineTuneInsightsCard({
  scope,
  metricKey,
  initialRating,
  comments,
}: FineTuneInsightsCardProps): React.ReactElement {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <p className="font-medium text-slate-700">
        Feedback: {scope} / {metricKey}
      </p>
      {initialRating != null && (
        <p className="mt-1 text-slate-600">Rating: {initialRating}</p>
      )}
      {comments.length > 0 && (
        <ul className="mt-2 space-y-1 text-slate-600">
          {comments.map((c) => (
            <li key={c.id}>{c.comment_text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
