import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PublicShell } from "./public-shell";

export type ContentSection = { title: string; body: string; points?: string[] };

export function ContentPage({
  kicker,
  title,
  intro,
  sections,
  draft = false,
  ctaLabel = "Explore the demo",
  ctaHref = "/demo",
}: {
  kicker: string;
  title: string;
  intro: string;
  sections: ContentSection[];
  draft?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const isFaq = kicker.toLowerCase().includes("frequently");
  const isMethodology = /methodology|how it works/i.test(kicker);
  const isSecurity = /security|privacy/i.test(kicker);
  const isResources = kicker.toLowerCase() === "resources";

  return (
    <PublicShell className="marketing-site content-site">
      <div className={`content-hero-shell content-variant-${isFaq ? "faq" : isMethodology ? "methodology" : isSecurity ? "security" : isResources ? "resources" : "standard"}`}>
        <header className="content-hero">
          <p className="marketing-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
          {draft ? <span className="draft-label">Hackathon draft · not legal advice</span> : null}
        </header>
        {isFaq ? (
          <div className="content-body content-faq-list">
            {sections.map((section, index) => (
              <details key={section.title} open={index === 0}>
                <summary><span className="content-index">0{index + 1}</span><strong>{section.title}</strong></summary>
                <div className="content-faq-answer"><p>{section.body}</p>{section.points ? <ContentPoints points={section.points} /> : null}</div>
              </details>
            ))}
          </div>
        ) : isMethodology ? (
          <ol className="content-body content-timeline">
            {sections.map((section, index) => (
              <li key={section.title}>
                <span className="content-index">0{index + 1}</span>
                <div><h2>{section.title}</h2><p>{section.body}</p>{section.points ? <ContentPoints points={section.points} /> : null}</div>
              </li>
            ))}
          </ol>
        ) : isSecurity ? (
          <div className="content-body content-classification-grid">
            {sections.map((section, index) => (
              <section key={section.title}>
                <span className="content-index">0{index + 1}</span><div><h2>{section.title}</h2><p>{section.body}</p>{section.points ? <ContentPoints points={section.points} /> : null}</div>
              </section>
            ))}
          </div>
        ) : isResources ? (
          <div className="content-body content-resource-grid">
            {sections.map((section, index) => (
              <section key={section.title}><span className="content-index">0{index + 1}</span><div><h2>{section.title}</h2><p>{section.body}</p><Link className="text-action" href={index === 1 ? "/security-privacy" : index === 2 ? "/faq" : "/how-trust-works"}>Open resource <ArrowRight size={15} /></Link></div></section>
            ))}
          </div>
        ) : (
          <div className="content-body">
            {sections.map((section, index) => (
              <section key={section.title}><span className="content-index">0{index + 1}</span><div><h2>{section.title}</h2><p>{section.body}</p>{section.points ? <ContentPoints points={section.points} /> : null}</div></section>
            ))}
          </div>
        )}
        <section className="content-cta">
          <p>See the trust workflow for yourself.</p>
          <h2>Evidence stays private. Approved facts become understandable.</h2>
          <Link className="button button-accent button-large" href={ctaHref}>{ctaLabel} <ArrowRight size={17} /></Link>
        </section>
      </div>
    </PublicShell>
  );
}

function ContentPoints({ points }: { points: string[] }) {
  return <ul>{points.map((point) => <li key={point}><CheckCircle2 size={16} /> {point}</li>)}</ul>;
}
