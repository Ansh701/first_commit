import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResetPasswordExperience } from "./reset-password-experience";

const resetPassword = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/auth-adapter", () => ({ getIdentityAdapter: () => ({ kind: "LOCAL_TEST", resetPassword }) }));

describe("ResetPasswordExperience", () => {
  beforeEach(() => {
    resetPassword.mockReset();
    resetPassword.mockResolvedValue({ ok: true, message: "Password updated for the local test account." });
    window.sessionStorage.clear();
  });

  it("checks the code, password rules, and confirmation before calling the adapter", () => {
    render(<ResetPasswordExperience />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "member@example.org" } });
    fireEvent.change(screen.getByLabelText("Recovery code"), { target: { value: "12" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "short" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "different" } });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Complete the email");
    expect(resetPassword).not.toHaveBeenCalled();
    expect(screen.getByText("Passwords do not match.")).toBeVisible();
  });

  it("shows an intentional completion state after a successful reset", async () => {
    render(<ResetPasswordExperience />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "member@example.org" } });
    fireEvent.change(screen.getByLabelText("Recovery code"), { target: { value: "135790" } });
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "StrongPassword!23" } });
    fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "StrongPassword!23" } });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Password updated"));
    expect(resetPassword).toHaveBeenCalledWith({ email: "member@example.org", code: "135790", password: "StrongPassword!23" });
    expect(screen.getByRole("link", { name: /Continue to sign in/i })).toHaveAttribute("href", "/auth/sign-in");
  });
});
