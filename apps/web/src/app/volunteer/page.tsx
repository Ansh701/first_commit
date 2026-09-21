import { VolunteerDirectory } from "@/components/community-flows";
import styles from "./volunteer-page.module.css";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Volunteer opportunities" };

export default function Page() {
  return (
    <div className={`marketing-site public-product-site ${styles.volunteerRoute}`}>
      <PublicHeader />
      <VolunteerDirectory />
      <SiteFooter />
    </div>
  );
}
