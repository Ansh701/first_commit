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
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDemo } from "@/components/demo-provider";
import { useProductDemo } from "@/components/product-demo-provider";
import { StatusPill } from "@/components/status-pill";
import { evidencePipelineStages } from "@/lib/workspace-fixtures";
import styles from "../evidence-page-experience.module.css";

export default function EvidenceDetailPage() {
  const { claims, suggestions, decideSuggestion } = useDemo();
  const { verificationDocuments } = useProductDemo();
  const params = useParams<{ id: string }>();
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const document = verificationDocuments.find((item) => item.id === params.id);
  const resolved = Object.values(suggestions).filter(
    (value) => value !== "pending",
  ).length;
  const accepted = Object.values(suggestions).filter(
    (value) => value === "accepted",
  ).length;

  function makeDecision(claimId: string, decision: "accepted" | "dismissed") {
    decideSuggestion(claimId, decision);
    setEditingClaimId(null);
    setFeedback(
      decision === "accepted"
        ? "Candidate accepted for submission."
        : "Candidate dismissed and kept out of submission.",
    );
  }

  function saveEdit(claimId: string) {
    setEditingClaimId(null);
    setFeedback(
      `Candidate edit for ${claimId} saved locally. Accept it when the value is ready.`,
    );
  }

  return (
    <div className={styles.detailPage}>
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
          {accepted > 0 ? (
            <Link className="button button-primary" href="/app/submission">
              Continue to submission
            </Link>
          ) : (
            <button
              className="button button-primary"
              disabled
              title="Accept at least one candidate before submitting"
              type="button"
            >
              Continue to submission
            </button>
          )}
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

      {feedback ? (
        <div className={styles.feedback} role="status">
          <CheckCircle2 size={16} /> <span>{feedback}</span>
        </div>
      ) : null}

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
                      {editingClaimId === claim.id ? (
                        <div className={styles.editField}>
                          <label htmlFor={`edit-${claim.id}`}>
                            Candidate value
                          </label>
                          <input
                            id={`edit-${claim.id}`}
                            onChange={(event) =>
                              setEditedValues((current) => ({
                                ...current,
                                [claim.id]: event.target.value,
                              }))
                            }
                            value={editedValues[claim.id] ?? claim.value}
                          />
                        </div>
                      ) : (
                        <p className="suggestion-value">
                          {editedValues[claim.id] ?? claim.value}
                        </p>
                      )}
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
                      onClick={() => makeDecision(claim.id, "accepted")}
                      type="button"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button
                      className="button button-secondary"
                      onClick={() => {
                        if (editingClaimId === claim.id) {
                          saveEdit(claim.id);
                        } else {
                          setEditingClaimId(claim.id);
                          setFeedback(null);
                        }
                      }}
                      type="button"
                    >
                      <Edit3 size={14} />
                      {editingClaimId === claim.id ? "Save edit" : "Edit"}
                    </button>
                    <button
                      className={`button ${decision === "dismissed" ? "button-danger" : "button-ghost"}`}
                      onClick={() => makeDecision(claim.id, "dismissed")}
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
            {accepted > 0 ? (
              <Link className="button button-primary" href="/app/submission">
                Continue with {accepted} {accepted === 1 ? "claim" : "claims"}
              </Link>
            ) : (
              <button
                className="button button-secondary"
                disabled
                title="Accept at least one candidate before submitting"
                type="button"
              >
                Continue with 0 claims
              </button>
            )}
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
                <p>Private · {document?.label ?? "synthetic data only"}</p>
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
                  <strong>{document?.label ?? "Evidence document"}</strong>
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
    </div>
  );
}
