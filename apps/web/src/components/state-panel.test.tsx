import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatePanel } from "./state-panel";

describe("StatePanel", () => {
  it("renders a recoverable empty state with its action", () => {
    render(
      <StatePanel
        action={{ href: "/discover", label: "Discover organizations" }}
        description="Try a different filter to see more organizations."
        kind="empty"
        title="No organizations match"
      />,
    );

    expect(screen.getByRole("heading", { name: "No organizations match" })).toBeVisible();
    expect(screen.getByText("Try a different filter to see more organizations.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Discover organizations" })).toHaveAttribute(
      "href",
      "/discover",
    );
  });

  it("announces errors as alerts", () => {
    render(
      <StatePanel
        description="The record could not be loaded."
        kind="error"
        title="We could not open this record"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("We could not open this record");
  });
});
