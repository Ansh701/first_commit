import { z } from "zod";

export const cognitoGroupSchema = z.enum([
  "INDIVIDUAL_DONOR",
  "ORGANIZATION_MEMBER",
  "ORGANIZATION_ADMIN",
  "CORPORATE_MEMBER",
  "CORPORATE_ADMIN",
  "REVIEWER",
  "PLATFORM_ADMIN",
]);

export type CognitoGroup = z.infer<typeof cognitoGroupSchema>;

export const tenantMembershipSchema = z.object({
  tenantId: z.string().min(1),
  tenantType: z.enum(["ORGANIZATION", "CORPORATE"]),
  permission: z.enum(["MEMBER", "ADMIN"]),
  status: z.enum(["ACTIVE", "INVITED", "SUSPENDED"]),
});

export type TenantMembership = z.infer<typeof tenantMembershipSchema>;

export const onboardingStepSchema = z.enum([
  "ACCOUNT",
  "ORGANIZATION",
  "LOCATION",
  "MEDIA",
  "DOCUMENTS",
  "SOCIAL",
  "TEAM",
  "PAYMENTS",
  "PREVIEW",
  "SUBMIT",
]);

export type OnboardingStep = z.infer<typeof onboardingStepSchema>;

export const onboardingDraftSchema = z.object({
  organizationId: z.string().min(1),
  completedSteps: z.array(onboardingStepSchema),
  currentStep: onboardingStepSchema,
  status: z.enum(["DRAFT", "SUBMITTED", "CHANGES_REQUESTED", "APPROVED"]),
  updatedAt: z.string().datetime(),
  rejectedFields: z.record(z.string(), z.string()).default({}),
});

export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;

export function onboardingCompletion(draft: OnboardingDraft): number {
  const uniqueSteps = new Set(draft.completedSteps);
  return Math.round(
    (uniqueSteps.size / onboardingStepSchema.options.length) * 100,
  );
}

export const verificationDocumentStatusSchema = z.enum([
  "PENDING",
  "CHANGES_REQUESTED",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
]);

export type VerificationDocumentStatus = z.infer<
  typeof verificationDocumentStatusSchema
>;

export const verificationDocumentSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  label: z.string().min(1).max(120),
  privateObjectId: z.string().min(1),
  expiresOn: z.string().date().optional(),
  status: verificationDocumentStatusSchema,
  latestReason: z.string().max(500).optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
});

export type VerificationDocument = z.infer<typeof verificationDocumentSchema>;

export function decideVerificationDocument(
  document: VerificationDocument,
  decision: Exclude<VerificationDocumentStatus, "PENDING" | "EXPIRED">,
  reviewerId: string,
  reason?: string,
  now = new Date().toISOString(),
): VerificationDocument {
  if (
    (decision === "REJECTED" || decision === "CHANGES_REQUESTED") &&
    !reason?.trim()
  ) {
    throw new Error("A reason is required for this decision.");
  }
  return verificationDocumentSchema.parse({
    ...document,
    status: decision,
    latestReason: reason?.trim() || undefined,
    reviewedBy: reviewerId,
    reviewedAt: now,
  });
}

export const organizationLifecycleSchema = z.enum([
  "DRAFT",
  "IN_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
  "ARCHIVED",
]);

export type OrganizationLifecycle = z.infer<typeof organizationLifecycleSchema>;

export const DEFAULT_PLATFORM_FEE_BPS = 25;

export const donationStatusSchema = z.enum([
  "CREATED",
  "PENDING",
  "AUTHORIZED",
  "CAPTURED",
  "FAILED",
  "CANCELLED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
]);

export const transferStatusSchema = z.enum([
  "NOT_CONFIGURED",
  "CREATED",
  "PENDING",
  "PROCESSED",
  "FAILED",
  "REVERSED",
  "PARTIALLY_REVERSED",
]);

export type DonationStatus = z.infer<typeof donationStatusSchema>;
export type TransferStatus = z.infer<typeof transferStatusSchema>;

