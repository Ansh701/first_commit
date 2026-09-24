import { ItemNeedsDirectory } from "@/components/community-flows";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import styles from "./items-page.module.css";

export const metadata = { title: "Item donations" };

export default function Page() {
  return (
    <div className={`${styles.page} marketing-site public-product-site`}>
      <PublicHeader />
      <ItemNeedsDirectory />
      <SiteFooter />
    </div>
  );
}
