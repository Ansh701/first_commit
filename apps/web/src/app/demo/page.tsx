import Link from "next/link";
import { ArrowRight, Building2, Landmark, ShieldCheck } from "lucide-react";
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
    href: "/csr/discover",
    title: "CSR user",
    detail: "Discover reviewed indicators and build a shortlist",
    icon: Landmark,
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
