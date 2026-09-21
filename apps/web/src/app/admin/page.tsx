import { AdminOverview } from "@/components/community-flows";
import styles from "./admin-page.module.css";

export const metadata = { title: "Platform administration" };

export default function Page() {
  return (
    <div className={styles.adminRoute}>
      <AdminOverview />
    </div>
  );
}
