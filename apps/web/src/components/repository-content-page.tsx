import { StatePanel } from "@/components/state-panel";
import { getPublishedSiteContent } from "@/lib/server/content-repository";
import { ContentPage } from "./content-page";

export async function RepositoryContentPage({
  slug,
  ctaLabel,
  ctaHref,
}: {
  slug: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const page = await getPublishedSiteContent(slug);
  if (!page) {
    return <StatePanel action={{ href: "/", label: "Return home" }} description="This page is not currently published." kind="empty" title="Content unavailable" />;
  }
  return <ContentPage {...page} ctaLabel={ctaLabel} ctaHref={ctaHref} />;
}
