import { Search, SlidersHorizontal } from "lucide-react";
import { OrganizationCard } from "@/components/organization-card";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { publicOrganizations } from "@/lib/demo-data";

export const metadata = { title: "Discover organizations" };

export default function DiscoverPage() {
  return (
    <div className="marketing-site public-directory-site">
      <div className="content-hero-shell">
        <PublicHeader />
        <main className="public-page" id="main-content">
          <header className="public-page-heading">
            <p className="section-kicker">Discover social impact</p>
            <h1>Understand the work—and what has actually been reviewed.</h1>
            <p>
              Browse synthetic demonstration organizations. Trust indicators
              stay specific, dated, and explained.
            </p>
          </header>
          <div className="discovery-toolbar">
            <label className="search-field">
              <Search size={17} />
              <span className="sr-only">Search organizations</span>
              <input placeholder="Search by organization, location, or cause" />
            </label>
            <button className="button button-secondary" type="button">
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
          <div className="organization-grid">
            {publicOrganizations.map((organization) => (
              <OrganizationCard
                organization={organization}
                key={organization.slug}
              />
            ))}
          </div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
