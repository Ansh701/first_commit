import { OrganizationDonationLedger } from "@/components/donation-flows";
import styles from "./donations-page.module.css";

export const metadata = { title: "Donations received" };

export default function Page() {
  return (
    <div className={styles.donationsRoute}>
      <OrganizationDonationLedger />
    </div>
  );
}
