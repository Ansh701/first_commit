import { CorporateWorkspace } from "@/components/community-flows";
import styles from "./shortlist-page.module.css";

export const metadata = { title: "Corporate shortlist" };

export default function Page() {
  return (
    <div className={styles.shortlistRoute}>
      <CorporateWorkspace page="shortlist" />
    </div>
  );
}
