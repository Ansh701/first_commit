"use client";

import Link from "next/link";
import { ArrowRight, Check, Info, MailCheck, RefreshCw } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { getIdentityAdapter } from "@/lib/auth-adapter";
import styles from "../sign-in/sign-in-experience.module.css";

type Status = { kind: "error" | "loading" | "success"; message: string } | null;

function formatCountdown(seconds: number) {
  return `00:${String(seconds).padStart(2, "0")}`;
}

export function VerifyEmailExperience() {
  const adapter = getIdentityAdapter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [completed, setCompleted] = useState(false);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const validCode = /^\d{6}$/.test(code);
  const emailInvalid = email.length > 0 && !validEmail;
  const codeInvalid = code.length > 0 && !validCode;

  useEffect(() => {
    setEmail(window.sessionStorage.getItem("insips-verification-email") ?? "");
  }, []);

  useEffect(() => {
    if (secondsRemaining === 0) return;
    const timer = window.setInterval(() => setSecondsRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsRemaining]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validEmail || !validCode) {
      setStatus({ kind: "error", message: "Enter a valid email address and all six digits from your verification email." });
      return;
    }
    setStatus({ kind: "loading", message: "Checking your verification code…" });
    try {
      const result = await adapter.verifyEmail({ email: email.trim().toLowerCase(), code });
      setStatus({ kind: result.ok ? "success" : "error", message: result.message });
      if (result.ok) setCompleted(true);
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Email verification could not be completed." });
    }
  }

  async function resend() {
    setStatus({ kind: "loading", message: "Requesting a new verification code…" });
    try {
      const result = await adapter.resendVerification(email.trim().toLowerCase());
      setStatus({ kind: result.ok ? "success" : "error", message: result.message });
      if (result.ok) {
        setCode("");
        setSecondsRemaining(30);
      }
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "A new verification code could not be requested." });
    }
  }

  return (
    <main className={styles.page} id="main-content">
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.topbar}>
        <BrandMark />
        <div className={styles.topbarActions}>
          <Link className={styles.backLink} href="/"><ArrowRight className={styles.backIcon} size={15} aria-hidden="true" /> Back to INSIPS</Link>
          <ThemeToggle />
        </div>
      </div>
      <section className={styles.cardWrap} aria-labelledby="verify-title">
        <div className={styles.card}>
          {completed ? (
            <div className={styles.resultPanel} role="status" aria-live="polite">
              <span className={styles.iconTile} aria-hidden="true"><Check size={20} /></span>
              <p className={styles.eyebrow}>Email verified</p>
              <h1 id="verify-title">Your account is ready.</h1>
              <p>Your email address is confirmed. Continue to sign in and access the workspace assigned to you.</p>
              <Link className="button button-accent button-full" href="/auth/sign-in">Continue to sign in <ArrowRight size={17} /></Link>
              <Link className={styles.cardFoot} href="/">Return to INSIPS</Link>
            </div>
          ) : (
            <>
              <div className={styles.cardIntro}>
                <span className={styles.iconTile} aria-hidden="true"><MailCheck size={20} /></span>
                <p className={styles.eyebrow}>Verify your email</p>
                <h1 id="verify-title">Check your inbox</h1>
                <p>Enter the six-digit code sent to your account email. Codes are time-limited for your security.</p>
              </div>
              <div className={styles.adapterNote} role="note"><Info size={15} aria-hidden="true" /><span>{adapter.kind === "LOCAL_TEST" ? "Local test mode. Use verification code 246810." : "The configured identity provider controls code delivery and expiry."}</span></div>
              <form className={styles.form} onSubmit={submit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="verify-email">Email address</label>
                  <div className={`${styles.control} ${emailInvalid ? styles.invalid : ""}`}><span aria-hidden="true">@</span><input id="verify-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@organization.org" value={email} aria-invalid={emailInvalid} onChange={(event) => setEmail(event.target.value)} /></div>
                  {emailInvalid ? <small className={styles.errorText}>Enter a valid email address.</small> : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="verify-code">Verification code</label>
                  <div className={`${styles.control} ${codeInvalid ? styles.invalid : ""}`}><MailCheck size={17} aria-hidden="true" /><input id="verify-code" name="code" autoComplete="one-time-code" inputMode="numeric" maxLength={6} placeholder="000000" value={code} aria-invalid={codeInvalid} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} /></div>
                  <small>Six digits · codes expire after the identity provider’s verification window.</small>
                  {codeInvalid ? <small className={styles.errorText}>Enter all six digits from your verification email.</small> : null}
                </div>
                {status ? <div className={`${styles.status} ${styles[`status-${status.kind}`]}`} role={status.kind === "error" ? "alert" : "status"}><Info size={16} aria-hidden="true" /><span>{status.message}</span></div> : null}
                <button className="button button-accent button-full" disabled={status?.kind === "loading"} type="submit">{status?.kind === "loading" ? <><RefreshCw className={styles.spin} size={17} /> Verifying…</> : <>Verify email <ArrowRight size={17} /></>}</button>
              </form>
              <div className={styles.resendRow}>
                <span>{secondsRemaining > 0 ? `Resend available in ${formatCountdown(secondsRemaining)}` : "Didn’t receive the code?"}</span>
                <button type="button" disabled={!validEmail || secondsRemaining > 0 || status?.kind === "loading"} onClick={() => void resend}>Resend code</button>
              </div>
              <p className={styles.cardFoot}><Link href="/auth/sign-in"><ArrowRight className={styles.backIcon} size={15} aria-hidden="true" /> Back to sign in</Link></p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
