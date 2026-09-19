import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

export const metadata = { title: "Session expired" };

export default function SessionExpiredPage() {
  return (
    <AuthShell>
      <div className="auth-form-card auth-state-card">
        <span className="auth-state-icon">
          <Clock3 size={28} />
        </span>
        <p className="auth-eyebrow">Session protected</p>
        <h2>Your session has expired.</h2>
        <p className="auth-description">
          We signed this browser out after inactivity. Your saved work is
          preserved; sign in again to continue.
        </p>
        <div className="auth-state-detail">
          <ShieldCheck size={17} />
          <span>
            No private evidence was exposed and no action was submitted.
          </span>
        </div>
        <Link className="button button-accent button-full" href="/auth/sign-in">
          Return to sign in <ArrowRight size={17} />
        </Link>
      </div>
    </AuthShell>
  );
}
