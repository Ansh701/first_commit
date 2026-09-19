"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Info,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useDemo } from "@/components/demo-provider";
import { PublicHeader } from "@/components/public-header";
import { StatusPill } from "@/components/status-pill";
import { publicOrganizations } from "@/lib/demo-data";

export default function OrganizationPublicProfilePage() {
  const params = useParams<{ slug: string }>();
  const organization =
    publicOrganizations.find((item) => item.slug === params.slug) ??
    publicOrganizations[0];
  const { claims, review } = useDemo();
  const newlyApproved =
    organization.slug === "udaan-learning-foundation"
      ? claims.filter((claim) => review[claim.id] === "approved")
      : [];
  const allClaims = [
    ...organization.trustClaims.map((claim) => ({
      id: claim.id,
      label: claim.label,
      value: claim.value,
      reviewedAt: claim.reviewedAt,
      meaning: claim.meaning,
      sourceSummary: claim.sourceSummary,
    })),
    ...newlyApproved.map((claim) => ({
      id: claim.id,
      label: claim.label,
      value: claim.value,
      reviewedAt: "19 September 2026",
      meaning:
        "A platform reviewer matched this organization-confirmed value to the submitted synthetic evidence.",
      sourceSummary: `Reviewed synthetic evidence, page ${claim.source.page}`,
    })),
  ];

  return (
    <>
      <PublicHeader />
      <main className="public-page" id="main-content">
        <Link className="back-link" href="/discover">
          <ArrowLeft size={15} /> Back to discovery
        </Link>
        <section className="profile-hero">
          <div>
            <span className="org-logo org-logo-large">
              {organization.displayName
                .split(" ")
                .slice(0, 2)
                .map((word) => word[0])
                .join("")}
            </span>
          </div>
          <div className="profile-intro">
            <p className="section-kicker">Public organization profile</p>
            <h1>{organization.displayName}</h1>
            <p>{organization.summary}</p>
            <div className="profile-meta">
              <span>
                <MapPin size={15} /> {organization.location}
              </span>
              <span>{organization.focusAreas.join(" · ")}</span>
            </div>
          </div>
          <aside className="profile-trust-summary">
            <ShieldCheck size={22} />
            <strong>
              {allClaims.length} reviewed{" "}
              {allClaims.length === 1 ? "indicator" : "indicators"}
            </strong>
            <p>
              Each indicator has its own meaning and review date. This is not a
              general guarantee.
            </p>
          </aside>
        </section>

        <div className="public-profile-grid">
          <section>
            <div className="profile-section-heading">
              <div>
                <p className="section-kicker">Explainable trust</p>
                <h2>Public trust indicators</h2>
              </div>
              <Link href="/how-trust-works">How review works</Link>
            </div>
            {allClaims.length ? (
              <div className="public-claims">
                {allClaims.map((claim) => (
                  <article className="public-claim" key={claim.id}>
                    <div className="public-claim-icon">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div className="public-claim-head">
                        <h3>{claim.label}</h3>
                        <StatusPill tone="approved">Reviewed</StatusPill>
                      </div>
                      <p className="public-claim-value">{claim.value}</p>
                      <p>{claim.meaning}</p>
                      <div className="claim-foot">
                        <span>
                          <CalendarDays size={14} /> Reviewed {claim.reviewedAt}
                        </span>
                        <span>{claim.sourceSummary}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="panel empty-state">
                <div>
                  <span className="empty-state-icon">
                    <Info size={26} />
                  </span>
                  <h2>No reviewed indicators yet</h2>
                  <p>
                    This organization has a public profile, but no current
                    approved trust claims. That is different from being rejected
                    or untrustworthy.
                  </p>
                </div>
              </div>
            )}
          </section>
          <aside className="panel trust-explainer">
            <div className="panel-body">
              <h2>What this page does—and does not—mean</h2>
              <p>
                INSIPS shows evidence-backed review events. It does not certify
                future conduct, provide legal advice, or convert multiple
                statuses into a single trust score.
              </p>
              <ul>
                <li>Documents stay restricted.</li>
                <li>Organizations confirm their own facts.</li>
                <li>Reviewers approve individual claims.</li>
                <li>Edits invalidate stale approval.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
