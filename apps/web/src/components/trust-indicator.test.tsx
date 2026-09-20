import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrustIndicator } from "./trust-indicator";

describe("TrustIndicator", () => {
  it("shows the claim meaning, scope, and review date", () => {
    render(
      <TrustIndicator
        label="Registration status"
        meaning="The submitted registration was matched to the organization-confirmed value."
        reviewedAt="19 September 2026"
        scope="Organization profile"
        status="approved"
        value="Section 8 company"
      />,
    );

    expect(screen.getByRole("article")).toHaveTextContent("Registration status");
    expect(screen.getByText("Section 8 company")).toBeVisible();
    expect(screen.getByText(/matched to the organization-confirmed value/)).toBeVisible();
    expect(screen.getByText("Organization profile")).toBeVisible();
    expect(screen.getByText(/Reviewed 19 September 2026/)).toBeVisible();
  });

  it("does not render restricted source text", () => {
    render(
      <TrustIndicator
        label="Registration status"
        meaning="A reviewed claim with a public explanation."
        reviewedAt="19 September 2026"
        status="approved"
        value="Section 8 company"
      />,
    );

    expect(screen.queryByText(/object-key|reviewer note|private PDF/i)).not.toBeInTheDocument();
  });
});
