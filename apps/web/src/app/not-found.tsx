import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

export default function NotFound() {
  return (
    <AuthShell>
      <div className="auth-form-card auth-state-card">
        <span className="auth-state-icon">
          <SearchX size={28} />
        </span>
        <p className="auth-eyebrow">404 · Not found</p>
        <h2>This page is not part of the trust profile.</h2>
        <p className="auth-description">
          The link may be outdated or the resource may no longer be available.
          No restricted details were disclosed.
        </p>
        <Link className="button button-accent button-full" href="/">
          <ArrowLeft size={17} /> Return home
        </Link>
      </div>
    </AuthShell>
  );
}
