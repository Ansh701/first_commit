import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { OrganizationCard } from "@/components/organization-card";
import { StatePanel } from "@/components/state-panel";
import { StatusPill } from "@/components/status-pill";
import { getPublicOrganizations } from "@/lib/server/content-repository";
import styles from "./discover-page.module.css";

export default async function CsrDiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; focus?: string }>;
}) {
  const params = await searchParams;
  const [organizations, allOrganizations] = await Promise.all([
    getPublicOrganizations({ query: params.q, focusArea: params.focus }),
    getPublicOrganizations(),
  ]);
  const focusAreas = [
    ...new Set(
      allOrganizations.flatMap((organization) => organization.focusAreas),
    ),
  ].sort();
  const hasFilters = Boolean(params.q?.trim() || params.focus?.trim());
  return (
    <div className={styles.route}>
      <header className="page-heading">
        <div>
          <StatusPill tone="pending">CSR workspace</StatusPill>
          <h1>Discover organizations</h1>
          <p>
            Compare public, approved indicators without treating popularity as
            proof.
          </p>
        </div>
      </header>
      <form className={styles.toolbar} method="get">
        <label className={styles.searchField}>
          <Search size={16} />
          <span className="sr-only">Search organizations</span>
          <input
            defaultValue={params.q}
            name="q"
            placeholder="Search by focus or location…"
          />
        </label>
        <label className={styles.filterField}>
          <span className="sr-only">Focus area</span>
          <select defaultValue={params.focus ?? ""} name="focus">
            <option value="">All focus areas</option>
            {focusAreas.map((focusArea) => (
              <option key={focusArea} value={focusArea}>
                {focusArea}
              </option>
            ))}
          </select>
        </label>
        <button className="button button-secondary" type="submit">
          <SlidersHorizontal size={16} /> Apply filters
        </button>
      </form>
      <div className={styles.resultsBar} aria-live="polite">
        <span>
          <strong>{organizations.length}</strong>{" "}
          {organizations.length === 1 ? "organization" : "organizations"} in
          view
        </span>
        {hasFilters ? (
          <Link href="/csr/discover">Clear filters</Link>
        ) : (
          <span className={styles.resultsHint}>
            Public indicators stay specific and dated.
          </span>
        )}
      </div>
      {organizations.length > 0 ? (
        <div className="organization-grid">
          {organizations.map((organization) => (
            <OrganizationCard
              csr
              organization={organization}
              key={organization.slug}
            />
          ))}
        </div>
      ) : (
        <StatePanel
          action={{ href: "/csr/discover", label: "Clear filters" }}
          description="Try an organization name, focus area, or location, then compare the public context with your own due diligence."
          kind="empty"
          title="No organizations match yet"
        />
      )}
    </div>
  );
}
