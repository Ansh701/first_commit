import { WorkspaceShell } from "@/components/workspace-shell";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell role="organization">{children}</WorkspaceShell>;
}
