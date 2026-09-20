import { Search, SlidersHorizontal } from "lucide-react";
import { OrganizationCard } from "@/components/organization-card";
import { StatusPill } from "@/components/status-pill";
import { getPublicOrganizations } from "@/lib/server/content-repository";

export default async function CsrDiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const organizations = await getPublicOrganizations({ query: params.q });
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
          <input defaultValue={params.q} name="q" placeholder="Search by focus or location…" />
        </label>
        <button className="button button-secondary" type="button">
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>
      <div className="organization-grid">
        {organizations.map((organization) => (
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
