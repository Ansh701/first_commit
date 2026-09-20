import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecoveryExperience } from "./recovery-experience";

const push = vi.fn();
const forgotPassword = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/auth-adapter", () => ({
  getIdentityAdapter: () => ({ kind: "LOCAL_TEST", forgotPassword }),
}));

describe("RecoveryExperience", () => {
  beforeEach(() => {
    push.mockReset();
    forgotPassword.mockReset();
    forgotPassword.mockResolvedValue({ ok: true, next: "RESET_CODE", message: "If the local test account exists, use reset code 135790." });
  });

  it("validates the email without revealing account existence", () => {
    render(<RecoveryExperience />);
    fireEvent.click(screen.getByRole("button", { name: "Send recovery link" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email address.");
    expect(screen.queryByText(/account exists/i)).not.toBeInTheDocument();
  });

  it("routes a confirmed recovery request to reset password", async () => {
    render(<RecoveryExperience />);
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "asha@example.org" } });
    fireEvent.click(screen.getByRole("button", { name: "Send recovery link" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/auth/reset-password"));
    expect(forgotPassword).toHaveBeenCalledWith("asha@example.org");
  });
});
