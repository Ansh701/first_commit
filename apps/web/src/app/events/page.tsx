import { EventDirectory } from "@/components/community-flows";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import styles from "./events-page.module.css";

export const metadata = { title: "Organization events" };

export default function Page() {
  return (
    <div className={`${styles.page} marketing-site public-product-site`}>
      <PublicHeader />
      <EventDirectory />
      <SiteFooter />
    </div>
  );
}
