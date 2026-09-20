"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Info, LockKeyhole, Mail, RefreshCw } from "lucide-react";
import { FormEvent, KeyboardEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { getIdentityAdapter, type AuthProviderName } from "@/lib/auth-adapter";
import styles from "./sign-in-experience.module.css";

type Status = { kind: "error" | "success" | "loading"; message: string } | null;

export function SignInExperience() {
  const router = useRouter();
  const adapter = getIdentityAdapter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const emailError = emailTouched && !emailValid;
  const passwordError = passwordTouched && !password;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!emailValid || !password) {
      setStatus({ kind: "error", message: "Enter your email and password to continue." });
      return;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setStatus({ kind: "error", message: "You appear to be offline. Reconnect and try again." });
      return;
    }
    setStatus({ kind: "loading", message: "Checking your account…" });
    try {
      const result = await adapter.signIn({ email: email.trim().toLowerCase(), password });
      setStatus({ kind: result.ok ? "success" : "error", message: result.message });
      if (result.ok && result.next === "SIGNED_IN") router.push("/app");
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Sign-in could not be completed." });
    }
  }

  async function signInWithProvider(provider: AuthProviderName) {
    setStatus({ kind: "loading", message: `Opening ${provider} sign-in…` });
    try {
      await adapter.signInWithProvider(provider);
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Federated sign-in is unavailable." });
    }
  }

  function handleCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    const nativeEvent = event.nativeEvent as unknown as KeyboardEvent & { capsLock?: boolean };
    setCapsLock(event.key === "CapsLock" ? !capsLock : event.getModifierState("CapsLock") || nativeEvent.capsLock === true);
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
      <section className={styles.cardWrap} aria-labelledby="sign-in-title">
        <div className={styles.card}>
          <div className={styles.cardIntro}>
            <span className={styles.iconTile} aria-hidden="true"><LockKeyhole size={20} /></span>
            <p className={styles.eyebrow}>Welcome back</p>
            <h1 id="sign-in-title">Sign in to INSIPS</h1>
            <p>Return to your workspace with a clear, protected session.</p>
          </div>
          <div className={styles.adapterNote} role="note"><Info size={15} aria-hidden="true" /><span>{adapter.kind === "LOCAL_TEST" ? "Local test mode. Provider buttons stay connected to the real adapter and will report when credentials are unavailable." : "Protected account access with secure session handling."}</span></div>
          <div className={styles.providers} aria-label="Federated sign in">
            <button className={styles.providerButton} disabled={status?.kind === "loading"} onClick={() => void signInWithProvider("Google")} type="button" aria-label="Continue with Google"><GoogleIcon /><span>Continue with Google</span></button>
            <button className={styles.providerButton} disabled={status?.kind === "loading"} onClick={() => void signInWithProvider("Facebook")} type="button" aria-label="Continue with Facebook"><FacebookIcon /><span>Continue with Facebook</span></button>
            <button className={styles.providerButton} disabled={status?.kind === "loading"} onClick={() => void signInWithProvider("Apple")} type="button" aria-label="Continue with Apple"><AppleIcon /><span>Continue with Apple</span></button>
          </div>
          <div className={styles.divider}><span>or continue with email</span></div>
          <form className={styles.form} onSubmit={submit} noValidate>
            <div className={styles.field}>
              <label htmlFor="sign-in-email">Email address</label>
              <div className={`${styles.control} ${emailError ? styles.invalid : ""}`}>
                <Mail size={17} aria-hidden="true" />
                <input id="sign-in-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@organization.org" value={email} onBlur={() => setEmailTouched(true)} onChange={(event) => setEmail(event.target.value)} aria-invalid={emailError} aria-describedby={emailError ? "sign-in-email-error" : undefined} />
              </div>
              {emailError ? <small className={styles.errorText} id="sign-in-email-error">Enter a valid email address.</small> : null}
            </div>
            <div className={styles.field}>
              <div className={styles.labelRow}><label htmlFor="sign-in-password">Password</label><Link href="/auth/forgot-password">Forgot password?</Link></div>
              <div className={`${styles.control} ${passwordError ? styles.invalid : ""}`}>
                <LockKeyhole size={17} aria-hidden="true" />
                <input id="sign-in-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Your password" value={password} onBlur={() => setPasswordTouched(true)} onChange={(event) => setPassword(event.target.value)} onKeyUp={handleCapsLock} aria-invalid={passwordError} aria-describedby={capsLock ? "caps-lock-warning" : passwordError ? "sign-in-password-error" : undefined} />
                <button className={styles.passwordToggle} type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
              {capsLock ? <small className={styles.warningText} id="caps-lock-warning">Caps Lock is on.</small> : null}
              {passwordError ? <small className={styles.errorText} id="sign-in-password-error">Enter your password.</small> : null}
            </div>
            {status ? <div className={`${styles.status} ${styles[`status-${status.kind}`]}`} role={status.kind === "error" ? "alert" : "status"}><Info size={16} aria-hidden="true" /><span>{status.message}</span></div> : null}
            <button className="button button-accent button-full" disabled={status?.kind === "loading"} type="submit">{status?.kind === "loading" ? <><RefreshCw className={styles.spin} size={17} /> Checking…</> : <>Sign in <ArrowRight size={17} /></>}</button>
          </form>
          <p className={styles.cardFoot}>New to INSIPS? <Link href="/auth/sign-up">Request an account</Link></p>
          <Link className={styles.demoLink} href="/demo">Looking for the synthetic demo? Choose a role <ArrowRight size={15} /></Link>
        </div>
      </section>
    </main>
  );
}

export function GoogleIcon() { return <svg className={styles.providerIcon} viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.27c0-.78-.07-1.53-.22-2.25H12v4.26h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.4Z"/><path fill="#34A853" d="M12 21.75c2.63 0 4.83-.87 6.44-2.36l-3.14-2.45c-.87.58-1.98.92-3.3.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.76 9.76 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M6.53 13.83a5.85 5.85 0 0 1 0-3.66V7.64H3.28a9.76 9.76 0 0 0 0 8.72l3.25-2.53Z"/><path fill="#EA4335" d="M12 6.14c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.82 3.25 14.63 2.25 12 2.25a9.73 9.73 0 0 0-8.72 5.39l3.25 2.53C7.3 7.86 9.46 6.14 12 6.14Z"/></svg>; }
export function FacebookIcon() { return <svg className={styles.providerIcon} viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M22 12.07C22 6.51 17.52 2 12 2S2 6.51 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.54V9.86c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.75 8.44-4.91 8.44-9.93Z"/></svg>; }
export function AppleIcon() { return <svg className={styles.providerIcon} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.77 12.72c.02 2.35 2.06 3.13 2.08 3.14-.02.05-.33 1.15-1.08 2.28-.65.98-1.32 1.96-2.38 1.98-1.04.02-1.38-.64-2.57-.64-1.18 0-1.55.62-2.54.66-1.02.04-1.8-1.07-2.46-2.05-1.34-1.99-2.36-5.63-.99-8.08.68-1.22 1.9-1.99 3.22-2.01 1.01-.02 1.97.68 2.57.68.61 0 1.75-.84 2.95-.72.5.02 1.89.2 2.78 1.52-.07.04-1.66.97-1.64 3.24ZM14.84 4.74c.54-.66.91-1.57.81-2.49-.78.03-1.72.52-2.28 1.18-.5.58-.94 1.51-.82 2.39.87.07 1.76-.44 2.29-1.08Z"/></svg>; }
