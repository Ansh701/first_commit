import { AccountSettings } from "@/components/community-flows";
import { WorkspaceShell } from "@/components/workspace-shell";
import styles from "./account-page.module.css";

export const metadata = { title: "Account settings" };

export default function Page() {
  return (
    <WorkspaceShell role="organization">
      <div className={styles.accountRoute}>
        <AccountSettings />
      </div>
    </WorkspaceShell>
  );
}
