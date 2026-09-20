import { Search } from "lucide-react";
import { OrganizationCard } from "@/components/organization-card";
import { PublicShell } from "@/components/public-shell";
import { StatePanel } from "@/components/state-panel";
import { getPublicOrganizations } from "@/lib/server/content-repository";

export const metadata = { title: "Discover organizations" };

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const area = params.area?.trim() ?? "";
  const organizations = await getPublicOrganizations({ query, focusArea: area });
  const allOrganizations = await getPublicOrganizations();
  const areas = Array.from(new Set(allOrganizations.flatMap((item) => item.focusAreas))).sort();

  return (
    <PublicShell className="marketing-site public-directory-site">
      <div className="content-hero-shell">
        <div className="public-page">
          <header className="public-page-heading">
            <p className="section-kicker">Discover social impact</p>
            <h1>Understand the work, and what has actually been reviewed.</h1>
            <p>Browse organizations through specific, dated, explained indicators.</p>
          </header>
          <form className="discovery-toolbar" action="/discover" method="get">
            <label className="search-field"><Search size={17} /><span className="sr-only">Search organizations</span><input defaultValue={query} name="q" placeholder="Search by organization, location, or cause" /></label>
            <label className="filter-select"><span className="sr-only">Filter by focus area</span><select defaultValue={area} name="area"><option value="">All focus areas</option>{areas.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <button className="button button-primary" type="submit">Apply filters</button>
          </form>
          {organizations.length ? <div className="organization-grid">{organizations.map((organization) => <OrganizationCard organization={organization} key={organization.slug} />)}</div> : <StatePanel action={{ href: "/discover", label: "Clear filters" }} description="Try a different organization name, location, or focus area." kind="empty" title="No organizations match" />}
        </div>
      </div>
    </PublicShell>
  );
}
