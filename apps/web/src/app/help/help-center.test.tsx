import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PublishedContentPage } from "@insips/contracts";
import { HelpCenter } from "./help-center";

const page: PublishedContentPage = {
  slug: "help",
  kicker: "Help and contact",
  title: "Know what happened and what to do next.",
  intro: "The product explains preserved work, blocked states, and safe recovery actions without exposing raw system errors.",
  sections: [
    {
      title: "A document is blocked",
      body: "Keep it restricted. Correct the file or account issue, then retry only the failed safe stage. Never skip a required check.",
    },
    {
      title: "A public indicator disappeared",
      body: "The underlying value may have changed. This is expected until a reviewer approves the new version.",
    },
  ],
};

describe("HelpCenter", () => {
  it("filters repository-backed guides and provides a recovery link", () => {
    render(<HelpCenter page={page} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search help" }), {
      target: { value: "blocked" },
    });

    expect(screen.getAllByRole("button", { name: "A document is blocked" }).some((button) => button.hasAttribute("aria-controls"))).toBe(true);
    expect(within(screen.getByRole("region", { name: "Clear answers, one decision at a time." })).queryByRole("button", { name: "A public indicator disappeared" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search help" }), {
      target: { value: "nothing matches" },
    });

    expect(screen.getByText("No guides match that search.")).toBeVisible();
    expect(within(screen.getByRole("status")).getByRole("link", { name: "Contact support" })).toHaveAttribute("href", "/contact");
  });

  it("opens and closes a guide with an accessible button", () => {
    render(<HelpCenter page={page} />);
    const guide = screen.getAllByRole("button", { name: "A document is blocked" }).find((button) => button.hasAttribute("aria-controls"))!;

    expect(guide).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(guide);
    expect(guide).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Keep it restricted/)).toBeVisible();
    fireEvent.click(guide);
    expect(guide).toHaveAttribute("aria-expanded", "false");
  });
});
