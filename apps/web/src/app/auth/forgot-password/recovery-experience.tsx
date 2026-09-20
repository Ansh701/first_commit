"use client";

import Link from "next/link";
import { ArrowRight, Info, Mail, RefreshCw } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { getIdentityAdapter } from "@/lib/auth-adapter";
import styles from "../sign-in/sign-in-experience.module.css";

export function RecoveryExperience() {
  const router = useRouter();
  const adapter = getIdentityAdapter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<{ kind: "error" | "loading" | "success"; message: string } | null>(null);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const emailInvalid = email.length > 0 && !validEmail;
  const statusClass = status ? styles[`status-${status.kind}`] : "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!validEmail) {
      setStatus({ kind: "error", message: "Enter a valid email address." });
      return;
    }
    setStatus({ kind: "loading", message: "Preparing your recovery step…" });
    try {
      const result = await adapter.forgotPassword(email.trim().toLowerCase());
      setStatus({ kind: result.ok ? "success" : "error", message: result.message });
      if (result.ok) {
        window.sessionStorage.setItem("insips-reset-email", email.trim().toLowerCase());
        router.push("/auth/reset-password");
      }
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Recovery could not be started." });
    }
  }

  return (
    <main className={styles.page} id="main-content">
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.topbar}><BrandMark /><div className={styles.topbarActions}><Link className={styles.backLink} href="/"><ArrowRight className={styles.backIcon} size={15} aria-hidden="true" /> Back to INSIPS</Link><ThemeToggle /></div></div>
      <section className={styles.cardWrap} aria-labelledby="recovery-title">
        <div className={styles.card}>
          <div className={styles.cardIntro}><span className={styles.iconTile} aria-hidden="true"><Mail size={20} /></span><p className={styles.eyebrow}>Account recovery</p><h1 id="recovery-title">Reset your password</h1><p>Enter your account email. We will never reveal whether an address exists.</p></div>
          <div className={styles.adapterNote} role="note"><Info size={15} aria-hidden="true" /><span>{adapter.kind === "LOCAL_TEST" ? "Local test mode. A recovery code is available after this step." : "Recovery requests use the configured identity provider and a protected reset flow."}</span></div>
          <form className={styles.form} onSubmit={submit} noValidate>
            <div className={styles.field}>
              <label htmlFor="recovery-email">Email address</label>
              <div className={`${styles.control} ${(submitted && !validEmail) || emailInvalid ? styles.invalid : ""}`}>
                <Mail size={17} aria-hidden="true" />
                <input id="recovery-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@organization.org" value={email} aria-invalid={emailInvalid || (submitted && !validEmail)} onChange={(event) => setEmail(event.target.value)} />
              </div>
              {(submitted && !validEmail) || emailInvalid ? <small className={styles.errorText}>Enter a valid email address.</small> : null}
            </div>
            {status ? (
              <div className={`${styles.status} ${statusClass}`} role={status.kind === "error" ? "alert" : "status"}>
                <Info size={16} aria-hidden="true" />
                <span>{status.message}</span>
              </div>
            ) : null}
            <button className="button button-accent button-full" disabled={status?.kind === "loading"} type="submit">
              {status?.kind === "loading" ? (
                <><RefreshCw className={styles.spin} size={17} /> Preparing…</>
              ) : (
                <>Send recovery link <ArrowRight size={17} /></>
              )}
            </button>
          </form>
          <p className={styles.cardFoot}><Link href="/auth/sign-in"><ArrowRight className={styles.backIcon} size={15} aria-hidden="true" /> Back to sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
