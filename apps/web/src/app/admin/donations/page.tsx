import { OrganizationDonationLedger } from "@/components/donation-flows";
import styles from "../../app/donations/donations-page.module.css";

export const metadata = { title: "Donation ledger" };

export default function Page() {
  return (
    <div className={styles.donationsRoute}>
      <OrganizationDonationLedger admin />
    </div>
  );
}
