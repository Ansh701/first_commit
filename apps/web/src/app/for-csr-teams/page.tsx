import { getPublishedSiteContent } from "@/lib/server/content-repository";
import { CsrTeamsPage } from "./csr-teams-page";

export const metadata = { title: "For CSR teams" };

export default async function Page() {
  const page = await getPublishedSiteContent("for-csr-teams");
  return <CsrTeamsPage page={page} />;
}
