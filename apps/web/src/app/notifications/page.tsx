import { NotificationCentre } from "@/components/community-flows";
import { WorkspaceShell } from "@/components/workspace-shell";
import styles from "./notifications-page.module.css";

export const metadata = { title: "Notifications" };

export default function Page() {
  return (
    <WorkspaceShell role="organization">
      <div className={styles.page}>
        <NotificationCentre />
      </div>
    </WorkspaceShell>
  );
}
