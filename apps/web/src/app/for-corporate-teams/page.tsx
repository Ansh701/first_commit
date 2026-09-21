import { getPublishedSiteContent } from "@/lib/server/content-repository";
import { CorporateTeamsPage } from "./corporate-teams-page";

export const metadata = { title: "For corporate teams" };

export default async function Page() {
  const page = await getPublishedSiteContent("for-corporate-teams");
  return <CorporateTeamsPage page={page} />;
}
