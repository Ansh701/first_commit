import { NotificationCentre } from "@/components/community-flows";
import { WorkspaceShell } from "@/components/workspace-shell";

export const metadata = { title: "Notifications" };

export default function Page() {
  return (
    <WorkspaceShell role="organization">
      <NotificationCentre />
    </WorkspaceShell>
  );
}
