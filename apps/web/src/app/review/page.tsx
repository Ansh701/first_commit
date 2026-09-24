"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/components/demo-provider";
import { StatusPill } from "@/components/status-pill";

export default function ReviewQueuePage() {
  const { submissionStatus } = useDemo();
  const hasSubmission = submissionStatus !== "draft";
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [query, setQuery] = useState("");
  const visibleSubmission =
    hasSubmission &&
    filter === "pending" &&
    "udaan learning foundation".includes(query.trim().toLowerCase());
  const emptyTitle = hasSubmission
    ? filter === "pending"
      ? "No matching submissions"
      : `No ${filter} submissions`
    : `No ${filter} submissions`;

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
          <button
            aria-pressed={filter === "pending"}
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
            type="button"
          >
            Pending {hasSubmission ? "1" : "0"}
          </button>
          <button
            aria-pressed={filter === "approved"}
            className={filter === "approved" ? "active" : ""}
            onClick={() => setFilter("approved")}
            type="button"
          >
            Approved
          </button>
          <button
            aria-pressed={filter === "rejected"}
            className={filter === "rejected" ? "active" : ""}
            onClick={() => setFilter("rejected")}
            type="button"
          >
            Rejected
          </button>
        </div>
        <label className="search-field" htmlFor="review-search">
          <Search size={16} />
          <span className="sr-only">Search review queue</span>
          <input
            id="review-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search organizations…"
            value={query}
          />
        </label>
      </div>
      {visibleSubmission ? (
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
            <h2>{emptyTitle}</h2>
            <p>
              {hasSubmission
                ? "Try another status or search term, or return to the pending queue."
                : filter === "pending"
                  ? "Complete and submit at least one organization claim to create a review item."
                  : `There are no ${filter} submissions in the current local queue.`}
            </p>
            {!hasSubmission ? (
              <Link className="button button-primary" href="/app/submission">
                Open organization submission
              </Link>
            ) : null}
            <button
              className="button button-ghost"
              onClick={() => {
                setFilter("pending");
                setQuery("");
              }}
              type="button"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </section>
      )}
    </>
  );
}
