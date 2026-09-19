import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

export const metadata = { title: "Access denied" };

export default function ForbiddenPage() {
  return (
    <AuthShell>
      <div className="auth-form-card auth-state-card">
        <span className="auth-state-icon">
          <LockKeyhole size={28} />
        </span>
        <p className="auth-eyebrow">Access protected</p>
        <h2>You do not have access to this workspace.</h2>
        <p className="auth-description">
          We cannot confirm that your current role is allowed to view this
          resource. No details were revealed.
        </p>
        <Link className="button button-accent button-full" href="/demo">
          <ArrowLeft size={17} /> Choose another demo role
        </Link>
      </div>
    </AuthShell>
  );
}
