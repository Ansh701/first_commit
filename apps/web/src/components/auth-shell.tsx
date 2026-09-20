import Link from "next/link";
import { ArrowLeft, BadgeCheck, FileSearch, LockKeyhole } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-experience" id="main-content">
      <a className="skip-link" href="#auth-form">Skip to sign in form</a>
      <section className="auth-context" aria-label="INSIPS trust workflow">
        <div className="auth-context-top"><BrandMark /><Link href="/"><ArrowLeft size={15} /> Back to INSIPS</Link></div>
        <div className="auth-context-copy">
          <p className="eyebrow">A clear path to trusted work</p>
          <h1>Keep the evidence private. Keep the decision visible.</h1>
          <p>INSIPS connects source context, human confirmation, and independent review in one accountable workspace.</p>
        </div>
        <div className="auth-ledger" aria-hidden="true">
          <div><span><LockKeyhole size={16} /></span><strong>Private evidence</strong><small>Restricted to the right workspace</small></div>
          <div><span><FileSearch size={16} /></span><strong>Source context</strong><small>Page-aware, candidate-ready</small></div>
          <div><span><BadgeCheck size={16} /></span><strong>Approved projection</strong><small>Specific, dated, explained</small></div>
        </div>
        <p className="auth-context-foot">Use synthetic demo access if you are exploring the product.</p>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-top"><BrandMark /><ThemeToggle /></div>
        <div className="auth-form-wrap" id="auth-form">{children}</div>
      </section>
    </main>
  );
}
