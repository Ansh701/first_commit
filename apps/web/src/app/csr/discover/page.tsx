import { Search, SlidersHorizontal } from "lucide-react";
import { OrganizationCard } from "@/components/organization-card";
import { StatusPill } from "@/components/status-pill";
import { publicOrganizations } from "@/lib/demo-data";

export default function CsrDiscoverPage() {
  return (
    <>
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
      <div className="filter-bar">
        <label className="search-field">
          <Search size={16} />
          <span className="sr-only">Search organizations</span>
          <input placeholder="Search by focus or location…" />
        </label>
        <button className="button button-secondary" type="button">
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>
      <div className="organization-grid">
        {publicOrganizations.map((organization) => (
          <OrganizationCard
            csr
            organization={organization}
            key={organization.slug}
          />
        ))}
      </div>
    </>
  );
}
