import { OrganizationVerificationDetail } from "@/components/admin-verification";
import styles from "../organizations-page.module.css";

export const metadata = { title: "Organization review" };

export default function Page() {
  return (
    <div className={styles.organizationDetailRoute}>
      <OrganizationVerificationDetail />
    </div>
  );
}
