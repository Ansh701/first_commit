import { DonationDetail } from "@/components/donation-flows";

export const metadata = { title: "Donation detail" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DonationDetail donationId={id} />;
}
