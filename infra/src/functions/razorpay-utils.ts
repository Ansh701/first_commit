import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";
import { RAZORPAY_CURRENCY } from "@insips/contracts";

export type RazorpayDonationOrder = {
  causeId: string;
  organizationId: string;
  amountPaise: number;
  platformFeePaise: number;
  totalChargedPaise: number;
  currency: typeof RAZORPAY_CURRENCY;
};

export type SafeRazorpayOrderDetails = {
  orderId: string;
  amountPaise: number;
  currency: typeof RAZORPAY_CURRENCY;
  publicKey: string;
};

export type RazorpayCredentials = {
  keyId: string;
  keySecret: string;
};

type RazorpayOrderResponse = {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
};

const razorpayOrderResponse = {
  id: (value: unknown): value is string =>
    typeof value === "string" && value.length > 0 && value.length <= 80,
  amount: (value: unknown): value is number | string => {
    const amount = typeof value === "string" ? Number(value) : value;
    return (
      (typeof amount === "number" &&
        Number.isSafeInteger(amount) &&
        amount > 0) ||
      false
    );
  },
  currency: (value: unknown): value is typeof RAZORPAY_CURRENCY =>
    value === RAZORPAY_CURRENCY,
  status: (value: unknown): value is string =>
    value === "created" || value === "attempted" || value === "paid",
};

export function buildRazorpayOrderRequest(
  order: RazorpayDonationOrder,
  receipt: string,
) {
  return {
    amount: order.totalChargedPaise,
    currency: order.currency,
    receipt,
    partial_payment: false,
    notes: {
      cause_id: order.causeId,
      organization_id: order.organizationId,
    },
  };
}

export function safeRazorpayOrderDetails(
  order: RazorpayOrderResponse,
  publicKey: string,
): SafeRazorpayOrderDetails {
  if (
    !razorpayOrderResponse.id(order.id) ||
    !razorpayOrderResponse.amount(order.amount) ||
    !razorpayOrderResponse.currency(order.currency) ||
    !razorpayOrderResponse.status(order.status) ||
    !publicKey.trim()
  ) {
    throw new Error("RAZORPAY_ORDER_RESPONSE_INVALID");
  }

  const amountPaise = Number(order.amount);
  return {
    orderId: order.id,
    amountPaise,
    currency: order.currency,
    publicKey: publicKey.trim(),
  };
}

function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) {
    return false;
  }
  const expected = Buffer.from(left, "hex");
  const received = Buffer.from(right, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
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

export function createRazorpayClient(credentials: RazorpayCredentials) {
  const keyId = credentials.keyId.trim();
  const keySecret = credentials.keySecret.trim();
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_NOT_CONFIGURED");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  return createRazorpayClient({ keyId, keySecret });
}

export async function createRazorpayOrder(
  order: RazorpayDonationOrder,
  receipt: string,
  credentials?: RazorpayCredentials,
) {
  const client = credentials
    ? createRazorpayClient(credentials)
    : getRazorpayClient();
  return client.orders.create(
    buildRazorpayOrderRequest(order, receipt),
  );
}
