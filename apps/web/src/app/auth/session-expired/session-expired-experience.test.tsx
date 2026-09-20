import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionExpiredExperience } from "./session-expired-experience";

describe("SessionExpiredExperience", () => {
  it("explains the protected state and offers clear recovery destinations", () => {
    render(<SessionExpiredExperience />);
    expect(screen.getByRole("heading", { name: "Your session has expired." })).toBeVisible();
    expect(screen.getByText(/No private evidence was exposed/)).toBeVisible();
    expect(screen.getByRole("link", { name: /Return to sign in/i })).toHaveAttribute("href", "/auth/sign-in");
    expect(screen.getByRole("link", { name: /Return to INSIPS home/i })).toHaveAttribute("href", "/");
  });
});
