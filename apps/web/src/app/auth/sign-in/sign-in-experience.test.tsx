import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignInExperience } from "./sign-in-experience";

const push = vi.fn();
const signIn = vi.fn();
const signInWithProvider = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/auth-adapter", () => ({
  getIdentityAdapter: () => ({
    kind: "LOCAL_TEST",
    signIn,
    signInWithProvider,
  }),
}));

describe("SignInExperience", () => {
  beforeEach(() => {
    push.mockReset();
    signIn.mockReset();
    signInWithProvider.mockReset();
    signIn.mockResolvedValue({ ok: false, message: "Sign-in failed." });
    signInWithProvider.mockRejectedValue(new Error("Provider unavailable."));
  });

  it("validates email, toggles password visibility, and warns about caps lock", () => {
    render(<SignInExperience />);
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Enter a valid email address.")).toBeVisible();

    const password = screen.getByLabelText("Password");
    fireEvent.keyUp(password, { key: "CapsLock" });
    expect(screen.getByText("Caps Lock is on.")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
  });

  it("keeps provider buttons real and reports a local adapter error", async () => {
    render(<SignInExperience />);
    await fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Provider unavailable."));
    expect(signInWithProvider).toHaveBeenCalledWith("Google");
  });

  it("navigates to the workspace after a confirmed sign in", async () => {
    signIn.mockResolvedValue({ ok: true, next: "SIGNED_IN", message: "Signed in locally." });
    render(<SignInExperience />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "donor@example.org" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "StrongPassword!23" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/app"));
  });
});
