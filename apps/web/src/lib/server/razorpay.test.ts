import { describe, expect, it } from "vitest";
import {
  validateDonationOrderInput,
  verifyPaymentConfirmation,
  verifyRazorpayWebhookSignature,
} from "./razorpay";

const target = {
  causeId: "cause-learning-kits",
  organizationId: "org-udaan-learning",
  currency: "INR" as const,
  acceptingDonations: true,
};

describe("Razorpay payment boundary", () => {
  it("accepts a valid INR order and calculates the server-owned fee", () => {
    expect(
      validateDonationOrderInput(
        {
          causeId: target.causeId,
          organizationId: target.organizationId,
          amountPaise: 100_000,
          currency: "INR",
          donorCoversPlatformFee: false,
        },
        target,
      ),
    ).toMatchObject({
      amountPaise: 100_000,
      platformFeePaise: 250,
      totalChargedPaise: 100_000,
      currency: "INR",
    });
  });

  it("rejects a cause, organization, currency, or amount that the server cannot verify", () => {
    expect(() =>
      validateDonationOrderInput(
        {
          causeId: "cause-other",
          organizationId: target.organizationId,
          amountPaise: 100_000,
          currency: "INR",
          donorCoversPlatformFee: false,
        },
        target,
      ),
    ).toThrow(/cause/i);
    expect(() =>
      validateDonationOrderInput(
        {
          causeId: target.causeId,
          organizationId: "org-other",
          amountPaise: 100_000,
          currency: "INR",
          donorCoversPlatformFee: false,
        },
        target,
      ),
    ).toThrow(/organization/i);
    expect(() =>
      validateDonationOrderInput(
        {
          causeId: target.causeId,
          organizationId: target.organizationId,
          amountPaise: 99,
          currency: "USD",
          donorCoversPlatformFee: false,
        },
        target,
      ),
    ).toThrow(/amount|currency/i);
  });

  it("requires the expected order, amount, currency, and verified payment signature", () => {
    const confirmation = {
      orderId: "order_123",
      paymentId: "pay_123",
      signature:
        "f6cd8fcfb47bcb5b4aee44a546dff2e008d07e7cba650141113fe766ec847eaa",
      amountPaise: 100_000,
      currency: "INR" as const,
      status: "captured" as const,
    };

    expect(
      verifyPaymentConfirmation(
        confirmation,
        { orderId: "order_123", amountPaise: 100_000, currency: "INR" },
        "test_secret",
      ),
    ).toEqual({
      orderId: "order_123",
      paymentId: "pay_123",
      status: "CAPTURED",
    });
    expect(() =>
      verifyPaymentConfirmation(
        { ...confirmation, amountPaise: 100_001 },
        { orderId: "order_123", amountPaise: 100_000, currency: "INR" },
        "test_secret",
      ),
    ).toThrow(/amount/i);
    expect(() =>
      verifyPaymentConfirmation(
        { ...confirmation, orderId: "order_other" },
        { orderId: "order_123", amountPaise: 100_000, currency: "INR" },
        "test_secret",
      ),
    ).toThrow(/order|signature/i);
  });

  it("validates webhook signatures against the exact raw body", () => {
    const rawBody = '{"id":"evt_1","event":"payment.captured"}';
    const signature =
      "eda0feb9c99516a0949ff3c73c9e4ae8a2c1aa234a9cf489d85c3d0ff8525831";

    expect(
      verifyRazorpayWebhookSignature(rawBody, signature, "webhook_secret"),
    ).toBe(true);
    expect(
      verifyRazorpayWebhookSignature(
        '{ "id":"evt_1", "event":"payment.captured" }',
        signature,
        "webhook_secret",
      ),
    ).toBe(false);
  });
});
