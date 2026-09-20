"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/#platform", label: "Platform", menu: true },
  { href: "/for-organizations", label: "For organizations" },
  { href: "/for-corporate-teams", label: "For corporate teams" },
  { href: "/how-trust-works", label: "How it works" },
  { href: "/resources", label: "Resources", menu: true },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();

  return (
    <header className="public-header">
      <div className="public-brand-lockup">
        <BrandMark />
        <span className="nav-status-tag">Human-led</span>
      </div>
      <nav className="public-nav" aria-label="Primary navigation">
        {navigation.map((item) => (
          <span key={item.href}>
            <Link aria-current={pathname === item.href ? "page" : undefined} href={item.href}>
              {item.label}
              {item.menu ? <ChevronDown aria-hidden="true" size={12} /> : null}
            </Link>
          </span>
        ))}
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <Link className="header-sign-in" href="/auth/sign-in">
          Sign in
        </Link>
        <motion.span
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link className="button button-accent header-cta" href="/demo">
            Open the demo <ArrowRight size={16} />
          </Link>
        </motion.span>
        <button
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="mobile-menu-button"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mobile-menu-panel"
            exit={{ opacity: 0, y: -12 }}
            initial={{ opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <nav aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link
                  aria-current={pathname === item.href ? "page" : undefined}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label} <ArrowRight size={17} />
                </Link>
              ))}
              <Link href="/auth/sign-in" onClick={() => setOpen(false)}>
                Sign in <ArrowRight size={17} />
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
