"use client";

import Link from "next/link";
import { ArrowRight, Check, Eye, EyeOff, Info, LockKeyhole, Mail, RefreshCw } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { getIdentityAdapter, type AuthProviderName } from "@/lib/auth-adapter";
import { AppleIcon, FacebookIcon, GoogleIcon } from "../sign-in/sign-in-experience";
import styles from "../sign-in/sign-in-experience.module.css";

type Status = { kind: "error" | "success" | "loading"; message: string } | null;

export function SignUpExperience() {
  const router = useRouter();
  const adapter = getIdentityAdapter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const rules = [
    ["12+ characters", password.length >= 12],
    ["Upper and lowercase", /[a-z]/.test(password) && /[A-Z]/.test(password)],
    ["Number and symbol", /\d/.test(password) && /[^A-Za-z0-9]/.test(password)],
  ] as const;
  const validPassword = rules.every(([, valid]) => valid);
  const confirmationError = Boolean(confirmation) && confirmation !== password;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !validEmail || !validPassword || confirmation !== password) {
      setStatus({ kind: "error", message: "Complete the fields and password checks before creating your account." });
      return;
    }
    setStatus({ kind: "loading", message: "Creating your account…" });
    try {
      const result = await adapter.signUp({ name: name.trim(), email: email.trim().toLowerCase(), password });
      setStatus({ kind: result.ok ? "success" : "error", message: result.message });
      if (result.ok && result.next === "VERIFY_EMAIL") {
        window.sessionStorage.setItem("insips-verification-email", email.trim().toLowerCase());
        router.push("/auth/verify-email");
      }
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Account creation could not be completed." });
    }
  }

  async function providerSignUp(provider: AuthProviderName) {
    setStatus({ kind: "loading", message: `Opening ${provider} sign-up…` });
    try { await adapter.signInWithProvider(provider); } catch (error) { setStatus({ kind: "error", message: error instanceof Error ? error.message : "Federated sign-up is unavailable." }); }
  }

  return (
    <main className={styles.page} id="main-content">
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.topbar}><BrandMark /><div className={styles.topbarActions}><Link className={styles.backLink} href="/"><ArrowRight className={styles.backIcon} size={15} aria-hidden="true" /> Back to INSIPS</Link><ThemeToggle /></div></div>
      <section className={styles.cardWrap} aria-labelledby="sign-up-title">
        <div className={styles.card}>
          <div className={styles.cardIntro}><span className={styles.iconTile} aria-hidden="true"><LockKeyhole size={20} /></span><p className={styles.eyebrow}>Request access</p><h1 id="sign-up-title">Create your INSIPS account</h1><p>Prepare a workspace with clear ownership, evidence boundaries, and human review.</p></div>
          <div className={styles.adapterNote} role="note"><Info size={15} aria-hidden="true" /><span>{adapter.kind === "LOCAL_TEST" ? "Local test mode. Verification code 246810 is available after this step." : "Your access request is protected by the configured identity provider."}</span></div>
          <div className={styles.providers} aria-label="Federated sign up">
            <button className={styles.providerButton} disabled={status?.kind === "loading"} onClick={() => void providerSignUp("Google")} type="button" aria-label="Continue with Google"><GoogleIcon /><span>Continue with Google</span></button>
            <button className={styles.providerButton} disabled={status?.kind === "loading"} onClick={() => void providerSignUp("Facebook")} type="button" aria-label="Continue with Facebook"><FacebookIcon /><span>Continue with Facebook</span></button>
            <button className={styles.providerButton} disabled={status?.kind === "loading"} onClick={() => void providerSignUp("Apple")} type="button" aria-label="Continue with Apple"><AppleIcon /><span>Continue with Apple</span></button>
          </div>
          <div className={styles.divider}><span>or continue with email</span></div>
          <form className={styles.form} onSubmit={submit} noValidate>
            <div className={styles.field}><label htmlFor="sign-up-name">Full name</label><div className={styles.control}><input id="sign-up-name" name="name" autoComplete="name" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} /></div></div>
            <div className={styles.field}><label htmlFor="sign-up-email">Email address</label><div className={`${styles.control} ${email.length > 0 && !validEmail ? styles.invalid : ""}`}><Mail size={17} aria-hidden="true" /><input id="sign-up-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@organization.org" value={email} onChange={(event) => setEmail(event.target.value)} /></div>{email.length > 0 && !validEmail ? <small className={styles.errorText}>Enter a valid email address.</small> : null}</div>
            <div className={styles.field}><label htmlFor="sign-up-password">Password</label><div className={styles.control}><LockKeyhole size={17} aria-hidden="true" /><input id="sign-up-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 12 characters" value={password} onChange={(event) => setPassword(event.target.value)} /><button className={styles.passwordToggle} type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><ul className={styles.requirements} aria-label="Password requirements">{rules.map(([label, valid]) => <li className={`${styles.requirement} ${valid ? styles.requirementMet : ""}`} key={label}>{valid ? <Check size={13} aria-hidden="true" /> : <span aria-hidden="true">○</span>} {label}</li>)}</ul></div>
            <div className={styles.field}><label htmlFor="sign-up-confirm">Confirm password</label><div className={`${styles.control} ${confirmationError ? styles.invalid : ""}`}><LockKeyhole size={17} aria-hidden="true" /><input id="sign-up-confirm" name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>{confirmationError ? <small className={styles.errorText}>Passwords do not match.</small> : null}</div>
            {status ? <div className={`${styles.status} ${styles[`status-${status.kind}`]}`} role={status.kind === "error" ? "alert" : "status"}><Info size={16} aria-hidden="true" /><span>{status.message}</span></div> : null}
            <button className="button button-accent button-full" disabled={status?.kind === "loading"} type="submit">{status?.kind === "loading" ? <><RefreshCw className={styles.spin} size={17} /> Creating…</> : <>Create account <ArrowRight size={17} /></>}</button>
          </form>
          <p className={styles.cardFoot}>Already have access? <Link href="/auth/sign-in">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
