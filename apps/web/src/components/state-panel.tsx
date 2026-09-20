import Link from "next/link";
import { AlertCircle, CheckCircle2, Info, LoaderCircle } from "lucide-react";

export type StatePanelKind =
  | "loading"
  | "empty"
  | "success"
  | "error"
  | "permission"
  | "offline"
  | "expired";

const icons = {
  loading: LoaderCircle,
  empty: Info,
  success: CheckCircle2,
  error: AlertCircle,
  permission: AlertCircle,
  offline: AlertCircle,
  expired: AlertCircle,
} satisfies Record<StatePanelKind, typeof LoaderCircle>;

export function StatePanel({
  action,
  description,
  kind,
  title,
}: {
  action?: { href: string; label: string };
  description: string;
  kind: StatePanelKind;
  title: string;
}) {
  const Icon = icons[kind];
  const role = kind === "error" ? "alert" : kind === "loading" ? "status" : undefined;

  return (
    <section
      aria-live={kind === "loading" || kind === "success" ? "polite" : undefined}
      className={`state-panel state-panel-${kind}`}
      role={role}
    >
      <span className="state-panel-icon" aria-hidden="true">
        <Icon className={kind === "loading" ? "state-panel-spin" : undefined} size={22} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
        {action ? (
          <Link className="button button-secondary" href={action.href}>
            {action.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
