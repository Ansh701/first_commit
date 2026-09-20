import { z } from "zod";
import { calculateDonationBreakdown, DEFAULT_PLATFORM_FEE_BPS } from "./product.ts";

export const RAZORPAY_CURRENCY = "INR" as const;
export const MIN_DONATION_PAISE = 100;
export const MAX_DONATION_PAISE = 100_000_000;

const orderInputSchema = z.object({
  causeId: z.string().min(1).max(120),
  organizationId: z.string().min(1).max(120),
  amountPaise: z.number().int().min(MIN_DONATION_PAISE).max(MAX_DONATION_PAISE),
  currency: z.literal(RAZORPAY_CURRENCY),
  donorCoversPlatformFee: z.boolean(),
});

export type DonationOrderInput = z.infer<typeof orderInputSchema>;

export type DonationTarget = {
  causeId: string;
  organizationId: string;
  currency: typeof RAZORPAY_CURRENCY;
  acceptingDonations: boolean;
};

export function validateDonationOrderInput(
  input: unknown,
  target: DonationTarget,
) {
  const parsed = orderInputSchema.parse(input);
  if (parsed.causeId !== target.causeId) {
    throw new Error("The selected cause could not be verified.");
  }
  if (parsed.organizationId !== target.organizationId) {
    throw new Error("The selected organization could not be verified.");
  }
  if (parsed.currency !== target.currency) {
    throw new Error("Only INR donations are supported.");
  }
  if (!target.acceptingDonations) {
    throw new Error("This cause is not accepting donations.");
  }

  return {
    ...parsed,
    ...calculateDonationBreakdown({
      amountPaise: parsed.amountPaise,
      donorCoversPlatformFee: parsed.donorCoversPlatformFee,
      feeRateBps: DEFAULT_PLATFORM_FEE_BPS,
    }),
  };
}
