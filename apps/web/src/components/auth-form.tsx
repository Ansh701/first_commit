"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  Mail,
  RefreshCw,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIdentityAdapter, type AuthProviderName } from "@/lib/auth-adapter";

type AuthMode = "sign-in" | "sign-up" | "forgot" | "reset" | "verify";

const copy: Record<
  AuthMode,
  { eyebrow: string; title: string; description: string; action: string }
> = {
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Sign in to INSIPS",
    description:
      "Access your donor, organization, corporate, review, or platform workspace securely.",
    action: "Sign in",
  },
  "sign-up": {
    eyebrow: "Request access",
    title: "Create your INSIPS account",
    description:
      "Start an organization workspace. Tenant access is reviewed before activation.",
    action: "Create account",
  },
  forgot: {
    eyebrow: "Account recovery",
    title: "Reset your password",
    description:
      "Enter your account email. We will never reveal whether an address exists.",
    action: "Send recovery link",
  },
  reset: {
    eyebrow: "Choose a new password",
    title: "Secure your account",
    description: "Use a strong, unique password that you do not use elsewhere.",
    action: "Update password",
  },
  verify: {
    eyebrow: "Verify your email",
    title: "Check your inbox",
    description: "Enter the six-digit code sent to your account email.",
    action: "Verify email",
  },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const details = copy[mode];
  const needsEmail =
    mode === "sign-in" ||
    mode === "sign-up" ||
    mode === "forgot" ||
    mode === "reset" ||
    mode === "verify";
  const needsPassword =
    mode === "sign-in" || mode === "sign-up" || mode === "reset";

  useEffect(() => setHydrated(true), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const adapter = getIdentityAdapter();
    try {
      const email = String(form.get("email") ?? "");
      const password = String(form.get("password") ?? "");
      const code = String(form.get("code") ?? "");
      if (
        mode === "reset" &&
        password !== String(form.get("confirm-password") ?? "")
      ) {
        setIsError(true);
        setMessage("The new passwords do not match.");
        return;
      }
      const result =
        mode === "sign-up"
          ? await adapter.signUp({
              name: String(form.get("name") ?? ""),
              email,
              password,
            })
          : mode === "sign-in"
            ? await adapter.signIn({ email, password })
            : mode === "forgot"
              ? await adapter.forgotPassword(email)
              : mode === "verify"
                ? await adapter.verifyEmail({ email, code })
                : await adapter.resetPassword({ email, code, password });
      setIsError(!result.ok);
      setMessage(result.message);
      if (result.ok && result.next === "VERIFY_EMAIL") {
        window.sessionStorage.setItem("insips-verification-email", email);
        router.push("/auth/verify-email");
      }
      if (result.ok && mode === "forgot") {
        window.sessionStorage.setItem("insips-reset-email", email);
        router.push("/auth/reset-password");
      }
      if (result.ok && result.next === "SIGNED_IN") {
        router.push(mode === "sign-in" ? "/app" : "/auth/sign-in");
      }
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "The account action could not be completed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function federate(provider: AuthProviderName) {
    setSubmitting(true);
    setMessage(null);
    try {
      await getIdentityAdapter().signInWithProvider(provider);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Federated sign-in is unavailable.",
      );
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="auth-form-card"
      initial={false}
      transition={{ duration: 0.5 }}
    >
      <p className="auth-eyebrow">{details.eyebrow}</p>
      <h2>{details.title}</h2>
      <p className="auth-description">{details.description}</p>
      <div className="auth-adapter-note" role="note">
        <Info size={15} />
        {getIdentityAdapter().kind === "LOCAL_TEST"
          ? "Local test adapter. No real account is created in this demo."
          : "Protected account access with secure session handling."}
      </div>
      {mode === "sign-in" || mode === "sign-up" ? (
        <div className="federated-auth" aria-label="Federated sign in">
          {(["Google", "Facebook", "Apple"] as const).map((provider) => (
            <button
              disabled={submitting || !hydrated}
              key={provider}
              onClick={() => void federate(provider)}
              type="button"
            >
              Continue with {provider}
            </button>
          ))}
          <span>or continue with email</span>
        </div>
      ) : null}
      <form onSubmit={submit}>
        {mode === "sign-up" ? (
          <div className="auth-field">
            <label htmlFor="name">Full name</label>
            <div>
              <input
                autoComplete="name"
                id="name"
                name="name"
                placeholder="Your name"
                required
              />
            </div>
          </div>
        ) : null}
        {needsEmail ? (
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <div>
              <Mail size={17} />
              <input
                autoComplete="email"
                id="email"
                name="email"
                placeholder="you@organization.org"
                required
                type="email"
              />
            </div>
          </div>
        ) : null}
        {mode === "verify" || mode === "reset" ? (
          <div className="auth-field">
            <label htmlFor="code">
              {mode === "verify" ? "Verification code" : "Recovery code"}
            </label>
            <div>
              <input
                autoComplete="one-time-code"
                id="code"
                inputMode="numeric"
                maxLength={6}
                name="code"
                pattern="[0-9]{6}"
                placeholder="000000"
                required
              />
            </div>
            <small>
              Six digits · local fixture codes are shown after the preceding
              action
            </small>
          </div>
        ) : null}
        {needsPassword ? (
          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="password">
                {mode === "reset" ? "New password" : "Password"}
              </label>
              {mode === "sign-in" ? (
                <Link href="/auth/forgot-password">Forgot password?</Link>
              ) : null}
            </div>
            <div>
              <LockKeyhole size={17} />
              <input
                autoComplete={
                  mode === "sign-in" ? "current-password" : "new-password"
                }
                id="password"
                minLength={12}
                name="password"
                placeholder="At least 12 characters"
                required
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {mode !== "sign-in" ? (
              <ul className="password-rules">
                <li>
                  <Check size={12} /> 12+ characters
                </li>
                <li>
                  <Check size={12} /> Upper and lowercase
                </li>
                <li>
                  <Check size={12} /> Number and symbol
                </li>
              </ul>
            ) : null}
          </div>
        ) : null}
        {mode === "reset" ? (
          <div className="auth-field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <div>
              <LockKeyhole size={17} />
              <input
                autoComplete="new-password"
                id="confirm-password"
                minLength={12}
                name="confirm-password"
                required
                type={showPassword ? "text" : "password"}
              />
            </div>
          </div>
        ) : null}
        {message ? (
          <div
            className={`auth-inline-message ${isError ? "error" : "success"}`}
            role={isError ? "alert" : "status"}
          >
            <Info size={17} />
            <span>{message}</span>
          </div>
        ) : null}
        <motion.button
          className="button button-accent button-full auth-submit"
          disabled={submitting || !hydrated}
          type="submit"
          whileTap={{ scale: 0.985 }}
        >
          {submitting ? (
            <>
              <RefreshCw className="spin" size={17} /> Working…
            </>
          ) : (
            <>
              {details.action} <ArrowRight size={17} />
            </>
          )}
        </motion.button>
      </form>
      <div className="auth-card-foot">
        {mode === "sign-in" ? (
          <>
            <span>New to INSIPS?</span>
            <Link href="/auth/sign-up">Request an account</Link>
          </>
        ) : mode === "sign-up" ? (
          <>
            <span>Already have access?</span>
            <Link href="/auth/sign-in">Sign in</Link>
          </>
        ) : (
          <Link href="/auth/sign-in">
            <ArrowRight className="auth-back-arrow" size={15} /> Back to sign in
          </Link>
        )}
      </div>
      {mode === "sign-in" ? (
        <Link className="demo-entry-link" href="/demo">
          Looking for the synthetic demo? Choose a role <ArrowRight size={15} />
        </Link>
      ) : null}
    </motion.div>
  );
}
