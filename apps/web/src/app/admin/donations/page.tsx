import { OrganizationDonationLedger } from "@/components/donation-flows";

export const metadata = { title: "Donation ledger" };

export default function Page() {
  return <OrganizationDonationLedger admin />;
}
