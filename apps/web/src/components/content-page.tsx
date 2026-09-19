import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PublicHeader } from "./public-header";
import { SiteFooter } from "./site-footer";

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
  return (
    <div className="marketing-site content-site">
      <div className="content-hero-shell">
        <PublicHeader />
        <main id="main-content">
          <header className="content-hero">
            <p className="marketing-kicker">{kicker}</p>
            <h1>{title}</h1>
            <p>{intro}</p>
            {draft ? (
              <span className="draft-label">
                Hackathon draft · not legal advice
              </span>
            ) : null}
          </header>
          <div className="content-body">
            {sections.map((section, index) => (
              <section key={section.title}>
                <span className="content-index">0{index + 1}</span>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  {section.points ? (
                    <ul>
                      {section.points.map((point) => (
                        <li key={point}>
                          <CheckCircle2 size={16} /> {point}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
          <section className="content-cta">
            <p>See the trust workflow for yourself.</p>
            <h2>
              Evidence stays private. Approved facts become understandable.
            </h2>
            <Link className="button button-accent button-large" href={ctaHref}>
              {ctaLabel} <ArrowRight size={17} />
            </Link>
          </section>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
