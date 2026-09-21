"use client";

import type { VerificationDocumentStatus } from "@insips/contracts";
import {
  ArchiveRestore,
  Check,
  Eye,
  FileLock2,
  History,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useProductDemo } from "./product-demo-provider";

const queueCases = [
  {
    id: "org-udaan-learning",
    name: "Udaan Learning Foundation",
    type: "Section 8 company",
    submitted: "19 Sep 2026",
    status: "CHANGES_REQUESTED",
    pendingDocuments: 1,
  },
  {
    id: "org-jal-saathi",
    name: "Jal Saathi Collective",
    type: "Registered society",
    submitted: "18 Sep 2026",
    status: "PENDING",
    pendingDocuments: 4,
  },
  {
    id: "org-sahaara-health",
    name: "Sahaara Health Network",
    type: "Public charitable trust",
    submitted: "15 Sep 2026",
    status: "APPROVED",
    pendingDocuments: 0,
  },
] as const;

export function OrganizationVerificationQueue() {
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const attentionCount = queueCases.filter((item) =>
    ["PENDING", "CHANGES_REQUESTED"].includes(item.status),
  ).length;
  const approvedCount = queueCases.filter(
    (item) => item.status === "APPROVED",
  ).length;
  const filtered = queueCases.filter(
    (item) =>
      (filter === "ALL" || item.status === filter) &&
      item.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flow-page">
      <header className="flow-page-heading">
        <div>
          <span className="fixture-chip">Platform admin · synthetic cases</span>
          <h1>Organization verification</h1>
          <p>
            Review private documents, record every decision, and publish a
            verified state only after explicit platform approval.
          </p>
        </div>
        <div className="metric-pair">
          <span>
            <strong>{attentionCount}</strong> need attention
          </span>
          <span>
            <strong>{approvedCount}</strong> approved
          </span>
        </div>
      </header>
      <div className="table-toolbar">
        <label>
          <Search size={16} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search organizations"
            value={query}
          />
        </label>
        <select
          aria-label="Filter verification status"
          onChange={(event) => setFilter(event.target.value)}
          value={filter}
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CHANGES_REQUESTED">Changes requested</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>
      <section className="flow-table-card">
        <table>
          <thead>
            <tr>
              <th>Organization</th>
              <th>Submitted</th>
              <th>Documents</th>
              <th>Status</th>
              <th>
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td data-label="Organization">
                  <strong>{item.name}</strong>
                  <small>{item.type}</small>
                </td>
                <td data-label="Submitted">{item.submitted}</td>
                <td data-label="Documents">
                  {item.pendingDocuments} awaiting decisions
                </td>
                <td data-label="Status">
                  <span className={`state-badge ${item.status.toLowerCase()}`}>
                    {item.status.replaceAll("_", " ")}
                  </span>
                </td>
                <td data-label="Action">
                  <Link
                    className="button button-secondary button-small"
                    href={`/admin/organizations/${item.id}`}
                  >
                    Review <Eye size={15} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? (
          <div className="empty-flow-state">
            <Search size={24} />
            <strong>No cases match “{query}”.</strong>
            <button
              onClick={() => {
                setQuery("");
                setFilter("ALL");
              }}
              type="button"
            >
              Reset filters
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export function OrganizationVerificationDetail() {
  const {
    verificationDocuments,
    reviewHistory,
    organizationStatus,
    decideDocument,
    decideOrganization,
  } = useProductDemo();
  const [selectedId, setSelectedId] = useState(
    verificationDocuments[0]?.id ?? "",
  );
  const [reason, setReason] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [message, setMessage] = useState("");
  const selected = useMemo(
    () => verificationDocuments.find((document) => document.id === selectedId),
    [selectedId, verificationDocuments],
  );

  function decide(
    decision: Exclude<VerificationDocumentStatus, "PENDING" | "EXPIRED">,
  ) {
    if (
      (decision === "REJECTED" || decision === "CHANGES_REQUESTED") &&
      !reason.trim()
    ) {
      setMessage("Enter a reason before requesting changes or rejecting.");
      return;
    }
    if (!selected) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Record ${decision.replaceAll("_", " ").toLowerCase()} for ${selected.label}?`,
      )
    ) {
      return;
    }
    decideDocument(selected.id, decision, reason);
    setMessage(
      `Decision recorded: ${decision.replaceAll("_", " ").toLowerCase()}.`,
    );
    setReason("");
  }

  return (
    <div className="flow-page admin-review-detail">
      <header className="flow-page-heading compact">
        <div>
          <Link className="back-link" href="/admin/organizations">
            ← Verification queue
          </Link>
          <h1>Udaan Learning Foundation</h1>
          <p>Submitted 19 Sep 2026 · synthetic private review case</p>
        </div>
        <span className={`state-badge ${organizationStatus.toLowerCase()}`}>
          {organizationStatus.replaceAll("_", " ")}
        </span>
      </header>

      <div className="admin-review-grid">
        <section className="flow-panel document-list-panel">
          <div className="flow-panel-head">
            <div>
              <small>Private evidence</small>
              <h2>Submitted documents</h2>
            </div>
          </div>
          <div className="document-review-list">
            {verificationDocuments.map((document) => (
              <button
                className={document.id === selectedId ? "active" : ""}
                key={document.id}
                onClick={() => {
                  setSelectedId(document.id);
                  setPreviewOpen(false);
                  setMessage("");
                }}
                type="button"
              >
                <FileLock2 size={18} />
                <span>
                  <strong>{document.label}</strong>
                  <small>{document.status.replaceAll("_", " ")}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="secure-preview-panel">
          <div className="secure-preview-head">
            <span>
              <FileLock2 size={18} /> Signed access · expires in 5 minutes
            </span>
            <button
              onClick={() => setPreviewOpen((open) => !open)}
              type="button"
            >
              <Eye size={16} />{" "}
              {previewOpen ? "Hide preview" : "Open secure preview"}
            </button>
          </div>
          {previewOpen ? (
            <div
              className="synthetic-document-preview"
              role="img"
              aria-label="Synthetic private document preview"
            >
              <span>PRIVATE SYNTHETIC FIXTURE</span>
              <h2>{selected?.label}</h2>
              <p>Udaan Learning Foundation</p>
              <div />
              <div />
              <div className="short" />
              <small>
                Preview content is generated for this local demo and is never
                public.
              </small>
            </div>
          ) : (
            <div className="preview-closed-state">
              <ShieldCheck size={34} />
              <strong>Private preview is closed</strong>
              <p>Open it only when needed for this review decision.</p>
            </div>
          )}
        </section>

        <aside className="flow-panel decision-panel">
          <div className="flow-panel-head">
            <div>
              <small>Human decision</small>
              <h2>{selected?.label}</h2>
            </div>
          </div>
          {selected?.expiresOn ? (
            <p className="expiry-line">Expires {selected.expiresOn}</p>
          ) : null}
          <label className="flow-field">
            <span>Reason for changes or rejection</span>
            <textarea
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              value={reason}
            />
          </label>
          <label className="flow-field">
            <span>Internal review notes</span>
            <textarea
              onChange={(event) => setInternalNote(event.target.value)}
              rows={3}
              value={internalNote}
            />
            <small>Never included in public responses.</small>
          </label>
          {message ? (
            <div className="inline-result" role="status">
              {message}
            </div>
          ) : null}
          <div className="decision-actions">
            <button onClick={() => decide("APPROVED")} type="button">
              <Check size={16} /> Approve
            </button>
            <button onClick={() => decide("CHANGES_REQUESTED")} type="button">
              <ShieldAlert size={16} /> Request changes
            </button>
            <button onClick={() => decide("REJECTED")} type="button">
              <X size={16} /> Reject
            </button>
          </div>
          <div className="organization-actions">
            <strong>Organization decision</strong>
            <button
              onClick={() => {
                if (
                  typeof window === "undefined" ||
                  window.confirm(
                    "Approve this organization for public projection? This records a consequential platform decision.",
                  )
                ) {
                  decideOrganization("APPROVED", internalNote);
                }
              }}
              type="button"
            >
              Approve organization
            </button>
            <button
              onClick={() => {
                if (
                  typeof window === "undefined" ||
                  window.confirm(
                    "Suspend this organization? This changes its platform status.",
                  )
                ) {
                  decideOrganization("SUSPENDED", internalNote);
                }
              }}
              type="button"
            >
              Suspend
            </button>
            <button
              onClick={() => {
                if (
                  typeof window === "undefined" ||
                  window.confirm(
                    "Restore this organization to review? Its current status will be replaced.",
                  )
                ) {
                  decideOrganization("IN_REVIEW", "Restored by platform admin");
                }
              }}
              type="button"
            >
              <ArchiveRestore size={15} /> Restore to review
            </button>
          </div>
        </aside>
      </div>

      <section className="flow-panel review-history-panel">
        <div className="flow-panel-head">
          <div>
            <small>Immutable audit view</small>
            <h2>
              <History size={18} /> Review history
            </h2>
          </div>
        </div>
        <div className="timeline-list">
          {reviewHistory.map((entry) => (
            <article key={entry.id}>
              <span />
              <div>
                <strong>{entry.action}</strong>
                <p>{entry.reason ?? "No external reason recorded."}</p>
                <small>
                  {entry.actor} · {entry.at}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
