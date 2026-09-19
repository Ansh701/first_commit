import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Landmark,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { StatusPill } from "@/components/status-pill";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="auth-page" id="main-content">
      <div className="auth-top">
        <BrandMark />
        <ThemeToggle />
      </div>
      <section className="auth-card">
        <StatusPill tone="warning">Local demo access</StatusPill>
        <h1>Choose a safe demo role.</h1>
        <p>
          Production sign-in uses Amazon Cognito Managed Login with
          Authorization Code + PKCE. Until the AWS environment is approved,
          these links open synthetic local fixtures and do not create an
          identity session.
        </p>
        <div className="auth-options">
          <Link href="/app">
            <span className="auth-icon">
              <Building2 size={22} />
            </span>
            <span>
              <strong>Organization admin</strong>
              <small>Profile, evidence, confirmation, submission</small>
            </span>
            <ArrowRight size={17} />
          </Link>
          <Link href="/review">
            <span className="auth-icon">
              <ShieldCheck size={22} />
            </span>
            <span>
              <strong>Platform reviewer</strong>
              <small>Queue, evidence context, claim decisions</small>
            </span>
            <ArrowRight size={17} />
          </Link>
          <Link href="/csr/discover">
            <span className="auth-icon">
              <Landmark size={22} />
            </span>
            <span>
              <strong>CSR user</strong>
              <small>Discovery and private shortlist</small>
            </span>
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="auth-security-note">
          <LockKeyhole size={17} />
          <span>
            <strong>No passwords are handled here.</strong> Cognito will own
            credentials, recovery, verification, and protections in production.
          </span>
        </div>
      </section>
    </main>
  );
}
