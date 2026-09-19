import { WorkspaceShell } from "@/components/workspace-shell";

export default function CsrLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell role="csr">{children}</WorkspaceShell>;
}
