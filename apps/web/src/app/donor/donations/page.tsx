import { DonorDonationHistory } from "@/components/donation-flows";
import styles from "./donor-donations-page.module.css";

export const metadata = { title: "Donation history" };

export default function Page() {
  return (
    <div className={styles.donorDonationsRoute}>
      <DonorDonationHistory />
    </div>
  );
}
