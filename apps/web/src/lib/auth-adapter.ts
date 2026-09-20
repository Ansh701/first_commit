"use client";

export type AuthProviderName = "Google" | "Facebook" | "Apple";

export type AuthResult = {
  ok: boolean;
  next?: "VERIFY_EMAIL" | "SIGNED_IN" | "RESET_CODE";
  message: string;
};

export interface IdentityAdapter {
  readonly kind: "LOCAL_TEST" | "COGNITO";
  signUp(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResult>;
  verifyEmail(input: { email: string; code: string }): Promise<AuthResult>;
  resendVerification(email: string): Promise<AuthResult>;
  signIn(input: { email: string; password: string }): Promise<AuthResult>;
  signInWithProvider(provider: AuthProviderName): Promise<void>;
  forgotPassword(email: string): Promise<AuthResult>;
  resetPassword(input: {
    email: string;
    code: string;
    password: string;
  }): Promise<AuthResult>;
  refreshSession(): Promise<AuthResult>;
  logout(): Promise<AuthResult>;
  deleteAccount(): Promise<AuthResult>;
  restoreAccount(): Promise<AuthResult>;
}

const accountKey = "insips-local-test-account-v1";
const sessionKey = "insips-local-test-session-v1";

type LocalAccount = {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  archived: boolean;
};

function readLocalAccount(): LocalAccount | null {
  const raw = window.localStorage.getItem(accountKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalAccount;
  } catch {
    window.localStorage.removeItem(accountKey);
    return null;
  }
}

const localTestAdapter: IdentityAdapter = {
  kind: "LOCAL_TEST",
  async signUp(input) {
    window.localStorage.setItem(
      accountKey,
      JSON.stringify({ ...input, verified: false, archived: false }),
    );
    return {
      ok: true,
      next: "VERIFY_EMAIL",
      message:
        "Test account created. Use verification code 246810 in this local fixture.",
    };
  },
  async verifyEmail({ email, code }) {
    const account = readLocalAccount();
    if (!account || account.email !== email || code !== "246810") {
      return { ok: false, message: "The test verification code is not valid." };
    }
    window.localStorage.setItem(
      accountKey,
      JSON.stringify({ ...account, verified: true }),
    );
    return {
      ok: true,
      next: "SIGNED_IN",
      message: "Email verified. You can now sign in.",
    };
  },
  async resendVerification(email) {
    return {
      ok: true,
      message: `A new local verification code is ready for ${email}. Use 246810.`,
    };
  },
  async signIn({ email, password }) {
    const account = readLocalAccount();
    if (
      !account ||
      account.email !== email ||
      account.password !== password ||
      !account.verified ||
      account.archived
    ) {
      return {
        ok: false,
        message:
          "Sign-in failed. Verify the local account details and email status.",
      };
    }
    window.localStorage.setItem(
      sessionKey,
      JSON.stringify({
        subject: `local:${account.email}`,
        expiresAt: Date.now() + 60 * 60 * 1000,
      }),
    );
    return { ok: true, next: "SIGNED_IN", message: "Signed in locally." };
  },
  async signInWithProvider() {
    throw new Error(
      "Federated sign-in is not configured in this local environment.",
    );
  },
  async forgotPassword() {
    return {
      ok: true,
      next: "RESET_CODE",
      message:
        "If the local test account exists, use reset code 135790.",
    };
  },
  async resetPassword({ email, code, password }) {
    const account = readLocalAccount();
    if (!account || account.email !== email || code !== "135790") {
      return { ok: false, message: "The local reset code is not valid." };
    }
    window.localStorage.setItem(
      accountKey,
      JSON.stringify({ ...account, password }),
    );
    return {
      ok: true,
      message: "Password updated for the local test account.",
    };
  },
  async refreshSession() {
    const raw = window.localStorage.getItem(sessionKey);
    if (!raw) return { ok: false, message: "No local session is active." };
    const session = JSON.parse(raw) as { subject: string; expiresAt: number };
    window.localStorage.setItem(
      sessionKey,
      JSON.stringify({ ...session, expiresAt: Date.now() + 60 * 60 * 1000 }),
    );
    return { ok: true, message: "Local test session refreshed." };
  },
  async logout() {
    window.localStorage.removeItem(sessionKey);
    return { ok: true, message: "Signed out." };
  },
  async deleteAccount() {
    const account = readLocalAccount();
    if (account) {
      window.localStorage.setItem(
        accountKey,
        JSON.stringify({ ...account, archived: true }),
      );
    }
    window.localStorage.removeItem(sessionKey);
    return {
      ok: true,
      message:
        "The local test account was archived. Production deletion follows the retention workflow.",
    };
  },
  async restoreAccount() {
    const account = readLocalAccount();
    if (account) {
      window.localStorage.setItem(
        accountKey,
        JSON.stringify({ ...account, archived: false }),
      );
    }
    return { ok: true, message: "The local test account was restored." };
  },
};

async function callAccountApi(path: string, method: "POST" | "DELETE") {
  const { fetchAuthSession } = await import("aws-amplify/auth");
  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken.toString();
  const apiUrl = process.env.NEXT_PUBLIC_INSIPS_API_URL;
  if (!token || !apiUrl)
    throw new Error("Authenticated API configuration is incomplete.");
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: { authorization: `Bearer ${token}` },
  });
  if (!response.ok)
    throw new Error("The account lifecycle request was not accepted.");
}

