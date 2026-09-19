import { LandingExperience } from "@/components/landing-experience";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <div className="marketing-site">
      <div className="marketing-dark-shell">
        <PublicHeader />
      </div>
      <main id="main-content">
        <LandingExperience />
      </main>
      <SiteFooter />
    </div>
  );
}
