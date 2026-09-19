"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck, RefreshCw, Search } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { StatusPill } from "@/components/status-pill";

export default function ReviewQueuePage() {
  const { submissionStatus } = useDemo();
  const hasSubmission = submissionStatus !== "draft";

  return (
    <>
      <header className="page-heading">
        <div>
          <StatusPill tone="pending">Platform reviewer</StatusPill>
          <h1>Review queue</h1>
          <p>
            Decide claim by claim. Organization facts remain unchanged; your
            decision creates a separate audit record.
          </p>
        </div>
      </header>
      <div className="filter-bar">
        <div className="segments" aria-label="Review status">
          <button className="active" type="button">
            Pending {hasSubmission ? "1" : "0"}
          </button>
          <button type="button">Approved</button>
          <button type="button">Rejected</button>
        </div>
        <label className="search-field">
          <Search size={16} />
          <span className="sr-only">Search review queue</span>
          <input placeholder="Search organizations…" />
        </label>
      </div>
      {hasSubmission ? (
        <section className="panel">
          <div className="data-list">
            <div className="data-row">
              <div className="data-title">
                <span className="org-logo">UL</span>
                <span>
                  <strong>Udaan Learning Foundation</strong>
                  <small>Submission PAS-2026-0919 · synthetic</small>
                </span>
              </div>
              <div className="data-cell">
                <small>Claims</small>
                <span>Organization confirmed</span>
              </div>
              <div className="data-cell">
                <small>Submitted</small>
                <span>Just now</span>
              </div>
              <Link
                className="button button-primary"
                href="/review/submission-demo"
              >
                Start review <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="panel empty-state">
          <div>
            <span className="empty-state-icon">
              <ClipboardCheck size={27} />
            </span>
            <h2>No pending submissions</h2>
            <p>
              The current filter is clear. Complete and submit at least one
              organization claim to create a review item.
            </p>
            <Link className="button button-primary" href="/app/submission">
              Open organization submission
            </Link>
            <button className="button button-ghost" type="button">
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </section>
      )}
    </>
  );
}