const cognitoAdapter: IdentityAdapter = {
  kind: "COGNITO",
  async signUp({ name, email, password }) {
    const { signUp } = await import("aws-amplify/auth");
    const result = await signUp({
      username: email,
      password,
      options: { userAttributes: { email, name } },
    });
    return {
      ok: true,
      next:
        result.nextStep.signUpStep === "CONFIRM_SIGN_UP"
          ? "VERIFY_EMAIL"
          : "SIGNED_IN",
      message: "Account created. Check your email to verify access.",
    };
  },
  async verifyEmail({ email, code }) {
    const { confirmSignUp } = await import("aws-amplify/auth");
    await confirmSignUp({ username: email, confirmationCode: code });
    return { ok: true, message: "Email verified." };
  },
  async resendVerification(email) {
    const { resendSignUpCode } = await import("aws-amplify/auth");
    await resendSignUpCode({ username: email });
    return { ok: true, message: "A new verification code was sent." };
  },
  async signIn({ email, password }) {
    const { signIn } = await import("aws-amplify/auth");
    const result = await signIn({ username: email, password });
    return {
      ok: result.isSignedIn,
      next: result.isSignedIn ? "SIGNED_IN" : undefined,
      message: result.isSignedIn
        ? "Signed in securely."
        : "Additional verification is required.",
    };
  },
  async signInWithProvider(provider) {
    const { signInWithRedirect } = await import("aws-amplify/auth");
    await signInWithRedirect({ provider });
  },
  async forgotPassword(email) {
    const { resetPassword } = await import("aws-amplify/auth");
    await resetPassword({ username: email });
    return {
      ok: true,
      next: "RESET_CODE",
      message: "If the account exists, a recovery code was sent.",
    };
  },
  async resetPassword({ email, code, password }) {
    const { confirmResetPassword } = await import("aws-amplify/auth");
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword: password,
    });
    return { ok: true, message: "Password updated." };
  },
  async refreshSession() {
    const { fetchAuthSession } = await import("aws-amplify/auth");
    await fetchAuthSession({ forceRefresh: true });
    return { ok: true, message: "Session refreshed." };
  },
  async logout() {
    const { signOut } = await import("aws-amplify/auth");
    await signOut({ global: false });
    return { ok: true, message: "Signed out." };
  },
  async deleteAccount() {
    await callAccountApi("/account", "DELETE");
    const { signOut } = await import("aws-amplify/auth");
    await signOut({ global: true });
    return {
      ok: true,
      message:
        "Account archived and signed out. Permanent deletion follows the retention process.",
    };
  },
  async restoreAccount() {
    await callAccountApi("/account/restore", "POST");
    return { ok: true, message: "Account restored." };
  },
};

export function getIdentityAdapter(): IdentityAdapter {
  return process.env.NEXT_PUBLIC_INSIPS_AUTH_MODE === "cognito"
    ? cognitoAdapter
    : localTestAdapter;
}
