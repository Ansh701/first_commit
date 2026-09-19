"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileText,
  RotateCcw,
  X,
} from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { StatusPill } from "@/components/status-pill";

export default function ActiveReviewPage() {
  const { claims, suggestions, review, decideReview, submissionStatus } =
    useDemo();
  const submittedClaims = claims.filter(
    (claim) => suggestions[claim.id] === "accepted",
  );
  const resolved = submittedClaims.filter(
    (claim) => review[claim.id] !== "pending",
  ).length;

  if (submittedClaims.length === 0) {
    return (
      <section className="panel empty-state">
        <div>
          <span className="empty-state-icon">
            <FileText size={27} />
          </span>
          <h2>This submission is not ready</h2>
          <p>
            The organization has not confirmed any candidate claims. Review
            access fails closed until a valid submission exists.
          </p>
          <Link
            className="button button-primary"
            href="/app/evidence/demo-csr-1"
          >
            Prepare demo submission
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <header className="page-heading">
        <div>
          <StatusPill
            tone={submissionStatus === "reviewed" ? "approved" : "pending"}
          >
            {submissionStatus === "reviewed" ? "Review complete" : "In review"}
          </StatusPill>
          <h1>Udaan Learning Foundation</h1>
          <p>
            Submission PAS-2026-0919 · {resolved} of {submittedClaims.length}{" "}
            claims decided
          </p>
        </div>
        <div className="page-actions">
          <Link className="button button-secondary" href="/review">
            Back to queue
          </Link>
          <Link
            className="button button-primary"
            href="/organizations/udaan-learning-foundation"
          >
            View public result
          </Link>
        </div>
      </header>
      <div className="notice-bar">
        <AlertTriangle size={17} />
        <span>
          <strong>Reviewer boundary:</strong> you may decide the submitted
          claim, but you cannot silently edit the organization-authored value.
        </span>
      </div>
      <div className="review-layout">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Claim decisions</h2>
              <p>Compare the confirmed value with the source context.</p>
            </div>
          </div>
          <div className="panel-body">
            {submittedClaims.map((claim) => {
              const decision = review[claim.id];
              return (
                <article className="review-claim" key={claim.id}>
                  <div className="review-claim-head">
                    <div>
                      <h3>{claim.label}</h3>
                      <p className="claim-value">{claim.value}</p>
                    </div>
                    <StatusPill
                      tone={
                        decision === "approved"
                          ? "approved"
                          : decision === "rejected"
                            ? "warning"
                            : decision === "changes_requested"
                              ? "warning"
                              : "pending"
                      }
                    >
                      {decision === "pending"
                        ? "Decision required"
                        : decision.replace("_", " ")}
                    </StatusPill>
                  </div>
                  <p className="suggestion-note">
                    <strong>Organization confirmation:</strong> submitted as
                    shown · candidate confidence was{" "}
                    {claim.confidence.toLowerCase()}
                  </p>
                  <div className="source-snippet">
                    <strong>Page {claim.source.page}</strong> · “
                    {claim.source.snippet}”
                  </div>
                  <div
                    className="decision-controls"
                    aria-label={`Decision for ${claim.label}`}
                  >
                    <button
                      className={`button ${decision === "approved" ? "button-primary" : "button-secondary"}`}
                      onClick={() => decideReview(claim.id, "approved")}
                      type="button"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      className={`button ${decision === "changes_requested" ? "button-primary" : "button-secondary"}`}
                      onClick={() =>
                        decideReview(claim.id, "changes_requested")
                      }
                      type="button"
                    >
                      <RotateCcw size={14} /> Changes
                    </button>
                    <button
                      className={`button ${decision === "rejected" ? "button-danger" : "button-secondary"}`}
                      onClick={() => decideReview(claim.id, "rejected")}
                      type="button"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {resolved === submittedClaims.length && (
            <div className="panel-footer">
              <span className="status-pill status-approved">
                <CheckCircle2 size={14} /> Decisions recorded in the local audit
                fixture
              </span>
            </div>
          )}
        </section>
        <aside className="panel evidence-drawer">
          <div className="panel-header">
            <div>
              <h2>Source evidence</h2>
              <p>Restricted · temporary reviewer access</p>
            </div>
            <FileText size={18} />
          </div>
          <div className="panel-body">
            <div
              className="document-preview"
              role="img"
              aria-label="Synthetic document page with highlighted source line"
            >
              <span className="doc-eyebrow">
                Synthetic demonstration document
              </span>
              <h4>Form CSR-1 Registration</h4>
              <p>
                This sample is not an official document and contains no real
                registration data.
              </p>
              <p>
                Organization: <mark>Udaan Learning Foundation</mark>
              </p>
              <p>
                Registration number: <mark>CSR00018427</mark>
              </p>
              <p>Filed for the sole purpose of a software demonstration.</p>
            </div>
            <div className="document-caption">
              <span>Page 1 of 2</span>
              <span>Watermark: SYNTHETIC</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
