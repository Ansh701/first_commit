"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  CircleUserRound,
  FileCheck2,
  FileSearch,
  Landmark,
  LockKeyhole,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

const featureData = {
  prepare: {
    label: "Prepare evidence",
    eyebrow: "A calm place for every document",
    title: "Know what is ready—and what needs attention.",
    text: "A guided evidence profile turns scattered files into a clear next-action workspace without exposing private material publicly.",
  },
  confirm: {
    label: "Confirm facts",
    eyebrow: "INSIPS Compass",
    title: "Suggestions stay suggestions until you decide.",
    text: "Compare each candidate with its source, then accept, edit, or dismiss it. Confidence describes the source match, not legitimacy.",
  },
  review: {
    label: "Human review",
    eyebrow: "Independent decisions",
    title: "Reviewers decide claim by claim.",
    text: "The submitted value and source context stay together. Review decisions are separate, attributable, and never silently rewrite organization facts.",
  },
  public: {
    label: "Public trust",
    eyebrow: "Specific, dated, explained",
    title: "Share only what is approved and current.",
    text: "Public profiles show the claim, what it means, and when it was reviewed—without publishing private evidence or internal notes.",
  },
} as const;

type FeatureKey = keyof typeof featureData;

const ecosystem = [
  "Education",
  "Healthcare",
  "Climate",
  "Livelihoods",
  "Organizations",
  "CSR teams",
  "Reviewers",
  "Donors",
];

const flowSteps = [
  { label: "Upload privately", icon: LockKeyhole },
  { label: "Safety check", icon: ShieldCheck },
  { label: "Read the evidence", icon: FileSearch },
  { label: "Review suggestions", icon: Sparkles },
  { label: "Human decision", icon: CircleUserRound },
  { label: "Publish approved facts", icon: BadgeCheck },
];

const reveal = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
};

