import { getPublicOrganizations } from "@/lib/server/content-repository";
import { ShortlistClient } from "@/components/shortlist-client";

export default async function ShortlistPage() {
  const organizations = await getPublicOrganizations();
  return <ShortlistClient organizations={organizations} />;
}
