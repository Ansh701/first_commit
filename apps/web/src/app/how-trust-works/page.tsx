import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileLock2,
  ScanSearch,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { PublicHeader } from "@/components/public-header";

export const metadata = { title: "How trust works" };

export default function HowTrustWorksPage() {
  return (
    <>
      <PublicHeader />
      <main className="public-page" id="main-content">
        <header className="public-page-heading trust-heading">
          <p className="section-kicker">How trust works</p>
          <h1>
            Evidence passes through gates. Trust claims pass through people.
          </h1>
          <p>
            INSIPS separates document safety, AI assistance, organization
            confirmation, platform review, and public presentation so one step
            never pretends to be another.
          </p>
        </header>
        <section className="trust-step-list" aria-label="Trust workflow">
          <article>
            <span className="trust-step-icon">
              <FileLock2 size={23} />
            </span>
            <span className="trust-step-number">01</span>
            <div>
              <h2>Evidence starts private</h2>
              <p>
                A PDF enters a private quarantine area under a server-generated
                key. It is not public evidence and cannot be fetched by guessing
                a URL.
              </p>
            </div>
          </article>
          <article>
            <span className="trust-step-icon">
              <ScanSearch size={23} />
            </span>
            <span className="trust-step-number">02</span>
            <div>
              <h2>Scanning gates every later step</h2>
              <p>
                Only a clean malware result permits extraction. Infected,
                failed, or unknown states remain blocked; the interface cannot
                override that rule.
              </p>
            </div>
          </article>
          <article>
            <span className="trust-step-icon">
              <Bot size={23} />
            </span>
            <span className="trust-step-number">03</span>
            <div>
              <h2>Compass prepares candidates</h2>
              <p>
                Textract preserves page context and Bedrock returns bounded,
                schema-validated suggestions. Instructions inside uploaded
                content are treated as untrusted text.
              </p>
            </div>
          </article>
          <article>
            <span className="trust-step-icon">
              <UserCheck size={23} />
            </span>
            <span className="trust-step-number">04</span>
            <div>
              <h2>The organization confirms</h2>
              <p>
                Every suggestion must be accepted, edited, or dismissed.
                Confidence describes the source match—not legitimacy or
                regulatory status.
              </p>
            </div>
          </article>
          <article>
            <span className="trust-step-icon">
              <ShieldCheck size={23} />
            </span>
            <span className="trust-step-number">05</span>
            <div>
              <h2>An independent reviewer decides</h2>
              <p>
                The reviewer compares each organization-confirmed claim with
                restricted source context and records approval, rejection, or
                requested changes.
              </p>
            </div>
          </article>
          <article>
            <span className="trust-step-icon">
              <CheckCircle2 size={23} />
            </span>
            <span className="trust-step-number">06</span>
            <div>
              <h2>Only current approvals become public</h2>
              <p>
                The public sees an explanation, review date, and safe source
                summary—never the document, full extracted text, private note,
                or stale approval.
              </p>
            </div>
          </article>
        </section>
        <section className="trust-callout">
          <div>
            <p className="section-kicker">Important distinction</p>
            <h2>Reviewed is not the same as guaranteed.</h2>
            <p>
              INSIPS records what was reviewed and when. It does not certify
              future behavior, funding eligibility, legal compliance, or freedom
              from fraud.
            </p>
          </div>
          <Link
            className="button button-primary"
            href="/organizations/udaan-learning-foundation"
          >
            See a public example <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    </>
  );
}
