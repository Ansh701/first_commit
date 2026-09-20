import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignUpExperience } from "./sign-up-experience";

const push = vi.fn();
const signUp = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/auth-adapter", () => ({
  getIdentityAdapter: () => ({
    kind: "LOCAL_TEST",
    signUp,
    signInWithProvider: vi.fn().mockRejectedValue(new Error("Provider unavailable.")),
  }),
}));

describe("SignUpExperience", () => {
  beforeEach(() => {
    push.mockReset();
    signUp.mockReset();
    signUp.mockResolvedValue({ ok: true, next: "VERIFY_EMAIL", message: "Account created." });
  });

  it("checks password requirements and confirmation as the user types", () => {
    render(<SignUpExperience />);
    const password = screen.getByLabelText("Password");
    fireEvent.change(password, { target: { value: "short" } });
    expect(screen.getByText("12+ characters").className).not.toMatch(/requirementMet/);
    fireEvent.change(password, { target: { value: "StrongPassword!23" } });
    expect(screen.getByText("12+ characters").className).toMatch(/requirementMet/);
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "different" } });
    expect(screen.getByText("Passwords do not match.")).toBeVisible();
  });

  it("submits through the adapter and routes to email verification", async () => {
    render(<SignUpExperience />);
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Asha Rao" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "asha@example.org" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "StrongPassword!23" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "StrongPassword!23" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/auth/verify-email"));
    expect(signUp).toHaveBeenCalledWith({ name: "Asha Rao", email: "asha@example.org", password: "StrongPassword!23" });
  });
});
