import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, LockKeyhole, Sparkles } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-experience" id="main-content">
      <section className="auth-art" aria-label="INSIPS trust workflow">
        <div className="auth-art-top">
          <BrandMark inverse />
          <Link href="/">
            <ArrowLeft size={15} /> Back to INSIPS
          </Link>
        </div>
        <div className="auth-art-copy">
          <p>One evidence profile. Clear human decisions.</p>
          <h1>TRUST THAT SHOWS ITS WORK.</h1>
          <p>
            Prepare evidence privately, keep people in control, and publish only
            approved, current facts.
          </p>
        </div>
        <div className="auth-art-scene" aria-hidden="true">
          <span className="auth-float auth-float-a">
            <LockKeyhole size={17} /> Private evidence
          </span>
          <span className="auth-float auth-float-b">
            <Sparkles size={17} /> Compass candidate
          </span>
          <span className="auth-float auth-float-c">
            <BadgeCheck size={17} /> Human reviewed
          </span>
          <div className="auth-orbit auth-orbit-one" />
          <div className="auth-orbit auth-orbit-two" />
          <div className="auth-core">
            <Image alt="" height={58} src="/brand/insips-logo.png" width={58} />
          </div>
        </div>
        <p className="auth-art-foot">
          Synthetic local experience · no real personal data
        </p>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-top">
          <BrandMark />
          <ThemeToggle />
        </div>
        <div className="auth-form-wrap">{children}</div>
      </section>
    </main>
  );
}
