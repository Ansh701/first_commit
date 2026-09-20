"use client";

import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Edit3,
  FileText,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { StatusPill } from "@/components/status-pill";
import { evidencePipelineStages } from "@/lib/workspace-fixtures";

export default function EvidenceDetailPage() {
  const { claims, suggestions, decideSuggestion } = useDemo();
  const resolved = Object.values(suggestions).filter(
    (value) => value !== "pending",
  ).length;
  const accepted = Object.values(suggestions).filter(
    (value) => value === "accepted",
  ).length;

  return (
    <>
      <header className="page-heading">
        <div>
          <StatusPill tone="ai">INSIPS Compass · AI-assisted</StatusPill>
          <h1>Review what Compass found</h1>
          <p>
            Compare every candidate with its source. Accept, edit, or dismiss
            it. Nothing moves forward without you.
          </p>
        </div>
        <div className="page-actions">
          <Link className="button button-secondary" href="/app/evidence">
            Back to evidence
          </Link>
          <Link
            className="button button-primary"
            href="/app/submission"
            aria-disabled={accepted === 0}
          >
            Continue to submission
          </Link>
        </div>
      </header>

      <div className="notice-bar" role="status">
        <ShieldAlert size={17} />
        <span>
          <strong>Synthetic fixture:</strong> the visual stages mirror the
          intended protected workflow, but no live external processing occurred
          in this local session.
        </span>
      </div>

      <div className="evidence-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Candidate fields</h2>
              <p>
                {resolved} of {claims.length} decisions made · {accepted}{" "}
                accepted
              </p>
            </div>
            <StatusPill
              tone={resolved === claims.length ? "approved" : "pending"}
            >
              {resolved === claims.length ? "Ready" : "Your review"}
            </StatusPill>
          </div>
          <div className="panel-body suggestion-list">
            {claims.map((claim) => {
              const decision = suggestions[claim.id];
              return (
                <article
                  className={`suggestion-card ${decision}`}
                  key={claim.id}
                >
                  <div className="suggestion-header">
                    <div>
                      <h3>{claim.label}</h3>
                      <p className="suggestion-value">{claim.value}</p>
                    </div>
                    <StatusPill
                      tone={
                        claim.confidence === "HIGH" ? "approved" : "warning"
                      }
                    >
                      {claim.confidence} source match
                    </StatusPill>
                  </div>
                  <p className="suggestion-note">{claim.confidenceNote}</p>
                  <div className="source-snippet">
                    <strong>Page {claim.source.page}</strong> · “
                    {claim.source.snippet}”
                  </div>
                  <div
                    className="suggestion-actions"
                    aria-label={`Decision for ${claim.label}`}
                  >
                    <button
                      className={`button ${decision === "accepted" ? "button-primary" : "button-secondary"}`}
                      onClick={() => decideSuggestion(claim.id, "accepted")}
                      type="button"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button
                      className="button button-secondary"
                      onClick={() => decideSuggestion(claim.id, "accepted")}
                      type="button"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      className={`button ${decision === "dismissed" ? "button-danger" : "button-ghost"}`}
                      onClick={() => decideSuggestion(claim.id, "dismissed")}
                      type="button"
                    >
                      <X size={14} /> Dismiss
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="panel-footer">
            <Link
              className={`button ${accepted ? "button-primary" : "button-secondary"}`}
              href={accepted ? "/app/submission" : "#"}
              aria-disabled={!accepted}
            >
              Continue with {accepted} {accepted === 1 ? "claim" : "claims"}
            </Link>
          </div>
        </section>

        <aside className="panel-stack" aria-label="Evidence processing details">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Evidence progress</h2>
                <p>The first three gates completed before suggestions.</p>
              </div>
            </div>
            <div className="panel-body processing-timeline">
              {evidencePipelineStages.map((stage) => (
                <div
                  className={`processing-step ${stage.state}`}
                  key={stage.label}
                >
                  <span className="processing-marker">
                    {stage.state === "complete" && <Check size={11} />}
                  </span>
                  <span>
                    <strong>{stage.label}</strong>
                    <p>{stage.detail}</p>
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Document</h2>
                <p>Private · synthetic data only</p>
              </div>
              <span className="file-icon">
                <FileText size={19} />
              </span>
            </div>
            <div className="panel-body">
              <div className="activity-row">
                <span className="activity-icon">
                  <CheckCircle2 size={17} />
                </span>
                <span>
                  <strong>Synthetic_CSR-1_Certificate.pdf</strong>
                  <p>2 pages · checksum recorded</p>
                </span>
                <StatusPill tone="approved">Clean</StatusPill>
              </div>
            </div>
          </section>
          <details className="panel technical-details">
            <summary>
              <span>
                <Sparkles size={18} /> Technical details
              </span>
              <small>Optional hackathon context</small>
            </summary>
            <div className="panel-body activity-list">
              <div className="activity-row">
                <span />
                <span>
                  <strong>Processing path</strong>
                  <p>Private processing path · safety gate · extraction</p>
                </span>
              </div>
              <div className="activity-row">
                <span />
                <span>
                  <strong>Compass provider</strong>
                  <p>Assistive extraction · fixture mode</p>
                </span>
              </div>
              <div className="activity-row">
                <span />
                <span>
                  <strong>Schema and prompt</strong>
                  <p>2026-09-01 · evidence-candidates-v1</p>
                </span>
              </div>
            </div>
          </details>
        </aside>
      </div>
    </>
  );
}
