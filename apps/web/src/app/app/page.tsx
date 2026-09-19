"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Circle,
  FileCheck2,
  FileSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { StatusPill } from "@/components/status-pill";

export default function OrganizationOverviewPage() {
  const { suggestions, submissionStatus } = useDemo();
  const accepted = Object.values(suggestions).filter(
    (value) => value === "accepted",
  ).length;
  const suggestionsDone = accepted > 0;
  const submitted = submissionStatus !== "draft";
  const complete = 2 + Number(suggestionsDone) + Number(submitted);

  return (
    <>
      <div className="notice-bar" role="status">
        <Sparkles size={17} aria-hidden="true" />
        <span>
          <strong>Demo mode:</strong> this workspace uses synthetic evidence and
          local browser storage. It does not claim a live AWS result.
        </span>
      </div>
      <header className="page-heading">
        <div>
          <StatusPill tone="pending">Organization admin</StatusPill>
          <h1>Good afternoon, Nisha.</h1>
          <p>
            One useful next step: review the three candidate fields Compass
            found in your synthetic CSR-1 document.
          </p>
        </div>
        <div className="page-actions">
          <Link
            className="button button-secondary"
            href="/organizations/udaan-learning-foundation"
          >
            View public profile
          </Link>
          <Link
            className="button button-primary"
            href="/app/evidence/demo-csr-1"
          >
            Review suggestions <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="panel-stack">
          <section className="readiness-hero" aria-labelledby="readiness-title">
            <div className="readiness-top">
              <div>
                <h2 id="readiness-title">
                  Your Passport is {complete}/4 steps ready
                </h2>
                <p>Finish the evidence loop to request human review.</p>
              </div>
              <div
                className="progress-orb"
                aria-label={`${complete} of 4 steps complete`}
              >
                <strong>{complete}/4</strong>
              </div>
            </div>
            <div className="checklist">
              <div className="checklist-item done">
                <span className="check-icon">
                  <Check size={16} />
                </span>
                <span>
                  <strong>Complete organization profile</strong>
                  <small>Public description and focus areas are ready</small>
                </span>
                <Link href="/app/profile">Edit</Link>
              </div>
              <div className="checklist-item done">
                <span className="check-icon">
                  <Check size={16} />
                </span>
                <span>
                  <strong>Add one evidence document</strong>
                  <small>Synthetic_CSR-1_Certificate.pdf</small>
                </span>
                <Link href="/app/evidence">View</Link>
              </div>
              <div
                className={`checklist-item ${suggestionsDone ? "done" : "current"}`}
              >
                <span className="check-icon">
                  {suggestionsDone ? (
                    <Check size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                </span>
                <span>
                  <strong>Confirm Compass suggestions</strong>
                  <small>
                    {accepted
                      ? `${accepted} candidate ${accepted === 1 ? "field" : "fields"} confirmed`
                      : "3 candidate fields need a human decision"}
                  </small>
                </span>
                <Link href="/app/evidence/demo-csr-1">
                  {suggestionsDone ? "Review" : "Continue"}
                </Link>
              </div>
              <div className={`checklist-item ${submitted ? "done" : ""}`}>
                <span className="check-icon">
                  {submitted ? <Check size={16} /> : <Circle size={13} />}
                </span>
                <span>
                  <strong>Submit trust claims</strong>
                  <small>
                    {submitted
                      ? "Sent to platform review"
                      : "Available after at least one confirmation"}
                  </small>
                </span>
                {suggestionsDone && !submitted ? (
                  <Link href="/app/submission">Submit</Link>
                ) : (
                  <span />
                )}
              </div>
            </div>
          </section>

          <div className="stat-grid" aria-label="Workspace summary">
            <div className="stat-card">
              <span>Evidence documents</span>
              <strong>1</strong>
              <small>synthetic PDF</small>
            </div>
            <div className="stat-card">
              <span>Candidate fields</span>
              <strong>3</strong>
              <small>{accepted} confirmed</small>
            </div>
            <div className="stat-card">
              <span>Public indicators</span>
              <strong>1</strong>
              <small>approved & current</small>
            </div>
          </div>
        </div>

        <div className="panel-stack">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Evidence status</h2>
                <p>The processing gate is complete.</p>
              </div>
              <StatusPill tone="approved">Clean</StatusPill>
            </div>
            <div className="panel-body">
              <div className="activity-list">
                <div className="activity-row">
                  <span className="activity-icon">
                    <ShieldCheck size={17} />
                  </span>
                  <span>
                    <strong>Malware scan passed</strong>
                    <p>Synthetic pre-scanned fixture</p>
                  </span>
                  <time>12:42</time>
                </div>
                <div className="activity-row">
                  <span className="activity-icon">
                    <FileSearch size={17} />
                  </span>
                  <span>
                    <strong>2 pages extracted</strong>
                    <p>Page references preserved</p>
                  </span>
                  <time>12:43</time>
                </div>
                <div className="activity-row">
                  <span className="activity-icon">
                    <Sparkles size={17} />
                  </span>
                  <span>
                    <strong>Compass prepared 3 fields</strong>
                    <p>Human confirmation required</p>
                  </span>
                  <time>12:44</time>
                </div>
              </div>
            </div>
          </section>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Existing public trust</h2>
                <p>Separate facts, never one score.</p>
              </div>
            </div>
            <div className="panel-body">
              <div className="activity-row">
                <span className="activity-icon">
                  <FileCheck2 size={17} />
                </span>
                <span>
                  <strong>Organization registration</strong>
                  <p>Section 8 company · reviewed 12 Sep</p>
                </span>
                <StatusPill tone="approved">Approved</StatusPill>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
