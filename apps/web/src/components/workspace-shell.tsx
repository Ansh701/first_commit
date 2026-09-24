"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  BadgeCheck,
  Bell,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Compass,
  FileStack,
  Gauge,
  HandHeart,
  Home,
  Menu,
  PackageCheck,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { BrandMark } from "./brand-mark";
import { useDemo } from "./demo-provider";
import { ThemeToggle } from "./theme-toggle";

type WorkspaceRole =
  | "organization"
  | "reviewer"
  | "csr"
  | "donor"
  | "admin"
  | "corporate";

const navByRole = {
  organization: [
    { href: "/app", label: "Overview", icon: Gauge },
    { href: "/app/onboarding", label: "Onboarding", icon: ClipboardCheck },
    { href: "/app/profile", label: "Organization profile", icon: Building2 },
    { href: "/app/evidence", label: "Evidence", icon: FileStack },
    { href: "/app/submission", label: "Submission", icon: ClipboardCheck },
    { href: "/app/donations", label: "Donations received", icon: WalletCards },
    { href: "/app/items", label: "Item donations", icon: PackageCheck },
    { href: "/app/volunteers", label: "Volunteers", icon: HandHeart },
    { href: "/app/team", label: "Team and roles", icon: UsersRound },
    { href: "/app/analytics", label: "Analytics", icon: Gauge },
  ],
  reviewer: [
    { href: "/review", label: "Review queue", icon: ClipboardCheck },
    {
      href: "/review/submission-demo",
      label: "Active review",
      icon: ShieldCheck,
    },
  ],
  csr: [
    { href: "/csr/discover", label: "Discover", icon: Search },
    { href: "/csr/shortlist", label: "Shortlist", icon: BadgeCheck },
  ],
  donor: [
    { href: "/donor", label: "Donor home", icon: Home },
    { href: "/donor/donations", label: "Donation history", icon: WalletCards },
    { href: "/donor/items", label: "Item pledges", icon: PackageCheck },
    { href: "/volunteer", label: "Volunteering", icon: HandHeart },
  ],
  admin: [
    { href: "/admin", label: "Admin overview", icon: Gauge },
    {
      href: "/admin/organizations",
      label: "Organization verification",
      icon: ShieldCheck,
    },
    { href: "/admin/donations", label: "Donation ledger", icon: WalletCards },
  ],
  corporate: [
    { href: "/corporate", label: "Corporate overview", icon: Gauge },
    { href: "/corporate/discover", label: "Discover causes", icon: Search },
    {
      href: "/corporate/shortlist",
      label: "Cause shortlist",
      icon: BadgeCheck,
    },
    { href: "/corporate/matching", label: "Matching pledges", icon: HandHeart },
  ],
} as const;

const labels = {
  organization: {
    title: "Organization workspace",
    name: "Udaan Learning Foundation",
    initials: "UL",
  },
  reviewer: {
    title: "Platform review",
    name: "Maya · Reviewer",
    initials: "MR",
  },
  csr: { title: "CSR workspace", name: "Aarav · CSR", initials: "AC" },
  donor: { title: "Donor account", name: "Aarav Mehta", initials: "AM" },
  admin: {
    title: "Platform administration",
    name: "Mira · Admin",
    initials: "MS",
  },
  corporate: {
    title: "Corporate workspace",
    name: "Rhea · Impact team",
    initials: "RI",
  },
} as const;

function isActive(pathname: string, href: string) {
  if (["/app", "/review", "/donor", "/admin", "/corporate"].includes(href))
    return pathname === href;
  return pathname.startsWith(href);
}

export function WorkspaceShell({
  role,
  children,
}: {
  role: WorkspaceRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = navByRole[role];
  const label = labels[role];
  const { submissionStatus } = useDemo();
  const reduceMotion = useReducedMotion();
  const current =
    nav.find((item) => isActive(pathname, item.href))?.label ?? label.title;

  return (
    <div className="workspace-frame">
      <aside
        className="workspace-sidebar"
        aria-label={`${label.title} navigation`}
      >
        <div className="sidebar-brand">
          <BrandMark />
        </div>
        <div className="workspace-identity">
          <span className="avatar avatar-gradient">{label.initials}</span>
          <span>
            <small>{label.title}</small>
            <strong>{label.name}</strong>
          </span>
          <ChevronDown size={15} aria-hidden="true" />
        </div>
        <p className="workspace-nav-label">Workspace</p>
        <nav className="workspace-nav">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <motion.div
                key={item.href}
                whileHover={reduceMotion ? undefined : { x: 2 }}
                whileTap={{ scale: 0.985 }}
              >
                <Link
                  href={item.href}
                  className={active ? "active" : ""}
                  aria-current={active ? "page" : undefined}
                  style={active ? { color: "var(--text)" } : undefined}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.label === "Evidence" ? <small>1</small> : null}
                  {item.label === "Review queue" ? (
                    <small>{submissionStatus === "draft" ? 0 : 1}</small>
                  ) : null}
                </Link>
              </motion.div>
            );
          })}
        </nav>
        <div className="sidebar-group">
          <p className="workspace-nav-label">Trust profile</p>
          <Link
            href={
              role === "organization"
                ? "/organizations/udaan-learning-foundation"
                : "/discover"
            }
          >
            <BadgeCheck size={17} /> Public indicators{" "}
            <span className="sidebar-status-dot" />
          </Link>
          <Link href="/how-trust-works">
            <Compass size={17} /> Methodology
          </Link>
        </div>
        <div className="sidebar-callout">
          <span className="callout-icon">
            <Sparkles size={17} />
          </span>
          <strong>Compass is assistive</strong>
          <p>People confirm and review every claim.</p>
          <Link href="/how-trust-works" style={{ color: "var(--text)" }}>
            Read the method <ChevronDown className="flip" size={14} />
          </Link>
        </div>
        <div className="sidebar-bottom">
          <Link href="/" aria-label="Open public site">
            <Home size={18} />
            <span>Public site</span>
          </Link>
          <Link href="/account" aria-label="Open account">
            <Settings size={18} />
            <span>Account</span>
          </Link>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="mobile-brand">
            <BrandMark compact />
          </div>
          <div className="topbar-context">
            <span className="topbar-breadcrumb">
              INSIPS <i>/</i> {label.title} <i>/</i> <strong>{current}</strong>
            </span>
          </div>
          <div className="topbar-actions">
            <form className="topbar-search" action="/discover">
              <Search size={16} />
              <label className="sr-only" htmlFor="workspace-search">
                Search workspace
              </label>
              <input
                id="workspace-search"
                name="q"
                placeholder="Search workspace"
              />
              <kbd>⌘K</kbd>
            </form>
            <ThemeToggle />
            <Link
              className="icon-button topbar-notification"
              aria-label="Notifications"
              href="/notifications"
            >
              <Bell size={18} />
              <i />
            </Link>
            <Link
              className="avatar"
              aria-label="Open user account"
              href="/account"
            >
              {label.initials}
            </Link>
          </div>
        </header>
        <div className="fixture-ribbon" role="status">
          <span /> Synthetic local fixture · no live external processing
        </div>
        <main className="workspace-main" id="main-content">
          {children}
        </main>
      </div>
      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile workspace navigation"
      >
        {nav.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              href={item.href}
              className={active ? "active" : ""}
              style={active ? { color: "var(--text)" } : undefined}
              key={item.href}
            >
              <Icon size={19} />
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <Link href="/account" aria-label="More navigation">
          <Menu size={19} />
          <span>More</span>
        </Link>
      </nav>
    </div>
  );
}
