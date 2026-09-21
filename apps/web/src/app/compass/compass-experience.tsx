"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check, FileSearch, HelpCircle, Pencil, ShieldAlert, X } from "lucide-react";
import type { CandidateClaim, PublishedContentPage } from "@insips/contracts";
import { PublicShell } from "@/components/public-shell";
import { StatePanel } from "@/components/state-panel";
import styles from "./compass-experience.module.css";

type Decision = "pending" | "accepted" | "dismissed";

export function CompassExperience({ page, claims }: { page: PublishedContentPage | null; claims: CandidateClaim[] }) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>(() => Object.fromEntries(claims.map((claim) => [claim.id, "pending"])));
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState(claims[0]?.id ?? "");
  const activeClaim = claims.find((claim) => claim.id === activeId) ?? claims[0];
  const resolvedCount = useMemo(() => Object.values(decisions).filter((decision) => decision !== "pending").length, [decisions]);

  if (!page) return <StatePanel action={{ href: "/", label: "Return home" }} description="This page is not currently published." kind="empty" title="Content unavailable" />;

  const updateDecision = (claim: CandidateClaim, decision: Decision) => setDecisions((current) => ({ ...current, [claim.id]: decision }));

  return (
    <PublicShell className="marketing-site">
      <main className={styles.route}>
        <section className={styles.hero}>
          <div>
            <p className="marketing-kicker">{page.kicker}</p>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
          </div>
          <div className={styles.heroNote}><ShieldAlert size={18} /><span>Compass prepares a candidate. A person still owns the decision.</span></div>
        </section>

        <section className={styles.workbench} aria-labelledby="compass-workbench-title">
          <div className={styles.workbenchHeader}><div><p className="marketing-kicker">Synthetic evidence workbench</p><h2 id="compass-workbench-title">Review one claim at a time.</h2></div><span className={styles.counter}>{resolvedCount}/{claims.length} resolved</span></div>
          <div className={styles.workbenchGrid}>
            <nav className={styles.claimList} aria-label="Compass candidate claims">
              {claims.map((claim) => <button className={`${styles.claimTab} ${claim.id === activeClaim?.id ? styles.active : ""}`} key={claim.id} onClick={() => setActiveId(claim.id)} type="button"><span>{claim.label}</span><small>{decisions[claim.id] === "pending" ? "Needs input" : decisions[claim.id]}</small></button>)}
            </nav>
            {activeClaim ? <ClaimPanel claim={activeClaim} decision={decisions[activeClaim.id]} editing={editingId === activeClaim.id} editedValue={editedValues[activeClaim.id] ?? activeClaim.value} onAccept={() => updateDecision(activeClaim, "accepted")} onDismiss={() => updateDecision(activeClaim, "dismissed")} onEdit={() => setEditingId(activeClaim.id)} onChange={(value) => setEditedValues((current) => ({ ...current, [activeClaim.id]: value }))} onSave={() => { setEditingId(null); updateDecision(activeClaim, "accepted"); }} /> : null}
          </div>
          <div className={styles.disclaimer}><HelpCircle size={16} /><span>Confidence describes the source match. It does not certify the organization, approve the claim, or publish anything.</span></div>
        </section>

        <section className={styles.limits} aria-labelledby="compass-limits-title">
          <div><p className="marketing-kicker">Human control stays visible</p><h2 id="compass-limits-title">Useful assistance needs clear limits.</h2></div>
          <div className={styles.limitGrid}><article><strong>What Compass can do</strong><p>{page.sections[0]?.body}</p></article><article><strong>What Compass cannot do</strong><p>{page.sections[1]?.body}</p></article><article><strong>When evidence is missing</strong><p>Leave the candidate unresolved, find the supporting source, or dismiss it. Do not fill the gap with an assumption.</p></article></div>
        </section>

        <section className={styles.cta}><div><p className="marketing-kicker">Keep the source close</p><h2>See the complete evidence-to-review workflow.</h2></div><Link className="button button-accent button-large" href="/how-trust-works">How trust works <ArrowRight size={17} /></Link></section>
      </main>
    </PublicShell>
  );
}

function ClaimPanel({ claim, decision, editing, editedValue, onAccept, onDismiss, onEdit, onChange, onSave }: { claim: CandidateClaim; decision: Decision; editing: boolean; editedValue: string; onAccept: () => void; onDismiss: () => void; onEdit: () => void; onChange: (value: string) => void; onSave: () => void }) {
  return <div className={styles.claimPanel}>
    <div className={styles.panelTop}><span className={styles.sourceLabel}><FileSearch size={15} /> Source reference</span><span className={styles.pageTag}>Synthetic evidence · page {claim.source.page}</span></div>
    <div className={styles.sourceExcerpt}><span>Excerpt available to the reviewer</span><strong>{claim.source.snippet}</strong><small>Private source context is shown here only as a synthetic demonstration.</small></div>
    <div className={styles.candidateHeader}><div><p className="marketing-kicker">Candidate field</p><h3>{claim.label}</h3></div><span className={`${styles.confidence} ${claim.confidence === "HIGH" ? styles.high : ""}`}>{claim.confidence} match</span></div>
    {editing ? <div className={styles.editRow}><label htmlFor={`claim-${claim.id}`}>Edit candidate value</label><input id={`claim-${claim.id}`} onChange={(event) => onChange(event.target.value)} value={editedValue} /><button className="button button-accent" onClick={onSave} type="button"><Check size={15} /> Save as candidate</button></div> : <div className={styles.valueRow}><strong>{editedValue}</strong><button className={styles.iconAction} aria-label={`Edit ${claim.label}`} onClick={onEdit} type="button"><Pencil size={15} /></button></div>}
    <p className={styles.confidenceNote}>{claim.confidenceNote}</p>
    <div className={styles.panelActions}><button className="button button-accent" onClick={onAccept} type="button"><Check size={16} /> Accept candidate</button><button className="button button-secondary" onClick={onDismiss} type="button"><X size={16} /> Dismiss</button><span role="status" className={styles.decisionStatus}>{decision === "pending" ? "Human confirmation required" : `Candidate ${decision}`}</span></div>
  </div>;
}
