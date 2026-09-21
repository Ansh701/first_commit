import { getPublishedSiteContent } from "@/lib/server/content-repository";
import { OrganizationsPage } from "./organizations-page";

export const metadata = { title: "For organizations" };

export default async function Page() {
  const page = await getPublishedSiteContent("for-organizations");
  return <OrganizationsPage page={page} />;
}
