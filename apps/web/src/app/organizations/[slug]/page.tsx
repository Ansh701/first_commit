import { notFound } from "next/navigation";
import { PublicOrganizationProfile } from "@/components/public-organization-profile";
import { getPublicOrganization } from "@/lib/server/content-repository";

export const metadata = { title: "Organization profile" };

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organization = await getPublicOrganization(slug);
  if (!organization) notFound();
  return <PublicOrganizationProfile organization={organization} />;
}
