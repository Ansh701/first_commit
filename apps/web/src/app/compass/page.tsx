import { getPublishedSiteContent } from "@/lib/server/content-repository";
import { getCompassCandidateClaims } from "@/lib/server/compass-repository";
import { CompassExperience } from "./compass-experience";

export const metadata = { title: "Compass" };

export default async function Page() {
  const page = await getPublishedSiteContent("compass");
  const claims = await getCompassCandidateClaims();
  return <CompassExperience page={page} claims={claims} />;
}
