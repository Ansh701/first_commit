import { DonorHome } from "@/components/donation-flows";
import styles from "./donor-page.module.css";

export const metadata = { title: "Donor account" };

export default function Page() {
  return (
    <div className={styles.donorRoute}>
      <DonorHome />
    </div>
  );
}
