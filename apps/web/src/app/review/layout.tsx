import { WorkspaceShell } from "@/components/workspace-shell";

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell role="reviewer">{children}</WorkspaceShell>;
}
