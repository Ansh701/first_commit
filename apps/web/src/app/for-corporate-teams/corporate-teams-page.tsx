import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, FileSearch, ListChecks, Scale } from "lucide-react";
import type { PublishedContentPage } from "@insips/contracts";
import { PublicShell } from "@/components/public-shell";
import { StatePanel } from "@/components/state-panel";
import styles from "./corporate-teams-page.module.css";

export function CorporateTeamsPage({ page }: { page: PublishedContentPage | null }) {
  if (!page) {
    return <StatePanel action={{ href: "/", label: "Return home" }} description="This page is not currently published." kind="empty" title="Content unavailable" />;
  }

  const discovery = page.sections[0];
  const shortlist = page.sections[1];

  return (
    <PublicShell className="marketing-site">
      <main className={styles.route}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className="marketing-kicker">{page.kicker}</p>
            <h1>{page.title}</h1>
            <p className={styles.heroIntro}>{page.intro}</p>
            <div className={styles.heroActions}>
              <Link className="button button-accent button-large" href="/corporate/discover">
                Open corporate discovery <ArrowRight size={17} />
              </Link>
              <Link className={styles.quietLink} href="/how-trust-works">
                See how evidence is reviewed <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className={styles.heroAside}>
            <div className={styles.asideLabel}>A clearer team decision</div>
            <p>Move from a broad search to a shortlist your team can explain internally.</p>
            <div className={styles.signalRow}><span>Public context</span><strong>Specific</strong></div>
            <div className={styles.signalRow}><span>Internal notes</span><strong>Private</strong></div>
            <div className={styles.signalRow}><span>Review trail</span><strong>Visible</strong></div>
          </div>
        </section>

        <section className={styles.workflow} aria-labelledby="corporate-workflow-title">
          <div className={styles.sectionIntro}>
            <p className="marketing-kicker">The corporate workflow</p>
            <h2 id="corporate-workflow-title">A working session, not another directory.</h2>
            <p>Give the team a shared place to discover, compare, and prepare the next conversation without turning due diligence into a single score.</p>
          </div>
          <div className={styles.workflowSteps}>
            <article>
              <span className={styles.stepIcon}><FileSearch size={20} /></span>
              <span className={styles.stepNumber}>01</span>
              <h3>Discover with context</h3>
              <p>{discovery.body}</p>
            </article>
            <article>
              <span className={styles.stepIcon}><ListChecks size={20} /></span>
              <span className={styles.stepNumber}>02</span>
              <h3>Build a shortlist</h3>
              <p>{shortlist.body}</p>
            </article>
            <article>
              <span className={styles.stepIcon}><Scale size={20} /></span>
              <span className={styles.stepNumber}>03</span>
              <h3>Review the edges</h3>
              <p>Keep an organization&apos;s approved public context separate from the questions your team still needs to ask.</p>
            </article>
          </div>
        </section>

        <section className={styles.productSection} aria-labelledby="corporate-product-title">
          <div className={styles.productFrame}>
            <div className={styles.productTopline}><span>Corporate discovery</span><span>Evidence context</span></div>
            <div className={styles.productImage}>
              <Image src="/corporate-discovery-dark.png" alt="INSIPS corporate discovery workspace showing search and evidence context." fill sizes="(max-width: 760px) 100vw, 58vw" />
            </div>
          </div>
          <div className={styles.productCopy}>
            <p className="marketing-kicker">Make the next question easier</p>
            <h2 id="corporate-product-title">Compare what is known, then decide what to learn next.</h2>
            <ul>
              {["Search approved public organization context", "Keep internal shortlist notes with your team", "Move into matching only when the context is clear"].map((item) => <li key={item}><Check size={16} /> {item}</li>)}
            </ul>
            <Link className={styles.textLink} href="/corporate/discover">Explore organizations <ArrowRight size={15} /></Link>
          </div>
        </section>

        <section className={styles.cta}>
          <div><p className="marketing-kicker">Start with the trail</p><h2>Bring a better question to your next giving conversation.</h2></div>
          <Link className="button button-accent button-large" href="/corporate/discover">Open corporate discovery <ArrowRight size={17} /></Link>
        </section>
      </main>
    </PublicShell>
  );
}
