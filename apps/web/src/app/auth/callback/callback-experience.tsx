"use client";

import Link from "next/link";
import { ArrowRight, Check, Home, Info, RefreshCw, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { getIdentityAdapter } from "@/lib/auth-adapter";
import styles from "../sign-in/sign-in-experience.module.css";

type State = { kind: "error" | "loading" | "success"; message: string };

export function CallbackExperience() {
  const router = useRouter();
  const routerRef = useRef(router);
  const adapterRef = useRef(getIdentityAdapter());
  const adapter = adapterRef.current;
  const [state, setState] = useState<State>({ kind: "loading", message: "Your sign-in provider is validating the session and access." });
  const redirectTimer = useRef<number | null>(null);

  const finishSignIn = useCallback(async () => {
    setState({ kind: "loading", message: "Your sign-in provider is validating the session and access." });
    try {
      const result = await adapter.refreshSession();
      if (!result.ok) throw new Error(result.message);
      setState({ kind: "success", message: "Your session is ready. Taking you to the workspace." });
      redirectTimer.current = window.setTimeout(() => routerRef.current.replace("/app"), 500);
    } catch (reason) {
      setState({ kind: "error", message: reason instanceof Error ? reason.message : "Sign-in could not be completed." });
    }
  }, [adapter]);

  useEffect(() => {
    void finishSignIn();
    return () => { if (redirectTimer.current !== null) window.clearTimeout(redirectTimer.current); };
  }, [finishSignIn]);

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
      <section className={styles.cardWrap} aria-labelledby="callback-title">
        <div className={styles.card}>
          <div className={styles.resultPanel} aria-live="polite">
            <span className={styles.iconTile} aria-hidden="true">{state.kind === "loading" ? <RefreshCw className={styles.spin} size={20} /> : state.kind === "success" ? <Check size={20} /> : <ShieldCheck size={20} />}</span>
            <p className={styles.eyebrow}>{state.kind === "error" ? "Sign-in needs attention" : "Federated sign-in"}</p>
            <h1 id="callback-title">{state.kind === "loading" ? "Securing your session…" : state.kind === "success" ? "You’re signed in." : "We could not finish signing you in."}</h1>
            <p>{state.message}</p>
            {state.kind === "error" ? (
              <>
                <div className={`${styles.status} ${styles["status-error"]}`} role="alert"><Info size={16} aria-hidden="true" /><span>Try the provider sign-in again, or use your email and password.</span></div>
                <div className={styles.actionStack}><button className="button button-accent button-full" onClick={() => void finishSignIn()} type="button">Try again <RefreshCw size={17} /></button><Link className={styles.secondaryAction} href="/auth/sign-in">Use email sign-in <ArrowRight size={15} aria-hidden="true" /></Link></div>
              </>
            ) : null}
            {state.kind === "loading" ? <div className={styles.status} role="status"><RefreshCw className={styles.spin} size={16} aria-hidden="true" /><span>Checking the provider response…</span></div> : null}
            {state.kind === "success" ? <div className={`${styles.status} ${styles["status-success"]}`} role="status"><Check size={16} aria-hidden="true" /><span>Access confirmed. Redirecting to your workspace.</span></div> : null}
            <Link className={styles.secondaryAction} href="/"><Home size={15} aria-hidden="true" /> Return to INSIPS home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
