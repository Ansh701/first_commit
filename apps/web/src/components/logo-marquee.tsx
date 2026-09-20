import type { PublicOrganizationSummary } from "@insips/contracts";

export function LogoMarquee({ organizations }: { organizations: PublicOrganizationSummary[] }) {
  const items = organizations.concat(organizations);
  return (
    <section className="logo-marquee-section" aria-labelledby="logo-marquee-title">
      <div className="marketing-section logo-marquee-inner">
        <div><p className="marketing-kicker">A wider field of view</p><h2 id="logo-marquee-title">Discover the work behind the public record.</h2></div>
        <div className="logo-marquee" role="list" aria-label="Organizations in the public directory">
          <div className="logo-marquee-track">
            {items.map((organization, index) => <div className="marquee-mark" role="listitem" key={`${organization.slug}-${index}`}><span>{organization.logoMark}</span><strong>{organization.displayName}</strong></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}
