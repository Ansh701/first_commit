import { RepositoryContentPage } from "@/components/repository-content-page";
import styles from "./privacy-page.module.css";
export const metadata = { title: "Privacy policy" };
export default function Page() {
  return (
    <div className={styles.page}>
      <RepositoryContentPage
        ctaHref="/security-privacy"
        ctaLabel="Read security"
        slug="privacy"
      />
    </div>
  );
}
