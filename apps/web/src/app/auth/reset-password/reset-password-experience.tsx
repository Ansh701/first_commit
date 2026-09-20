"use client";

import Link from "next/link";
import { ArrowRight, Check, Info, KeyRound, LockKeyhole, RefreshCw } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { getIdentityAdapter } from "@/lib/auth-adapter";
import styles from "../sign-in/sign-in-experience.module.css";

type Status = { kind: "error" | "loading" | "success"; message: string } | null;

export function ResetPasswordExperience() {
  const adapter = getIdentityAdapter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [completed, setCompleted] = useState(false);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const validCode = /^\d{6}$/.test(code);
  const rules = [
    ["12+ characters", password.length >= 12],
    ["Upper and lowercase", /[a-z]/.test(password) && /[A-Z]/.test(password)],
    ["Number and symbol", /\d/.test(password) && /[^A-Za-z0-9]/.test(password)],
  ] as const;
  const validPassword = rules.every(([, valid]) => valid);
  const confirmationError = Boolean(confirmation) && confirmation !== password;
  const emailInvalid = email.length > 0 && !validEmail;
  const codeInvalid = code.length > 0 && !validCode;

  useEffect(() => {
    setEmail(window.sessionStorage.getItem("insips-reset-email") ?? "");
  }, []);

  function handleCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState("CapsLock"));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validEmail || !validCode || !validPassword || confirmation !== password) {
      setStatus({ kind: "error", message: "Complete the email, six-digit code, and password checks before continuing." });
      return;
    }
    setStatus({ kind: "loading", message: "Updating your password…" });
    try {
      const result = await adapter.resetPassword({ email: email.trim().toLowerCase(), code, password });
      setStatus({ kind: result.ok ? "success" : "error", message: result.message });
      if (result.ok) setCompleted(true);
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Password reset could not be completed." });
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
      <section className={styles.cardWrap} aria-labelledby="reset-title">
        <div className={styles.card}>
          {completed ? (
            <div className={styles.resultPanel} role="status" aria-live="polite">
              <span className={styles.iconTile} aria-hidden="true"><Check size={20} /></span>
              <p className={styles.eyebrow}>Password updated</p>
              <h1 id="reset-title">Your account is secure again.</h1>
              <p>Your password was changed for the local test account. Use the new password the next time you sign in.</p>
              <Link className="button button-accent button-full" href="/auth/sign-in">Continue to sign in <ArrowRight size={17} /></Link>
              <Link className={styles.cardFoot} href="/">Return to INSIPS</Link>
            </div>
          ) : (
            <>
              <div className={styles.cardIntro}>
                <span className={styles.iconTile} aria-hidden="true"><KeyRound size={20} /></span>
                <p className={styles.eyebrow}>Choose a new password</p>
                <h1 id="reset-title">Secure your account</h1>
                <p>Enter the six-digit recovery code and choose a password you do not use elsewhere.</p>
              </div>
              <div className={styles.adapterNote} role="note"><Info size={15} aria-hidden="true" /><span>{adapter.kind === "LOCAL_TEST" ? "Local test mode. Use recovery code 135790 after requesting a reset." : "The code was sent by the configured identity provider."}</span></div>
              <form className={styles.form} onSubmit={submit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="reset-email">Email address</label>
                  <div className={`${styles.control} ${emailInvalid ? styles.invalid : ""}`}><span aria-hidden="true">@</span><input id="reset-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@organization.org" value={email} aria-invalid={emailInvalid} onChange={(event) => setEmail(event.target.value)} /></div>
                  {emailInvalid ? <small className={styles.errorText}>Enter a valid email address.</small> : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="reset-code">Recovery code</label>
                  <div className={`${styles.control} ${codeInvalid ? styles.invalid : ""}`}><KeyRound size={17} aria-hidden="true" /><input id="reset-code" name="code" autoComplete="one-time-code" inputMode="numeric" maxLength={6} placeholder="000000" value={code} aria-invalid={codeInvalid} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} /></div>
                  <small>Six digits · the code expires after the recovery window.</small>
                  {codeInvalid ? <small className={styles.errorText}>Enter all six digits from your recovery email.</small> : null}
                </div>
                <div className={styles.field}>
                  <label htmlFor="reset-password">New password</label>
                  <div className={styles.control}><LockKeyhole size={17} aria-hidden="true" /><input id="reset-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 12 characters" value={password} onKeyDown={handleCapsLock} onKeyUp={handleCapsLock} onChange={(event) => setPassword(event.target.value)} /><button className={styles.passwordToggle} type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></div>
                  {capsLock ? <small className={styles.warningText} role="status">Caps Lock is on.</small> : null}
                  <ul className={styles.requirements} aria-label="Password requirements">{rules.map(([label, valid]) => <li className={`${styles.requirement} ${valid ? styles.requirementMet : ""}`} key={label}>{valid ? <Check size={13} aria-hidden="true" /> : <span aria-hidden="true">○</span>} {label}</li>)}</ul>
                </div>
                <div className={styles.field}>
                  <label htmlFor="reset-confirm">Confirm new password</label>
                  <div className={`${styles.control} ${confirmationError ? styles.invalid : ""}`}><LockKeyhole size={17} aria-hidden="true" /><input id="reset-confirm" name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
                  {confirmationError ? <small className={styles.errorText}>Passwords do not match.</small> : null}
                </div>
                {status ? <div className={`${styles.status} ${styles[`status-${status.kind}`]}`} role={status.kind === "error" ? "alert" : "status"}><Info size={16} aria-hidden="true" /><span>{status.message}</span></div> : null}
                <button className="button button-accent button-full" disabled={status?.kind === "loading"} type="submit">{status?.kind === "loading" ? <><RefreshCw className={styles.spin} size={17} /> Updating…</> : <>Update password <ArrowRight size={17} /></>}</button>
              </form>
              <p className={styles.cardFoot}><Link href="/auth/sign-in"><ArrowRight className={styles.backIcon} size={15} aria-hidden="true" /> Back to sign in</Link></p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
