import { StatePanel } from "@/components/state-panel";
import { PublicShell } from "@/components/public-shell";
import { getPublishedSiteContent } from "@/lib/server/content-repository";
import { HelpCenter } from "./help-center";

export const metadata = { title: "Help centre" };

export default async function Page() {
  const page = await getPublishedSiteContent("help");

  return (
    <PublicShell className="marketing-site help-site">
      {page ? <HelpCenter page={page} /> : <StatePanel action={{ href: "/", label: "Return home" }} description="This page is not currently published." kind="empty" title="Help unavailable" />}
    </PublicShell>
  );
}
