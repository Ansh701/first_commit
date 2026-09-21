import { OrganizationVerificationQueue } from "@/components/admin-verification";
import styles from "./organizations-page.module.css";

export const metadata = { title: "Organization verification" };

export default function Page() {
  return (
    <div className={styles.organizationsRoute}>
      <OrganizationVerificationQueue />
    </div>
  );
}
