import { CorporateWorkspace } from "@/components/community-flows";
import styles from "./discover-page.module.css";

export const metadata = { title: "Corporate cause discovery" };

export default function Page() {
  return (
    <div className={styles.discoverRoute}>
      <CorporateWorkspace page="discover" />
    </div>
  );
}
