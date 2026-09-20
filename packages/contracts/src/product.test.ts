import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLATFORM_FEE_BPS,
  applyPaymentEvent,
  calculateDonationBreakdown,
  canTransitionItemDonation,
  canTransitionVolunteer,
  decideVerificationDocument,
  onboardingCompletion,
  type Donation,
  type PaymentEvent,
} from "./product";

const capturedDonation: Donation = {
  id: "donation-1",
  donorId: "donor-1",
  organizationId: "org-1",
  causeId: "cause-1",
  amountPaise: 100_000,
  feeRateBps: DEFAULT_PLATFORM_FEE_BPS,
  donorCoversPlatformFee: false,
  platformFeePaise: 250,
  razorpayFeePaise: 0,
  netOrganizationPaise: 99_750,
  status: "CREATED",
  transferStatus: "NOT_CONFIGURED",
  refundedPaise: 0,
  anonymous: false,
  publicName: "Demo Donor",
  createdAt: "2026-09-19T10:00:00.000Z",
};

describe("donation accounting", () => {
  it("uses the exact default 25 basis point platform fee", () => {
    expect(
      calculateDonationBreakdown({
        amountPaise: 100_000,
        donorCoversPlatformFee: false,
      }),
    ).toEqual({
      causeAmountPaise: 100_000,
      platformFeePaise: 250,
      razorpayFeePaise: 0,
      totalChargedPaise: 100_000,
      netOrganizationPaise: 99_750,
      feeRateBps: 25,
      donorCoversPlatformFee: false,
    });
  });

  it("charges a covered fee separately without inflating cause progress", () => {
    const result = calculateDonationBreakdown({
      amountPaise: 100_000,
      donorCoversPlatformFee: true,
    });
    expect(result.totalChargedPaise).toBe(100_250);
    expect(result.causeAmountPaise).toBe(100_000);
    expect(result.netOrganizationPaise).toBe(100_000);
  });

  it("counts a captured webhook once and ignores an exact retry", () => {
    const event = {
      id: "event-captured-1",
      donationId: capturedDonation.id,
      type: "PAYMENT_CAPTURED" as const,
      occurredAt: "2026-09-19T10:01:00.000Z",
    };
    const first = applyPaymentEvent(
      {
        donation: capturedDonation,
        processedEventIds: [],
        causeProgressPaise: 0,
      },
      event,
    );
    const retry = applyPaymentEvent(first, event);
    expect(first.causeProgressPaise).toBe(100_000);
    expect(retry).toBe(first);
  });

  it("does not count failed payments and reverses progress on refunds", () => {
    const failed = applyPaymentEvent(
      {
        donation: capturedDonation,
        processedEventIds: [],
        causeProgressPaise: 0,
      },
      {
        id: "event-failed",
        donationId: capturedDonation.id,
        type: "PAYMENT_FAILED",
        occurredAt: "2026-09-19T10:01:00.000Z",
      },
    );
    expect(failed.causeProgressPaise).toBe(0);

    const captured = applyPaymentEvent(
      {
        donation: capturedDonation,
        processedEventIds: [],
        causeProgressPaise: 0,
      },
      {
        id: "event-captured",
        donationId: capturedDonation.id,
        type: "PAYMENT_CAPTURED",
        occurredAt: "2026-09-19T10:01:00.000Z",
      },
    );
    const refunded = applyPaymentEvent(captured, {
      id: "event-refund",
      donationId: capturedDonation.id,
      type: "REFUND_PROCESSED",
      amountPaise: 25_000,
      occurredAt: "2026-09-19T11:00:00.000Z",
    });
    expect(refunded.causeProgressPaise).toBe(75_000);
    expect(refunded.donation.status).toBe("PARTIALLY_REFUNDED");
  });

  it("tracks authorized and cancelled states without letting late events downgrade capture", () => {
    const authorized = applyPaymentEvent(
      {
        donation: capturedDonation,
        processedEventIds: [],
        causeProgressPaise: 0,
      },
      {
        id: "event-authorized",
        donationId: capturedDonation.id,
        type: "PAYMENT_AUTHORIZED",
        occurredAt: "2026-09-19T10:01:00.000Z",
      } as unknown as PaymentEvent,
    );
    expect(authorized.donation.status).toBe("AUTHORIZED");

    const captured = applyPaymentEvent(authorized, {
      id: "event-captured-after-authorized",
      donationId: capturedDonation.id,
      type: "PAYMENT_CAPTURED",
      occurredAt: "2026-09-19T10:02:00.000Z",
    });
    const lateCancelled = applyPaymentEvent(captured, {
      id: "event-cancelled-after-capture",
      donationId: capturedDonation.id,
      type: "PAYMENT_CANCELLED",
      occurredAt: "2026-09-19T10:03:00.000Z",
    } as unknown as PaymentEvent);

    expect(captured.donation.status).toBe("CAPTURED");
    expect(captured.causeProgressPaise).toBe(capturedDonation.amountPaise);
    expect(lateCancelled.donation.status).toBe("CAPTURED");
    expect(lateCancelled.causeProgressPaise).toBe(
      capturedDonation.amountPaise,
    );
  });
});

describe("workflow state machines", () => {
  it("requires a reason for rejected verification documents", () => {
    expect(() =>
      decideVerificationDocument(
        {
          id: "doc-1",
          organizationId: "org-1",
          label: "Registration",
          privateObjectId: "private-doc-1",
          status: "PENDING",
        },
        "REJECTED",
        "admin-1",
      ),
    ).toThrow(/reason/i);
  });

  it("tracks resumable onboarding completion", () => {
    expect(
      onboardingCompletion({
        organizationId: "org-1",
        completedSteps: ["ACCOUNT", "ORGANIZATION", "LOCATION"],
        currentStep: "MEDIA",
        status: "DRAFT",
        updatedAt: "2026-09-19T10:00:00.000Z",
        rejectedFields: {},
      }),
    ).toBe(30);
  });

  it("keeps item and volunteer terminal states closed", () => {
    expect(canTransitionItemDonation("PLEDGED", "ACCEPTED")).toBe(true);
    expect(canTransitionItemDonation("RECEIVED", "PLEDGED")).toBe(false);
    expect(canTransitionVolunteer("APPLIED", "APPROVED")).toBe(true);
    expect(canTransitionVolunteer("COMPLETED", "APPROVED")).toBe(false);
  });
});
