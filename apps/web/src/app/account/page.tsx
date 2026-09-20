import { AccountSettings } from "@/components/community-flows";
import { WorkspaceShell } from "@/components/workspace-shell";

export const metadata = { title: "Account settings" };

export default function Page() {
  return (
    <WorkspaceShell role="organization">
      <AccountSettings />
    </WorkspaceShell>
  );
}
