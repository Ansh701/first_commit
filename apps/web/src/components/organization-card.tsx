"use client";

import Link from "next/link";
import { Bookmark, MapPin } from "lucide-react";
import type { PublicOrganization, PublicOrganizationSummary } from "@insips/contracts";
import { useDemo } from "./demo-provider";
import { StatusPill } from "./status-pill";

export function OrganizationCard({
  organization,
  csr = false,
}: {
  organization: PublicOrganization | PublicOrganizationSummary;
  csr?: boolean;
}) {
  const { shortlist, toggleShortlist } = useDemo();
  const saved = shortlist.includes(organization.slug);
  const reviewedCount = "trustClaims" in organization
    ? organization.trustClaims.length
    : organization.approvedIndicatorCount;

  return (
    <article className="org-card">
      <div className="org-card-top">
        <span className="org-logo">
          {organization.displayName
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("")}
        </span>
        {csr ? (
          <button
            className={`save-button ${saved ? "saved" : ""}`}
            type="button"
            onClick={() => toggleShortlist(organization.slug)}
            aria-label={`${saved ? "Remove" : "Add"} ${organization.displayName} ${saved ? "from" : "to"} shortlist`}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          </button>
        ) : reviewedCount > 0 ? (
          <StatusPill tone="approved">
            {reviewedCount} reviewed
          </StatusPill>
        ) : (
          <StatusPill>No public claims</StatusPill>
        )}
      </div>
      <h2>
        <Link href={`/organizations/${organization.slug}`}>
          {organization.displayName}
        </Link>
      </h2>
      <p>{organization.summary}</p>
      <div className="tag-row">
        {organization.focusAreas.map((area) => (
          <span className="tag" key={area}>
            {area}
          </span>
        ))}
      </div>
      <div className="org-meta">
        <span>
          <MapPin size={13} /> {organization.location}
        </span>
        <Link href={`/organizations/${organization.slug}`}>View profile →</Link>
      </div>
    </article>
  );
}
