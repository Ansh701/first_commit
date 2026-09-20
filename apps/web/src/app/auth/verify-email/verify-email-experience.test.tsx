import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VerifyEmailExperience } from "./verify-email-experience";

const verifyEmail = vi.fn();
const resendVerification = vi.fn();
vi.mock("@/lib/auth-adapter", () => ({ getIdentityAdapter: () => ({ kind: "LOCAL_TEST", verifyEmail, resendVerification }) }));

describe("VerifyEmailExperience", () => {
  beforeEach(() => {
    verifyEmail.mockReset();
    resendVerification.mockReset();
    verifyEmail.mockResolvedValue({ ok: true, next: "SIGNED_IN", message: "Email verified." });
    resendVerification.mockResolvedValue({ ok: true, message: "A new code is ready." });
    window.sessionStorage.clear();
  });

  it("validates the six-digit code before contacting the adapter", () => {
    render(<VerifyEmailExperience />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "member@example.org" } });
    fireEvent.change(screen.getByLabelText("Verification code"), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify email" }));
    expect(screen.getByRole("alert")).toHaveTextContent("all six digits");
    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it("shows the verified completion state", async () => {
    render(<VerifyEmailExperience />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "member@example.org" } });
    fireEvent.change(screen.getByLabelText("Verification code"), { target: { value: "246810" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify email" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Email verified"));
    expect(verifyEmail).toHaveBeenCalledWith({ email: "member@example.org", code: "246810" });
    expect(screen.getByRole("link", { name: /Continue to sign in/i })).toHaveAttribute("href", "/auth/sign-in");
  });
});
