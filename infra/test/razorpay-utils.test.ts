import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildRazorpayOrderRequest,
  safeRazorpayOrderDetails,
  verifyPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "../src/functions/razorpay-utils.js";

describe("Razorpay server utilities", () => {
  it("builds a minor-unit order and exposes only safe client details", () => {
    const request = buildRazorpayOrderRequest(
      {
        causeId: "cause-1",
        organizationId: "org-1",
        amountPaise: 10_000,
        platformFeePaise: 25,
        totalChargedPaise: 10_025,
        currency: "INR",
      },
      "donation-1",
    );
    expect(request).toEqual({
      amount: 10_025,
      currency: "INR",
      receipt: "donation-1",
      partial_payment: false,
      notes: { cause_id: "cause-1", organization_id: "org-1" },
    });
    expect(
      safeRazorpayOrderDetails(
        { id: "order_1", amount: 10_025, currency: "INR", status: "created" },
        "rzp_test_public",
      ),
    ).toEqual({
      orderId: "order_1",
      amountPaise: 10_025,
      currency: "INR",
      publicKey: "rzp_test_public",
    });
  });

  it("verifies payment and raw webhook HMAC signatures", () => {
    const paymentSignature = createHmac("sha256", "secret")
      .update("order_1|pay_1")
      .digest("hex");
    const webhookBody = '{"id":"evt_1","event":"payment.captured"}';
    const webhookSignature = createHmac("sha256", "secret")
      .update(webhookBody)
      .digest("hex");

    expect(
      verifyPaymentSignature("order_1", "pay_1", paymentSignature, "secret"),
    ).toBe(true);
    expect(
      verifyPaymentSignature("order_other", "pay_1", paymentSignature, "secret"),
    ).toBe(false);
    expect(
      verifyRazorpayWebhookSignature(webhookBody, webhookSignature, "secret"),
    ).toBe(true);
    expect(
      verifyRazorpayWebhookSignature(
        '{ "id":"evt_1", "event":"payment.captured" }',
        webhookSignature,
        "secret",
      ),
    ).toBe(false);
  });
});
