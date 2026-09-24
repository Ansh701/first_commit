import { AuthShell } from "@/components/auth-shell";
import { StatePanel } from "@/components/state-panel";
import styles from "./offline-page.module.css";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <AuthShell className={styles.page}>
      <StatePanel
        action={{ href: "/", label: "Try again" }}
        description="Your saved work is still available, but decisions and publication actions stay disabled until the server can confirm them."
        kind="offline"
        title="You appear to be offline"
      />
    </AuthShell>
  );
}
