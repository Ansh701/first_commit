import { getPublicOrganizations } from "@/lib/server/content-repository";
import { CsrShortlistExperience } from "./csr-shortlist-experience";

export default async function ShortlistPage() {
  const organizations = await getPublicOrganizations();
  return <CsrShortlistExperience organizations={organizations} />;
}
