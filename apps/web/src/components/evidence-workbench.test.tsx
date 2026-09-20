import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EvidenceWorkbench } from "./evidence-workbench";

describe("EvidenceWorkbench", () => {
  it("exposes the six evidence-to-public stages", () => {
    render(<EvidenceWorkbench />);

    expect(screen.getByRole("tablist", { name: "Evidence to public workflow" })).toBeVisible();
    for (const label of [
      "Upload privately",
      "Safety check",
      "Read the evidence",
      "Review suggestions",
      "Human decision",
      "Publish approved facts",
    ]) {
      expect(screen.getByRole("tab", { name: label })).toBeVisible();
    }
    expect(screen.getByRole("tab", { name: "Review suggestions" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("keeps the current stage readable as a static ledger", () => {
    render(<EvidenceWorkbench />);

    expect(screen.getByText("Compass candidate fields")).toBeVisible();
    expect(screen.getByText("Human confirmation required")).toBeVisible();
    expect(screen.getByText("Synthetic evidence · page 1")).toBeVisible();
  });
});
