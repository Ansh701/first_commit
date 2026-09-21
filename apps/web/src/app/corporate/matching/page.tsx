import { CorporateWorkspace } from "@/components/community-flows";
import styles from "./matching-page.module.css";

export const metadata = { title: "Matching pledges" };

export default function Page() {
  return (
    <div className={styles.matchingRoute}>
      <CorporateWorkspace page="matching" />
    </div>
  );
}
