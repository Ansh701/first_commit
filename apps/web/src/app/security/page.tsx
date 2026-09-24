import { RepositoryContentPage } from "@/components/repository-content-page";
import styles from "./security-page.module.css";
export const metadata = { title: "Security" };
export default function Page() {
  return (
    <div className={styles.page}>
      <RepositoryContentPage
        ctaHref="/contact"
        ctaLabel="Contact security"
        slug="security"
      />
    </div>
  );
}
