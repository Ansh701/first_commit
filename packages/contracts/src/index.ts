import { z } from "zod";
import { cognitoGroupSchema, type TenantMembership } from "./product.ts";

export * from "./product.ts";
export * from "./content.ts";
export * from "./payment.ts";

export const roleSchema = z.union([cognitoGroupSchema, z.literal("PUBLIC")]);

export type Role = z.infer<typeof roleSchema>;

export const documentStateSchema = z.enum([
  "CREATED",
  "UPLOADING",
  "QUARANTINED",
  "SCANNING",
  "CLEAN",
  "EXTRACTING",
  "ANALYZING",
  "NEEDS_CONFIRMATION",
  "READY",
  "UPLOAD_FAILED",
  "SCAN_FAILED",
  "INFECTED",
  "EXTRACTION_FAILED",
  "ANALYSIS_FAILED",
]);

export type DocumentState = z.infer<typeof documentStateSchema>;

export const claimStateSchema = z.enum([
  "DRAFT",
  "CONFIRMED_BY_ORG",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "CHANGES_REQUESTED",
]);

export type ClaimState = z.infer<typeof claimStateSchema>;

export const confidenceSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const sourceReferenceSchema = z.object({
  page: z.number().int().positive(),
  snippet: z.string().min(1).max(280),
});

export const candidateClaimSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["REGISTRATION", "CSR_1", "TAX_12A", "TAX_80G"]),
  label: z.string().min(1).max(80),
  value: z.string().min(1).max(160),
  confidence: confidenceSchema,
  confidenceNote: z.string().min(1).max(240),
  source: sourceReferenceSchema,
  state: claimStateSchema,
  version: z.number().int().positive(),
});

export type CandidateClaim = z.infer<typeof candidateClaimSchema>;

export const compassResultSchema = z.object({
  schemaVersion: z.literal("2026-09-01"),
  modelProvider: z.literal("Amazon Bedrock"),
  modelId: z.string().min(1),
  promptVersion: z.string().min(1),
  candidates: z.array(candidateClaimSchema).max(12),
  missingEvidence: z.array(z.string().min(1).max(180)).max(12),
  warnings: z.array(z.string().min(1).max(240)).max(8),
});

export type CompassResult = z.infer<typeof compassResultSchema>;

export const organizationProfileSchema = z.object({
  id: z.string().min(1),
  legalName: z.string().min(2).max(120),
  displayName: z.string().min(2).max(80),
  summary: z.string().min(40).max(360),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  focusAreas: z.array(z.string().min(2).max(60)).min(1).max(6),
  publicEmail: z.string().email().optional(),
  privatePhone: z.string().max(18).optional(),
  version: z.number().int().positive(),
});

export type OrganizationProfile = z.infer<typeof organizationProfileSchema>;

export type Capability =
  | "account:manage"
  | "profile:read"
  | "profile:write"
  | "onboarding:write"
  | "evidence:read"
  | "evidence:upload"
  | "claim:confirm"
  | "claim:submit"
  | "review:read"
  | "review:decide"
  | "organization:moderate"
  | "donation:create"
  | "donation:read:self"
  | "donation:read:tenant"
  | "item:pledge"
  | "item:manage"
  | "volunteer:apply"
  | "volunteer:manage"
  | "public:read"
  | "shortlist:write";

const grants: Record<Role, readonly Capability[]> = {
  INDIVIDUAL_DONOR: [
    "account:manage",
    "donation:create",
    "donation:read:self",
    "item:pledge",
    "volunteer:apply",
    "public:read",
  ],
  ORGANIZATION_ADMIN: [
    "account:manage",
    "profile:read",
    "profile:write",
    "onboarding:write",
    "evidence:read",
    "evidence:upload",
    "claim:confirm",
    "claim:submit",
    "donation:read:tenant",
    "item:manage",
    "volunteer:manage",
    "public:read",
  ],
  ORGANIZATION_MEMBER: [
    "account:manage",
    "profile:read",
    "evidence:read",
    "donation:read:tenant",
    "public:read",
  ],
  CORPORATE_ADMIN: [
    "account:manage",
    "donation:create",
    "donation:read:self",
    "public:read",
    "shortlist:write",
  ],
  CORPORATE_MEMBER: [
    "account:manage",
    "donation:create",
    "donation:read:self",
    "public:read",
    "shortlist:write",
  ],
  REVIEWER: ["account:manage", "review:read", "review:decide", "public:read"],
  PLATFORM_ADMIN: [
    "account:manage",
    "review:read",
    "review:decide",
    "organization:moderate",
    "donation:read:tenant",
    "public:read",
  ],
  PUBLIC: ["public:read"],
};

export type Actor = {
  userId: string;
  role: Role;
  memberships: TenantMembership[];
  sessionExpiresAt: number;
};

export type ResourceContext = {
  organizationId?: string;
  ownerUserId?: string;
  assignedReviewerId?: string;
};

