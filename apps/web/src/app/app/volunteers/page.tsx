import { VolunteerDirectory } from "@/components/community-flows";
import styles from "./volunteers-page.module.css";

export const metadata = { title: "Volunteer applications" };

export default function Page() {
  return (
    <div className={styles.volunteersRoute}>
      <VolunteerDirectory manage />
    </div>
  );
}
