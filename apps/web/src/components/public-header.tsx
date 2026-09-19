import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";

export function PublicHeader() {
  return (
    <header className="public-header">
      <BrandMark />
      <nav className="public-nav" aria-label="Primary navigation">
        <Link href="/discover">Discover</Link>
        <Link href="/how-trust-works">How trust works</Link>
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <Link
          className="button button-secondary hide-mobile"
          href="/auth/sign-in"
        >
          Sign in
        </Link>
        <Link className="button button-primary" href="/app">
          Open demo <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}
