"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Compass,
  FileStack,
  Gauge,
  ListChecks,
  Menu,
  Bell,
  Command,
  Home,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";

type WorkspaceRole = "organization" | "reviewer" | "csr";

const navByRole = {
  organization: [
    { href: "/app", label: "Overview", icon: Gauge },
    { href: "/app/profile", label: "Organization profile", icon: Building2 },
    { href: "/app/evidence", label: "Evidence", icon: FileStack },
    { href: "/app/submission", label: "Submission", icon: ListChecks },
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
};

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
};

function isActive(pathname: string, href: string) {
  if (href === "/app" || href === "/review") return pathname === href;
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
  const reduceMotion = useReducedMotion();
  const current =
    nav.find((item) => isActive(pathname, item.href))?.label ?? label.title;

  useEffect(() => {
    if (!window.localStorage.getItem("insips-theme")) {
      window.localStorage.setItem("insips-theme", "dark");
      document.documentElement.dataset.theme = "dark";
    }
  }, []);

  return (
    <div className="workspace-frame">
      <aside className="workspace-rail" aria-label="Workspace switcher">
        <BrandMark compact />
        <nav>
          <Link
            aria-label="Organization workspace"
            className={role === "organization" ? "active" : ""}
            href="/app"
            title="Organization"
          >
            <Building2 size={20} />
          </Link>
          <Link
            aria-label="Review workspace"
            className={role === "reviewer" ? "active" : ""}
            href="/review"
            title="Review"
          >
            <ShieldCheck size={20} />
          </Link>
          <Link
            aria-label="CSR workspace"
            className={role === "csr" ? "active" : ""}
            href="/csr/discover"
            title="CSR"
          >
            <UsersRound size={20} />
          </Link>
          <Link aria-label="Public site" href="/" title="Public site">
            <Home size={20} />
          </Link>
        </nav>
        <Link
          className="rail-exit"
          href="/demo"
          aria-label="Switch demo role"
          title="Switch demo role"
        >
          <ArrowLeft size={19} />
        </Link>
      </aside>
      <aside className="workspace-sidebar">
        <div className="sidebar-brand">
          <BrandMark inverse />
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
        <nav className="workspace-nav" aria-label={`${label.title} navigation`}>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                whileHover={reduceMotion ? undefined : { x: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={item.href}
                  className={isActive(pathname, item.href) ? "active" : ""}
                >
                  <Icon size={19} aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.label === "Evidence" ||
                  item.label === "Review queue" ? (
                    <small>1</small>
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
            <Compass size={18} />
          </span>
          <strong>Compass is assistive</strong>
          <p>
            It suggests candidate fields. People confirm and review every claim.
          </p>
          <Link href="/how-trust-works">
            How it works <ArrowLeft className="flip" size={14} />
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
            <label className="topbar-search">
              <Search size={16} />
              <span className="sr-only">Search workspace</span>
              <input placeholder="Search or jump to…" />
              <kbd>
                <Command size={12} />K
              </kbd>
            </label>
            <ThemeToggle />
            <button
              className="icon-button topbar-notification"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
            <Link
              aria-label={
                role === "organization"
                  ? "Open reviewer workspace"
                  : role === "reviewer"
                    ? "Open public organization view"
                    : "Open organization workspace"
              }
              className="role-switch"
              href={
                role === "organization"
                  ? "/review"
                  : role === "reviewer"
                    ? "/organizations/udaan-learning-foundation"
                    : "/app"
              }
            >
              {role === "organization" ? (
                <UsersRound size={17} />
              ) : role === "reviewer" ? (
                <Sparkles size={17} />
              ) : (
                <Building2 size={17} />
              )}
              <span>
                {role === "organization"
                  ? "Reviewer view"
                  : role === "reviewer"
                    ? "Public view"
                    : "Organization view"}
              </span>
            </Link>
            <button
              className="avatar"
              type="button"
              aria-label="Open user menu"
            >
              {label.initials}
            </button>
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
          return (
            <Link
              href={item.href}
              className={isActive(pathname, item.href) ? "active" : ""}
              key={item.href}
            >
              <Icon size={19} />
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
        <button type="button" aria-label="More navigation">
          <Menu size={19} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
