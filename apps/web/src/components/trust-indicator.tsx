import { BadgeCheck, CalendarDays, Info } from "lucide-react";

export type TrustIndicatorStatus = "approved" | "pending" | "stale" | "rejected";

const statusLabels: Record<TrustIndicatorStatus, string> = {
  approved: "Reviewed",
  pending: "Pending review",
  stale: "Needs review",
  rejected: "Not approved",
};

export function TrustIndicator({
  label,
  meaning,
  reviewedAt,
  scope,
  status,
  value,
}: {
  label: string;
  meaning: string;
  reviewedAt: string;
  scope?: string;
  status: TrustIndicatorStatus;
  value: string;
}) {
  return (
    <article className={`trust-indicator trust-indicator-${status}`}>
      <div className="trust-indicator-icon" aria-hidden="true">
        {status === "approved" ? <BadgeCheck size={20} /> : <Info size={20} />}
      </div>
      <div className="trust-indicator-content">
        <div className="trust-indicator-heading">
          <div>
            <p className="trust-indicator-label">{label}</p>
            <p className="trust-indicator-value">{value}</p>
          </div>
          <span className="status-pill">{statusLabels[status]}</span>
        </div>
        <p className="trust-indicator-meaning">{meaning}</p>
        <div className="trust-indicator-meta">
          {scope ? <span>{scope}</span> : null}
          <span>
            <CalendarDays aria-hidden="true" size={14} /> Reviewed {reviewedAt}
          </span>
        </div>
      </div>
    </article>
  );
}
