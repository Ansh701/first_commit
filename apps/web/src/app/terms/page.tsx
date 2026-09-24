import { RepositoryContentPage } from "@/components/repository-content-page";
import styles from "./terms-page.module.css";
export const metadata = { title: "Terms of use" };
export default function Page() {
  return (
    <div className={styles.page}>
      <RepositoryContentPage
        ctaHref="/demo"
        ctaLabel="Explore the product"
        slug="terms"
      />
    </div>
  );
}
