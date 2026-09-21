import { TeamManagement } from "@/components/community-flows";
import styles from "./team-page.module.css";

export const metadata = { title: "Team and roles" };

export default function Page() {
  return (
    <div className={styles.teamRoute}>
      <TeamManagement />
    </div>
  );
}
