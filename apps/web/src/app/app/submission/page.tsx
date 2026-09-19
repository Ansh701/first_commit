"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  LockKeyhole,
  Send,
} from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { StatusPill } from "@/components/status-pill";

export default function SubmissionPage() {
  const { claims, suggestions, submissionStatus, submitClaims } = useDemo();
  const acceptedClaims = claims.filter(
    (claim) => suggestions[claim.id] === "accepted",
  );
  const submitted = submissionStatus !== "draft";

  return (
    <>
      <header className="page-heading">
        <div>
          <StatusPill tone={submitted ? "pending" : "neutral"}>
            {submitted ? "Submitted for review" : "Draft submission"}
          </StatusPill>
          <h1>Review submission</h1>
          <p>
            Submit only the claims you confirmed. Reviewers decide each one
            independently.
          </p>
        </div>
        <div className="page-actions">
          <Link
            className="button button-secondary"
            href="/app/evidence/demo-csr-1"
          >
            Edit confirmations
          </Link>
        </div>
      </header>

      {acceptedClaims.length === 0 ? (
        <section className="panel empty-state">
          <div>
            <span className="empty-state-icon">
              <ClipboardCheck size={26} />
            </span>
            <h2>No confirmed claims yet</h2>
            <p>
              Return to your evidence and accept at least one Compass suggestion
              before submitting.
            </p>
            <Link
              className="button button-primary"
              href="/app/evidence/demo-csr-1"
            >
              Review suggestions <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      ) : (
        <div className="dashboard-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Selected claims</h2>
                <p>
                  {acceptedClaims.length} organization-confirmed{" "}
                  {acceptedClaims.length === 1 ? "claim" : "claims"}
                </p>
              </div>
              <StatusPill tone="approved">Human confirmed</StatusPill>
            </div>
            <div className="panel-body suggestion-list">
              {acceptedClaims.map((claim) => (
                <article className="suggestion-card accepted" key={claim.id}>
                  <div className="suggestion-header">
                    <div>
                      <h3>{claim.label}</h3>
                      <p className="suggestion-value">{claim.value}</p>
                    </div>
                    <Check size={19} color="var(--success)" />
                  </div>
                  <div className="source-snippet">
                    <strong>Source page {claim.source.page}</strong> · Safe
                    summary prepared for reviewer
                  </div>
                </article>
              ))}
            </div>
            <div className="panel-footer">
              {!submitted ? (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={submitClaims}
                >
                  <Send size={16} /> Submit for human review
                </button>
              ) : (
                <Link className="button button-primary" href="/review">
                  Switch to reviewer queue <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </section>
          <aside className="panel-stack">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Before you submit</h2>
                  <p>These integrity rules stay in force.</p>
                </div>
              </div>
              <div className="panel-body activity-list">
                <div className="activity-row">
                  <span className="activity-icon">
                    <Check size={16} />
                  </span>
                  <span>
                    <strong>You confirmed the values</strong>
                    <p>AI did not publish them.</p>
                  </span>
                </div>
                <div className="activity-row">
                  <span className="activity-icon">
                    <LockKeyhole size={16} />
                  </span>
                  <span>
                    <strong>Evidence stays private</strong>
                    <p>No document or full text becomes public.</p>
                  </span>
                </div>
                <div className="activity-row">
                  <span className="activity-icon">
                    <ClipboardCheck size={16} />
                  </span>
                  <span>
                    <strong>A reviewer decides each claim</strong>
                    <p>Approval is never automatic.</p>
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
