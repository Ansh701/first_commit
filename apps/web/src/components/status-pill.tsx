import { CheckCircle2, CircleAlert, Clock3, Sparkles } from "lucide-react";

type Tone = "approved" | "pending" | "warning" | "ai" | "neutral";

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  const Icon =
    tone === "approved"
      ? CheckCircle2
      : tone === "warning"
        ? CircleAlert
        : tone === "pending"
          ? Clock3
          : tone === "ai"
            ? Sparkles
            : null;
  return (
    <span className={`status-pill status-${tone}`}>
      {Icon && <Icon size={14} aria-hidden="true" />}
      {children}
    </span>
  );
}
