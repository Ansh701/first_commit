import { CauseDetail } from "@/components/donation-flows";
import { PublicShell } from "@/components/public-shell";
import { notFound } from "next/navigation";
import { getPublishedCauses } from "@/lib/server/content-repository";

export const metadata = { title: "Cause" };

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cause = (await getPublishedCauses({ limit: 50 })).find((item) => item.slug === slug);
  if (!cause) notFound();
  return (
    <PublicShell className="marketing-site public-product-site">
      <CauseDetail cause={cause} />
    </PublicShell>
  );
}
