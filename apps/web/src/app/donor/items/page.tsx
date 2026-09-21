import { DonorItemHistory } from "@/components/community-flows";
import styles from "./donor-items-page.module.css";

export const metadata = { title: "Item donation history" };

export default function Page() {
  return (
    <div className={styles.donorItemsRoute}>
      <DonorItemHistory />
    </div>
  );
}
