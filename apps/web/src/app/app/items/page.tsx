import { OrganizationItemManagement } from "@/components/community-flows";
import styles from "./items-page.module.css";

export const metadata = { title: "Item donations" };

export default function Page() {
  return (
    <div className={styles.itemsRoute}>
      <OrganizationItemManagement />
    </div>
  );
}
