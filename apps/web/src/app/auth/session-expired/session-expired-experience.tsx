import Link from "next/link";
import { ArrowRight, Clock3, Home, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "../sign-in/sign-in-experience.module.css";

export function SessionExpiredExperience() {
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
      <section className={styles.cardWrap} aria-labelledby="expired-title">
        <div className={styles.card}>
          <div className={styles.resultPanel}>
            <span className={styles.iconTile} aria-hidden="true"><Clock3 size={20} /></span>
            <p className={styles.eyebrow}>Session protected</p>
            <h1 id="expired-title">Your session has expired.</h1>
            <p>We signed this browser out after inactivity. Sign in again to continue where you left off.</p>
            <div className={styles.adapterNote} role="note"><ShieldCheck size={16} aria-hidden="true" /><span>No private evidence was exposed and no action was submitted.</span></div>
            <Link className="button button-accent button-full" href="/auth/sign-in">Return to sign in <ArrowRight size={17} /></Link>
            <Link className={styles.secondaryAction} href="/"><Home size={15} aria-hidden="true" /> Return to INSIPS home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
