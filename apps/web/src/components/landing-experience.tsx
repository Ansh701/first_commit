import type {
  PublicCause,
  PublicFeedPost,
  PublicMedia,
  PublicOrganizationSummary,
} from "@insips/contracts";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileSearch,
  Landmark,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { BeforeAfterSlider } from "./before-after-slider";
import { CauseReel } from "./cause-reel";
import { EcosystemOrbit } from "./ecosystem-orbit";
import { EvidenceWorkbench } from "./evidence-workbench";
import { HeroCarousel, type HeroSlide } from "./hero-carousel";
import { LogoMarquee } from "./logo-marquee";
import { PublicUpdateList } from "./public-update-list";
import { ScreenshotStack } from "./screenshot-stack";

const audiencePaths = [
  { label: "For organizations", title: "Prepare once. Explain every claim.", text: "Keep evidence private, confirm candidate fields, and see what needs a human decision next.", href: "/for-organizations", icon: Building2 },
  { label: "For reviewers", title: "Decide with the source in view.", text: "Review claim by claim with the organization-confirmed value and its safe evidence context together.", href: "/review", icon: UsersRound },
  { label: "For CSR teams", title: "Compare specific indicators.", text: "Discover organizations through dated, explained public signals instead of a black-box score.", href: "/for-csr-teams", icon: Landmark },
];

