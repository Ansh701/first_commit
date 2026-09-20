import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "./contact-form";
import { normalizeContactSubmission } from "./contact-submission";

describe("contact submission", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("unexpected request"));
  });

  it("normalizes a complete submission without exposing the honeypot", () => {
    const result = normalizeContactSubmission({
      fullName: "  Asha Rao ",
      email: " ASHA@EXAMPLE.ORG ",
      relationship: "Organization",
      topic: "Organization onboarding",
      subject: "Need help with evidence",
      message: "  I need help preparing our next submission.  ",
      consent: true,
      website: "",
    });

    expect(result).toEqual({
      fullName: "Asha Rao",
      email: "asha@example.org",
      relationship: "Organization",
      topic: "Organization onboarding",
      subject: "Need help with evidence",
      message: "I need help preparing our next submission.",
      consent: true,
      website: "",
    });
  });

  it("shows field guidance before making a request", () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByText("Enter your full name.")).toBeVisible();
    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("shows the queued success state returned by the server", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ status: "QUEUED", referenceId: "INS-1234" }), {
        status: 202,
        headers: { "content-type": "application/json" },
      }),
    );
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Asha Rao" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "asha@example.org" } });
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Evidence question" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Please help with our evidence submission." } });
    fireEvent.click(screen.getByLabelText(/I agree that INSIPS may use this information/));
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Message received and queued" })).toBeVisible());
    expect(screen.getByText("INS-1234")).toBeVisible();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute("href", "/");
  });
});
