"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { href: "/#platform", label: "Platform" },
  { href: "/for-organizations", label: "For organizations" },
  { href: "/for-csr-teams", label: "For CSR teams" },
  { href: "/how-trust-works", label: "How it works" },
  { href: "/resources", label: "Resources" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      animate={{ opacity: 1, y: 0 }}
      className="public-header"
      initial={reduceMotion ? false : { opacity: 0, y: -18 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <BrandMark inverse />
      <nav className="public-nav" aria-label="Primary navigation">
        {navigation.map((item, index) => (
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            key={item.href}
            transition={{ delay: 0.08 + index * 0.05 }}
          >
            <Link href={item.href}>{item.label}</Link>
          </motion.span>
        ))}
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <Link className="header-sign-in hide-tablet" href="/auth/sign-in">
          Sign in
        </Link>
        <motion.span
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link className="button button-accent header-cta" href="/demo">
            Explore demo <ArrowRight size={16} />
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
    </motion.header>
  );
}