export const donationBreakdownSchema = z.object({
  causeAmountPaise: z.number().int().nonnegative(),
  platformFeePaise: z.number().int().nonnegative(),
  razorpayFeePaise: z.number().int().nonnegative(),
  totalChargedPaise: z.number().int().nonnegative(),
  netOrganizationPaise: z.number().int().nonnegative(),
  feeRateBps: z.number().int().min(0).max(10_000),
  donorCoversPlatformFee: z.boolean(),
});

export type DonationBreakdown = z.infer<typeof donationBreakdownSchema>;

export function calculateDonationBreakdown(input: {
  amountPaise: number;
  feeRateBps?: number;
  donorCoversPlatformFee: boolean;
  razorpayFeePaise?: number;
}): DonationBreakdown {
  const amountPaise = z.number().int().positive().parse(input.amountPaise);
  const feeRateBps = z
    .number()
    .int()
    .min(0)
    .max(10_000)
    .parse(input.feeRateBps ?? DEFAULT_PLATFORM_FEE_BPS);
  const razorpayFeePaise = z
    .number()
    .int()
    .nonnegative()
    .parse(input.razorpayFeePaise ?? 0);
  const platformFeePaise = Math.round((amountPaise * feeRateBps) / 10_000);
  const totalChargedPaise = input.donorCoversPlatformFee
    ? amountPaise + platformFeePaise
    : amountPaise;
  const feeDeductedFromOrganization = input.donorCoversPlatformFee
    ? 0
    : platformFeePaise;

  return donationBreakdownSchema.parse({
    causeAmountPaise: amountPaise,
    platformFeePaise,
    razorpayFeePaise,
    totalChargedPaise,
    netOrganizationPaise: Math.max(
      0,
      amountPaise - feeDeductedFromOrganization - razorpayFeePaise,
    ),
    feeRateBps,
    donorCoversPlatformFee: input.donorCoversPlatformFee,
  });
}

