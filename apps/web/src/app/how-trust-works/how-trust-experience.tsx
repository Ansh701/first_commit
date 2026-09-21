"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, CircleUserRound, FileSearch, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import type { PublishedContentPage } from "@insips/contracts";
import { PublicShell } from "@/components/public-shell";
import { StatePanel } from "@/components/state-panel";
import styles from "./how-trust-experience.module.css";

const stageIcons = [LockKeyhole, ShieldCheck, FileSearch, Sparkles, CircleUserRound, Check];
const owners = ["Organization", "Safety boundary", "Evidence service", "Organization", "Independent reviewer", "Public reader"];

export function HowTrustExperience({ page }: { page: PublishedContentPage | null }) {
  const [activeIndex, setActiveIndex] = useState(3);
  if (!page) return <StatePanel action={{ href: "/", label: "Return home" }} description="This page is not currently published." kind="empty" title="Content unavailable" />;
  const active = page.sections[activeIndex] ?? page.sections[0];
  const ActiveIcon = stageIcons[activeIndex] ?? FileSearch;
  return <PublicShell className="marketing-site"><main className={styles.route}>
    <section className={styles.hero}><div><p className="marketing-kicker">{page.kicker}</p><h1>{page.title}</h1><p>{page.intro}</p></div><div className={styles.heroRule}><span>One accountable trail</span><strong>Private evidence → human decision → approved projection</strong></div></section>
    <section className={styles.workbench} aria-labelledby="trust-workbench-title"><div className={styles.workbenchHeader}><div><p className="marketing-kicker">Interactive journey</p><h2 id="trust-workbench-title">Follow the handoff.</h2></div><span className={styles.current}>Stage {String(activeIndex + 1).padStart(2, "0")} of {page.sections.length}</span></div><div className={styles.workbenchGrid}><nav className={styles.stageNav} aria-label="Trust workflow stages">{page.sections.map((section, index) => { const Icon = stageIcons[index] ?? FileSearch; return <button className={index === activeIndex ? styles.active : ""} key={section.title} onClick={() => setActiveIndex(index)} type="button"><span><Icon size={16} /></span><small>{String(index + 1).padStart(2, "0")}</small><strong>{section.title}</strong>{index < activeIndex ? <Check className={styles.completed} size={14} /> : null}</button>; })}</nav><div className={styles.stagePanel} role="tabpanel"><div className={styles.stagePanelHeader}><div><span className="marketing-kicker">Current handoff</span><h3>{active.title}</h3></div><span className={styles.owner}>Owner · {owners[activeIndex] ?? "Workflow participant"}</span></div><p>{active.body}</p><div className={styles.boundary}><ActiveIcon size={18} /><div><strong>{activeIndex >= 5 ? "Public projection" : "What stays bounded"}</strong><span>{activeIndex >= 5 ? "Only the approved current version is visible outside the workflow." : activeIndex === 4 ? "The reviewer records a decision against the confirmed value and source context." : "The underlying document and unapproved candidate remain restricted."}</span></div></div></div></div><p className={styles.workbenchNote}><ShieldCheck size={15} /> Selecting a stage changes the explanation only; it never approves or publishes a claim.</p></section>
    <section className={styles.principles}><div><p className="marketing-kicker">Three guardrails</p><h2>The path is useful because the boundaries are visible.</h2></div><div className={styles.principleGrid}><article><strong>Evidence stays private</strong><p>Public context is a projection, not a document viewer.</p></article><article><strong>People own decisions</strong><p>Compass can assist, but organizations and reviewers remain accountable.</p></article><article><strong>Approval has scope</strong><p>A decision belongs to a claim version, meaning, and review date.</p></article></div></section>
    <section className={styles.cta}><div><p className="marketing-kicker">See it in context</p><h2>Open the product demo and follow one claim through the trail.</h2></div><Link className="button button-accent button-large" href="/demo">Open the product demo <ArrowRight size={17} /></Link></section>
  </main></PublicShell>;
}
