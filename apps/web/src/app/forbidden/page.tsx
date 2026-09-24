import { AuthShell } from "@/components/auth-shell";
import { StatePanel } from "@/components/state-panel";
import styles from "./forbidden-page.module.css";

export const metadata = { title: "Access denied" };

export default function ForbiddenPage() {
  return (
    <AuthShell className={styles.page}>
      <StatePanel
        action={{ href: "/demo", label: "Choose another demo role" }}
        description="We cannot confirm that your current role is allowed to view this resource. No details were revealed."
        kind="permission"
        title="You do not have access to this workspace"
      />
    </AuthShell>
  );
}