export function LandingExperience({
  organizations,
  causes,
  posts,
}: {
  organizations: PublicOrganizationSummary[];
  causes: PublicCause[];
  posts: PublicFeedPost[];
}) {
  const media: PublicMedia[] = organizations.flatMap((organization) => {
    const local = organization.slug === "udaan-learning-foundation" ? "/admin-org-marketing-1440.png" : "/corporate-discovery-dark.png";
    return [{ id: `homepage-${organization.slug}`, type: "IMAGE" as const, title: `${organization.displayName} workspace`, alt: `INSIPS product workspace preview for ${organization.displayName}.`, canonicalUrl: local, sourceUrl: local, provider: "INSIPS local product capture", permission: "LOCAL_FIXTURE" as const, publishingState: "PUBLISHED" as const, width: 1440, height: 900 }];
  });
  const heroSlides: HeroSlide[] = [
    { eyebrow: "Organization story", title: "Make every public claim easier to explain.", body: "Give people the context behind a signal: what was checked, who decided, and when it was reviewed.", href: "/discover", cta: "Discover organizations", image: "/admin-org-marketing-1440.png", alt: "INSIPS organization workspace showing a clear evidence-to-public trail." },
    { eyebrow: "Cause story", title: "Contribution deserves a visible next step.", body: "Keep causes, owners, targets, current progress, and end dates together so giving feels specific rather than abstract.", href: "/causes", cta: "Explore causes", image: "/media/home/carousel-community.png", alt: "Community learning and food-support work shown across a local programme and a volunteer packing team." },
    { eyebrow: "Evidence story", title: "A suggestion is useful only when a person can decide.", body: "Compass prepares candidates. Organizations confirm. Independent reviewers decide what can be projected publicly.", href: "/how-trust-works", cta: "See how review works", image: "/admin-org-marketing-1440.png", alt: "INSIPS product screen showing evidence review and human decision context." },
  ];

  return (
    <>
      <section className="landing-hero landing-hero-story" aria-labelledby="hero-title">
        <div className="landing-hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Evidence-to-trust platform</p>
          <h1 id="hero-title">Trust is a trail, not a badge.</h1>
          <p className="hero-support">INSIPS helps impact organizations prepare private evidence, confirm every suggested fact, and publish only what an independent reviewer approves.</p>
          <div className="hero-actions"><Link className="button button-primary button-large" href="/demo">Open the product demo <ArrowRight size={17} /></Link><Link className="button button-secondary button-large" href="/discover">Discover organizations</Link></div>
          <div className="hero-proof-row" aria-label="Workflow assurances"><span><ShieldCheck size={15} /> Private by default</span><span><BadgeCheck size={15} /> Approved-only public view</span></div>
        </div>
        <HeroCarousel slides={heroSlides} />
      </section>

      <LogoMarquee organizations={organizations} />

      <section className="marketing-section workbench-section" id="platform" aria-labelledby="workbench-section-title">
        <div className="section-heading-split"><div><p className="marketing-kicker">The product idea</p><h2 id="workbench-section-title">Keep the source, decision, and public meaning close.</h2></div><p>Files, fields, and decisions usually drift apart. The evidence workbench makes the next action explicit without turning private documents into public content.</p></div>
        <EvidenceWorkbench />
      </section>

      <section className="ledger-strip" aria-label="INSIPS principles"><div><span>01</span><strong>Source stays close</strong><p>Page-aware context remains attached to each candidate.</p></div><div><span>02</span><strong>People own decisions</strong><p>AI can suggest; people confirm and review.</p></div><div><span>03</span><strong>Public means current</strong><p>Only approved projections are visible outside the workspace.</p></div></section>

      <EcosystemOrbit />
      <CauseReel causes={causes} />
      <ScreenshotStack media={media} />
      <BeforeAfterSlider />
      <PublicUpdateList posts={posts} />

      <section className="marketing-section story-section">
        <div className="section-heading-split"><div><p className="marketing-kicker">A human-owned workflow</p><h2>Every step has a clear owner.</h2></div><p>Preparation can be assisted. Confirmation and review remain decisions made by people with the right context.</p></div>
        <div className="ledger-bands"><article className="ledger-band"><span className="ledger-band-number">A</span><div><p className="marketing-kicker">Prepare</p><h3>Know what is ready and what needs attention.</h3><p>A calm evidence profile makes the next action explicit before anything reaches review.</p></div><FileSearch size={25} /></article><article className="ledger-band"><span className="ledger-band-number">B</span><div><p className="marketing-kicker">Confirm</p><h3>Suggestions stay suggestions until you decide.</h3><p>Compare the source, accept or edit the candidate, and leave a clear human record.</p></div><CheckCircle2 size={25} /></article><article className="ledger-band"><span className="ledger-band-number">C</span><div><p className="marketing-kicker">Publish</p><h3>Show the claim, its meaning, and its review date.</h3><p>Public profiles stay specific and current without exposing the source document or reviewer notes.</p></div><BadgeCheck size={25} /></article></div>
      </section>

      <section className="proof-section"><div className="marketing-section proof-grid"><div><p className="marketing-kicker">A public signal with edges</p><h2>CSR-1 registration · reviewed 19 September 2026</h2><p>This indicator means a platform reviewer matched the organization-confirmed value to submitted evidence. It does not guarantee future conduct, and it is not a general trust score.</p><Link className="text-action" href="/organizations/udaan-learning-foundation">See the public profile <ArrowRight size={15} /></Link></div><div className="proof-card"><div className="proof-card-top"><BadgeCheck size={18} /><span>Approved and current</span></div><strong>CSR00018427</strong><p>Meaning, scope, and review date remain visible together.</p><div className="proof-card-foot"><CalendarDays size={14} /> Reviewed 19 Sep 2026</div></div></div></section>

      <section className="marketing-section audience-section" aria-labelledby="audience-title"><div className="section-heading-centered"><p className="marketing-kicker">One workflow, clear views</p><h2 id="audience-title">The right context for each person.</h2><p>Organizations, reviewers, and CSR teams see the action and context that belongs to them.</p></div><div className="audience-editorial-grid">{audiencePaths.map((item, index) => { const Icon = item.icon; return <article className="audience-editorial-card" key={item.label}><div className="audience-card-top"><span>0{index + 1}</span><Icon size={23} /></div><p className="marketing-kicker">{item.label}</p><h3>{item.title}</h3><p>{item.text}</p><Link className="text-action" href={item.href}>Explore this view <ArrowRight size={15} /></Link></article>; })}</div></section>

      <section className="privacy-section"><div className="marketing-section privacy-grid"><div><p className="marketing-kicker">Private by default</p><h2>Your evidence stays protected while it is checked and prepared.</h2><p>Clear explanations do not require public access to the document itself.</p></div><div className="privacy-ledger"><div><span>01</span><strong>Restricted evidence</strong></div><div><span>02</span><strong>Human confirmation</strong></div><div><span>03</span><strong>Independent review</strong></div><div><span>04</span><strong>Approved projection</strong></div></div></div></section>

      <section className="marketing-section final-marketing-cta"><p className="marketing-kicker">Start with the trail</p><h2>Make every claim easier to understand.</h2><div><Link className="button button-primary button-large" href="/demo">Open the product demo <ArrowRight size={17} /></Link><Link className="button button-secondary button-large" href="/how-trust-works">How the review works</Link></div></section>
    </>
  );
}
