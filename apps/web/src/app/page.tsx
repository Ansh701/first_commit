import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Building2,
  Check,
  CircleUserRound,
  FileSearch,
  Landmark,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { StatusPill } from "@/components/status-pill";
import { pipelineStages } from "@/lib/demo-data";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">Evidence, made understandable</div>
            <h1>
              Turn proof into <em>explainable trust.</em>
            </h1>
            <p>
              INSIPS Passport helps social-impact organizations prepare
              evidence, confirm AI-assisted suggestions, and publish trust
              signals only after independent human review.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/app">
                Try the organization flow <ArrowRight size={17} />
              </Link>
              <Link className="button button-secondary" href="/discover">
                Explore organizations
              </Link>
            </div>
            <div className="hero-note">
              <ShieldCheck size={16} aria-hidden="true" />
              Synthetic demo data · no real identity documents
            </div>
          </div>

          <div
            className="orbit-stage"
            aria-label="Illustration of the INSIPS evidence review workflow"
          >
            <div className="orbit-card orbit-card-a">
              <Building2 size={21} aria-hidden="true" />
              <span>
                <strong>Organization</strong>
                <small>Confirms its facts</small>
              </span>
            </div>
            <div className="orbit-card orbit-card-b">
              <Bot size={21} aria-hidden="true" />
              <span>
                <strong>Compass</strong>
                <small>Suggests, never approves</small>
              </span>
            </div>
            <div className="orbit-card orbit-card-c">
              <CircleUserRound size={21} aria-hidden="true" />
              <span>
                <strong>Reviewer</strong>
                <small>Checks each claim</small>
              </span>
            </div>
            <div className="orbit-card orbit-card-d">
              <Landmark size={21} aria-hidden="true" />
              <span>
                <strong>CSR team</strong>
                <small>Sees what was reviewed</small>
              </span>
            </div>
            <div className="orbit-core">
              <div className="document-icon">
                <FileSearch size={23} />
              </div>
              <h3>CSR-1 evidence</h3>
              <p>Private document · 2 pages</p>
              <div
                className="mini-progress"
                role="progressbar"
                aria-label="Review progress"
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={4}
              >
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="orbit-badge">
              <Check size={14} /> Human review required
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="trust-heading">
          <p className="section-kicker">A clearer trust model</p>
          <h2 className="section-title" id="trust-heading">
            No magic badge. Every claim earns its own explanation.
          </h2>
          <p className="section-lede">
            Publication, legal registration, tax status, and physical
            verification are different facts. INSIPS keeps them separate,
            source-backed, and dated.
          </p>
          <div className="trust-principles">
            <article className="principle-card">
              <span className="number">01</span>
              <h3>AI prepares</h3>
              <p>
                Compass reads clean extracted text, highlights candidate fields,
                and points back to the supporting page.
              </p>
            </article>
            <article className="principle-card">
              <span className="number">02</span>
              <h3>People confirm</h3>
              <p>
                The organization accepts, edits, or dismisses every suggestion.
                Nothing advances silently.
              </p>
            </article>
            <article className="principle-card">
              <span className="number">03</span>
              <h3>Reviewers decide</h3>
              <p>
                An independent reviewer approves or rejects each claim and
                records why. Only current approvals become public.
              </p>
            </article>
          </div>
        </section>

        <section className="section" aria-labelledby="audiences-heading">
          <p className="section-kicker">One connected workflow</p>
          <h2 className="section-title" id="audiences-heading">
            Built around the questions each person actually has.
          </h2>
          <div className="audience-grid">
            <article className="audience-card">
              <Building2 size={27} />
              <h3>For organizations</h3>
              <p>
                What evidence is ready, what is missing, and what should I do
                next?
              </p>
              <Link className="card-link" href="/app">
                Open workspace <ArrowRight size={15} />
              </Link>
            </article>
            <article className="audience-card">
              <UsersRound size={27} />
              <h3>For reviewers</h3>
              <p>
                Which claim is supported, where is the source, and what decision
                is auditable?
              </p>
              <Link className="card-link" href="/review">
                Open review queue <ArrowRight size={15} />
              </Link>
            </article>
            <article className="audience-card">
              <Landmark size={27} />
              <h3>For CSR teams</h3>
              <p>
                What does this indicator mean, when was it reviewed, and is it
                current?
              </p>
              <Link className="card-link" href="/csr/discover">
                Open CSR discovery <ArrowRight size={15} />
              </Link>
            </article>
          </div>
        </section>

        <section className="section" aria-labelledby="preview-heading">
          <p className="section-kicker">The product, not a promise</p>
          <h2 className="section-title" id="preview-heading">
            A next-action workspace from upload to public trust.
          </h2>
          <div
            className="product-preview"
            aria-label="INSIPS Passport product preview"
          >
            <div className="preview-sidebar">
              <span className="brand">
                <span className="brand-symbol">
                  <span />
                </span>
                <strong>INSIPS</strong>
              </span>
              <div className="preview-nav">
                <span>Overview</span>
                <span className="active">Evidence</span>
                <span>Submission</span>
                <span>Public profile</span>
              </div>
            </div>
            <div className="preview-main">
              <div className="preview-top">
                <div>
                  <StatusPill tone="ai">INSIPS Compass</StatusPill>
                  <h3>Review what Compass found</h3>
                  <p>
                    AI-assisted suggestions from a synthetic, pre-scanned
                    fixture.
                  </p>
                </div>
                <button className="button button-primary" type="button">
                  Confirm selected
                </button>
              </div>
              <div className="preview-columns">
                <div className="preview-panel">
                  <h4>Candidate trust claims</h4>
                  <div className="suggestion-mini">
                    <strong>CSR-1 registration</strong>
                    <span>CSR00018427 · Source page 1</span>
                    <span className="confidence">HIGH SOURCE MATCH</span>
                  </div>
                  <div className="suggestion-mini">
                    <strong>Registered legal name</strong>
                    <span>Udaan Learning Foundation · Source page 1</span>
                    <span className="confidence">HIGH SOURCE MATCH</span>
                  </div>
                  <div className="suggestion-mini">
                    <strong>80G status</strong>
                    <span>
                      Referenced, certificate not included · Source page 2
                    </span>
                    <span className="confidence">REVIEW CAREFULLY</span>
                  </div>
                </div>
                <div className="preview-panel">
                  <h4>Secure processing</h4>
                  <div className="timeline-mini">
                    {pipelineStages.map((stage) => (
                      <div
                        className={`timeline-row ${stage.state}`}
                        key={stage.label}
                      >
                        <span className="timeline-dot" />
                        <span>
                          <strong>{stage.label}</strong>
                          <small>{stage.detail}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="aws-heading">
          <p className="section-kicker">AWS-powered, human-controlled</p>
          <h2 className="section-title" id="aws-heading">
            Security gates are part of the product story.
          </h2>
          <p className="section-lede">
            Documents stay private, scanning gates extraction, structured AI
            output is validated, and people control every consequential
            transition.
          </p>
          <div className="aws-flow" aria-label="AWS evidence processing flow">
            <div className="aws-node">
              <strong>Private S3</strong>
              <small>Quarantine upload</small>
            </div>
            <ArrowRight className="flow-arrow" size={18} />
            <div className="aws-node">
              <strong>GuardDuty</strong>
              <small>Malware result</small>
            </div>
            <ArrowRight className="flow-arrow" size={18} />
            <div className="aws-node">
              <strong>Step Functions</strong>
              <small>Enforced sequence</small>
            </div>
            <ArrowRight className="flow-arrow" size={18} />
            <div className="aws-node">
              <strong>Textract</strong>
              <small>Page-aware text</small>
            </div>
            <ArrowRight className="flow-arrow" size={18} />
            <div className="aws-node">
              <strong>Bedrock</strong>
              <small>Bounded candidates</small>
            </div>
            <ArrowRight className="flow-arrow" size={18} />
            <div className="aws-node">
              <strong>Human review</strong>
              <small>Claim decision</small>
            </div>
          </div>
        </section>

        <section className="section section-tight">
          <div className="final-cta">
            <div>
              <h2>See the complete evidence-to-publication loop.</h2>
              <p>
                Start in the organization workspace, confirm Compass
                suggestions, submit them, and switch to the reviewer view.
              </p>
            </div>
            <Link className="button button-accent" href="/app">
              Start the demo <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>INSIPS Passport · Synthetic hackathon demonstration</span>
        <span>AI assists · organizations confirm · people review</span>
      </footer>
    </>
  );
}
