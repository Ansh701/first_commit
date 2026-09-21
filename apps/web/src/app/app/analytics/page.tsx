import { OrganizationAnalytics } from "@/components/community-flows";
import styles from "./analytics-page.module.css";

export const metadata = { title: "Organization analytics" };

export default function Page() {
  return (
    <div className={styles.analyticsRoute}>
      <OrganizationAnalytics />
    </div>
  );
}
