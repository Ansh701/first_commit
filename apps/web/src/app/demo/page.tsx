import Link from "next/link";
import {
  ArrowRight,
  Building2,
  HandHeart,
  Landmark,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

export const metadata = { title: "Synthetic demo" };

const roles = [
  {
    href: "/app",
    title: "Organization admin",
    detail: "Prepare evidence and confirm Compass suggestions",
    icon: Building2,
  },
  {
    href: "/review",
    title: "Platform reviewer",
    detail: "Compare claims with evidence and record decisions",
    icon: ShieldCheck,
  },
  {
    href: "/corporate",
    title: "Corporate member",
    detail: "Discover reviewed indicators and build a shortlist",
    icon: Landmark,
  },
  {
    href: "/donor",
    title: "Individual donor",
    detail: "Review donations, receipts, item pledges, and volunteering",
    icon: UserRound,
  },
  {
    href: "/admin",
    title: "Platform admin",
    detail: "Verify organizations and inspect the donation ledger",
    icon: Settings,
  },
  {
    href: "/volunteer",
    title: "Public supporter",
    detail: "Explore causes, events, item needs, and opportunities",
    icon: HandHeart,
  },
];

export default function DemoPage() {
  return (
    <AuthShell>
      <div className="auth-form-card demo-launcher">
        <p className="auth-eyebrow">Synthetic local experience</p>
        <h2>Choose a workspace.</h2>
        <p className="auth-description">
          Explore the complete flow with fictional organizations and locally
          stored decisions. This launcher does not create an identity session.
        </p>
        <div className="demo-role-grid">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link href={role.href} key={role.href}>
                <span>
                  <Icon size={21} />
                </span>
                <div>
                  <strong>{role.title}</strong>
                  <small>{role.detail}</small>
                </div>
                <ArrowRight size={17} />
              </Link>
            );
          })}
        </div>
        <div className="auth-inline-message">
          <ShieldCheck size={17} />
          <span>
            All people, identifiers, documents, and decisions in this demo are
            synthetic.
          </span>
        </div>
      </div>
    </AuthShell>
  );
}
