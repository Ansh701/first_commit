import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  FileSearch,
  ListChecks,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import type { PublishedContentPage } from "@insips/contracts";
import { PublicShell } from "@/components/public-shell";
import { StatePanel } from "@/components/state-panel";
import styles from "./csr-teams-page.module.css";

export function CsrTeamsPage({ page }: { page: PublishedContentPage | null }) {
  if (!page) {
    return (
      <StatePanel
        action={{ href: "/", label: "Return home" }}
        description="This page is not currently published."
        kind="empty"
        title="Content unavailable"
      />
    );
  }

  return (
    <PublicShell className="marketing-site">
      <main className={styles.route}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className="marketing-kicker">{page.kicker}</p>
            <h1>{page.title}</h1>
            <p className={styles.heroIntro}>{page.intro}</p>
            <div className={styles.heroActions}>
              <Link
                className="button button-accent button-large"
                href="/csr/discover"
              >
                Open CSR discovery <ArrowRight size={17} />
              </Link>
              <Link className={styles.quietLink} href="/how-trust-works">
                Follow the trust trail <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <aside className={styles.brief} aria-label="CSR decision brief">
            <div className={styles.briefHeader}>
              <span>Decision brief</span>
              <span className={styles.briefStatus}>
                <span /> Ready to review
              </span>
            </div>
            <p>
              Keep the public signal specific enough to start a useful internal
              conversation.
            </p>
            <div className={styles.briefRows}>
              <div>
                <span className={styles.briefIcon}>
                  <ShieldCheck size={15} />
                </span>
                <span>Claim scope</span>
                <strong>Defined</strong>
              </div>
              <div>
                <span className={styles.briefIcon}>
                  <CalendarDays size={15} />
                </span>
                <span>Review date</span>
                <strong>Visible</strong>
              </div>
              <div>
                <span className={styles.briefIcon}>
                  <FileSearch size={15} />
                </span>
                <span>Source context</span>
                <strong>Linked</strong>
              </div>
            </div>
            <div className={styles.briefFooter}>
              <span>Next question</span>
              <strong>What should we verify next?</strong>
            </div>
          </aside>
        </section>

        <section
          className={styles.workflow}
          aria-labelledby="csr-workflow-title"
        >
          <div className={styles.sectionIntro}>
            <p className="marketing-kicker">A practical review rhythm</p>
            <h2 id="csr-workflow-title">
              Move from signal to question without losing the trail.
            </h2>
            <p>
              CSR work needs enough context to compare responsibly, and enough
              restraint to leave room for your own due diligence.
            </p>
          </div>
          <div className={styles.workflowList}>
            {page.sections.map((section, index) => {
              const Icon =
                [FileSearch, ListChecks, MessageSquareText][index] ??
                MessageSquareText;
              return (
                <article key={section.title} className={styles.workflowItem}>
                  <div className={styles.workflowMeta}>
                    <span className={styles.workflowIcon}>
                      <Icon size={18} />
                    </span>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <h3>{section.title}</h3>
                    <p>{section.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section
          className={styles.productSection}
          aria-labelledby="csr-product-title"
        >
          <div className={styles.productFrame}>
            <div className={styles.productTopline}>
              <span>CSR discovery</span>
              <span>Approved public context</span>
            </div>
            <div className={styles.productImage}>
              <Image
                src="/corporate-discovery-dark.png"
                alt="INSIPS discovery workspace showing organization search and evidence context."
                fill
                sizes="(max-width: 760px) 100vw, 58vw"
              />
            </div>
          </div>
          <div className={styles.productCopy}>
            <p className="marketing-kicker">Keep the source close</p>
            <h2 id="csr-product-title">
              Bring a clearer brief to the people who make the decision.
            </h2>
            <ul>
              <li>
                <Check size={16} /> Compare specific indicators instead of a
                universal score
              </li>
              <li>
                <Check size={16} /> Keep approved public context separate from
                internal questions
              </li>
              <li>
                <Check size={16} /> Carry the next due-diligence step into the
                conversation
              </li>
            </ul>
            <Link className={styles.textLink} href="/csr/discover">
              Explore CSR discovery <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <section className={styles.guardrail}>
          <div>
            <p className="marketing-kicker">The boundary matters</p>
            <h2>
              A reviewed signal starts the conversation. It never replaces it.
            </h2>
          </div>
          <div className={styles.guardrailNote}>
            <ShieldCheck size={18} />
            <p>
              INSIPS shows what a specific indicator means, when it was
              reviewed, and what it does not say. Your team keeps the final
              decision and broader due diligence.
            </p>
          </div>
        </section>

        <section className={styles.cta}>
          <div>
            <p className="marketing-kicker">Start with a better question</p>
            <h2>Find organizations your team can understand and discuss.</h2>
          </div>
          <Link
            className="button button-accent button-large"
            href="/csr/discover"
          >
            Open CSR discovery <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    </PublicShell>
  );
}
