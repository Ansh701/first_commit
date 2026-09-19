import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <AuthShell>
      <div className="auth-form-card auth-state-card">
        <span className="auth-state-icon">
          <WifiOff size={28} />
        </span>
        <p className="auth-eyebrow">Connection interrupted</p>
        <h2>You appear to be offline.</h2>
        <p className="auth-description">
          Your saved work is still available, but decisions and publication
          actions stay disabled until the server can confirm them.
        </p>
        <Link className="button button-accent button-full" href="/">
          <RefreshCw size={17} /> Try again
        </Link>
      </div>
    </AuthShell>
  );
}
