"use client";

import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import type { PublicOrganizationSummary } from "@insips/contracts";
import { useDemo } from "@/components/demo-provider";
import { OrganizationCard } from "@/components/organization-card";
import { StatusPill } from "@/components/status-pill";

export function ShortlistClient({ organizations }: { organizations: PublicOrganizationSummary[] }) {
  const { shortlist } = useDemo();
  const saved = organizations.filter((organization) => shortlist.includes(organization.slug));
  return (
    <>
      <header className="page-heading">
        <div>
          <StatusPill tone="pending">{saved.length} saved</StatusPill>
          <h1>Your shortlist</h1>
          <p>A lightweight place to compare organizations you may want to research further.</p>
        </div>
      </header>
      {saved.length ? (
        <div className="organization-grid">
          {saved.map((organization) => <OrganizationCard csr organization={organization} key={organization.slug} />)}
        </div>
      ) : (
        <section className="panel empty-state">
          <div>
            <span className="empty-state-icon"><Bookmark size={26} /></span>
            <h2>Your shortlist is empty</h2>
            <p>Discover organizations and save the ones you want to compare. Saving is private to your workspace.</p>
            <Link className="button button-primary" href="/csr/discover"><Search size={16} /> Discover organizations</Link>
          </div>
        </section>
      )}
    </>
  );
}
