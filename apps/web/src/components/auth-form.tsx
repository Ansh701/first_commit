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
} from "lucide-react";
import { FormEvent, useState } from "react";

type AuthMode = "sign-in" | "sign-up" | "forgot" | "reset" | "verify";

const copy: Record<
  AuthMode,
  { eyebrow: string; title: string; description: string; action: string }
> = {
  "sign-in": {
    eyebrow: "Welcome back",
    title: "Sign in to INSIPS",
    description: "Access your organization, review, or CSR workspace securely.",
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
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const details = copy[mode];
  const needsEmail =
    mode === "sign-in" || mode === "sign-up" || mode === "forgot";
  const needsPassword =
    mode === "sign-in" || mode === "sign-up" || mode === "reset";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      mode === "forgot"
        ? "If an account exists, recovery instructions will be sent when secure account access is enabled."
        : mode === "verify"
          ? "Email verification is not connected in this local fixture. No code was submitted."
          : "Secure account actions are not connected in this local fixture. Your details were not sent.",
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="auth-form-card"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.5 }}
    >
      <p className="auth-eyebrow">{details.eyebrow}</p>
      <h2>{details.title}</h2>
      <p className="auth-description">{details.description}</p>
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
        {mode === "verify" ? (
          <div className="auth-field">
            <label htmlFor="code">Verification code</label>
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
            <small>Six digits · codes expire for your protection</small>
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
          <div className="auth-inline-message" role="status">
            <Info size={17} />
            <span>{message}</span>
          </div>
        ) : null}
        <motion.button
          className="button button-accent button-full auth-submit"
          type="submit"
          whileTap={{ scale: 0.985 }}
        >
          {details.action} <ArrowRight size={17} />
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
