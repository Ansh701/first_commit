import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CallbackExperience } from "./callback-experience";

const refreshSession = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/lib/auth-adapter", () => ({ getIdentityAdapter: () => ({ kind: "LOCAL_TEST", refreshSession }) }));

describe("CallbackExperience", () => {
  beforeEach(() => {
    refreshSession.mockReset();
    replace.mockReset();
  });

  it("shows a recoverable provider error", async () => {
    refreshSession.mockResolvedValue({ ok: false, message: "No local session is active." });
    render(<CallbackExperience />);
    await waitFor(() => expect(screen.getByRole("heading", { name: /could not finish/i })).toBeVisible());
    expect(screen.getByRole("button", { name: /Try again/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /Use email sign-in/i })).toHaveAttribute("href", "/auth/sign-in");
  });

  it("confirms a valid provider session and redirects to the workspace", async () => {
    refreshSession.mockResolvedValue({ ok: true, message: "Session refreshed." });
    render(<CallbackExperience />);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/Access confirmed/));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/app"), { timeout: 1200 });
  });
});
