"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Check,
  ExternalLink,
  Heart,
  Info,
  MapPin,
  PackageOpen,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useDemo } from "@/components/demo-provider";
import { PublicShell } from "@/components/public-shell";
import { TrustIndicator } from "@/components/trust-indicator";
import type { PublicOrganizationProfile as PublicProfile } from "@insips/contracts";
import styles from "./public-organization-profile.module.css";

export function PublicOrganizationProfile({ organization }: { organization: PublicProfile }) {
  const { claims, review } = useDemo();
  const [followed, setFollowed] = useState(false);
  const [saved, setSaved] = useState(false);
  const newlyApproved = organization.slug === "udaan-learning-foundation"
    ? claims.filter((claim) => review[claim.id] === "approved")
    : [];
  const allClaims = [
    ...organization.trustIndicators,
    ...newlyApproved.map((claim) => ({
      id: claim.id,
      label: claim.label,
      value: claim.value,
      reviewedAt: "19 September 2026",
      meaning: "A platform reviewer matched this organization-confirmed value to submitted evidence.",
      scope: "Public indicator",
      status: "APPROVED" as const,
    })),
  ];

  return (
    <PublicShell className="marketing-site public-directory-site">
      <div className="content-hero-shell">
        <div className="public-page">
          <Link className="back-link" href="/discover"><ArrowLeft size={15} /> Back to discovery</Link>
          <section className={`${styles.profileHero} profile-hero`}>
            {organization.media[0] ? <div className={styles.cover}><Image src={organization.media[0].canonicalUrl} alt="" fill sizes="100vw" unoptimized /></div> : null}
            <div><span className="org-logo org-logo-large">{organization.displayName.split(" ").slice(0, 2).map((word) => word[0]).join("")}</span></div>
            <div className="profile-intro">
              <p className="section-kicker">Public organization profile</p>
              <h1>{organization.displayName}</h1>
              <p>{organization.summary}</p>
              <div className="profile-meta"><span><MapPin size={15} /> {organization.location}</span><span>{organization.focusAreas.join(" · ")}</span></div>
              <div className={styles.heroLinks}>{organization.websiteUrl ? <a href={organization.websiteUrl} rel="noreferrer" target="_blank">Website <ExternalLink size={13} /></a> : null}{organization.officialSocials.map((social) => <a href={social.href} key={social.href} rel="noreferrer" target="_blank">{social.label} <ExternalLink size={13} /></a>)}</div>
              <div className={styles.heroActions}><button className="button button-secondary" onClick={() => setFollowed((current) => !current)} type="button"><Heart size={15} fill={followed ? "currentColor" : "none"} /> {followed ? "Following" : "Follow organization"}</button><button className="button button-secondary" onClick={() => setSaved((current) => !current)} type="button"><Bookmark size={15} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save profile"}</button></div><span className={styles.actionStatus} role="status">{followed || saved ? <><Check size={13} /> {followed && saved ? "Profile followed and saved" : followed ? "Profile followed" : "Profile saved"}</> : "Independent public directory record"}</span>
            </div>
            <aside className="profile-trust-summary"><ShieldCheck size={22} /><strong>{allClaims.length} reviewed {allClaims.length === 1 ? "indicator" : "indicators"}</strong><p>Each indicator has its own meaning and review date. This is not a general guarantee.</p></aside>
          </section>
          <div className="public-profile-grid">
            <section>
              <div className="profile-section-heading"><div><p className="section-kicker">Explainable trust</p><h2>Public trust indicators</h2></div><Link href="/how-trust-works">How review works</Link></div>
              {allClaims.length ? <div className="public-claims">{allClaims.map((claim) => <TrustIndicator key={claim.id} label={claim.label} meaning={claim.meaning} reviewedAt={claim.reviewedAt} scope={claim.scope} status="approved" value={claim.value} />)}</div> : <div className="panel empty-state"><div><span className="empty-state-icon"><Info size={26} /></span><h2>No reviewed indicators yet</h2><p>This organization has a public profile, but no current approved trust claims.</p></div></div>}
            </section>
            <aside className="panel trust-explainer"><div className="panel-body"><h2>What this page means</h2><p>INSIPS shows evidence-backed review events. It does not certify future conduct or convert multiple statuses into a single trust score.</p><ul><li>Documents stay restricted.</li><li>Organizations confirm their own facts.</li><li>Reviewers approve individual claims.</li><li>Edits invalidate stale approval.</li></ul></div></aside>
          </div>
          <section className="profile-public-section" aria-labelledby="profile-media-title">
            <div className="profile-section-heading"><div><p className="section-kicker">Public media and updates</p><h2 id="profile-media-title">What this organization chooses to show.</h2></div><span className="profile-disclosure">{organization.disclosure}</span></div>
            {organization.media.length ? <div className="profile-media-grid">{organization.media.map((media) => <figure key={media.id}><Image src={media.canonicalUrl} alt={media.alt} width={media.width} height={media.height} unoptimized /><figcaption>{media.title}<small>{media.attribution ?? media.provider}</small></figcaption></figure>)}</div> : <div className="panel empty-state"><p>No public media has been published yet.</p></div>}
          </section>
          <section className="profile-public-section" aria-labelledby="profile-causes-title">
            <div className="profile-section-heading"><div><p className="section-kicker">Current causes</p><h2 id="profile-causes-title">Ways to contribute with context.</h2></div></div>
            {organization.causes.length ? <div className="profile-cause-list">{organization.causes.map((cause) => <Link className="profile-cause-row" href={`/causes/${cause.slug}`} key={cause.id}><span><strong>{cause.title}</strong><small>{cause.category} · ends {cause.endDate}</small></span><ArrowLeft size={15} /></Link>)}</div> : <div className="panel empty-state"><p>No active causes have been published.</p></div>}
          </section>
          <section className="profile-public-section" aria-labelledby="profile-participation-title">
            <div className="profile-section-heading"><div><p className="section-kicker">Participation</p><h2 id="profile-participation-title">Ways to take part.</h2></div></div>
            <div className={styles.participationGrid}><div className="panel"><Users size={20} /><strong>Volunteer opportunities</strong><p>No current public opportunities have been published.</p></div><div className="panel"><PackageOpen size={20} /><strong>Item needs</strong><p>No current item needs have been published.</p></div><div className="panel"><Heart size={20} /><strong>Support a cause</strong><p>{organization.causes.length ? "Explore the current cause above to understand what the organization is asking for." : "No active causes are available yet."}</p></div></div>
          </section>
          <section className="profile-public-section" aria-labelledby="profile-updates-title">
            <div className="profile-section-heading"><div><p className="section-kicker">Organization updates</p><h2 id="profile-updates-title">A dated public trail.</h2></div></div>
            {organization.posts.length ? <div className="profile-post-list">{organization.posts.map((post) => <article className="profile-post" key={post.id}><p className="section-kicker">{post.kind} · {post.publishedAt}</p><h3>{post.title}</h3><p>{post.body}</p></article>)}</div> : <div className="panel empty-state"><p>No public updates have been published.</p></div>}
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
