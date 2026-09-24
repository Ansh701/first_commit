"use client";

import Link from "next/link";
import * as React from "react";
import {
  ArrowRight,
  Bookmark,
  Check,
  Download,
  FileText,
  GitCompareArrows,
  Search,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import type { PublicOrganizationSummary } from "@insips/contracts";
import { OrganizationCard } from "@/components/organization-card";
import { StatusPill } from "@/components/status-pill";
import { useDemo } from "@/components/demo-provider";
import styles from "./csr-shortlist-experience.module.css";

function downloadCsv(organizations: PublicOrganizationSummary[]) {
  const rows = [
    [
      "Organization",
      "Location",
      "Focus areas",
      "Approved indicators",
      "Profile",
    ],
    ...organizations.map((organization) => [
      organization.displayName,
      organization.location,
      organization.focusAreas.join("; "),
      String(organization.approvedIndicatorCount),
      `${window.location.origin}/organizations/${organization.slug}`,
    ]),
  ];
  const csv = rows
    .map((row) =>
      row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = "insips-csr-shortlist.csv";
  link.click();
  URL.revokeObjectURL(href);
}

export function CsrShortlistExperience({
  organizations,
}: {
  organizations: PublicOrganizationSummary[];
}) {
  const { shortlist, toggleShortlist } = useDemo();
  const [query, setQuery] = React.useState("");
  const [focusArea, setFocusArea] = React.useState("");
  const [comparison, setComparison] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [savedNotes, setSavedNotes] = React.useState<Record<string, string>>(
    {},
  );
  const [removedSlug, setRemovedSlug] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState("");

  const saved = organizations.filter((organization) =>
    shortlist.includes(organization.slug),
  );
  const focusAreas = [
    ...new Set(saved.flatMap((organization) => organization.focusAreas)),
  ].sort();
  const visible = saved.filter((organization) => {
    const haystack = [
      organization.displayName,
      organization.location,
      organization.summary,
      ...organization.focusAreas,
    ]
      .join(" ")
      .toLowerCase();
    return (
      (!query.trim() || haystack.includes(query.trim().toLowerCase())) &&
      (!focusArea || organization.focusAreas.includes(focusArea))
    );
  });
  const compared = saved.filter((organization) =>
    comparison.includes(organization.slug),
  );
  const totalIndicators = saved.reduce(
    (sum, organization) => sum + organization.approvedIndicatorCount,
    0,
  );

  function toggleComparison(slug: string) {
    setComparison((current) => {
      if (current.includes(slug))
        return current.filter((item) => item !== slug);
      if (current.length >= 2) return current;
      return [...current, slug];
    });
  }

  function removeOrganization(organization: PublicOrganizationSummary) {
    toggleShortlist(organization.slug);
    setComparison((current) =>
      current.filter((slug) => slug !== organization.slug),
    );
    setRemovedSlug(organization.slug);
    setStatus(`${organization.displayName} was removed from your shortlist.`);
  }

  function restoreOrganization() {
    if (!removedSlug) return;
    toggleShortlist(removedSlug);
    const restored = organizations.find(
      (organization) => organization.slug === removedSlug,
    );
    setStatus(
      restored
        ? `${restored.displayName} was restored to your shortlist.`
        : "Organization restored to your shortlist.",
    );
    setRemovedSlug(null);
  }

  function saveNote(organization: PublicOrganizationSummary) {
    const note = notes[organization.slug]?.trim() ?? "";
    setSavedNotes((current) => ({ ...current, [organization.slug]: note }));
    setStatus(
      note
        ? `Private note saved for ${organization.displayName}.`
        : `Private note cleared for ${organization.displayName}.`,
    );
  }

  return (
    <div className={styles.route}>
      <header className="page-heading">
        <div>
          <StatusPill tone="pending">{saved.length} saved</StatusPill>
          <h1>Your shortlist</h1>
          <p>
            Keep the public context together while your team decides what to
            verify next.
          </p>
        </div>
        <div className={styles.headingActions}>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => downloadCsv(saved)}
            disabled={!saved.length}
          >
            <Download size={16} /> Export view
          </button>
          <Link className="button button-primary" href="/csr/discover">
            <Search size={16} /> Discover more
          </Link>
        </div>
      </header>

      <div className={styles.statusRow} aria-live="polite">
        <span>
          {status || "Shortlist notes stay private to this local workspace."}
        </span>
        {removedSlug ? (
          <button
            className={styles.textButton}
            type="button"
            onClick={restoreOrganization}
          >
            <Undo2 size={14} /> Undo removal
          </button>
        ) : null}
      </div>

      {saved.length ? (
        <>
          <section
            className={styles.summaryGrid}
            aria-label="Shortlist summary"
          >
            <article className={styles.summaryCard}>
              <span>Saved organizations</span>
              <strong>{saved.length}</strong>
              <small>Private to your workspace</small>
            </article>
            <article className={styles.summaryCard}>
              <span>Approved indicators</span>
              <strong>{totalIndicators}</strong>
              <small>Specific public signals in view</small>
            </article>
            <article
              className={`${styles.summaryCard} ${styles.summaryAccent}`}
            >
              <span>Comparison</span>
              <strong>{comparison.length}/2</strong>
              <small>Select up to two for a side-by-side read</small>
            </article>
          </section>

          <section
            className={styles.workspace}
            aria-label="Shortlist workspace"
          >
            <div className={styles.listColumn}>
              <div className={styles.toolbar}>
                <label className={styles.searchField}>
                  <Search size={16} />
                  <span className="sr-only">Search saved organizations</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search saved…"
                  />
                </label>
                <label className={styles.filterField}>
                  <span className="sr-only">
                    Filter saved organizations by focus area
                  </span>
                  <select
                    value={focusArea}
                    onChange={(event) => setFocusArea(event.target.value)}
                  >
                    <option value="">All focus areas</option>
                    {focusAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className={styles.listHeader}>
                <span>
                  <strong>{visible.length}</strong> in view
                </span>
                <span>Review the signal, then follow the source context.</span>
              </div>
              {visible.length ? (
                <div className="organization-grid">
                  {visible.map((organization) => (
                    <div className={styles.savedItem} key={organization.slug}>
                      <OrganizationCard csr organization={organization} />
                      <div className={styles.savedItemTools}>
                        <label className={styles.compareControl}>
                          <input
                            type="checkbox"
                            checked={comparison.includes(organization.slug)}
                            onChange={() => toggleComparison(organization.slug)}
                          />
                          <span>
                            <GitCompareArrows size={14} /> Compare
                          </span>
                        </label>
                        <button
                          className={styles.removeButton}
                          type="button"
                          onClick={() => removeOrganization(organization)}
                        >
                          <Bookmark size={14} fill="currentColor" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.filteredEmpty}>
                  <Search size={20} />
                  <strong>No saved organizations match</strong>
                  <p>
                    Clear the search or focus-area filter to see your complete
                    shortlist.
                  </p>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setFocusArea("");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            <aside className={styles.sideColumn}>
              <section className={styles.panel} aria-labelledby="compare-title">
                <div className={styles.panelHeader}>
                  <div>
                    <span className={styles.eyebrow}>Decision view</span>
                    <h2 id="compare-title">Compare signals</h2>
                  </div>
                  <GitCompareArrows size={20} />
                </div>
                <p>
                  Select up to two organizations. Comparison keeps context
                  visible; it does not rank or recommend a funding decision.
                </p>
                {compared.length ? (
                  <div className={styles.compareTable}>
                    {compared.map((organization) => (
                      <div
                        className={styles.compareRow}
                        key={organization.slug}
                      >
                        <strong>{organization.displayName}</strong>
                        <span>
                          {organization.approvedIndicatorCount} approved
                          indicator
                          {organization.approvedIndicatorCount === 1 ? "" : "s"}
                        </span>
                        <span>{organization.location}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.sideEmpty}>
                    <GitCompareArrows size={18} />
                    <span>Choose organizations from the list to compare.</span>
                  </div>
                )}
              </section>

              <section className={styles.panel} aria-labelledby="trail-title">
                <div className={styles.panelHeader}>
                  <div>
                    <span className={styles.eyebrow}>Trust context</span>
                    <h2 id="trail-title">Keep the trail open</h2>
                  </div>
                  <ShieldCheck size={20} />
                </div>
                <p>
                  Public indicators are scoped and dated. Use the profile and
                  methodology before treating a shortlist as a next step.
                </p>
                <Link className={styles.panelLink} href="/how-trust-works">
                  Read how review works <ArrowRight size={15} />
                </Link>
              </section>
            </aside>
          </section>

          <section
            className={styles.notesSection}
            aria-labelledby="notes-title"
          >
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.eyebrow}>Internal context</span>
                <h2 id="notes-title">Private research notes</h2>
              </div>
              <p>
                Notes are workspace-only and never appear on an organization’s
                public profile.
              </p>
            </div>
            <div className={styles.notesGrid}>
              {saved.map((organization) => (
                <article className={styles.noteCard} key={organization.slug}>
                  <div className={styles.noteHeading}>
                    <FileText size={16} />
                    <strong>{organization.displayName}</strong>
                  </div>
                  <label>
                    <span className="sr-only">
                      Private note for {organization.displayName}
                    </span>
                    <textarea
                      value={
                        notes[organization.slug] ??
                        savedNotes[organization.slug] ??
                        ""
                      }
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          [organization.slug]: event.target.value,
                        }))
                      }
                      placeholder="What should your team verify next?"
                      rows={3}
                    />
                  </label>
                  <div className={styles.noteFooter}>
                    <span>
                      {savedNotes[organization.slug] ? (
                        <>
                          <Check size={13} /> Saved privately
                        </>
                      ) : (
                        "Not saved"
                      )}
                    </span>
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => saveNote(organization)}
                    >
                      Save note
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <Bookmark size={24} />
          </span>
          <span className={styles.eyebrow}>Start with context</span>
          <h2>Your shortlist is empty</h2>
          <p>
            Discover organizations, save the ones worth further research, and
            keep the source trail visible while your team decides what to verify
            next.
          </p>
          <Link className="button button-primary" href="/csr/discover">
            <Search size={16} /> Discover organizations
          </Link>
        </section>
      )}
    </div>
  );
}
