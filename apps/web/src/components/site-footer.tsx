import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "./brand-mark";

const footerGroups = [
  {
    title: "Platform",
    links: [
      ["Discover organizations", "/discover"],
      ["Discover causes", "/causes"],
      ["For organizations", "/for-organizations"],
      ["For corporate teams", "/for-corporate-teams"],
      ["Trust methodology", "/trust-methodology"],
      ["INSIPS Compass", "/compass"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["How it works", "/how-trust-works"],
      ["FAQ", "/faq"],
      ["Security and privacy", "/security-privacy"],
      ["Help centre", "/help"],
      ["Organization activity", "/feed"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About INSIPS", "/about"],
      ["Contact", "/contact"],
      ["Hackathon story", "/hackathon"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy policy", "/privacy"],
      ["Terms of use", "/terms"],
      ["Cookie notice", "/cookies"],
      ["Donation and refund policy", "/donation-refund-policy"],
      ["Acceptable use policy", "/acceptable-use"],
      ["Accessibility", "/accessibility"],
      ["Security", "/security"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer" id="site-footer">
      <div className="footer-top">
        <div className="footer-brand-column">
          <BrandMark inverse />
          <p>
            Evidence made understandable. Trust made specific, current, and
            human-reviewed.
          </p>
          <Link className="footer-demo-link" href="/demo">
            Open the demo <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="footer-link-grid">
          {footerGroups.map((group) => (
            <div className="footer-group" key={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 INSIPS. Evidence made understandable.</span>
      </div>
    </footer>
  );
}