function FeatureMockup({ active }: { active: FeatureKey }) {
  if (active === "prepare") {
    return (
      <div className="feature-mockup-grid">
        <div className="mockup-summary">
          <span>Evidence readiness</span>
          <strong>3 of 4</strong>
          <div className="mockup-progress">
            <i />
            <i />
            <i />
            <i />
          </div>
          <small>One action before review</small>
        </div>
        <div className="mockup-list">
          {[
            ["Organization profile", "Ready"],
            ["CSR-1 certificate", "Prepared"],
            ["80G certificate", "Missing"],
          ].map(([title, state]) => (
            <div className="mockup-row" key={title}>
              <span className="mockup-file">
                <FileCheck2 size={17} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>Evidence profile</small>
              </span>
              <em>{state}</em>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (active === "confirm") {
    return (
      <div className="feature-confirm-scene">
        <div className="source-sheet">
          <small>Synthetic source · page 1</small>
          <h4>Form CSR-1 registration</h4>
          <p>Registration number</p>
          <mark>CSR00018427</mark>
          <span className="source-line" />
          <span className="source-line short" />
        </div>
        <div className="candidate-card">
          <span className="candidate-label">
            <Sparkles size={14} /> Candidate field
          </span>
          <h4>CSR-1 registration</h4>
          <strong>CSR00018427</strong>
          <p>High source match · page 1</p>
          <div>
            <button type="button">
              <Check size={14} /> Accept
            </button>
            <button type="button">Edit</button>
            <button type="button">Dismiss</button>
          </div>
        </div>
      </div>
    );
  }

  if (active === "review") {
    return (
      <div className="feature-review-scene">
        <div className="review-queue-mini">
          <span className="queue-label">Review queue</span>
          <h4>Udaan Learning Foundation</h4>
          <p>1 organization-confirmed claim</p>
          <div className="review-source-mini">
            <SearchCheck size={20} />
            <span>
              <strong>Source located</strong>
              <small>Page 1 · exact label match</small>
            </span>
          </div>
        </div>
        <div className="review-decision-mini">
          <span>Claim decision</span>
          <strong>CSR00018427</strong>
          <button type="button">
            <CheckCircle2 size={16} /> Approve
          </button>
          <button type="button">Request changes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-public-scene">
      <div className="public-org-mini">
        <span className="public-org-avatar">UL</span>
        <small>Public trust profile</small>
        <h4>Udaan Learning Foundation</h4>
        <p>Community learning · Pune</p>
      </div>
      <div className="approved-claim-mini">
        <span>
          <BadgeCheck size={16} /> Reviewed indicator
        </span>
        <h4>CSR-1 registration</h4>
        <strong>CSR00018427</strong>
        <p>Matched to submitted evidence · reviewed 19 Sep 2026</p>
      </div>
    </div>
  );
}

export function LandingExperience() {
  const reduceMotion = useReducedMotion();
  const [activeFeature, setActiveFeature] = useState<FeatureKey>("prepare");
  const [activeStep, setActiveStep] = useState(3);
  const feature = featureData[activeFeature];

  const ambient = (delay: number, y = 9) =>
    reduceMotion
      ? undefined
      : {
          y: [0, -y, 0],
          rotate: [0, delay % 2 ? 2 : -2, 0],
          transition: {
            duration: 8 + delay,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay,
          },
        };

  return (
    <>
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="hero-grid-glow" aria-hidden="true" />
        <motion.div className="hero-chip hero-chip-org" animate={ambient(0)}>
          <Building2 size={16} />
          <span>Organizations</span>
        </motion.div>
        <motion.div
          className="hero-chip hero-chip-evidence"
          animate={ambient(1.2, 12)}
        >
          <FileSearch size={16} />
          <span>Private evidence</span>
        </motion.div>
        <motion.div
          className="hero-chip hero-chip-review"
          animate={ambient(0.7, 7)}
        >
          <UsersRound size={16} />
          <span>Human reviewers</span>
        </motion.div>
        <motion.div
          className="hero-chip hero-chip-csr"
          animate={ambient(1.8, 10)}
        >
          <Landmark size={16} />
          <span>CSR teams</span>
        </motion.div>
        <div className="landing-hero-content">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="hero-kicker"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          >
            Evidence, made understandable.
          </motion.p>
          <h1 id="hero-title" aria-label="Turn evidence into explainable trust">
            {["TURN EVIDENCE", "INTO EXPLAINABLE", "HUMAN-REVIEWED TRUST."].map(
              (line, index) => (
                <span className={index === 1 ? "accent-line" : ""} key={line}>
                  <motion.i
                    animate={{ y: 0 }}
                    initial={reduceMotion ? false : { y: "110%" }}
                    transition={{
                      delay: 0.12 + index * 0.1,
                      duration: 0.68,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {line}
                  </motion.i>
                </span>
              ),
            )}
          </h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="hero-support"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            transition={{ delay: 0.48, duration: 0.55 }}
          >
            INSIPS helps social-impact organizations prepare evidence, confirm
            every suggested fact, and publish only what an independent reviewer
            approves.
          </motion.p>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="hero-actions hero-actions-centered"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            transition={{ delay: 0.58 }}
          >
            <Link className="button button-accent button-large" href="/demo">
              Explore the demo <ArrowRight size={18} />
            </Link>
            <Link
              className="button button-on-dark button-large"
              href="/discover"
            >
              Discover organizations
            </Link>
          </motion.div>
          <motion.div
            animate={{ opacity: 1 }}
            className="hero-trust-note"
            initial={reduceMotion ? false : { opacity: 0 }}
            transition={{ delay: 0.72 }}
          >
            <ShieldCheck size={15} /> AI assists. Organizations confirm. People
            decide.
          </motion.div>
        </div>

        <motion.div
          className="hero-product-scene"
          initial={reduceMotion ? false : { opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-scene-toolbar">
            <span className="scene-dots">
              <i />
              <i />
              <i />
            </span>
            <span>INSIPS · Evidence workspace</span>
            <span className="scene-ready">
              <i /> Private workspace
            </span>
          </div>
          <div className="hero-scene-body">
            <div className="hero-scene-nav">
              <span className="scene-logo">I</span>
              {["Overview", "Evidence", "Claims", "Public profile"].map(
                (item, index) => (
                  <span className={index === 1 ? "active" : ""} key={item}>
                    {item}
                  </span>
                ),
              )}
            </div>
            <div className="hero-scene-main">
              <div className="scene-heading">
                <div>
                  <small>INSIPS Compass</small>
                  <h2>Review suggested facts</h2>
                </div>
                <span className="scene-status">3 candidates</span>
              </div>
              <div className="scene-columns">
                <div className="scene-card scene-source">
                  <span className="scene-card-label">Source evidence</span>
                  <div className="paper-preview">
                    <small>SYNTHETIC DOCUMENT</small>
                    <strong>Form CSR-1</strong>
                    <p>Udaan Learning Foundation</p>
                    <mark>Registration No. CSR00018427</mark>
                    <span />
                    <span />
                    <span className="short" />
                  </div>
                </div>
                <div className="scene-card scene-candidates">
                  <span className="scene-card-label">Candidate fields</span>
                  {[
                    "CSR-1 registration",
                    "Registered legal name",
                    "80G status",
                  ].map((item, index) => (
                    <div className="scene-candidate" key={item}>
                      <span>
                        <strong>{item}</strong>
                        <small>
                          {index === 2
                            ? "Review carefully"
                            : "High source match"}
                        </small>
                      </span>
                      <i className={index === 0 ? "selected" : ""}>
                        {index === 0 ? <Check size={13} /> : index + 1}
                      </i>
                    </div>
                  ))}
                  <button type="button">
                    Continue with 1 claim <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section
        className="ecosystem-strip"
        aria-label="People and cause areas supported by INSIPS"
      >
        <p>Built for the impact ecosystem</p>
        <div className="marquee-window">
          <div className="marquee-track">
            {[...ecosystem, ...ecosystem].map((item, index) => (
              <span key={`${item}-${index}`}>
                <i />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <motion.section
        className="marketing-section feature-section"
        id="platform"
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.16 }}
        transition={{ duration: reduceMotion ? 0 : 0.6 }}
      >
        <div className="section-heading-centered">
          <p className="marketing-kicker">The platform</p>
          <h2>EVERY STEP HAS A HUMAN OWNER.</h2>
          <p>
            Move from private evidence to public clarity without losing context,
            control, or accountability.
          </p>
        </div>
        <div
          className="feature-tabs"
          role="tablist"
          aria-label="Platform capabilities"
        >
          {(Object.keys(featureData) as FeatureKey[]).map((key) => (
            <button
              aria-selected={activeFeature === key}
              className={activeFeature === key ? "active" : ""}
              key={key}
              onClick={() => setActiveFeature(key)}
              role="tab"
              type="button"
            >
              {activeFeature === key ? (
                <motion.span
                  className="feature-tab-highlight"
                  layoutId="feature-tab"
                />
              ) : null}
              <span>{featureData[key].label}</span>
            </button>
          ))}
        </div>
        <div className="feature-showcase">
          <div className="feature-copy">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                initial={{ opacity: 0, y: 12 }}
                key={activeFeature}
                transition={{ duration: reduceMotion ? 0 : 0.28 }}
              >
                <p className="feature-eyebrow">{feature.eyebrow}</p>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <Link href={activeFeature === "public" ? "/discover" : "/demo"}>
                  See it in action <ArrowRight size={16} />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="feature-visual">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: -16 }}
                initial={{ opacity: 0, scale: 0.98, x: 16 }}
                key={activeFeature}
                transition={{ duration: reduceMotion ? 0 : 0.34 }}
              >
                <FeatureMockup active={activeFeature} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      <section
        className="marketing-section action-section"
        aria-labelledby="action-title"
      >
        <div className="section-heading-split">
          <div>
            <p className="marketing-kicker">Product in action</p>
            <h2 id="action-title">FROM A PRIVATE FILE TO A PUBLIC FACT.</h2>
          </div>
          <p>
            Explore the six visible stages. The product always shows what is
            happening, what is blocked, and who needs to act next.
          </p>
        </div>
        <div className="action-demo">
          <div
            className="action-steps"
            role="tablist"
            aria-label="Evidence workflow steps"
          >
            {flowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <button
                  aria-selected={activeStep === index}
                  className={
                    activeStep === index
                      ? "active"
                      : index < activeStep
                        ? "complete"
                        : ""
                  }
                  key={step.label}
                  onClick={() => setActiveStep(index)}
                  role="tab"
                  type="button"
                >
                  <span>
                    {index < activeStep ? (
                      <Check size={15} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </span>
                  <strong>{step.label}</strong>
                  <small>0{index + 1}</small>
                </button>
              );
            })}
          </div>
          <div className="action-stage">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                initial={{ opacity: 0, y: 15 }}
                key={activeStep}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                className="action-stage-card"
              >
                <div className="stage-orbit" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="stage-number">0{activeStep + 1}</span>
                <div>
                  <p>
                    {activeStep === 3
                      ? "Your decision"
                      : activeStep === 4
                        ? "Independent review"
                        : activeStep === 5
                          ? "Public result"
                          : "Protected workflow"}
                  </p>
                  <h3>{flowSteps[activeStep].label}</h3>
                  <p>
                    {
                      [
                        "Add a PDF to a restricted workspace. Its display name is separated from the protected storage identity.",
                        "The file stays blocked until the safety result is known. Failed or unsupported files never move forward.",
                        "The system prepares page-aware text so every later suggestion can point back to its source.",
                        "Compass prepares candidates; you compare the source and accept, edit, or dismiss each one.",
                        "A reviewer sees the confirmed value with its evidence context and records a claim-level decision.",
                        "Only approved, current facts reach the public profile. Private evidence and notes stay restricted.",
                      ][activeStep]
                    }
                  </p>
                </div>
                <span className="stage-icon">
                  {(() => {
                    const Icon = flowSteps[activeStep].icon;
                    return <Icon size={38} />;
                  })()}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="audience-section" aria-labelledby="audience-title">
        <div className="marketing-section">
          <div className="section-heading-centered">
            <p className="marketing-kicker">
              Designed for the impact ecosystem
            </p>
            <h2 id="audience-title">ONE TRUST WORKFLOW. THREE CLEAR VIEWS.</h2>
            <p>
              Each person sees the context and action that belongs to
              them—nothing more.
            </p>
          </div>
          <div className="audience-editorial-grid">
            {[
              {
                title: "Organizations",
                text: "Prepare evidence once, understand what is missing, and stay in control of every fact.",
                href: "/for-organizations",
                icon: Building2,
                tone: "violet",
              },
              {
                title: "Platform reviewers",
                text: "Compare confirmed claims with source context and make accountable decisions.",
                href: "/review",
                icon: UsersRound,
                tone: "blue",
              },
              {
                title: "CSR teams",
                text: "Discover organizations through specific, dated indicators instead of a black-box score.",
                href: "/for-csr-teams",
                icon: Landmark,
                tone: "lime",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  className={`audience-editorial-card audience-${item.tone}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  whileHover={reduceMotion ? undefined : { y: -8 }}
                  key={item.title}
                >
                  <div className="audience-art">
                    <span>
                      <Icon size={32} />
                    </span>
                    <i />
                    <i />
                    <i />
                  </div>
                  <div>
                    <p>0{index + 1}</p>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <Link href={item.href}>
                      Explore this view <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="story-section">
        <div className="marketing-section story-grid">
          <article className="story-lead">
            <p className="marketing-kicker">The problem</p>
            <h2>TRUST GETS LOST BETWEEN FILES, FORMS, AND REPEATED CHECKS.</h2>
            <p>
              Social-impact organizations spend time resending evidence.
              Reviewers lose context. Public claims often reveal too little
              about what was actually checked.
            </p>
          </article>
          <div className="story-cards">
            <article>
              <span>
                <FileSearch size={20} />
              </span>
              <p className="marketing-kicker">Challenge</p>
              <h3>Evidence is fragmented.</h3>
              <p>
                Documents, claims, and decisions drift apart, making every new
                request feel like starting again.
              </p>
            </article>
            <article>
              <span>
                <Sparkles size={20} />
              </span>
              <p className="marketing-kicker">Solution</p>
              <h3>Make the review path visible.</h3>
              <p>
                INSIPS keeps sources, human confirmation, and independent
                decisions connected without making private evidence public.
              </p>
            </article>
            <blockquote>
              “Trust should be explainable at the level of each claim—not
              compressed into one magic badge.”
              <cite>INSIPS product principle</cite>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="marketing-section trust-section">
        <div className="section-heading-split">
          <div>
            <p className="marketing-kicker">Explainable trust</p>
            <h2>WHAT THE PUBLIC SIGNAL ACTUALLY MEANS.</h2>
          </div>
          <p>
            No customer claims, invented awards, or opaque scores. The demo uses
            clearly labeled synthetic scenarios to show how the trust model
            behaves.
          </p>
        </div>
        <div className="trust-scenario-grid">
          {[
            {
              status: "Approved & current",
              title: "Visible publicly",
              text: "The approved version matches the current organization-confirmed value.",
              icon: CheckCircle2,
            },
            {
              status: "Changed after review",
              title: "Approval is removed",
              text: "A later edit invalidates the public indicator until the new version is reviewed.",
              icon: FileCheck2,
            },
            {
              status: "Evidence incomplete",
              title: "Uncertainty stays visible",
              text: "A reference without its supporting certificate remains a candidate, not a public fact.",
              icon: SearchCheck,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.status}>
                <span className="scenario-icon">
                  <Icon size={23} />
                </span>
                <small>{item.status}</small>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="privacy-section">
        <div className="marketing-section privacy-grid">
          <div>
            <p className="marketing-kicker">
              Private by default. Public only by choice.
            </p>
            <h2>
              YOUR EVIDENCE STAYS PRIVATE WHILE IT IS CHECKED AND PREPARED.
            </h2>
            <p>
              You confirm every suggested fact, and an independent reviewer
              decides what can appear publicly.
            </p>
            <Link className="button button-on-dark" href="/security-privacy">
              Read our security approach <ArrowRight size={16} />
            </Link>
          </div>
          <div className="privacy-flow">
            {flowSteps.map((step, index) => (
              <div key={step.label}>
                <span>0{index + 1}</span>
                <strong>{step.label}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="marketing-section final-marketing-cta">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p>Ready to make every claim clearer?</p>
          <h2>BUILD A TRUST PROFILE PEOPLE CAN UNDERSTAND.</h2>
          <div>
            <Link className="button button-accent button-large" href="/demo">
              Explore the demo <ArrowRight size={18} />
            </Link>
            <Link
              className="button button-secondary button-large"
              href="/how-trust-works"
            >
              See how it works
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}
