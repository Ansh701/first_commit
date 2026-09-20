import { AuthShell } from "@/components/auth-shell";
import { StatePanel } from "@/components/state-panel";

export default function NotFound() {
  return (
    <AuthShell>
      <StatePanel action={{ href: "/", label: "Return home" }} description="The link may be outdated or the resource may no longer be available. No restricted details were disclosed." kind="empty" title="This page is not part of the trust profile" />
    </AuthShell>
  );
}
