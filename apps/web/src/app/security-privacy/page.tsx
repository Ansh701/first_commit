import { RepositoryContentPage } from "@/components/repository-content-page";
import styles from "./security-privacy-page.module.css";
export const metadata = { title: "Security and privacy" };
export default function Page() {
  return (
    <div className={styles.page}>
      <RepositoryContentPage
        ctaHref="/security"
        ctaLabel="Read security"
        slug="security-privacy"
      />
    </div>
  );
}
