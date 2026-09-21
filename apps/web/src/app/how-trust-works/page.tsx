import { getPublishedSiteContent } from "@/lib/server/content-repository";
import { HowTrustExperience } from "./how-trust-experience";

export const metadata = { title: "How it works" };

export default async function Page() {
  const page = await getPublishedSiteContent("how-trust-works");
  return <HowTrustExperience page={page} />;
}
