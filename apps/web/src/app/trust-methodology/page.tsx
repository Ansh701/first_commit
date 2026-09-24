import { RepositoryContentPage } from "@/components/repository-content-page";
import styles from "./trust-methodology-page.module.css";
export const metadata = { title: "Trust methodology" };
export default function Page() {
  return (
    <div className={styles.page}>
      <RepositoryContentPage
        ctaHref="/demo"
        ctaLabel="Open the evidence demo"
        slug="trust-methodology"
      />
    </div>
  );
}
