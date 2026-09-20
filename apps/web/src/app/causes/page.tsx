import { CauseDirectory } from "@/components/donation-flows";
import { PublicShell } from "@/components/public-shell";
import { getPublishedCauses } from "@/lib/server/content-repository";

export const metadata = { title: "Discover causes" };

export default async function Page() {
  const causes = await getPublishedCauses();
  return (
    <PublicShell className="marketing-site public-product-site">
      <CauseDirectory causes={causes} />
    </PublicShell>
  );
}
