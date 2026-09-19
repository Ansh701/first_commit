import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <AuthForm mode="verify" />
    </AuthShell>
  );
}
