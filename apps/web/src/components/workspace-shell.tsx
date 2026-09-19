"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <div className="workspace-frame">
      <aside className="workspace-sidebar">
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
        <nav className="workspace-nav" aria-label={`${label.title} navigation`}>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                className={isActive(pathname, item.href) ? "active" : ""}
                key={item.href}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
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
        <Link className="back-home" href="/">
          <ArrowLeft size={16} /> Back to public site
        </Link>
      </aside>

      <div className="workspace-body">
        <header className="workspace-topbar">
          <div className="mobile-brand">
            <BrandMark compact />
          </div>
          <div className="topbar-context">
            <span className="local-mode">
              <span /> Synthetic local fixture
            </span>
            <span className="topbar-separator" />
            <span className="topbar-hint">AWS connection pending</span>
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <Link
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
            <span className="avatar">{label.initials}</span>
          </div>
        </header>
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
