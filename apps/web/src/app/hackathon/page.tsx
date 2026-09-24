import { RepositoryContentPage } from "@/components/repository-content-page";
import styles from "./hackathon-page.module.css";
export const metadata = { title: "Project story" };
export default function Page() {
  return (
    <div className={styles.page}>
      <RepositoryContentPage
        ctaHref="/demo"
        ctaLabel="Explore the product"
        slug="hackathon"
      />
    </div>
  );
}
