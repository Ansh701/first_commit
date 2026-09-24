"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { useProductDemo } from "@/components/product-demo-provider";
import { validatePdfUpload } from "@/lib/upload-validation";
import styles from "./evidence-page-experience.module.css";

type EvidenceFilter = "ALL" | "PENDING" | "CHANGES_REQUESTED" | "APPROVED";

const statusLabels: Record<EvidenceFilter, string> = {
  ALL: "All documents",
  PENDING: "Pending",
  CHANGES_REQUESTED: "Changes requested",
  APPROVED: "Approved",
};

function statusTone(status: string) {
  if (status === "APPROVED") return "approved" as const;
  if (status === "CHANGES_REQUESTED") return "warning" as const;
  return "pending" as const;
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase();
}

export function EvidencePageExperience() {
  const { verificationDocuments } = useProductDemo();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<EvidenceFilter>("ALL");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(
    () => ({
      total: verificationDocuments.length,
      pending: verificationDocuments.filter(
        (document) => document.status === "PENDING",
      ).length,
      changes: verificationDocuments.filter(
        (document) => document.status === "CHANGES_REQUESTED",
      ).length,
      approved: verificationDocuments.filter(
        (document) => document.status === "APPROVED",
      ).length,
    }),
    [verificationDocuments],
  );

  const filteredDocuments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return verificationDocuments.filter((document) => {
      const matchesFilter = filter === "ALL" || document.status === filter;
      const matchesQuery = [
        document.label,
        document.status,
        document.latestReason ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, verificationDocuments]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setUploadMessage(null);
    setUploadError(null);
    if (!file) return;

    const firstBytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const result = validatePdfUpload({
      displayName: file.name,
      declaredContentType: file.type,
      size: file.size,
      firstBytes,
    });
    if (!result.ok) {
      setUploadError(result.message);
      event.target.value = "";
      return;
    }
    setUploadMessage(
      result.safeDisplayName +
        " passed local validation. Secure server upload remains disabled in local mode.",
    );
    event.target.value = "";
  }

  return (
    <div className={styles.page}>
      <header className="page-heading">
        <div>
          <StatusPill tone={counts.changes ? "warning" : "approved"}>
            {counts.total} {counts.total === 1 ? "document" : "documents"}
          </StatusPill>
          <h1>Evidence</h1>
          <p>
            Keep source documents private, resolve requested changes, and send
            only confirmed claims into review.
          </p>
        </div>
        <div className="page-actions">
          <button
            className="button button-primary"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <Plus size={16} /> Add evidence
          </button>
          <input
            aria-label="Upload a PDF evidence document"
            ref={inputRef}
            accept="application/pdf,.pdf"
            className={styles.fileInput}
            onChange={handleFileChange}
            type="file"
          />
        </div>
      </header>

      <div className="notice-bar" role="status">
        <ShieldCheck size={17} />
        <span>
          Local mode validates PDF type, size, name, and signature before any
          upload boundary. It never stores a private document in the browser.
        </span>
      </div>

      {uploadMessage ? (
        <div className={styles.feedbackSuccess} role="status">
          <CheckCircle2 size={17} /> <span>{uploadMessage}</span>
        </div>
      ) : null}
      {uploadError ? (
        <div className={styles.feedbackError} role="alert">
          <AlertCircle size={17} /> <span>{uploadError}</span>
        </div>
      ) : null}

      <div className={styles.summaryGrid} aria-label="Evidence summary">
        <article>
          <FileText size={18} />
          <span>Total documents</span>
          <strong>{counts.total}</strong>
        </article>
        <article>
          <Sparkles size={18} />
          <span>Need attention</span>
          <strong>{counts.changes + counts.pending}</strong>
        </article>
        <article>
          <CheckCircle2 size={18} />
          <span>Approved</span>
          <strong>{counts.approved}</strong>
        </article>
      </div>

      <div className={styles.contentGrid}>
        <section className="panel" aria-label="Evidence documents">
          <div className="panel-header">
            <div>
              <h2>Private document register</h2>
              <p>
                {filteredDocuments.length} of {verificationDocuments.length}{" "}
                visible · source files never appear in public projections.
              </p>
            </div>
            <Filter size={18} aria-hidden="true" />
          </div>
          <div className={styles.toolbar}>
            <label>
              <span>Search documents</span>
              <div className={styles.searchField}>
                <Search size={16} aria-hidden="true" />
                <input
                  aria-label="Search evidence documents"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by document or status"
                  type="search"
                  value={query}
                />
              </div>
            </label>
            <label>
              <span>Status</span>
              <select
                aria-label="Filter evidence status"
                onChange={(event) =>
                  setFilter(event.target.value as EvidenceFilter)
                }
                value={filter}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.documentList}>
            {filteredDocuments.length ? (
              filteredDocuments.map((document) => (
                <article className={styles.documentRow} key={document.id}>
                  <div className={styles.documentTitle}>
                    <span className="file-icon" aria-hidden="true">
                      <FileText size={20} />
                    </span>
                    <span>
                      <strong>{document.label}</strong>
                      <small>
                        Private object ·{" "}
                        {document.expiresOn
                          ? "expires " + document.expiresOn
                          : "no expiry recorded"}
                      </small>
                    </span>
                  </div>
                  <div className={styles.documentMeta}>
                    <small>Processing state</small>
                    <StatusPill tone={statusTone(document.status)}>
                      {statusLabel(document.status)}
                    </StatusPill>
                  </div>
                  <div className={styles.documentMeta}>
                    <small>Review context</small>
                    <span>
                      {document.latestReason ??
                        (document.status === "APPROVED"
                          ? "Approved claim version"
                          : "Awaiting organization action")}
                    </span>
                  </div>
                  <Link
                    className="button button-secondary"
                    href={"/app/evidence/" + document.id}
                  >
                    Open <ArrowRight size={15} />
                  </Link>
                </article>
              ))
            ) : (
              <div className={styles.emptyState}>
                <Search size={22} />
                <strong>No documents match these filters.</strong>
                <p>
                  Clear the search or choose all statuses to see the register.
                </p>
                <button
                  className="button button-secondary"
                  onClick={() => {
                    setQuery("");
                    setFilter("ALL");
                  }}
                  type="button"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className={styles.nextAction} aria-label="Evidence next action">
          <div className={styles.nextActionIcon}>
            <Upload size={20} />
          </div>
          <span className="eyebrow">Next useful action</span>
          <h2>
            {counts.changes
              ? "Resolve the requested document change."
              : counts.pending
                ? "Review the pending document state."
                : "Prepare the next evidence record."}
          </h2>
          <p>
            Compass can prepare candidates after a clean document check. Every
            suggestion still needs organization confirmation before submission.
          </p>
          <Link className="button button-secondary" href="/how-trust-works">
            See the evidence path <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