export const donationSchema = z.object({
  id: z.string().min(1),
  donorId: z.string().min(1),
  organizationId: z.string().min(1),
  causeId: z.string().min(1),
  amountPaise: z.number().int().positive(),
  feeRateBps: z.number().int().min(0).max(10_000),
  donorCoversPlatformFee: z.boolean(),
  platformFeePaise: z.number().int().nonnegative(),
  razorpayFeePaise: z.number().int().nonnegative(),
  netOrganizationPaise: z.number().int().nonnegative(),
  status: donationStatusSchema,
  transferStatus: transferStatusSchema,
  refundedPaise: z.number().int().nonnegative(),
  anonymous: z.boolean(),
  publicName: z.string().max(80).optional(),
  message: z.string().max(300).optional(),
  razorpayReference: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type Donation = z.infer<typeof donationSchema>;

export const paymentEventSchema = z.object({
  id: z.string().min(1),
  donationId: z.string().min(1),
  type: z.enum([
    "PAYMENT_PENDING",
    "PAYMENT_AUTHORIZED",
    "PAYMENT_CAPTURED",
    "PAYMENT_FAILED",
    "PAYMENT_CANCELLED",
    "REFUND_PROCESSED",
    "TRANSFER_CREATED",
    "TRANSFER_PENDING",
    "TRANSFER_PROCESSED",
    "TRANSFER_FAILED",
    "TRANSFER_REVERSED",
    "TRANSFER_PARTIALLY_REVERSED",
  ]),
  amountPaise: z.number().int().nonnegative().optional(),
  occurredAt: z.string().datetime(),
});

export type PaymentEvent = z.infer<typeof paymentEventSchema>;

export type DonationLedgerState = {
  donation: Donation;
  processedEventIds: string[];
  causeProgressPaise: number;
};

export function applyPaymentEvent(
  current: DonationLedgerState,
  rawEvent: PaymentEvent,
): DonationLedgerState {
  const event = paymentEventSchema.parse(rawEvent);
  if (event.donationId !== current.donation.id) {
    throw new Error("Payment event does not belong to this donation.");
  }
  if (current.processedEventIds.includes(event.id)) return current;

  const donation = { ...current.donation };
  let causeProgressPaise = current.causeProgressPaise;

  if (event.type === "PAYMENT_PENDING" && donation.status === "CREATED") {
    donation.status = "PENDING";
  }
  if (
    event.type === "PAYMENT_AUTHORIZED" &&
    ["CREATED", "PENDING"].includes(donation.status)
  ) {
    donation.status = "AUTHORIZED";
  }
  if (
    event.type === "PAYMENT_CAPTURED" &&
    donation.status !== "CAPTURED" &&
    donation.status !== "PARTIALLY_REFUNDED" &&
    donation.status !== "REFUNDED"
  ) {
    donation.status = "CAPTURED";
    causeProgressPaise += donation.amountPaise;
  }
  if (
    event.type === "PAYMENT_FAILED" &&
    ["CREATED", "PENDING", "AUTHORIZED"].includes(donation.status)
  ) {
    donation.status = "FAILED";
  }
  if (
    event.type === "PAYMENT_CANCELLED" &&
    ["CREATED", "PENDING", "AUTHORIZED"].includes(donation.status)
  ) {
    donation.status = "CANCELLED";
  }
  if (event.type === "REFUND_PROCESSED") {
    if (
      donation.status !== "CAPTURED" &&
      donation.status !== "PARTIALLY_REFUNDED"
    ) {
      throw new Error("Only captured donations can be refunded.");
    }
    const refundPaise = Math.min(
      event.amountPaise ?? donation.amountPaise,
      donation.amountPaise - donation.refundedPaise,
    );
    donation.refundedPaise += refundPaise;
    causeProgressPaise = Math.max(0, causeProgressPaise - refundPaise);
    donation.status =
      donation.refundedPaise === donation.amountPaise
        ? "REFUNDED"
        : "PARTIALLY_REFUNDED";
  }

  const transferStatusByEvent: Partial<
    Record<PaymentEvent["type"], TransferStatus>
  > = {
    TRANSFER_CREATED: "CREATED",
    TRANSFER_PENDING: "PENDING",
    TRANSFER_PROCESSED: "PROCESSED",
    TRANSFER_FAILED: "FAILED",
    TRANSFER_REVERSED: "REVERSED",
    TRANSFER_PARTIALLY_REVERSED: "PARTIALLY_REVERSED",
  };
  const transferStatus = transferStatusByEvent[event.type];
  if (transferStatus) donation.transferStatus = transferStatus;

  return {
    donation: donationSchema.parse(donation),
    processedEventIds: [...current.processedEventIds, event.id],
    causeProgressPaise,
  };
}

export const itemDonationStatusSchema = z.enum([
  "PLEDGED",
  "CHANGES_REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "SCHEDULED",
  "RECEIVED",
  "CANCELLED",
]);

export type ItemDonationStatus = z.infer<typeof itemDonationStatusSchema>;

const itemTransitions: Record<
  ItemDonationStatus,
  readonly ItemDonationStatus[]
> = {
  PLEDGED: ["CHANGES_REQUESTED", "ACCEPTED", "REJECTED", "CANCELLED"],
  CHANGES_REQUESTED: ["PLEDGED", "CANCELLED"],
  ACCEPTED: ["SCHEDULED", "REJECTED", "CANCELLED"],
  REJECTED: [],
  SCHEDULED: ["RECEIVED", "CANCELLED"],
  RECEIVED: [],
  CANCELLED: [],
};

export function canTransitionItemDonation(
  from: ItemDonationStatus,
  to: ItemDonationStatus,
): boolean {
  return itemTransitions[from].includes(to);
}

export const volunteerStatusSchema = z.enum([
  "APPLIED",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
  "WITHDRAWN",
]);

export type VolunteerStatus = z.infer<typeof volunteerStatusSchema>;

export function canTransitionVolunteer(
  from: VolunteerStatus,
  to: VolunteerStatus,
): boolean {
  const transitions: Record<VolunteerStatus, readonly VolunteerStatus[]> = {
    APPLIED: ["APPROVED", "REJECTED", "WITHDRAWN"],
    APPROVED: ["COMPLETED", "WITHDRAWN"],
    REJECTED: [],
    COMPLETED: [],
    WITHDRAWN: [],
  };
  return transitions[from].includes(to);
}
