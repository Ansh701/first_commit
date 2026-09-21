import { CorporateWorkspace } from "@/components/community-flows";
import styles from "./corporate-page.module.css";

export const metadata = { title: "Corporate workspace" };

export default function Page() {
  return (
    <div className={styles.corporateRoute}>
      <CorporateWorkspace />
    </div>
  );
}
