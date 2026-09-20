import { LandingExperience } from "@/components/landing-experience";
import { PublicShell } from "@/components/public-shell";
import { getPublicOrganizations, getPublishedCauses, getPublishedFeed } from "@/lib/server/content-repository";

export default async function HomePage() {
  const [organizations, causes, feed] = await Promise.all([
    getPublicOrganizations(),
    getPublishedCauses(),
    getPublishedFeed({ limit: 6 }),
  ]);
  return (
    <PublicShell className="marketing-site">
      <LandingExperience organizations={organizations} causes={causes} posts={feed.items} />
    </PublicShell>
  );
}
