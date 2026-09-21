import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, FileCheck2, Globe2, UploadCloud } from "lucide-react";
import type { PublishedContentPage } from "@insips/contracts";
import { PublicShell } from "@/components/public-shell";
import { StatePanel } from "@/components/state-panel";
import styles from "./organizations-page.module.css";

export function OrganizationsPage({ page }: { page: PublishedContentPage | null }) {
  if (!page) return <StatePanel action={{ href: "/", label: "Return home" }} description="This page is not currently published." kind="empty" title="Content unavailable" />;
  const [profile, compass, publicProfile] = page.sections;
  return (
    <PublicShell className="marketing-site">
      <main className={styles.route}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className="marketing-kicker">{page.kicker}</p>
            <h1>{page.title}</h1>
            <p className={styles.intro}>{page.intro}</p>
            <div className={styles.actions}>
              <Link className="button button-accent button-large" href="/app/onboarding">Start onboarding <ArrowRight size={17} /></Link>
              <Link className={styles.link} href="/how-trust-works">Read the evidence path <ArrowRight size={15} /></Link>
            </div>
          </div>
          <div className={styles.heroDiagram} aria-label="Organization evidence path">
            <div className={styles.diagramLabel}>Your evidence path</div>
            <div className={styles.diagramLine}><span className={styles.diagramDot} /><span>Prepare</span><strong>Private workspace</strong></div>
            <div className={styles.diagramLine}><span className={styles.diagramDot} /><span>Confirm</span><strong>Human-owned facts</strong></div>
            <div className={styles.diagramLine}><span className={styles.diagramDot} /><span>Project</span><strong>Approved public view</strong></div>
          </div>
        </section>

        <section className={styles.stages} aria-labelledby="organization-stages-title">
          <div className={styles.stageIntro}>
            <p className="marketing-kicker">A calmer way to get ready</p>
            <h2 id="organization-stages-title">One profile, three deliberate handoffs.</h2>
          </div>
          <div className={styles.stageGrid}>
            <article><span className={styles.icon}><UploadCloud size={20} /></span><span className={styles.number}>01</span><h3>Prepare the profile</h3><p>{profile.body}</p>{profile.points ? <ul>{profile.points.map((point) => <li key={point}><Check size={15} />{point}</li>)}</ul> : null}</article>
            <article><span className={styles.icon}><FileCheck2 size={20} /></span><span className={styles.number}>02</span><h3>Keep control of candidates</h3><p>{compass.body}</p>{compass.points ? <ul>{compass.points.map((point) => <li key={point}><Check size={15} />{point}</li>)}</ul> : null}</article>
            <article><span className={styles.icon}><Globe2 size={20} /></span><span className={styles.number}>03</span><h3>Share what is approved</h3><p>{publicProfile.body}</p></article>
          </div>
        </section>

        <section className={styles.preview} aria-labelledby="organization-preview-title">
          <div className={styles.previewImage}><Image src="/admin-org-marketing-1440.png" alt="INSIPS organization workspace showing evidence and review context." fill sizes="(max-width: 760px) 100vw, 58vw" /></div>
          <div className={styles.previewCopy}>
            <p className="marketing-kicker">Your work stays legible</p>
            <h2 id="organization-preview-title">See what is ready, what needs attention, and what can be shared.</h2>
            <p>Keep private evidence, candidate fields, reviewer questions, and approved public context in separate places so the next action is clear.</p>
            <Link className={styles.link} href="/app/onboarding">Open the onboarding demo <ArrowRight size={15} /></Link>
          </div>
        </section>

        <section className={styles.cta}><div><p className="marketing-kicker">Start with what you have</p><h2>Prepare once. Explain every fact.</h2></div><Link className="button button-accent button-large" href="/app/onboarding">Start onboarding <ArrowRight size={17} /></Link></section>
      </main>
    </PublicShell>
  );
}
