import { RepositoryContentPage } from "@/components/repository-content-page";
import styles from "./resources-page.module.css";
export const metadata = { title: "Resources" };
export default function Page() {
  return (
    <div className={styles.page}>
      <RepositoryContentPage
        ctaHref="/how-trust-works"
        ctaLabel="How it works"
        slug="resources"
      />
    </div>
  );
}