export function authorize(
  actor: Actor | null,
  capability: Capability,
  resource: ResourceContext = {},
  now = Date.now(),
): boolean {
  if (capability === "public:read" && !actor) return true;
  if (!actor || actor.sessionExpiresAt <= now) return false;
  if (!grants[actor.role].includes(capability)) return false;

  if (
    actor.role === "ORGANIZATION_ADMIN" ||
    actor.role === "ORGANIZATION_MEMBER"
  ) {
    if (!resource.organizationId) return false;
    const requiredPermission =
      actor.role === "ORGANIZATION_ADMIN" ? "ADMIN" : "MEMBER";
    return actor.memberships.some(
      (membership) =>
        membership.tenantId === resource.organizationId &&
        membership.tenantType === "ORGANIZATION" &&
        membership.status === "ACTIVE" &&
        (membership.permission === requiredPermission ||
          membership.permission === "ADMIN"),
    );
  }

  if (actor.role === "REVIEWER" && resource.assignedReviewerId) {
    return resource.assignedReviewerId === actor.userId;
  }

  if (
    capability === "donation:read:self" &&
    resource.ownerUserId !== actor.userId
  ) {
    return false;
  }

  return true;
}

const allowedDocumentTransitions: Record<
  DocumentState,
  readonly DocumentState[]
> = {
  CREATED: ["UPLOADING"],
  UPLOADING: ["QUARANTINED", "UPLOAD_FAILED"],
  QUARANTINED: ["SCANNING"],
  SCANNING: ["CLEAN", "INFECTED", "SCAN_FAILED"],
  CLEAN: ["EXTRACTING"],
  EXTRACTING: ["ANALYZING", "EXTRACTION_FAILED"],
  ANALYZING: ["NEEDS_CONFIRMATION", "ANALYSIS_FAILED"],
  NEEDS_CONFIRMATION: ["READY"],
  READY: [],
  UPLOAD_FAILED: ["UPLOADING"],
  SCAN_FAILED: ["SCANNING"],
  INFECTED: [],
  EXTRACTION_FAILED: ["EXTRACTING"],
  ANALYSIS_FAILED: ["ANALYZING"],
};

export function canTransitionDocument(
  from: DocumentState,
  to: DocumentState,
): boolean {
  return allowedDocumentTransitions[from].includes(to);
}

const allowedClaimTransitions: Record<ClaimState, readonly ClaimState[]> = {
  DRAFT: ["CONFIRMED_BY_ORG"],
  CONFIRMED_BY_ORG: ["SUBMITTED", "DRAFT"],
  SUBMITTED: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED", "CHANGES_REQUESTED"],
  APPROVED: ["DRAFT"],
  REJECTED: ["DRAFT"],
  CHANGES_REQUESTED: ["DRAFT"],
};

export function canTransitionClaim(from: ClaimState, to: ClaimState): boolean {
  return allowedClaimTransitions[from].includes(to);
}

export type ReviewedClaim = CandidateClaim & {
  reviewedAt?: string;
  reviewReason?: string;
  approvedVersion?: number;
};

export type PublicTrustClaim = Pick<
  ReviewedClaim,
  "id" | "type" | "label" | "value"
> & {
  reviewedAt: string;
  sourceSummary: string;
  meaning: string;
};

const claimMeaning: Record<CandidateClaim["type"], string> = {
  REGISTRATION:
    "The organization identity was matched to reviewed registration evidence.",
  CSR_1:
    "A reviewer matched the stated CSR-1 status to the submitted evidence.",
  TAX_12A:
    "A reviewer matched the stated 12A status to the submitted evidence.",
  TAX_80G:
    "A reviewer matched the stated 80G status to the submitted evidence.",
};

export function toPublicProjection(
  claims: readonly ReviewedClaim[],
): PublicTrustClaim[] {
  return claims
    .filter(
      (claim) =>
        claim.state === "APPROVED" &&
        claim.approvedVersion === claim.version &&
        Boolean(claim.reviewedAt),
    )
    .map((claim) => ({
      id: claim.id,
      type: claim.type,
      label: claim.label,
      value: claim.value,
      reviewedAt: claim.reviewedAt as string,
      sourceSummary: `Reviewed evidence, page ${claim.source.page}`,
      meaning: claimMeaning[claim.type],
    }));
}

export const publicOrganizationSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  displayName: z.string(),
  summary: z.string(),
  location: z.string(),
  focusAreas: z.array(z.string()),
  trustClaims: z.array(
    z.object({
      id: z.string(),
      type: candidateClaimSchema.shape.type,
      label: z.string(),
      value: z.string(),
      reviewedAt: z.string(),
      sourceSummary: z.string(),
      meaning: z.string(),
    }),
  ),
});

export type PublicOrganization = z.infer<typeof publicOrganizationSchema>;
