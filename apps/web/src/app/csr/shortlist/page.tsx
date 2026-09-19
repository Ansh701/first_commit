"use client";

import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { OrganizationCard } from "@/components/organization-card";
import { StatusPill } from "@/components/status-pill";
import { publicOrganizations } from "@/lib/demo-data";

export default function ShortlistPage() {
  const { shortlist } = useDemo();
  const organizations = publicOrganizations.filter((organization) =>
    shortlist.includes(organization.slug),
  );
  return (
    <>
      <header className="page-heading">
        <div>
          <StatusPill tone="pending">{organizations.length} saved</StatusPill>
          <h1>Your shortlist</h1>
          <p>
            A lightweight place to compare organizations you may want to
            research further.
          </p>
        </div>
      </header>
      {organizations.length ? (
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
        <section className="panel empty-state">
          <div>
            <span className="empty-state-icon">
              <Bookmark size={26} />
            </span>
            <h2>Your shortlist is empty</h2>
            <p>
              Discover organizations and save the ones you want to compare.
              Saving is private to this synthetic browser fixture.
            </p>
            <Link className="button button-primary" href="/csr/discover">
              <Search size={16} /> Discover organizations
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
