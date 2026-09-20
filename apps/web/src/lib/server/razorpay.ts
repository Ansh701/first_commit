import { createHmac, timingSafeEqual } from "node:crypto";
import { RAZORPAY_CURRENCY } from "@insips/contracts";
import { z } from "zod";

export {
  MIN_DONATION_PAISE,
  MAX_DONATION_PAISE,
  RAZORPAY_CURRENCY,
  validateDonationOrderInput,
} from "@insips/contracts";
export type { DonationOrderInput, DonationTarget } from "@insips/contracts";

const paymentConfirmationSchema = z.object({
  orderId: z.string().min(1).max(80),
  paymentId: z.string().min(1).max(80),
  signature: z.string().regex(/^[a-f0-9]{64}$/i),
  amountPaise: z.number().int().positive(),
  currency: z.literal(RAZORPAY_CURRENCY),
  status: z.enum(["authorized", "captured", "failed", "cancelled"]),
});

const paymentExpectationSchema = z.object({
  orderId: z.string().min(1).max(80),
  amountPaise: z.number().int().positive(),
  currency: z.literal(RAZORPAY_CURRENCY),
});

export type PaymentConfirmation = z.infer<typeof paymentConfirmationSchema>;
export type PaymentConfirmationResult = {
  orderId: string;
  paymentId: string;
  status: "AUTHORIZED" | "CAPTURED" | "FAILED" | "CANCELLED";
};

function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) {
    return false;
  }
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
) {
  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, signature);
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

export function verifyPaymentConfirmation(
  input: PaymentConfirmation,
  expectedPayment: {
    orderId: string;
    amountPaise: number;
    currency: typeof RAZORPAY_CURRENCY;
  },
  secret: string,
): PaymentConfirmationResult {
  const confirmation = paymentConfirmationSchema.parse(input);
  const expected = paymentExpectationSchema.parse(expectedPayment);
  if (confirmation.orderId !== expected.orderId) {
    throw new Error("The payment order could not be verified.");
  }
  if (confirmation.amountPaise !== expected.amountPaise) {
    throw new Error("The payment amount could not be verified.");
  }
  if (confirmation.currency !== expected.currency) {
    throw new Error("The payment currency could not be verified.");
  }
  if (
    !verifyPaymentSignature(
      confirmation.orderId,
      confirmation.paymentId,
      confirmation.signature,
      secret,
    )
  ) {
    throw new Error("The payment signature could not be verified.");
  }

  return {
    orderId: confirmation.orderId,
    paymentId: confirmation.paymentId,
    status: confirmation.status.toUpperCase() as PaymentConfirmationResult["status"],
  };
}
